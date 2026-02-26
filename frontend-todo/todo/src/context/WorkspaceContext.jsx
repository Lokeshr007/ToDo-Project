import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {useAuth} from "./AuthContext"
import { workspaceApi } from '../services/api/workspaceApi';
import api from '../services/api';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load workspaces on user login
  useEffect(() => {
    if (user) {
      loadWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      localStorage.removeItem('currentWorkspaceId');
    }
  }, [user]);

  // Set workspace ID in localStorage when changed
  useEffect(() => {
    if (currentWorkspace) {
      localStorage.setItem('currentWorkspaceId', currentWorkspace.id);
      // Update default workspace header for future requests
      api.defaults.headers.common['X-Workspace-ID'] = currentWorkspace.id;
    } else {
      localStorage.removeItem('currentWorkspaceId');
      delete api.defaults.headers.common['X-Workspace-ID'];
    }
  }, [currentWorkspace]);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const data = await workspaceApi.getWorkspaces();
      setWorkspaces(data);
      
      // Set current workspace from localStorage or first workspace
      const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
      if (savedWorkspaceId) {
        const savedWorkspace = data.find(w => w.id === parseInt(savedWorkspaceId));
        if (savedWorkspace) {
          setCurrentWorkspace(savedWorkspace);
        } else if (data.length > 0) {
          setCurrentWorkspace(data[0]);
        }
      } else if (data.length > 0) {
        setCurrentWorkspace(data[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load workspaces');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (workspaceData) => {
    setLoading(true);
    try {
      const newWorkspace = await workspaceApi.createWorkspace(workspaceData);
      setWorkspaces(prev => [...prev, newWorkspace]);
      return newWorkspace;
    } catch (err) {
      setError('Failed to create workspace');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (workspaceId, workspaceData) => {
    setLoading(true);
    try {
      const updatedWorkspace = await workspaceApi.updateWorkspace(workspaceId, workspaceData);
      setWorkspaces(prev => prev.map(w => w.id === workspaceId ? updatedWorkspace : w));
      
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(updatedWorkspace);
      }
      
      return updatedWorkspace;
    } catch (err) {
      setError('Failed to update workspace');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    setLoading(true);
    try {
      await workspaceApi.deleteWorkspace(workspaceId);
      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
      
      if (currentWorkspace?.id === workspaceId) {
        const nextWorkspace = workspaces.find(w => w.id !== workspaceId);
        setCurrentWorkspace(nextWorkspace || null);
      }
    } catch (err) {
      setError('Failed to delete workspace');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const switchWorkspace = useCallback((workspaceId) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  }, [workspaces]);

  const refreshWorkspaces = useCallback(() => {
    if (user) {
      loadWorkspaces();
    }
  }, [user]);

  const value = {
    workspaces,
    currentWorkspace,
    loading,
    error,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    switchWorkspace,
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};