// src/features/ai-assistant/api/contextApi.js
import API from '@/services/api';

export const getContext = async (sessionId) => {
  try {
    const response = await API.get(`/ai/context/${sessionId}`);
    return response.data;
  } catch (error) {
    // Return empty context if not found (session may be new)
    if (error.response?.status === 404) {
      return { insights: null };
    }
    throw error;
  }
};

export const createContext = async (sessionId, learningStyle = 'VISUAL', metadata = {}) => {
  const response = await API.post('/ai/context', {
    sessionId,
    learningStyle,
    ...metadata
  });
  return response.data;
};

export const updateContext = async (sessionId, updates) => {
  const response = await API.put(`/ai/context/${sessionId}`, updates);
  return response.data;
};

export const addMessageToContext = async (sessionId, role, content, metadata = {}) => {
  const response = await API.post(`/ai/context/${sessionId}/messages`, {
    role,
    content,
    metadata,
    timestamp: new Date().toISOString()
  });
  return response.data;
};

export const getContextMessages = async (sessionId) => {
  try {
    const response = await API.get(`/ai/context/${sessionId}/messages`);
    return response.data || [];
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const clearContext = async (sessionId) => {
  const response = await API.delete(`/ai/context/${sessionId}`);
  return response.data;
};

export const sendChatMessage = async (message, sessionId, context = {}) => {
  const response = await API.post('/ai/chat', {
    message,
    sessionId,
    context
  });
  return response.data;
};
