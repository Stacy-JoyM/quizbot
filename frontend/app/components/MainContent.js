'use client'

import { useState, useEffect } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import { chatService } from '../services/chat';

export default function MainContent({ user, onLoginClick, currentChatId, onChatCreated }) {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatTitle, setChatTitle] = useState('');

  // Load messages when chat changes
  useEffect(() => {
    if (user && currentChatId) {
      loadChat(currentChatId);
    } else if (!currentChatId) {
      // New chat - clear messages
      setMessages([]);
      setChatTitle('');
    }
  }, [currentChatId, user]);

  const loadChat = async (chatId) => {
    try {
      const chat = await chatService.getChat(chatId);
      setChatTitle(chat.title);
      
      // Convert messages to display format
      const formattedMessages = chat.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let data;
      let chatId = currentChatId;

      if (user) {
        // ============ AUTHENTICATED USER FLOW ============
        
        // Create chat if this is the first message
        if (!chatId) {
          // Generate title from first message (first 50 chars)
          const title = userMessage.content.slice(0, 50) + (userMessage.content.length > 50 ? '...' : '');
          const newChat = await chatService.createChat(title);
          chatId = newChat.id;
          setChatTitle(title);
          onChatCreated(newChat); // Notify parent to add to sidebar
        }

        // Send message
        data = await chatService.sendMessage(chatId, userMessage.content);
        
        const aiMessage = {
          id: data.assistant_message.id,
          role: 'assistant',
          content: data.assistant_message.content,
          timestamp: new Date(data.assistant_message.created_at)
        };
        
        setMessages(prev => [...prev, aiMessage]);

      } else {
        // ============ GUEST USER FLOW ============
        const conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        data = await chatService.sendGuestMessage(
          userMessage.content,
          conversationHistory
        );
        
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: data.assistant_message.content,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
      }

    } catch (error) {
      console.error('Error:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    setInputValue(suggestionText);
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} };
      handleSubmit(fakeEvent);
    }, 100);
  };

  return (
    <main className="flex-1 flex flex-col bg-white min-h-0">
      {/* Header */}
      <header className="border-b border-slate-200 p-4 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-slate-900">
            {chatTitle || 'AI Chat'}
          </h1>
          {!user && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-600 text-sm">⚠️ Guest Mode - Chat history not saved</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!user && (
            <button 
              onClick={onLoginClick}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 flex items-center gap-2 transition-all hover:shadow-lg"
            >
              <span>Sign In to Save History</span>
            </button>
          )}
          <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center bg-emerald-600 text-white transition-colors">
            {user?.name?.charAt(0).toUpperCase() || '👤'}
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <ChatMessages 
          messages={messages} 
          isLoading={isLoading} 
          user={user}
          onSuggestionClick={handleSuggestionClick}
        />
      </div>

      {/* Input Area */}
      <ChatInput 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </main>
  );
}