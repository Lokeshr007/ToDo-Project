import api from '@/services/api';

export const goalApi = {
  // Create a new goal
  createGoal: async (goalData) => {
    const response = await api.post('/goals', goalData);
    return response.data;
  },

  // Get all goals
  getGoals: async () => {
    const response = await api.get('/goals');
    return response.data;
  },

  // Update goal
  updateGoal: async (id, goalData) => {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  },

  // Delete goal
  deleteGoal: async (id) => {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  },

  // Get goal progress
  getGoalProgress: async (id) => {
    const response = await api.get(`/goals/${id}/progress`);
    return response.data;
  },

  // Get all goals progress
  getAllGoalsProgress: async () => {
    const response = await api.get('/goals/progress');
    return response.data;
  }
};