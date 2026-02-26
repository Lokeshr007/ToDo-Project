import api from '../api';

export const projectApi = {
  // Get all projects in current workspace
  getProjects: async (workspaceId) => {
    const response = await api.get('/projects', {
      params: { workspaceId }
    });
    return response.data;
  },

  // Get project by ID
  getProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (workspaceId, projectData) => {
    const response = await api.post('/projects', projectData, {
      params: { workspaceId }
    });
    return response.data;
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Get project statistics
  getProjectStats: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/stats`);
    return response.data;
  },
};