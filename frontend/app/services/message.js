
export const sendMessage = async (chatId, content) => {
  const response = await api.post(`/chats/${chatId}/messages`, { content });
  return response.data;
};

