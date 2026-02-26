// src/features/ai-assistant/api/learningPathApi.js
import API from '@/services/api';

export const getLearningPaths = async (workspaceId, category = null, difficulty = null) => {
  try {
    const params = {};
    if (workspaceId) params.workspaceId = workspaceId;
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;

    const response = await API.get('/ai/learning-paths', { params });
    return response.data || [];
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const getLearningPathById = async (pathId) => {
  const response = await API.get(`/ai/learning-paths/${pathId}`);
  return response.data;
};

export const createLearningPath = async (data) => {
  const response = await API.post('/ai/learning-paths', data);
  return response.data;
};

export const updateLearningPath = async (pathId, updates) => {
  const response = await API.put(`/ai/learning-paths/${pathId}`, updates);
  return response.data;
};

export const deleteLearningPath = async (pathId) => {
  const response = await API.delete(`/ai/learning-paths/${pathId}`);
  return response.data;
};

export const cloneLearningPath = async (pathId) => {
  const response = await API.post(`/ai/learning-paths/${pathId}/clone`);
  return response.data;
};

export const rateLearningPath = async (pathId, rating) => {
  const response = await API.post(`/ai/learning-paths/${pathId}/rate`, { rating });
  return response.data;
};

export const generateLearningPath = async (topic, options = {}) => {
  const response = await API.post('/ai/learning-paths/generate', { topic, ...options });
  return response.data;
};
