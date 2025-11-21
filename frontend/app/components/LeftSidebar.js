'use client'

import { useState, useEffect } from 'react';
import { chatService } from '../services/chat';

export default function LeftSidebar({ 
  user, 
  onLogout, 
  onLoginClick, 
  onSignupClick, 
  currentChatId,
  onChatSelect,
  onNewChat 
}) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load chats when user logs in
  useEffect(() => {
    if (user) {
      loadChats();
    } else {
      setChats([]);
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await chatService.getUserChats();
      console.log('Chats response:', response); // Debug log
      
      // Handle different response formats
      let userChats = [];
      if (Array.isArray(response)) {
        userChats = response;
      } else if (response.chats && Array.isArray(response.chats)) {
        userChats = response.chats;
      } else if (response.data && Array.isArray(response.data)) {
        userChats = response.data;
      } else {
        console.error('Unexpected response format:', response);
        userChats = [];
      }
      
      setChats(userChats);
    } catch (error) {
      console.error('Failed to load chats:', error);
      setError('Failed to load chats');
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      await chatService.deleteChat(chatId);
      setChats(chats.filter(chat => chat.id !== chatId));
      
      // If deleted chat was active, clear it
      if (currentChatId === chatId) {
        onNewChat();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  const handleNewChat = () => {
    onNewChat();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`;
      if (diffInHours < 48) return 'Yesterday';
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
      return `${Math.floor(diffInHours / 168)} weeks ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white text-lg font-bold">Q</span>
          </div>
          <span className="font-bold text-lg text-slate-900">Quizbot</span>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-3 bg-white border-b border-slate-200">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Chat</span>
        </button>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 overflow-y-auto p-3">
        {user ? (
          <>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 px-2">
              Recent Chats
            </h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-red-500 mb-2">{error}</p>
                <button 
                  onClick={loadChats}
                  className="text-xs text-emerald-600 hover:text-emerald-700"
                >
                  Try again
                </button>
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8 px-4">
                <p className="text-sm text-slate-500 mb-2">No chats yet</p>
                <p className="text-xs text-slate-400">Start a new conversation!</p>
              </div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`relative w-full text-left px-3 py-2.5 rounded-lg transition-all group cursor-pointer ${
                      currentChatId === chat.id
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' 
                        : 'hover:bg-white text-slate-700 hover:text-slate-900'
                    }`}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate mb-0.5">
                          {chat.title || 'Untitled Chat'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatTime(chat.updated_at || chat.created_at)}
                        </p>
                      </div>
                      <button 
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded"
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                      >
                        <svg className="w-4 h-4 text-slate-400 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 px-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-2">Sign in to save your chats</p>
            <p className="text-xs text-slate-500">
              Your conversation history will be available across devices
            </p>
          </div>
        )}
      </div>

      {/* Profile/Auth Section */}
      <div className="border-t border-slate-200 bg-white p-3">
        {user ? (
          <div className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-lg transition-colors group">
            <img 
              src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=059669&color=fff&size=128&bold=true`} 
              alt="Profile"
              className="w-9 h-9 rounded-full"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {user?.name || 'User'}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {user?.email || 'user@example.com'}
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 hover:bg-slate-200 rounded transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4 text-slate-500 hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={onLoginClick}
              className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              Sign In to Save History
            </button>
            <button
              onClick={onSignupClick}
              className="w-full px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Sign Up
            </button>
            <p className="text-xs text-center text-slate-500 pt-1">
              Create an account to save your chats
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}