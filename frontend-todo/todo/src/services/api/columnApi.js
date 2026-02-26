import api from '../api';

export const columnApi = {
  // Create column in board
  createColumn: async (boardId, columnData) => {
    const response = await api.post(`/kanban/boards/${boardId}/columns`, columnData);
    return response.data;
  },

  // Update column
  updateColumn: async (columnId, columnData) => {
    const response = await api.put(`/kanban/columns/${columnId}`, columnData);
    return response.data;
  },

  // Delete column
  deleteColumn: async (columnId) => {
    const response = await api.delete(`/kanban/columns/${columnId}`);
    return response.data;
  },

  // Reorder columns in board
  reorderColumns: async (boardId, columnOrder) => {
    const response = await api.put(`/kanban/boards/${boardId}/columns/reorder`, columnOrder);
    return response.data;
  },

  // Move task between columns
  moveTask: async (taskId, sourceColumnId, destinationColumnId, newOrder) => {
    const response = await api.post('/kanban/tasks/move', {
      taskId,
      sourceColumnId,
      destinationColumnId,
      newOrderIndex: newOrder
    });
    return response.data;
  },
};