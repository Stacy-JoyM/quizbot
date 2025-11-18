import google.generativeai as genai
from PIL import Image
import io
import base64
import os

class GeminiService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.0-flash-exp')
    
    async def generate_response(
        self,
        message: str,
        conversation_history: list = None
    ) -> str:
        """Generate response without image (text only)"""
        try:
            chat = self.model.start_chat(history=self._format_history(conversation_history))
            response = chat.send_message(message)
            return response.text
        except Exception as e:
            raise Exception(f"Error generating response: {str(e)}")
    
    async def generate_with_image(
        self,
        message: str,
        image_data: str,
        mime_type: str,
        conversation_history: list = None
    ) -> str:
        """Generate response with image context"""
        try:
            image_bytes = base64.b64decode(image_data)
            image = Image.open(io.BytesIO(image_bytes))
            
            formatted_history = self._format_history(conversation_history)
            
            if formatted_history:
                chat = self.model.start_chat(history=formatted_history)
                response = chat.send_message([message, image])
            else:
                response = self.model.generate_content([message, image])
            
            return response.text
        except Exception as e:
            raise Exception(f"Error generating response with image: {str(e)}")
    
    def _format_history(self, history: list) -> list:
        """Format conversation history for Gemini"""
        if not history:
            return []
        
        formatted = []
        for msg in history:
            role = "user" if msg["role"] == "user" else "model"
            formatted.append({
                "role": role,
                "parts": [msg["content"]]
            })
        
        return formatted

# Create singleton instance
gemini_service = GeminiService()