// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\hooks\useAIContext.js
import { useState, useCallback, useEffect } from 'react';
import { taskToast } from '@/shared/components/QuantumToaster';
import * as contextApi from '../api/contextApi';
import API from '@/services/api';

export const useAIContext = (initialSessionId = null) => {
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [messageHistory, setMessageHistory] = useState([]);
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    if (sessionId) {
      loadContext();
    }
  }, [sessionId]);

  const loadContext = async () => {
    setLoading(true);
    try {
      const contextData = await contextApi.getContext(sessionId);
      setContext(contextData.insights || {});
      setPreferences(contextData.insights?.preferences || {});
      
      const messages = await contextApi.getContextMessages(sessionId);
      setMessageHistory(messages);
    } catch (error) {
      console.error('Failed to load context:', error);
    } finally {
      setLoading(false);
    }
  };

  const createContext = useCallback(async (learningStyle = 'VISUAL', attentionSpan = 45) => {
    setLoading(true);
    try {
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const response = await contextApi.createContext(newSessionId, learningStyle, {
        attentionSpan,
        createdAt: new Date().toISOString()
      });
      
      setSessionId(newSessionId);
      setContext(response.insights || {});
      taskToast.success('New conversation started');
      
      return newSessionId;
    } catch (error) {
      taskToast.error('Failed to create context');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateContext = useCallback(async (updates) => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      await contextApi.updateContext(sessionId, updates);
      setContext(prev => ({ ...prev, ...updates }));
      
      if (updates.preferences) {
        setPreferences(updates.preferences);
      }
    } catch (error) {
      console.error('Failed to update context:', error);
      taskToast.error('Failed to update context');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const addMessage = useCallback(async (role, content, metadata = {}) => {
    if (!sessionId) return;
    
    try {
      await contextApi.addMessageToContext(sessionId, role, content, metadata);
      setMessageHistory(prev => [...prev, {
        role,
        content,
        timestamp: new Date().toISOString(),
        metadata
      }]);
    } catch (error) {
      console.error('Failed to add message:', error);
    }
  }, [sessionId]);

  const clearContext = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      await contextApi.clearContext(sessionId);
      setContext(null);
      setMessageHistory([]);
      setPreferences({});
      taskToast.success('Context cleared');
    } catch (error) {
      console.error('Failed to clear context:', error);
    }
  }, [sessionId]);

  const updateLearningStyle = useCallback(async (style) => {
    await updateContext({ learningStyle: style });
    taskToast.success(`Learning style updated to ${style}`);
  }, [updateContext]);

  const updateAttentionSpan = useCallback(async (minutes) => {
    await updateContext({ attentionSpan: minutes });
    taskToast.success(`Attention span updated to ${minutes} minutes`);
  }, [updateContext]);

  const addStrength = useCallback(async (strength) => {
    const currentStrengths = context?.strengths || [];
    await updateContext({ 
      strengths: [...currentStrengths, strength] 
    });
  }, [context, updateContext]);

  const addWeakness = useCallback(async (weakness) => {
    const currentWeaknesses = context?.weaknesses || [];
    await updateContext({ 
      weaknesses: [...currentWeaknesses, weakness] 
    });
  }, [context, updateContext]);

  const getContextSummary = useCallback(() => {
    if (!context) return null;
    
    return {
      learningStyle: context.learningStyle || 'VISUAL',
      attentionSpan: context.attentionSpan || 45,
      interactionCount: context.interactionCount || 0,
      lastInteraction: context.lastInteraction,
      strengths: context.strengths || [],
      weaknesses: context.weaknesses || [],
      progressRate: context.progressRate || 0
    };
  }, [context]);

  // Returns learning insights summary — used by EnterpriseAIChat
  const getLearningInsights = useCallback(() => {
    return getContextSummary();
  }, [getContextSummary]);

  // Send a user message and get AI response, auto-creating session if needed
  const sendMessage = useCallback(async (message) => {
    setLoading(true);
    try {
      let activeSessionId = sessionId;

      // Auto-create a session if none exists
      if (!activeSessionId) {
        activeSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(activeSessionId);
      }

      // Optimistically add user message
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      setMessageHistory(prev => [...prev, userMessage]);

      // Send to backend
      let assistantContent = "I'm here to help with your learning journey! What would you like to explore?";
      try {
        const response = await API.post('/ai/chat', {
          message,
          sessionId: activeSessionId
        });
        // Defensively extract a string from any backend response shape
        const d = response.data;
        const candidate =
          (typeof d?.response   === 'string' && d.response)   ||
          (typeof d?.message    === 'string' && d.message)    ||
          (typeof d?.content    === 'string' && d.content)    ||
          (typeof d?.reply      === 'string' && d.reply)      ||
          (typeof d?.text       === 'string' && d.text)       ||
          (typeof d?.data?.message === 'string' && d.data.message) ||
          (typeof d             === 'string' && d);
        if (candidate) assistantContent = candidate;
      } catch {
        // Keep fallback response if API unavailable
      }

      const assistantMessage = {
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString()
      };
      setMessageHistory(prev => [...prev, assistantMessage]);

      return assistantMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      taskToast.error('Failed to send message');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return {
    loading,
    context,
    sessionId,
    messageHistory,
    preferences,
    createContext,
    updateContext,
    addMessage,
    clearContext,
    updateLearningStyle,
    updateAttentionSpan,
    addStrength,
    addWeakness,
    getContextSummary,
    getLearningInsights,
    sendMessage,
    setSessionId
  };
};
