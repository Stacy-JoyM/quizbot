from fastapi import APIRouter

from app.api.v1 import user_routes, chat_routes, messages_routes,test_routes

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    user_routes.router,
    prefix="/users",
    tags=["Authentication"]
)

api_router.include_router(
    chat_routes.router,
    prefix="/chats",
    tags=["Chats"]
)

api_router.include_router(
    messages_routes.router,  
    prefix="/chats",
    tags=["Messages"]
)

api_router.include_router(
    test_routes.router,
    tags=["Testing"]
)