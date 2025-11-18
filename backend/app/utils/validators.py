
import re
from typing import Optional


def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    return True, None


def sanitize_input(text: str, max_length: int = 10000) -> str:
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Truncate to max length
    text = text[:max_length]
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def validate_chat_title(title: str) -> tuple[bool, Optional[str]]:
    if not title or not title.strip():
        return False, "Title cannot be empty"
    
    if len(title) > 200:
        return False, "Title must be less than 200 characters"
    
    return True, None