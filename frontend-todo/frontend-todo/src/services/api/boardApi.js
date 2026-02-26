import api from '../api';

export const boardApi = {
  // Get all boards for a project
  getBoards: async (projectId) => {
    const response = await api.get('/boards', {
      params: { projectId }
    });
    return response.data;
  },

  // Get board by ID with columns and tasks
  getBoard: async (boardId) => {
    const response = await api.get(`/boards/${boardId}`);
    return response.data;
  },

  // Create new board
  createBoard: async (projectId, boardData) => {
    const response = await api.post('/boards', boardData, {
      params: { projectId }
    });
    return response.data;
  },

  // Update board
  updateBoard: async (boardId, boardData) => {
    const response = await api.put(`/boards/${boardId}`, boardData);
    return response.data;
  },

  // Delete board
  deleteBoard: async (boardId) => {
    const response = await api.delete(`/boards/${boardId}`);
    return response.data;
  },

  // Reorder boards
  reorderBoards: async (boardOrder) => {
    const response = await api.put('/boards/reorder', boardOrder);
    return response.data;
  },

  // Get board activity
  getBoardActivity: async (boardId) => {
    const response = await api.get(`/boards/${boardId}/activity`);
    return response.data;
  },
};