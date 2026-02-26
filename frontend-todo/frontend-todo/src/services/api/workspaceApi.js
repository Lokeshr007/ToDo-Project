import api from '../api';

export const workspaceApi = {
  // Get all workspaces for current user
  getWorkspaces: async () => {
    const response = await api.get('/workspaces');
    return response.data;
  },

  // Get workspace by ID
  getWorkspace: async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}`);
    return response.data;
  },

  // Create new workspace
  createWorkspace: async (workspaceData) => {
    const response = await api.post('/workspaces', workspaceData);
    return response.data;
  },

  // Update workspace
  updateWorkspace: async (workspaceId, workspaceData) => {
    const response = await api.put(`/workspaces/${workspaceId}`, workspaceData);
    return response.data;
  },

  // Delete workspace
  deleteWorkspace: async (workspaceId) => {
    const response = await api.delete(`/workspaces/${workspaceId}`);
    return response.data;
  },

  // Get workspace members
  getWorkspaceMembers: async (workspaceId) => {
    const response = await api.get(`/workspaces/${workspaceId}/members`);
    return response.data;
  },

  // Add member to workspace
  addWorkspaceMember: async (workspaceId, memberData) => {
    const response = await api.post(`/workspaces/${workspaceId}/members`, memberData);
    return response.data;
  },

  // Update member role
  updateMemberRole: async (workspaceId, userId, roleData) => {
    const response = await api.put(`/workspaces/${workspaceId}/members/${userId}`, roleData);
    return response.data;
  },

  // Remove member from workspace
  removeWorkspaceMember: async (workspaceId, userId) => {
    const response = await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
  },
};