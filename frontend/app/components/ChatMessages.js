'use client'

import { useRef, useEffect } from 'react';

export default function ChatMessages({ messages, isLoading, user, onSuggestionClick }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="max-w-3xl w-full text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-700 to-teal-700 rounded-3xl mb-6 shadow-xl">
            <span className="text-4xl">💬</span>
          </div>
          
          {/* Welcome Message */}
          <h2 className="text-4xl md:text-3xl font-bold mb-4 text-slate-900 leading-tight">
            Start a conversation
          </h2>
          <p className="text-slate-500 text-md md:text-base mb-8">
            Ask me anything and I'll help you learn
          </p>
          
          {/* Quick Tips - Clickable */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 text-left">
            <button
              onClick={() => onSuggestionClick("Explain the concept of recursion in programming with examples")}
              className="bg-white rounded-xl p-5 border-2 border-slate-200 hover:border-emerald-600 hover:shadow-lg transition-all text-left group"
            >
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-emerald-700">Explain concepts</h3>
              <p className="text-sm text-slate-600">Get detailed explanations with examples</p>
            </button>
            
            <button
              onClick={() => onSuggestionClick("Write a Python function to reverse a string")}
              className="bg-white rounded-xl p-5 border-2 border-slate-200 hover:border-emerald-600 hover:shadow-lg transition-all text-left group"
            >
              <div className="text-2xl mb-3">💡</div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-emerald-700">Get code examples</h3>
              <p className="text-sm text-slate-600">Request working code snippets</p>
            </button>
            
            <button
              onClick={() => onSuggestionClick("What are the best practices for React hooks?")}
              className="bg-white rounded-xl p-5 border-2 border-slate-200 hover:border-emerald-600 hover:shadow-lg transition-all text-left group"
            >
              <div className="text-2xl mb-3">🔄</div>
              <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-emerald-700">Learn best practices</h3>
              <p className="text-sm text-slate-600">Discover tips and techniques</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-700 to-teal-700 flex items-center justify-center text-white font-bold shrink-0">
              Q
            </div>
          )}
          
          <div
            className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-emerald-700 to-teal-700 text-white'
                : message.isError
                ? 'bg-red-50 text-red-900 border-2 border-red-200'
                : 'bg-white border-2 border-slate-200 text-slate-900'
            }`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-900 font-semibold shrink-0">
              {user?.name?.charAt(0).toUpperCase() || '👤'}
            </div>
          )}
        </div>
      ))}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex gap-4 justify-start">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-700 to-teal-700 flex items-center justify-center text-white font-bold shrink-0">
            Q
          </div>
          <div className="bg-white border-2 border-slate-200 rounded-2xl px-5 py-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}