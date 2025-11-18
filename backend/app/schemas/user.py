from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True  # Use this instead of orm_mode for Pydantic v2

class TokenResponse(BaseModel):
    access_token: str
    user: UserResponse
    token_type: str = "bearer"  