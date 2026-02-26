import api from '../api';

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

  // Delete task
  deleteTodo: async (id) => {
    const response = await api.delete(`/todos/${id}`);
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

  getTimeEntries: async (todoId) => {
    const response = await api.get(`/todos/${todoId}/time`);
    return response.data;
  },

  getTotalTime: async (todoId) => {
    const response = await api.get(`/todos/${todoId}/time/total`);
    return response.data;
  },

  // Attachments
  uploadAttachment: async (todoId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/todos/${todoId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAttachments: async (todoId) => {
    const response = await api.get(`/todos/${todoId}/attachments`);
    return response.data;
  },

  deleteAttachment: async (attachmentId) => {
    const response = await api.delete(`/todos/attachments/${attachmentId}`);
    return response.data;
  },
};