import api from '@/services/api';

export const timeBlockApi = {
  // Create time block
  createTimeBlock: async (blockData) => {
    const response = await api.post('/time-blocks', blockData);
    return response.data;
  },

  // Get time blocks for date range
  getTimeBlocks: async (startDate, endDate) => {
    const response = await api.get('/time-blocks', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Update time block
  updateTimeBlock: async (id, blockData) => {
    const response = await api.put(`/time-blocks/${id}`, blockData);
    return response.data;
  },

  // Delete time block
  deleteTimeBlock: async (id) => {
    const response = await api.delete(`/time-blocks/${id}`);
    return response.data;
  },

  // Reorder time blocks
  reorderTimeBlocks: async (blocks) => {
    const response = await api.post('/time-blocks/reorder', { blocks });
    return response.data;
  },

  // Get time blocks for today
  getTodayBlocks: async () => {
    const today = new Date().toISOString().split('T')[0];
    return await timeBlockApi.getTimeBlocks(today, today);
  }
};