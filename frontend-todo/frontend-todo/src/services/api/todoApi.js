// frontend/src/features/todos/api/todoApi.js
import api from '@/services/api';

export const todoApi = {
  // Get all tasks with filters
  getTodos: async (filters = {}) => {
    const response = await api.get('/todos', { params: filters });
    return response.data;
  },

  // Get task statistics
  getTodoStats: async () => {
    const response = await api.get('/todos/stats');
    return response.data;
  },

  // Search tasks
  searchTodos: async (query) => {
    const response = await api.get('/todos/search', { params: { q: query } });
    return response.data;
  },

  // Get task by ID
  getTodo: async (id) => {
    const response = await api.get(`/todos/${id}`);
    return response.data;
  },

  // Create new task
  createTodo: async (todoData) => {
    const response = await api.post('/todos', todoData);
    return response.data;
  },

  // Update task
  updateTodo: async (id, todoData) => {
    const response = await api.put(`/todos/${id}`, todoData);
    return response.data;
  },

  // Update task status
  updateTodoStatus: async (id, status) => {
    const response = await api.patch(`/todos/${id}/status`, { status });
    return response.data;
  },

  // Delete task (soft delete by default)
  deleteTodo: async (id, permanent = false) => {
    const response = await api.delete(`/todos/${id}`, { 
      params: { permanent } 
    });
    return response.data;
  },

  // Restore archived task
  restoreTodo: async (id) => {
    const response = await api.post(`/todos/${id}/restore`);
    return response.data;
  },

  // Comments
  getComments: async (todoId) => {
    const response = await api.get(`/todos/${todoId}/comments`);
    return response.data;
  },

  addComment: async (todoId, comment) => {
    const response = await api.post(`/todos/${todoId}/comments`, { content: comment });
    return response.data;
  },

  // Time tracking
  startTimer: async (todoId) => {
    const response = await api.post(`/todos/${todoId}/time/start`);
    return response.data;
  },

  stopTimer: async (trackingId) => {
    const response = await api.post(`/todos/time/${trackingId}/stop`);
    return response.data;
  },

  getActiveTimer: async () => {
    const response = await api.get('/todos/time/active');
    return response.data;
  },

  getTimeEntries: async (todoId) => {
    const response = await api.get(`/todos/${todoId}/time`);
    return response.data;
  },

  getTotalTime: async (todoId) => {
    const response = await api.get(`/todos/${todoId}/time/total`);
    return response.data;
  },

  // Attachments (not yet implemented in backend — stubs to prevent 404 crashes)
  uploadAttachment: async (_todoId, _file) => {
    throw new Error('Attachment upload is not yet supported.');
  },

  getAttachments: async (_todoId) => {
    // Return empty array gracefully until backend supports it
    return [];
  },

  deleteAttachment: async (_attachmentId) => {
    throw new Error('Attachment deletion is not yet supported.');
  },

  // Bulk operations
  bulkDelete: async (todoIds, permanent = false) => {
    const response = await api.post('/todos/bulk/delete', { 
      ids: todoIds, 
      permanent 
    });
    return response.data;
  },

  bulkUpdateStatus: async (todoIds, status) => {
    const response = await api.post('/todos/bulk/status', { 
      ids: todoIds, 
      status 
    });
    return response.data;
  },

  bulkAssign: async (todoIds, userId) => {
    const response = await api.post('/todos/bulk/assign', { 
      ids: todoIds, 
      userId 
    });
    return response.data;
  }
};
