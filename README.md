This app has implemented the core features:
-Chatbot Messaging Feature 
-Guest feature
-Chatbot History 

The technologies used : Python, Fastpi, Nextjs, React, Postgresql 

Running backend: uvicorn app.main:app --reload --port 8000
Activate virtual environment : source venv/bin/activate  
pip freeze > requirements.txt

Running frontend: npm run dev
Clear cache for next : rm -rf .next 
                       rm -rf node_modules
                       rm -rf package-lock.json

                       npm install

python db_utils.py init       # Create database
python db_utils.py seed       # Add demo data (optional)
uvicorn app:app --reload --port 8000

Check endpoints : http://localhost:8000/docs

API Endpoints (10 Total):

Authentication (No auth required)
POST   /api/v1/auth/register    Register new user
POST   /api/v1/auth/login       Login user
GET    /api/v1/auth/me          Get current user (auth required)
Chats (Auth required)
GET    /api/v1/chats                   Get all chats
POST   /api/v1/chats                   Create chat
GET    /api/v1/chats/{id}              Get specific chat
DELETE /api/v1/chats/{id}              Delete chat
PATCH  /api/v1/chats/{id}/title        Update title
GET    /api/v1/chats/search/chats      Search chats
Messages (Auth required)
POST   /api/v1/chats/{id}/messages     Send message → Get AI response
