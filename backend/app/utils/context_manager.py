
from typing import List, Dict, Any

class ConversationContextManager:  
   
    @staticmethod
    def prepare_messages(messages: List[Any]) -> List[Dict[str, str]]:
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]
    
    @staticmethod
    def truncate_context(messages: List[Dict[str, str]], max_messages: int = 20) -> List[Dict[str, str]]:
        if len(messages) <= max_messages:
            return messages
        
        # Keep system message if present, then most recent messages
        system_messages = [m for m in messages if m.get("role") == "system"]
        other_messages = [m for m in messages if m.get("role") != "system"]
        
        return system_messages + other_messages[-max_messages:]
    
    @staticmethod
    def add_system_message(messages: List[Dict[str, str]], system_prompt: str) -> List[Dict[str, str]]:
        # Remove existing system messages
        filtered = [m for m in messages if m.get("role") != "system"]
        
        # Add new system message at the beginning
        return [{"role": "system", "content": system_prompt}] + filtered
    
    @staticmethod
    def estimate_tokens(messages: List[Dict[str, str]]) -> int:
        total_chars = sum(len(m.get("content", "")) for m in messages)
        return total_chars // 4