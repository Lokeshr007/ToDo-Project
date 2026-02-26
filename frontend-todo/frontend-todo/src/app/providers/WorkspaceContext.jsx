// frontend/src/app/providers/WorkspaceContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '@/services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WorkspaceContext = createContext();

 // Add this export
export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Load workspaces when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Load saved workspace from localStorage on mount
  useEffect(() => {
    if (isAuthenticated) {
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      const savedWorkspaceData = localStorage.getItem('currentWorkspace');
      
      console.log('Loading workspace from localStorage:', { 
        savedWorkspaceId, 
        savedWorkspace: savedWorkspaceData 
      });
      
      if (savedWorkspaceId && savedWorkspaceData) {
        try {
          const parsedWorkspace = JSON.parse(savedWorkspaceData);
          setCurrentWorkspace(parsedWorkspace);
        } catch (e) {
          console.error('Failed to parse saved workspace:', e);
          localStorage.removeItem('currentWorkspaceId');
          localStorage.removeItem('currentWorkspace');
        }
      }
    }
  }, [isAuthenticated]);

  const loadWorkspaces = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching workspaces for user...');
      const response = await API.get('/workspaces');
      
      let workspacesData = [];
      if (response.data && Array.isArray(response.data)) {
        workspacesData = response.data;
      } else if (response.data && response.data.content) {
        workspacesData = response.data.content;
      }
      
      console.log('Workspaces loaded:', workspacesData);
      setWorkspaces(workspacesData);
      
      // Set current workspace if not already set and workspaces exist
      if (workspacesData.length > 0 && !currentWorkspace) {
        const savedId = localStorage.getItem('currentWorkspaceId');
        const saved = savedId ? workspacesData.find(w => w.id === parseInt(savedId)) : null;
        
        if (saved) {
          setCurrentWorkspace(saved);
        } else {
          setCurrentWorkspace(workspacesData[0]);
          localStorage.setItem('currentWorkspaceId', workspacesData[0].id);
          localStorage.setItem('currentWorkspace', JSON.stringify(workspacesData[0]));
        }
      }
      
    } catch (err) {
      console.error('Failed to load workspaces:', err);
      setError('Failed to load workspaces');
      
      // Don't show toast for 401 (unauthorized) as it's expected when not logged in
      if (err.response?.status !== 401) {
        toast.error('Failed to load workspaces');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchWorkspace = (workspace) => {
    if (!workspace) return;
    
    console.log('Switching to workspace:', workspace);
    setCurrentWorkspace(workspace);
    localStorage.setItem('currentWorkspaceId', workspace.id);
    localStorage.setItem('currentWorkspace', JSON.stringify(workspace));
    
    // Optional: Reload page or trigger data refresh
    window.dispatchEvent(new CustomEvent('workspaceChanged', { detail: workspace }));
  };

  const createWorkspace = async (name, description = '') => {
    try {
      const response = await API.post('/workspaces', { name, description });
      const newWorkspace = response.data;
      
      setWorkspaces(prev => [...prev, newWorkspace]);
      switchWorkspace(newWorkspace);
      
      toast.success('Workspace created successfully');
      return newWorkspace;
      
    } catch (err) {
      console.error('Failed to create workspace:', err);
      toast.error(err.response?.data?.message || 'Failed to create workspace');
      throw err;
    }
  };

  const refreshWorkspaces = () => {
    if (isAuthenticated && user) {
      loadWorkspaces();
    }
  };

  

  const value = {
    workspaces,
    currentWorkspace,
    loading,
    error,
    switchWorkspace,
    createWorkspace,
    refreshWorkspaces,
    isWorkspaceLoaded: !!currentWorkspace
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );

  
};
// Add these exports at the bottom of WorkspaceContext.jsx
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export { WorkspaceContext };
