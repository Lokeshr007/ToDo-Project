// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\hooks\useEnterpriseAI.js
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as enterpriseAIApi from '../api/enterpriseAIApi';
import * as contextApi from '../api/contextApi';

export const useEnterpriseAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [context, setContext] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const processMessage = useCallback(async (message, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await enterpriseAIApi.processNaturalLanguage(message, {
        ...options,
        sessionId: options.sessionId || sessionId
      });
      
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to process message';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const processFile = useCallback(async (file, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await enterpriseAIApi.processFile(file, {
        ...options,
        sessionId: options.sessionId || sessionId
      });
      
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }
      
      toast.success('File processed successfully!');
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to process file';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const refinePlan = useCallback(async (planId, instructions) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await enterpriseAIApi.refinePlan(planId, instructions);
      toast.success('Plan refined successfully!');
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to refine plan';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptTasks = useCallback(async (taskIds, workspaceId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await enterpriseAIApi.acceptTasks(taskIds, workspaceId);
      toast.success(`Created ${response.createdCount} tasks!`);
      return response;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to accept tasks';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getContext = useCallback(async (sid) => {
    setLoading(true);
    
    try {
      const response = await contextApi.getContext(sid || sessionId);
      setContext(response.insights);
      return response;
    } catch (err) {
      console.error('Failed to get context:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const updateContext = useCallback(async (updates) => {
    if (!sessionId) return;
    
    try {
      await contextApi.updateContext(sessionId, updates);
      await getContext(sessionId);
    } catch (err) {
      console.error('Failed to update context:', err);
    }
  }, [sessionId, getContext]);

  const addMessageToContext = useCallback(async (role, content, metadata = {}) => {
    if (!sessionId) return;
    
    try {
      await contextApi.addMessageToContext(sessionId, role, content, metadata);
    } catch (err) {
      console.error('Failed to add message to context:', err);
    }
  }, [sessionId]);

  const clearContext = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      await contextApi.clearContext(sessionId);
      setSessionId(null);
      setContext(null);
      toast.success('Context cleared');
    } catch (err) {
      console.error('Failed to clear context:', err);
    }
  }, [sessionId]);

  return {
    loading,
    error,
    context,
    sessionId,
    processMessage,
    processFile,
    refinePlan,
    acceptTasks,
    getContext,
    updateContext,
    addMessageToContext,
    clearContext,
    setSessionId
  };
};