// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\utils\smartScheduler.js
import { addDays, format, differenceInDays, isWeekend } from 'date-fns';

export const smartScheduler = {
  /**
   * Create optimal schedule from tasks
   */
  createOptimalSchedule: (tasks, preferences = {}) => {
    const schedule = {
      daily: {},
      weekly: {},
      totalDays: 0,
      totalHours: 0,
      startDate: preferences.startDate || new Date(),
      endDate: null
    };
    
    // Sort tasks by day
    const sortedTasks = [...tasks].sort((a, b) => (a.dayNumber || 0) - (b.dayNumber || 0));
    
    let currentDate = new Date(schedule.startDate);
    let currentDay = 1;
    
    sortedTasks.forEach(task => {
      const taskDay = task.dayNumber || currentDay;
      
      // Advance date if needed
      if (taskDay > currentDay) {
        const daysToAdd = taskDay - currentDay;
        currentDate = addDays(currentDate, daysToAdd);
        currentDay = taskDay;
      }
      
      // Add to daily schedule
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      if (!schedule.daily[dateKey]) {
        schedule.daily[dateKey] = {
          date: currentDate,
          dayNumber: taskDay,
          tasks: [],
          totalHours: 0,
          isWeekend: isWeekend(currentDate)
        };
      }
      
      schedule.daily[dateKey].tasks.push({
        ...task,
        scheduledDate: currentDate
      });
      
      if (task.estimatedHours) {
        schedule.daily[dateKey].totalHours += task.estimatedHours;
        schedule.totalHours += task.estimatedHours;
      }
      
      // Add to weekly schedule
      const weekNumber = task.weekNumber || Math.ceil(taskDay / 7);
      if (!schedule.weekly[weekNumber]) {
        schedule.weekly[weekNumber] = {
          weekNumber,
          tasks: [],
          totalHours: 0,
          startDate: currentDate,
          endDate: addDays(currentDate, 6)
        };
      }
      
      schedule.weekly[weekNumber].tasks.push(task);
      if (task.estimatedHours) {
        schedule.weekly[weekNumber].totalHours += task.estimatedHours;
      }
    });
    
    schedule.endDate = currentDate;
    schedule.totalDays = currentDay;
    
    return schedule;
  },

  /**
   * Optimize task order within a day
   */
  optimizeTaskOrder: (tasks) => {
    const prioritized = [...tasks].sort((a, b) => {
      // Priority order
      const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aWeight = priorityWeight[a.priority] || 2;
      const bWeight = priorityWeight[b.priority] || 2;
      
      if (aWeight !== bWeight) return bWeight - aWeight;
      
      // Estimated hours (shorter tasks first)
      if (a.estimatedHours && b.estimatedHours) {
        return a.estimatedHours - b.estimatedHours;
      }
      
      return 0;
    });
    
    return prioritized;
  },

  /**
   * Detect scheduling conflicts
   */
  detectConflicts: (tasks) => {
    const conflicts = [];
    const dailyLoad = {};
    
    tasks.forEach(task => {
      const day = task.dayNumber;
      if (!dailyLoad[day]) {
        dailyLoad[day] = { tasks: [], totalHours: 0 };
      }
      
      dailyLoad[day].tasks.push(task);
      if (task.estimatedHours) {
        dailyLoad[day].totalHours += task.estimatedHours;
      }
    });
    
    // Check for overloaded days
    Object.entries(dailyLoad).forEach(([day, data]) => {
      if (data.totalHours > 8) {
        conflicts.push({
          type: 'OVERLOAD',
          day: parseInt(day),
          message: `Day ${day} has ${data.totalHours.toFixed(1)} hours of work (recommended max 8)`,
          tasks: data.tasks,
          severity: 'HIGH'
        });
      } else if (data.totalHours > 6) {
        conflicts.push({
          type: 'HEAVY_LOAD',
          day: parseInt(day),
          message: `Day ${day} has ${data.totalHours.toFixed(1)} hours of work`,
          tasks: data.tasks,
          severity: 'MEDIUM'
        });
      }
      
      // Check task count
      if (data.tasks.length > 8) {
        conflicts.push({
          type: 'TOO_MANY_TASKS',
          day: parseInt(day),
          message: `Day ${day} has ${data.tasks.length} tasks (recommended max 8)`,
          tasks: data.tasks,
          severity: 'MEDIUM'
        });
      }
    });
    
    // Check for missing prerequisites
    const taskMap = new Map(tasks.map(t => [t.id || t.title, t]));
    
    tasks.forEach(task => {
      if (task.prerequisites && task.prerequisites.length > 0) {
        task.prerequisites.forEach(prereq => {
          // Find prerequisite task
          const prereqTask = tasks.find(t => 
            t.title.toLowerCase().includes(prereq.toLowerCase()) ||
            t.id === prereq
          );
          
          if (prereqTask && (prereqTask.dayNumber || 0) > (task.dayNumber || 0)) {
            conflicts.push({
              type: 'PREREQUISITE_ORDER',
              day: task.dayNumber,
              message: `Task "${task.title}" requires "${prereq}" which comes later`,
              tasks: [task, prereqTask],
              severity: 'HIGH'
            });
          }
        });
      }
    });
    
    return conflicts;
  },

  /**
   * Suggest schedule optimizations
   */
  suggestOptimizations: (tasks, preferences = {}) => {
    const suggestions = [];
    const dailyLoad = {};
    const preferredHours = preferences.dailyHours || 4;
    const maxHours = preferences.maxDailyHours || 8;
    
    // Calculate daily load
    tasks.forEach(task => {
      const day = task.dayNumber;
      if (!dailyLoad[day]) {
        dailyLoad[day] = { tasks: [], totalHours: 0 };
      }
      dailyLoad[day].tasks.push(task);
      if (task.estimatedHours) {
        dailyLoad[day].totalHours += task.estimatedHours;
      }
    });
    
    // Suggest spreading out overloaded days
    Object.entries(dailyLoad).forEach(([day, data]) => {
      if (data.totalHours > maxHours) {
        const excessHours = data.totalHours - preferredHours;
        const daysToSpread = Math.ceil(excessHours / preferredHours);
        
        suggestions.push({
          type: 'SPREAD_LOAD',
          day: parseInt(day),
          message: `Spread ${excessHours.toFixed(1)} hours from Day ${day} over next ${daysToSpread} days`,
          action: 'SPREAD',
          data: { day: parseInt(day), hours: excessHours, days: daysToSpread }
        });
      } else if (data.totalHours < preferredHours * 0.5 && data.tasks.length > 0) {
        suggestions.push({
          type: 'LIGHT_LOAD',
          day: parseInt(day),
          message: `Day ${day} has light load (${data.totalHours.toFixed(1)} hours). Consider adding review or practice.`,
          action: 'ADD_TASKS',
          data: { day: parseInt(day), availableHours: preferredHours - data.totalHours }
        });
      }
    });
    
    // Suggest optimal study times
    if (preferences.productiveHours) {
      suggestions.push({
        type: 'PRODUCTIVE_HOURS',
        message: `Schedule important tasks during your productive hours: ${preferences.productiveHours.join('-')}`,
        action: 'SCHEDULE',
        data: { hours: preferences.productiveHours }
      });
    }
    
    // Suggest breaks
    suggestions.push({
      type: 'BREAKS',
      message: 'Take a 5-10 minute break every 45-50 minutes of study',
      action: 'REMINDER',
      data: { interval: 45, breakDuration: 10 }
    });
    
    // Suggest review days
    const hasReviewDays = tasks.some(t => t.category?.toLowerCase().includes('review'));
    if (!hasReviewDays && tasks.length > 20) {
      suggestions.push({
        type: 'ADD_REVIEW_DAYS',
        message: 'Add review days every 7 days to reinforce learning',
        action: 'ADD_TASKS',
        data: { frequency: 7 }
      });
    }
    
    return suggestions;
  },

  /**
   * Reschedule a task to a new date
   */
  rescheduleTask: (tasks, taskId, newDate, newTime) => {
    return tasks.map(task => {
      if (task.id === taskId || task.title === taskId) {
        const newDay = differenceInDays(newDate, new Date()) + 1;
        return {
          ...task,
          dayNumber: Math.max(1, newDay),
          scheduledDate: newDate,
          scheduledTime: newTime
        };
      }
      return task;
    });
  },

  /**
   * Balance workload across days
   */
  balanceWorkload: (tasks, targetHours = 4) => {
    const balanced = [...tasks];
    const days = [...new Set(tasks.map(t => t.dayNumber).filter(d => d))].sort((a, b) => a - b);
    
    // Calculate current distribution
    const dailyHours = {};
    balanced.forEach(task => {
      const day = task.dayNumber;
      if (day) {
        dailyHours[day] = (dailyHours[day] || 0) + (task.estimatedHours || 1);
      }
    });
    
    // Find overloaded and underloaded days
    const overloaded = [];
    const underloaded = [];
    
    days.forEach(day => {
      const hours = dailyHours[day] || 0;
      if (hours > targetHours * 1.5) {
        overloaded.push({ day, excess: hours - targetHours });
      } else if (hours < targetHours * 0.5) {
        underloaded.push({ day, deficit: targetHours - hours });
      }
    });
    
    // Move tasks from overloaded to underloaded days
    overloaded.forEach(({ day, excess }) => {
      const dayTasks = balanced.filter(t => t.dayNumber === day);
      const movableTasks = dayTasks.filter(t => !t.fixed && t.estimatedHours <= excess);
      
      movableTasks.forEach(task => {
        if (underloaded.length > 0) {
          const targetDay = underloaded[0].day;
          task.dayNumber = targetDay;
          underloaded[0].deficit -= task.estimatedHours || 1;
          
          if (underloaded[0].deficit <= 0) {
            underloaded.shift();
          }
        }
      });
    });
    
    return balanced;
  },

  /**
   * Suggest productive hours for a day
   */
  suggestProductiveHours: (day, preferences = {}) => {
    const defaultProductive = ['09:00-12:00', '14:00-17:00', '19:00-21:00'];
    
    if (preferences.productiveHours) {
      return preferences.productiveHours;
    }
    
    // Adjust based on day of week
    if (isWeekend(day)) {
      return ['10:00-13:00', '15:00-18:00', '20:00-22:00'];
    }
    
    return defaultProductive;
  },

  /**
   * Calculate optimal breaks
   */
  calculateOptimalBreaks: (dailyTasks) => {
    const totalHours = dailyTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    const breaks = [];
    
    if (totalHours <= 2) {
      breaks.push({ time: 'middle', duration: 5 });
    } else if (totalHours <= 4) {
      breaks.push({ time: 'after 90min', duration: 10 });
      breaks.push({ time: 'after 3h', duration: 15 });
    } else {
      breaks.push({ time: 'every 90min', duration: 10, count: Math.floor(totalHours * 60 / 90) });
    }
    
    return breaks;
  },

  /**
   * Get schedule for a specific day
   */
  getDailySchedule: (tasks, date) => {
    const dayNumber = differenceInDays(date, new Date()) + 1;
    
    return tasks
      .filter(t => t.dayNumber === dayNumber)
      .sort((a, b) => {
        // Sort by priority then estimated hours
        const priorityWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const aWeight = priorityWeight[a.priority] || 2;
        const bWeight = priorityWeight[b.priority] || 2;
        
        if (aWeight !== bWeight) return bWeight - aWeight;
        return (a.estimatedHours || 0) - (b.estimatedHours || 0);
      });
  },

  /**
   * Get schedule for a week
   */
  getWeeklySchedule: (tasks, startDate) => {
    const startDay = differenceInDays(startDate, new Date()) + 1;
    const weekly = {};
    
    for (let i = 0; i < 7; i++) {
      const day = startDay + i;
      const date = addDays(startDate, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      weekly[dateKey] = {
        date,
        dayNumber: day,
        tasks: tasks.filter(t => t.dayNumber === day),
        isWeekend: isWeekend(date)
      };
    }
    
    return weekly;
  },

  /**
   * Apply a scheduling suggestion
   */
  applySuggestion: (tasks, suggestion) => {
    switch (suggestion.action) {
      case 'SPREAD':
        return smartScheduler.spreadLoad(tasks, suggestion.data);
      case 'ADD_TASKS':
        return smartScheduler.addReviewTasks(tasks, suggestion.data);
      default:
        return tasks;
    }
  },

  /**
   * Spread load from an overloaded day
   */
  spreadLoad: (tasks, { day, hours, days }) => {
    const updated = [...tasks];
    const dayTasks = updated.filter(t => t.dayNumber === day);
    const hoursPerDay = hours / days;
    
    dayTasks.forEach((task, index) => {
      if (index < days) {
        task.dayNumber = day + index + 1;
        task.estimatedHours = hoursPerDay;
      }
    });
    
    return updated;
  },

  /**
   * Add review tasks
   */
  addReviewTasks: (tasks, { day, availableHours }) => {
    const newTasks = [];
    const reviewTask = {
      id: `review-${Date.now()}`,
      dayNumber: day,
      title: 'Review and Practice',
      description: 'Review previous material and practice concepts',
      priority: 'MEDIUM',
      estimatedHours: Math.min(availableHours, 2),
      category: 'Review',
      tags: ['review', 'practice'],
      type: 'review'
    };
    
    newTasks.push(reviewTask);
    return [...tasks, ...newTasks];
  },

  /**
   * Export schedule to calendar format
   */
  exportSchedule: (tasks, format = 'ical') => {
    if (format === 'ical') {
      let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//SmartScheduler//EN\n';
      
      tasks.forEach(task => {
        if (task.scheduledDate) {
          const date = new Date(task.scheduledDate);
          const start = format(date, "yyyyMMdd'T'HHmmss");
          const end = format(addDays(date, 1), "yyyyMMdd'T'HHmmss");
          
          ical += 'BEGIN:VEVENT\n';
          ical += `UID:${task.id || Math.random()}@smartscheduler\n`;
          ical += `DTSTART:${start}\n`;
          ical += `DTEND:${end}\n`;
          ical += `SUMMARY:${task.title}\n`;
          ical += `DESCRIPTION:${task.description || ''}\n`;
          ical += 'END:VEVENT\n';
        }
      });
      
      ical += 'END:VCALENDAR';
      return ical;
    }
    
    return JSON.stringify(tasks, null, 2);
  }
};