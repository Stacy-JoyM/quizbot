'use client'

import { useState, useEffect } from 'react';
import LeftSidebar from './components/LeftSidebar';
import MainContent from './components/MainContent';
import Login from './components/Login';
import Register from './components/Register';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(null); // 'login' or 'register'
  const [currentChatId, setCurrentChatId] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (data) => {
    setUser(data.user);
    setShowAuth(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentChatId(null);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
  };

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
  };

  const handleChatCreated = (newChat) => {
    setCurrentChatId(newChat.id);
    // Trigger sidebar refresh by updating a key or using a callback
  };

  if (showAuth === 'login') {
    return (
      <Login 
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowAuth('register')}
        onClose={() => setShowAuth(null)}  // ✅ ADDED THIS
      />
    );
  }

  if (showAuth === 'register') {
    return (
      <Register 
        onSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setShowAuth('login')}
        onClose={() => setShowAuth(null)}  // ✅ ADDED THIS
      />
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <LeftSidebar 
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuth('login')}
        onSignupClick={() => setShowAuth('register')}
        currentChatId={currentChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleNewChat}
      />
      <MainContent 
        user={user}
        onLoginClick={() => setShowAuth('login')}
        currentChatId={currentChatId}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
}