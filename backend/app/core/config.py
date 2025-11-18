from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    """Application settings"""
    
    # Project Info
    PROJECT_NAME: str = "Quizbot API"
    VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./quizbot.db")
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
  
    # Google Gemini Configuration 
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") 
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")
    MAX_TOKENS: int = int(os.getenv("MAX_TOKENS", "500"))
    TEMPERATURE: float = float(os.getenv("TEMPERATURE", "0.7"))
    SYSTEM_PROMPT: str = """You are a helpful AI assistant called Quizbot. Follow these rules strictly:
1. Be concise and direct in your responses
2. NEVER use asterisks (*) for emphasis or formatting
3. Use simple, clear language
4. Be friendly and accurate
5. Keep responses brief unless asked for details"""
    MAX_CONTEXT_MESSAGES: int = int(os.getenv("MAX_CONTEXT_MESSAGES", "20"))
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    DEBUG: bool = True
    
    class Config:
        case_sensitive = True

settings = Settings()