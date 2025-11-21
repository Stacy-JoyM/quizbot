'use client'

import { useRef, useEffect } from 'react';

export default function ChatInput({ value, onChange, onSubmit, isLoading }) {
  const textareaRef = useRef(null);

  // Focus on textarea after loading completes
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className="border-t border-slate-200 p-6 bg-white shrink-0">
      <div className="max-w-5xl mx-auto">
        <form onSubmit={onSubmit}>
          <div className="relative">
            <div className="bg-white border-2 border-slate-300 rounded-2xl shadow-sm hover:shadow-md transition-all focus-within:border-emerald-600 focus-within:shadow-lg">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={onChange}
                placeholder="Ask me anything... (Shift + Enter for new line)"
                rows="1"
                className="w-full px-6 py-4 rounded-t-2xl focus:outline-none text-slate-900 placeholder-slate-400 resize-none text-base"
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                autoFocus
              />
              <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400 font-medium">{value.length} / 3,000</span>
                  <button 
                    type="submit"
                    disabled={!value.trim() || isLoading}
                    className="bg-gradient-to-br from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 text-white px-5 py-2.5 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
                  >
                    <span>{isLoading ? 'Sending...' : 'Send'}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <p className="text-xs text-slate-400 text-center mt-3">
          Quizbot may generate inaccurate information. Please verify important facts.
        </p>
      </div>
    </div>
  );
}