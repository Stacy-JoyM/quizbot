
export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  
  // Store token and user in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  
  return response.data;
}