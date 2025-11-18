
from app.models.user import User
from app.models.chat import Chat
from app.models.message import Message

# This ensures all models are imported when you do: from app.models import User, Chat, Message
__all__ = [ "User", "Chat", "Message"]