const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://quizbot-backend-795951427566.us-central1.run.app/api/v1';


export const api = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }
      
      return response.json();
    } catch (error) {
      if (error.message) throw error;
      throw new Error('Network error. Please check if the backend is running.');
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }
      
      return response.json();
    } catch (error) {
      if (error.message) throw error;
      throw new Error('Network error. Please check if the backend is running.');
    }
  },

  // Get current user
  getCurrentUser: async (token) => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    
    return response.json();
  },
};