// frontend/src/features/ai-assistant/hooks/useAIAssistant.js
import { useState } from 'react';
import API from '@/services/api';
import toast from 'react-hot-toast';

const useAIAssistant = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Parse uploaded study plan
  const parsePlan = async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await API.post('/ai/parse-plan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to parse plan');
      }
      
      return response.data.plan;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to parse study plan';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Generate tasks from parsed plan
  const generateTasksFromPlan = async (plan, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await API.post('/ai/generate-tasks', { 
        plan,
        regenerate: options.regenerate || false
      });
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to generate tasks');
      }
      
      return response.data.tasks;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to generate tasks';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Save generated tasks to Todo system
  const saveTasks = async (tasks, workspaceId) => {
    setLoading(true);
    setError(null);
    
    try {
      if (!workspaceId) {
        throw new Error('No workspace selected');
      }
      
      let savedCount = 0;
      const errors = [];
      
      // Process tasks one by one to better handle errors
      for (const task of tasks) {
        try {
          // Format due date if it's a string
          let dueDate = task.dueDate;
          if (dueDate && typeof dueDate === 'string') {
            // Keep as is, backend will parse
          } else if (dueDate && dueDate instanceof Date) {
            dueDate = dueDate.toISOString().split('T')[0];
          }
          
          await API.post('/todos', {
            item: task.title,
            description: task.description || '',
            priority: task.priority?.toUpperCase() || 'NORMAL',
            dueDate: dueDate,
            estimatedHours: task.estimatedHours,
            labels: task.tags || [],
            workspaceId: workspaceId
          });
          savedCount++;
        } catch (err) {
          errors.push(`Failed to save: ${task.title}`);
        }
      }
      
      if (errors.length > 0) {
        toast.error(`${errors.length} tasks failed to save`);
      }
      
      return savedCount;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save tasks';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Chat with AI about the plan
  const chatWithAI = async (message, context) => {
    setLoading(true);
    
    try {
      const response = await API.post('/ai/chat', {
        message,
        context
      });
      
      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to get AI response');
      }
      
      return response.data.response;
    } catch (err) {
      toast.error('Failed to get AI response');
      return "I'm having trouble responding right now. Please try again.";
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    parsePlan,
    generateTasksFromPlan,
    saveTasks,
    chatWithAI
  };
};

export default useAIAssistant;