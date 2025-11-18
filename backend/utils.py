"""
Database Utility Script
Initialize, reset, and seed database
"""

import sys
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.append('.')

from app.db.base import Base
from app.db.session import engine , SessionLocal
from app.models.user import User
from app.models.chat import Chat
from app.models.message import Message
from app.core.security import get_password_hash

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")

def drop_db():
    """Drop all database tables"""
    Base.metadata.drop_all(bind=engine)
    print("✓ Database tables dropped successfully!")

def reset_db():
    """Reset database (drop and recreate)"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✓ Database reset successfully!")

def seed_demo_data():
    """Seed database with demo data"""
    db = SessionLocal()
    
    try:
        # Check if demo user already exists
        demo_user = db.query(User).filter(User.email == 'demo@quizbot.com').first()
        if demo_user:
            print("⚠ Demo data already exists!")
            return
        
        # Create demo user
        demo_user = User(
            name='Demo User',
            email='demo@quizbot.com',
            password_hash=get_password_hash('demo123'),
            avatar_url='https://ui-avatars.com/api/?name=Demo+User&background=1e293b&color=fff&size=128&bold=true'
        )
        db.add(demo_user)
        db.flush()
        
        # Create demo chats
        chats_data = [
            {
                'title': 'Getting Started with Python',
                'messages': [
                    {'role': 'user', 'content': 'How do I start learning Python?'},
                    {'role': 'assistant', 'content': 'Great question! To start learning Python, I recommend: 1) Install Python from python.org, 2) Learn basic syntax (variables, loops, functions), 3) Practice with small projects, 4) Use resources like Python.org tutorials or interactive platforms like Codecademy.'}
                ]
            },
            {
                'title': 'React Hooks Explained',
                'messages': [
                    {'role': 'user', 'content': 'What are React Hooks?'},
                    {'role': 'assistant', 'content': 'React Hooks are functions that let you use state and other React features in functional components. The most common hooks are useState for managing state and useEffect for side effects. They were introduced in React 16.8 to allow functional components to have the same capabilities as class components.'},
                    {'role': 'user', 'content': 'Can you show me an example?'},
                    {'role': 'assistant', 'content': 'Sure! Here\'s a simple example:\n\nimport { useState } from \'react\';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}'}
                ]
            },
            {
                'title': 'SQL vs NoSQL Databases',
                'messages': [
                    {'role': 'user', 'content': 'What\'s the difference between SQL and NoSQL databases?'},
                    {'role': 'assistant', 'content': 'SQL databases are relational and use structured schemas with tables, rows, and columns. They\'re great for complex queries and transactions. NoSQL databases are non-relational and more flexible with data structure. They\'re better for large-scale data, flexible schemas, and horizontal scaling. Choose SQL for structured data with relationships, and NoSQL for flexibility and scalability.'}
                ]
            }
        ]
        
        base_time = datetime.utcnow()
        
        for i, chat_data in enumerate(chats_data):
            # Create chat with staggered times
            chat_time = base_time - timedelta(days=i)
            chat = Chat(
                user_id=demo_user.id,
                title=chat_data['title'],
                created_at=chat_time,
                updated_at=chat_time
            )
            db.add(chat)
            db.flush()
            
            # Add messages
            for j, msg_data in enumerate(chat_data['messages']):
                message = Message(
                    chat_id=chat.id,
                    role=msg_data['role'],
                    content=msg_data['content'],
                    created_at=chat_time + timedelta(seconds=j*10)
                )
                db.add(message)
        
        db.commit()
        print("✓ Demo data seeded successfully!")
        print("\n📧 Demo credentials:")
        print("   Email: demo@quizbot.com")
        print("   Password: demo123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {str(e)}")
    finally:
        db.close()

def get_stats():
    """Get database statistics"""
    db = SessionLocal()
    
    try:
        user_count = db.query(User).count()
        chat_count = db.query(Chat).count()
        message_count = db.query(Message).count()
        
        print("\n📊 Database Statistics:")
        print(f"   Users: {user_count}")
        print(f"   Chats: {chat_count}")
        print(f"   Messages: {message_count}")
        print()
        
    finally:
        db.close()

def list_users():
    """List all users"""
    db = SessionLocal()
    
    try:
        users = db.query(User).all()
        print("\n👥 Users:")
        for user in users:
            print(f"   {user.id}: {user.name} ({user.email})")
        print()
        
    finally:
        db.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("\nDatabase Utility Commands:")
        print("  python db_utils.py init      - Initialize database")
        print("  python db_utils.py drop      - Drop all tables")
        print("  python db_utils.py reset     - Reset database")
        print("  python db_utils.py seed      - Seed demo data")
        print("  python db_utils.py stats     - Show statistics")
        print("  python db_utils.py users     - List users")
        print()
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    if command == 'init':
        init_db()
    elif command == 'drop':
        confirm = input("⚠ Are you sure you want to drop all tables? (yes/no): ")
        if confirm.lower() == 'yes':
            drop_db()
        else:
            print("Cancelled.")
    elif command == 'reset':
        confirm = input("⚠ Are you sure you want to reset the database? (yes/no): ")
        if confirm.lower() == 'yes':
            reset_db()
        else:
            print("Cancelled.")
    elif command == 'seed':
        seed_demo_data()
    elif command == 'stats':
        get_stats()
    elif command == 'users':
        list_users()
    else:
        print(f"Unknown command: {command}")