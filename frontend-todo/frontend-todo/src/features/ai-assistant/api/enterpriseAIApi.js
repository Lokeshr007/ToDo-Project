import API from '@/services/api';

export const enterpriseAI = {
  // Process any AI request
  processRequest: async (data) => {
    const response = await API.post('/enterprise-ai/process', data);
    return response.data;
  },

  // Upload and parse file
  uploadAndParse: async (file, workspaceId, createProject = true) => {
    const formData = new FormData();
    formData.append('file', file);
    if (workspaceId) formData.append('workspaceId', workspaceId);
    formData.append('createProject', createProject);

    const response = await API.post('/enterprise-ai/upload-and-parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Chat with AI
  chat: async (message, sessionId, context = {}) => {
    const response = await API.post('/enterprise-ai/chat', {
      message,
      sessionId,
      context
    });
    return response.data;
  },

  // Generate tasks from plan
  generateTasks: async (planId, createProject = true) => {
    const response = await API.post(`/enterprise-ai/generate-tasks/${planId}`, null, {
      params: { createProject }
    });
    return response.data;
  },

  // Refine plan
  refinePlan: async (planId, instructions, context = {}) => {
    const response = await API.post(`/enterprise-ai/refine/${planId}`, {
      instructions,
      context
    });
    return response.data;
  },

  // Get context
  getContext: async (sessionId) => {
    const response = await API.get(`/enterprise-ai/context/${sessionId}`);
    return response.data;
  },

  // Clear context
  clearContext: async (sessionId) => {
    const response = await API.delete(`/enterprise-ai/context/${sessionId}`);
    return response.data;
  }
};

// Named exports matching what useEnterpriseAI hook imports
export const processNaturalLanguage = async (message, options = {}) => {
  const response = await API.post('/enterprise-ai/chat', {
    message,
    sessionId: options.sessionId,
    context: options.context || {}
  });
  return response.data;
};

export const processFile = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.workspaceId) formData.append('workspaceId', options.workspaceId);
  if (options.sessionId) formData.append('sessionId', options.sessionId);

  const response = await API.post('/enterprise-ai/upload-and-parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const refinePlan = async (planId, instructions) => {
  const response = await API.post(`/enterprise-ai/refine/${planId}`, { instructions });
  return response.data;
};

export const acceptTasks = async (taskIds, workspaceId) => {
  const response = await API.post('/enterprise-ai/accept-tasks', { taskIds, workspaceId });
  return response.data;
};
