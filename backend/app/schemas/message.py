

from pydantic import BaseModel
from datetime import datetime

class MessageBase(BaseModel):
    """Base message schema"""
    content: str

class MessageCreate(MessageBase):
    """Schema for message creation"""
    pass

class MessageResponse(MessageBase):
    """Schema for message response"""
    id: int
    chat_id: int
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class MessagePairResponse(BaseModel):
    """Schema for user and assistant message pair"""
    user_message: MessageResponse
    assistant_message: MessageResponse

