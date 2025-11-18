from fastapi import APIRouter
import google.generativeai as genai
from app.core.config import settings

router = APIRouter()

@router.get("/test-gemini")
async def test_gemini():
    """Test Gemini API configuration"""
    
    if not settings.GEMINI_API_KEY:
        return {
            "error": "GEMINI_API_KEY not configured",
            "api_key_configured": False
        }
    
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    try:
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                models.append(m.name)
        
        return {
            "status": "success",
            "api_key_configured": True,
            "api_key_length": len(settings.GEMINI_API_KEY),
            "current_model": settings.GEMINI_MODEL,
            "available_models": models
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "api_key_configured": bool(settings.GEMINI_API_KEY)
        }