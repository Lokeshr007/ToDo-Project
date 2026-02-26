// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\utils\learningPathVisualizer.js

/**
 * Generate data for learning path visualization
 */
export const generatePathVisualization = (plan, tasks) => {
  const weeks = Math.ceil(plan.durationDays / 7);
  const visualization = {
    nodes: [],
    edges: [],
    milestones: [],
    progress: []
  };
  
  // Create nodes for each week
  for (let week = 1; week <= weeks; week++) {
    const weekTasks = tasks.filter(t => t.weekNumber === week);
    const weekProgress = calculateWeekProgress(weekTasks);
    
    visualization.nodes.push({
      id: `week-${week}`,
      type: 'week',
      label: `Week ${week}`,
      tasks: weekTasks.length,
      progress: weekProgress,
      color: getWeekColor(week)
    });
    
    // Add edges between consecutive weeks
    if (week > 1) {
      visualization.edges.push({
        from: `week-${week - 1}`,
        to: `week-${week}`,
        type: 'prerequisite'
      });
    }
  }
  
  // Add milestone nodes
  plan.milestones?.forEach((milestone, index) => {
    visualization.milestones.push({
      id: `milestone-${index}`,
      day: milestone.day,
      description: milestone.description,
      achieved: milestone.achieved || false
    });
  });
  
  // Generate progress data
  const today = new Date();
  const startDate = new Date();
  for (let day = 1; day <= plan.durationDays; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day - 1);
    
    const dayTasks = tasks.filter(t => t.dayNumber === day);
    const completed = dayTasks.filter(t => t.status === 'COMPLETED').length;
    
    visualization.progress.push({
      day,
      date: date.toISOString().split('T')[0],
      completed,
      total: dayTasks.length,
      isToday: date.toDateString() === today.toDateString()
    });
  }
  
  return visualization;
};

/**
 * Calculate week progress
 */
const calculateWeekProgress = (tasks) => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.status === 'COMPLETED').length;
  return (completed / tasks.length) * 100;
};

/**
 * Get color for week visualization
 */
const getWeekColor = (week) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
    '#f97316', '#a855f7', '#14b8a6', '#d946ef'
  ];
  return colors[(week - 1) % colors.length];
};

/**
 * Generate timeline data
 */
export const generateTimeline = (plan, tasks) => {
  const timeline = [];
  
  tasks.forEach(task => {
    if (task.dayNumber) {
      timeline.push({
        id: task.id,
        title: task.title,
        start: task.dayNumber,
        end: task.dayNumber,
        group: task.category,
        className: `timeline-${task.priority?.toLowerCase()}`,
        content: task.title
      });
    }
  });
  
  return timeline;
};

/**
 * Calculate critical path
 */
export const calculateCriticalPath = (tasks) => {
  const dependencies = {};
  const longestPath = [];
  
  // Build dependency graph
  tasks.forEach(task => {
    if (task.prerequisites && task.prerequisites.length > 0) {
      dependencies[task.id || task.title] = task.prerequisites;
    }
  });
  
  // Find longest path (simplified)
  const findPath = (taskId, path = []) => {
    path.push(taskId);
    
    const dependents = Object.entries(dependencies)
      .filter(([_, prereqs]) => prereqs.includes(taskId))
      .map(([id]) => id);
    
    if (dependents.length === 0) {
      if (path.length > longestPath.length) {
        longestPath.length = 0;
        longestPath.push(...path);
      }
    } else {
      dependents.forEach(dep => findPath(dep, [...path]));
    }
  };
  
  // Start from tasks with no prerequisites
  const startTasks = tasks
    .filter(t => !t.prerequisites || t.prerequisites.length === 0)
    .map(t => t.id || t.title);
  
  startTasks.forEach(taskId => findPath(taskId));
  
  return longestPath;
};

/**
 * Generate learning path recommendations
 */
export const generatePathRecommendations = (plan, progress) => {
  const recommendations = [];
  const completedTasks = progress.filter(p => p.completed).length;
  const totalTasks = progress.reduce((sum, p) => sum + p.total, 0);
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  if (completionRate < 30) {
    recommendations.push({
      type: 'PACE',
      message: 'You\'re just getting started! Focus on building momentum.',
      action: 'Set aside dedicated time each day'
    });
  } else if (completionRate < 70) {
    recommendations.push({
      type: 'PACE',
      message: 'Good progress! Keep up the consistency.',
      action: 'Review completed material regularly'
    });
  } else {
    recommendations.push({
      type: 'PACE',
      message: 'Almost there! Push through to the finish line.',
      action: 'Focus on remaining challenging topics'
    });
  }
  
  // Check for gaps in learning
  const categories = {};
  progress.forEach(day => {
    // This would need actual category data
  });
  
  return recommendations;
};