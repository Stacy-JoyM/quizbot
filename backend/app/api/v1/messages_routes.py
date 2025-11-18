from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.chat import Chat
from app.models.message import Message
from app.schemas.message import MessageCreate, MessagePairResponse, MessageResponse
from app.services.chatbot_service import get_ai_response
from app.utils.context_manager import ConversationContextManager
from app.core.logging import logger
from app.core.config import settings

router = APIRouter()

# ✅ NEW: Guest endpoint (add this at the top, before authenticated routes)
@router.post("/guest/message", response_model=MessagePairResponse, status_code=status.HTTP_201_CREATED)
async def send_guest_message(
    message_data: MessageCreate,
    db: Session = Depends(get_db)
):
    """Send a message as guest and get AI response (no persistence)"""
    
    # For guests, we don't save to database, just get AI response
    conversation_history = [
        {"role": "user", "content": message_data.content}
    ]
    
    # Add system prompt
    conversation_history = ConversationContextManager.add_system_message(
        conversation_history, 
        settings.SYSTEM_PROMPT
    )
    
    try:
        # Get AI response
        ai_content = await get_ai_response(conversation_history)
        
        logger.info(f"Guest message processed successfully")
        
        # Return response without saving to database
        return {
            "user_message": {
                "id": 0,  # Temporary ID for guest
                "chat_id": 0,
                "role": "user",
                "content": message_data.content,
                "created_at": datetime.utcnow()
            },
            "assistant_message": {
                "id": 0,
                "chat_id": 0,
                "role": "assistant",
                "content": ai_content,
                "created_at": datetime.utcnow()
            }
        }
        
    except Exception as e:
        logger.error(f"Guest message failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI response: {str(e)}"
        )

# Existing authenticated endpoint
@router.post("/{chat_id}/messages", response_model=MessagePairResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    chat_id: int,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message and get AI response"""
    
    # Verify chat exists and belongs to user
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Create user message
    user_message = Message(
        chat_id=chat_id,
        role="user",
        content=message_data.content
    )
    db.add(user_message)
    db.flush()  # Flush to get the message ID
    
    # Get conversation history from database
    db_messages = db.query(Message).filter(
        Message.chat_id == chat_id
    ).order_by(Message.created_at).all()
    
    # Use ConversationContextManager to prepare messages
    conversation_history = ConversationContextManager.prepare_messages(db_messages)
    
    # Add system prompt for better AI behavior
    conversation_history = ConversationContextManager.add_system_message(
        conversation_history, 
        settings.SYSTEM_PROMPT
    )
    
    # ✅ Truncate to prevent token limit errors
    conversation_history = ConversationContextManager.truncate_context(
        conversation_history, 
        settings.MAX_CONTEXT_MESSAGES
    )
    
    # ✅ Log token estimation for monitoring
    estimated_tokens = ConversationContextManager.estimate_tokens(conversation_history)
    logger.info(f"Chat {chat_id}: Sending ~{estimated_tokens} tokens to AI")
    
    try:
        # Get AI response
        ai_content = await get_ai_response(conversation_history)
        
        # Create assistant message
        assistant_message = Message(
            chat_id=chat_id,
            role="assistant",
            content=ai_content
        )
        db.add(assistant_message)
        
        if len(db_messages) == 1:
           title = message_data.content[:50] + ('...' if len(message_data.content) > 50 else '')
           chat.title = title
           logger.info(f"Chat {chat_id}: Auto-generated title: {title}")

        # Update chat timestamp
        chat.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(user_message)
        db.refresh(assistant_message)
        
        logger.info(f"Chat {chat_id}: Message exchange completed successfully")
        
        return MessagePairResponse(
            user_message=MessageResponse.from_orm(user_message),
            assistant_message=MessageResponse.from_orm(assistant_message)
        )
        
    except Exception as e:
        db.rollback()
        logger.error(f"Chat {chat_id}: Failed to get AI response - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get AI response: {str(e)}"
        )
    