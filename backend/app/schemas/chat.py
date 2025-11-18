

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ChatBase(BaseModel):
    """Base chat schema"""
    title: str = "New Chat"

class ChatCreate(ChatBase):
    """Schema for chat creation"""
    pass

class ChatUpdate(BaseModel):
    """Schema for chat update"""
    title: str

from typing import Optional, List

class MessageInChat(BaseModel):
    id: int
    role: str
    content: str
    file_name: Optional[str] = None
    file_path: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
        from_attributes = True


class ChatResponse(ChatBase):
    """Schema for chat response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    
    class Config:
        from_attributes = True

class ChatWithMessages(ChatResponse):
    """Schema for chat with messages"""
    messages: List[MessageInChat] = []
    
    class Config:
        from_attributes = True

class ChatListResponse(BaseModel):
    """Schema for chat list response"""
    chats: List[ChatResponse]