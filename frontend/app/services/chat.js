const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quizbot-backend-795951427566.us-central1.run.app/api/v1';


export const chatService = {
  // Get all user chats
  getUserChats: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/chats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load chats');
    }

    return response.json();
  },

  // Create new chat
  createChat: async (title = 'New Chat') => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/chats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      throw new Error('Failed to create chat');
    }

    return response.json();
  },

  // Get single chat with messages
  getChat: async (chatId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/chats/${chatId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load chat');
    }

    return response.json();
  },

  // Delete chat
  deleteChat: async (chatId) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/chats/${chatId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }

    return response.json();
  },

  // Send message to chat
  sendMessage: async (chatId, content) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
  },

  // Send guest message (no auth)
  sendGuestMessage: async (content, conversationHistory = []) => {
    const response = await fetch(`${API_URL}/chats/guest/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        content,
        conversation_history: conversationHistory 
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message');
    }

    return response.json();
  },
  // Send message with file (authenticated)
  async sendMessageWithFile(chatId, content, file) {
    const formData = new FormData();
    formData.append('message', content);
    formData.append('file', file);

    const response = await fetch(`${API_URL}/chats/${chatId}/messages/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send message with file');
    }

    return response.json();
  },
  // Send guest message with file
  async sendGuestMessageWithFile(message, conversationHistory, file) {
    const formData = new FormData();
    formData.append('message', message);
    formData.append('conversation_history', JSON.stringify(conversationHistory));
    formData.append('file', file);

    const response = await fetch(`${API_URL}/guest/message/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send guest message with file');
    }

    return response.json();
  }

};