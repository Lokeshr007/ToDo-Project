// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\hooks\usePlanParser.js
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as aiApi from '../api/aiApi';
import { advancedPlanParser } from '../utils/advancedPlanParser';
import { projectStructureBuilder } from '../utils/projectStructureBuilder';

export const usePlanParser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedPlan, setParsedPlan] = useState(null);
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  const parsePlan = useCallback(async (file, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, analyze the file locally
      const localAnalysis = await advancedPlanParser.analyzeFile(file);
      setAnalysis(localAnalysis);

      // Then send to backend for AI parsing
      const response = await aiApi.uploadAndParsePlan(file);
      
      const planData = {
        ...response.plan,
        localAnalysis
      };
      
      setParsedPlan(planData);
      
      toast.success('Plan parsed successfully!');
      return planData;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to parse plan';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateTasks = useCallback(async (plan, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await aiApi.generateTasks({ plan });
      
      const tasks = response.tasks.map((task, index) => ({
        ...task,
        id: task.id || `temp-${index}`,
        selected: options.selectAll !== false
      }));
      
      setGeneratedTasks(tasks);
      
      toast.success(`Generated ${tasks.length} tasks!`);
      return tasks;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate tasks';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateProjectStructure = useCallback(async (plan, tasks, workspaceId) => {
    setLoading(true);
    
    try {
      const structure = projectStructureBuilder.buildStructure(plan, tasks, {
        workspaceId,
        createBoards: true,
        createColumns: true
      });
      
      return structure;
    } catch (err) {
      console.error('Failed to generate project structure:', err);
      toast.error('Failed to generate project structure');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refinePlan = useCallback(async (planId, instructions) => {
    setLoading(true);
    setError(null);
    
    try {
      // This would call a backend API to refine the plan
      // For now, simulate refinement
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Plan refined successfully!');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to refine plan';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const extractTopics = useCallback((text) => {
    return advancedPlanParser.extractTopics(text);
  }, []);

  const calculateWorkload = useCallback((tasks) => {
    return advancedPlanParser.calculateWorkloadDistribution(tasks);
  }, []);

  const validatePlan = useCallback((plan) => {
    return advancedPlanParser.validatePlan(plan);
  }, []);

  const reset = useCallback(() => {
    setParsedPlan(null);
    setGeneratedTasks([]);
    setAnalysis(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    parsedPlan,
    generatedTasks,
    analysis,
    parsePlan,
    generateTasks,
    generateProjectStructure,
    refinePlan,
    extractTopics,
    calculateWorkload,
    validatePlan,
    reset
  };
};