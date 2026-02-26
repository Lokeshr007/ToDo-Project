// frontend/src/features/ai-assistant/api/aiApi.js
import API from '@/services/api';

// Upload and parse study plan file
export const uploadAndParsePlan = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await API.post('/ai/parse-plan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

// Generate tasks from parsed plan
export const generateTasks = async (planData) => {
  const response = await API.post('/ai/generate-tasks', planData);
  return response.data;
};

// Chat with AI assistant
export const chatWithAI = async (message, context) => {
  const response = await API.post('/ai/chat', { message, context });
  return response.data;
};

// Get AI suggestions for plan improvement
export const getPlanSuggestions = async (planId) => {
  const response = await API.get(`/ai/plan/${planId}/suggestions`);
  return response.data;
};

// Refine tasks with AI
export const refineTasks = async (taskIds, instructions) => {
  const response = await API.post('/ai/refine-tasks', { taskIds, instructions });
  return response.data;
};