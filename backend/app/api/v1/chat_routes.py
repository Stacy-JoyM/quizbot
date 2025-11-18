from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.chat import Chat
from app.schemas.chat import (
    ChatCreate,
    ChatResponse,
    ChatWithMessages,
    ChatListResponse,
    ChatUpdate,
    MessageInChat
)

router = APIRouter()

@router.get("", response_model=ChatListResponse)
async def get_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all chats for current user"""
    chats = db.query(Chat).filter(
        Chat.user_id == current_user.id
    ).order_by(Chat.updated_at.desc()).all()
    
    # Add message count to each chat
    chat_responses = []
    for chat in chats:
        chat_dict = {
            "id": chat.id,
            "user_id": chat.user_id,
            "title": chat.title,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at,
            "message_count": len(chat.messages)
        }
        chat_responses.append(ChatResponse(**chat_dict))
    
    return ChatListResponse(chats=chat_responses)

@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
async def create_chat(
    chat_data: ChatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chat = Chat(
        user_id=current_user.id,
        title=chat_data.title
    )
    
    db.add(chat)
    db.commit()
    db.refresh(chat)
    
    return ChatResponse(
        id=chat.id,
        user_id=chat.user_id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        message_count=0
    )

@router.get("/{chat_id}", response_model=ChatWithMessages)
async def get_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific chat with messages"""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    # Prepare messages
    messages = [MessageInChat.from_orm(msg) for msg in chat.messages]
    
    return ChatWithMessages(
        id=chat.id,
        user_id=chat.user_id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        message_count=len(messages),
        messages=messages
    )

@router.delete("/{chat_id}", status_code=status.HTTP_200_OK)
async def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a chat"""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    db.delete(chat)
    db.commit()
    
    return {"message": "Chat deleted successfully"}

@router.patch("/{chat_id}/title", response_model=ChatResponse)
async def update_chat_title(
    chat_id: int,
    chat_update: ChatUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update chat title"""
    chat = db.query(Chat).filter(
        Chat.id == chat_id,
        Chat.user_id == current_user.id
    ).first()
    
    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )
    
    chat.title = chat_update.title
    chat.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(chat)
    
    return ChatResponse(
        id=chat.id,
        user_id=chat.user_id,
        title=chat.title,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        message_count=len(chat.messages)
    )

@router.get("/search/chats", response_model=ChatListResponse)
async def search_chats(
    q: Optional[str] = Query(None, description="Search query"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search chats by title"""
    if not q:
        return ChatListResponse(chats=[])
    
    chats = db.query(Chat).filter(
        Chat.user_id == current_user.id,
        Chat.title.ilike(f"%{q}%")
    ).order_by(Chat.updated_at.desc()).all()
    
    chat_responses = []
    for chat in chats:
        chat_dict = {
            "id": chat.id,
            "user_id": chat.user_id,
            "title": chat.title,
            "created_at": chat.created_at,
            "updated_at": chat.updated_at,
            "message_count": len(chat.messages)
        }
        chat_responses.append(ChatResponse(**chat_dict))
    
    return ChatListResponse(chats=chat_responses)