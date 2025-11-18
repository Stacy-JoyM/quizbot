
import re
import google.generativeai as genai
from typing import List, Dict
from app.core.config import settings
from app.core.logging import logger

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


def remove_asterisks(text: str) -> str:
    """Remove all asterisks from text"""
    text = re.sub(r'\*+', '', text)  # Remove all asterisks
    return text


async def get_ai_response(messages: List[Dict[str, str]]) -> str:
    """
    Get AI response from Google Gemini
    
    Args:
        messages: List of message dicts with 'role' and 'content'
    
    Returns:
        AI response as string (without asterisks)
    """
    try:
        # Initialize the model
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            generation_config={
                "temperature": settings.TEMPERATURE,
                "max_output_tokens": settings.MAX_TOKENS,
            }
        )
        
        # Build conversation prompt
        conversation = ""
        
        for msg in messages:
            role = msg.get("role")
            content = msg.get("content", "")
            
            if role == "system":
                conversation += f"System Instructions: {content}\n\n"
            elif role == "user":
                conversation += f"User: {content}\n\n"
            elif role == "assistant":
                conversation += f"Assistant: {content}\n\n"
        
        # Get response
        response = model.generate_content(conversation)
        
        # Extract text and remove asterisks
        ai_response = response.text
        ai_response = remove_asterisks(ai_response)
        
        logger.info(f"Gemini API call successful. Response length: {len(ai_response)} chars")
        
        return ai_response.strip()
        
    except Exception as e:
        logger.error(f"Gemini API error: {str(e)}")
        raise Exception(f"Failed to get AI response: {str(e)}")