// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\hooks\useLearningPath.js
import { useState, useCallback, useEffect } from 'react';
import { taskToast } from '@/shared/components/QuantumToaster';
import * as learningPathApi from '../api/learningPathApi';
import { generatePathVisualization, calculateCriticalPath } from '../utils/learningPathVisualizer';

export const useLearningPath = (pathId) => {
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [visualization, setVisualization] = useState(null);
  const [criticalPath, setCriticalPath] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (pathId) {
      fetchLearningPath();
    }
  }, [pathId]);

  const fetchLearningPath = async () => {
    setLoading(true);
    try {
      const pathData = await learningPathApi.getLearningPath(pathId);
      setPath(pathData);
      
      // Generate visualization
      const vis = generatePathVisualization(pathData, pathData.tasks || []);
      setVisualization(vis);
      
      // Calculate critical path
      const critical = calculateCriticalPath(pathData.tasks || []);
      setCriticalPath(critical);
      
    } catch (error) {
      console.error('Failed to fetch learning path:', error);
      taskToast.error('Failed to load learning path');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = useCallback(async () => {
    try {
      const progressData = await learningPathApi.getLearningPathProgress(pathId);
      setProgress(progressData);
      
      // Generate recommendations based on progress
      if (path) {
        const recs = generateRecommendations(path, progressData);
        setRecommendations(recs);
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  }, [pathId, path]);

  const updatePath = useCallback(async (updates) => {
    setLoading(true);
    try {
      const updated = await learningPathApi.updateLearningPath(pathId, updates);
      setPath(updated);
      taskToast.success('Learning path updated');
      return updated;
    } catch (error) {
      taskToast.error('Failed to update learning path');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pathId]);

  const deletePath = useCallback(async () => {
    setLoading(true);
    try {
      await learningPathApi.deleteLearningPath(pathId);
      taskToast.success('Learning path deleted');
      return true;
    } catch (error) {
      taskToast.error('Failed to delete learning path');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pathId]);

  const clonePath = useCallback(async () => {
    setLoading(true);
    try {
      const cloned = await learningPathApi.cloneLearningPath(pathId);
      taskToast.success('Learning path cloned');
      return cloned;
    } catch (error) {
      taskToast.error('Failed to clone learning path');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [pathId]);

  const ratePath = useCallback(async (rating, review) => {
    try {
      await learningPathApi.rateLearningPath(pathId, rating, review);
      taskToast.success('Thank you for rating!');
    } catch (error) {
      taskToast.error('Failed to submit rating');
      throw error;
    }
  }, [pathId]);

  const generateRecommendations = (currentPath, currentProgress) => {
    const recs = [];
    
    if (!currentPath || !currentProgress) return recs;
    
    const completionRate = currentProgress.completionRate || 0;
    
    if (completionRate < 30) {
      recs.push({
        type: 'MOTIVATION',
        title: 'Getting Started',
        message: 'You\'re at the beginning of your journey. Focus on building a consistent routine.',
        action: 'Set a daily study time'
      });
    } else if (completionRate < 70) {
      recs.push({
        type: 'MOMENTUM',
        title: 'Keep Going',
        message: 'Good progress! Now is the time to maintain momentum.',
        action: 'Review completed material weekly'
      });
    } else {
      recs.push({
        type: 'FINISH_STRONG',
        title: 'Almost There',
        message: 'You\'re in the final stretch. Focus on challenging topics.',
        action: 'Create a study group for motivation'
      });
    }
    
    // Add critical path recommendations
    if (criticalPath.length > 0) {
      recs.push({
        type: 'CRITICAL_PATH',
        title: 'Critical Path',
        message: 'These tasks are essential for your progress',
        tasks: criticalPath.slice(0, 3)
      });
    }
    
    return recs;
  };

  const markMilestone = useCallback(async (milestoneId) => {
    try {
      // API call to mark milestone
      taskToast.success('Milestone achieved! 🎉');
      await fetchProgress();
    } catch (error) {
      taskToast.error('Failed to mark milestone');
    }
  }, [fetchProgress]);

  return {
    loading,
    path,
    tasks,
    progress,
    visualization,
    criticalPath,
    recommendations,
    fetchLearningPath,
    fetchProgress,
    updatePath,
    deletePath,
    clonePath,
    ratePath,
    markMilestone,
    generateRecommendations
  };
};
