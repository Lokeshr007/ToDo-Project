// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\utils\projectStructureBuilder.js

export const projectStructureBuilder = {
  /**
   * Build project structure from plan and tasks
   */
  buildStructure: (plan, tasks, options = {}) => {
    const structure = {
      project: projectStructureBuilder.buildProject(plan),
      boards: [],
      totalTasks: tasks.length,
      estimatedHours: plan.estimatedTotalHours || tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    };
    
    // Group tasks by week
    const tasksByWeek = tasks.reduce((acc, task) => {
      const week = task.weekNumber || Math.ceil((task.dayNumber || 1) / 7);
      if (!acc[week]) acc[week] = [];
      acc[week].push(task);
      return acc;
    }, {});
    
    // Create boards for each week
    Object.entries(tasksByWeek).forEach(([week, weekTasks], index) => {
      const board = projectStructureBuilder.buildBoard(week, weekTasks, index);
      structure.boards.push(board);
    });
    
    // Add metadata
    structure.metadata = {
      createdAt: new Date().toISOString(),
      source: 'AI_GENERATED',
      confidence: plan.confidenceScore || 85,
      workspaceId: options.workspaceId
    };
    
    return structure;
  },

  /**
   * Build project object
   */
  buildProject: (plan) => {
    return {
      name: plan.title || 'Learning Project',
      description: plan.description || 'AI-generated learning project',
      color: projectStructureBuilder.generateColor(plan.category),
      type: 'LEARNING',
      metadata: {
        duration: plan.durationDays || 60,
        difficulty: plan.difficulty || 'INTERMEDIATE',
        category: plan.category || 'DEVELOPMENT',
        topics: plan.topics || []
      }
    };
  },

  /**
   * Build board for a week
   */
  buildBoard: (week, tasks, index) => {
    const boardName = projectStructureBuilder.getBoardName(week, tasks);
    
    return {
      name: boardName,
      description: `Week ${week} tasks for your learning journey`,
      color: projectStructureBuilder.getBoardColor(week),
      orderIndex: index,
      columns: projectStructureBuilder.buildColumns(week, tasks),
      metadata: {
        week: parseInt(week),
        taskCount: tasks.length,
        totalHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
        theme: projectStructureBuilder.getWeekTheme(week, tasks)
      }
    };
  },

  /**
   * Build columns for a board
   */
  buildColumns: (week, tasks) => {
    const columns = [
      {
        name: 'To Do',
        type: 'TODO',
        color: '#6b7280',
        orderIndex: 0,
        wipLimit: 0,
        tasks: projectStructureBuilder.filterTasksByStatus(tasks, ['PENDING', 'TODO'])
      },
      {
        name: 'In Progress',
        type: 'IN_PROGRESS',
        color: '#3b82f6',
        orderIndex: 1,
        wipLimit: 3,
        tasks: projectStructureBuilder.filterTasksByStatus(tasks, ['IN_PROGRESS'])
      },
      {
        name: 'Review',
        type: 'REVIEW',
        color: '#a855f7',
        orderIndex: 2,
        wipLimit: 2,
        tasks: projectStructureBuilder.filterTasksByStatus(tasks, ['REVIEW'])
      },
      {
        name: 'Done',
        type: 'DONE',
        color: '#22c55e',
        orderIndex: 3,
        wipLimit: 0,
        tasks: projectStructureBuilder.filterTasksByStatus(tasks, ['COMPLETED', 'DONE'])
      }
    ];
    
    return columns;
  },

  /**
   * Filter tasks by status
   */
  filterTasksByStatus: (tasks, statuses) => {
    return tasks
      .filter(task => statuses.includes(task.status || 'PENDING'))
      .map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        estimatedHours: task.estimatedHours,
        tags: task.tags,
        dayNumber: task.dayNumber
      }));
  },

  /**
   * Generate board name based on week and tasks
   */
  getBoardName: (week, tasks) => {
    const themes = {
      1: 'Foundations',
      2: 'Building Blocks',
      3: 'Core Concepts',
      4: 'Practice',
      5: 'Advanced Topics',
      6: 'Projects',
      7: 'Review',
      8: 'Mastery'
    };
    
    const theme = themes[week] || `Week ${week}`;
    
    // Check if there's a dominant category
    const categories = tasks.reduce((acc, t) => {
      if (t.category) {
        acc[t.category] = (acc[t.category] || 0) + 1;
      }
      return acc;
    }, {});
    
    const dominantCategory = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    if (dominantCategory) {
      return `${theme}: ${dominantCategory}`;
    }
    
    return `${theme} - Week ${week}`;
  },

  /**
   * Generate color for board
   */
  getBoardColor: (week) => {
    const colors = [
      '#6366f1', // Indigo
      '#8b5cf6', // Purple
      '#d946ef', // Pink
      '#ec4899', // Rose
      '#f43f5e', // Red
      '#f97316', // Orange
      '#eab308', // Yellow
      '#22c55e', // Green
      '#06b6d4', // Cyan
      '#3b82f6'  // Blue
    ];
    
    return colors[(week - 1) % colors.length];
  },

  /**
   * Generate color based on category
   */
  generateColor: (category) => {
    const categoryColors = {
      DEVELOPMENT: '#6366f1',
      LANGUAGE: '#8b5cf6',
      BUSINESS: '#f59e0b',
      FITNESS: '#22c55e',
      ACADEMIC: '#ec4899',
      CREATIVE: '#d946ef',
      TECHNOLOGY: '#3b82f6',
      SCIENCE: '#06b6d4',
      ARTS: '#f43f5e',
      MUSIC: '#a855f7'
    };
    
    return categoryColors[category] || '#6366f1';
  },

  /**
   * Determine week theme
   */
  getWeekTheme: (week, tasks) => {
    // Analyze tasks to determine theme
    const categories = tasks.reduce((acc, t) => {
      if (t.category) {
        acc[t.category] = (acc[t.category] || 0) + 1;
      }
      return acc;
    }, {});
    
    const topCategory = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    
    if (topCategory) {
      return `${topCategory} Focus`;
    }
    
    // Default themes by week
    const weekThemes = {
      1: 'Getting Started',
      2: 'Building Foundation',
      3: 'Core Concepts',
      4: 'Practice & Application',
      5: 'Advanced Topics',
      6: 'Project Work',
      7: 'Review & Refine',
      8: 'Mastery & Beyond'
    };
    
    return weekThemes[week] || 'Continued Learning';
  },

  /**
   * Calculate board statistics
   */
  calculateBoardStats: (board) => {
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;
    
    board.columns.forEach(column => {
      totalTasks += column.tasks.length;
      if (column.type === 'DONE') {
        completedTasks += column.tasks.length;
      } else if (column.type === 'IN_PROGRESS') {
        inProgressTasks += column.tasks.length;
      }
    });
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks: totalTasks - completedTasks - inProgressTasks,
      completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    };
  },

  /**
   * Optimize board structure
   */
  optimizeStructure: (structure) => {
    // Sort boards by order
    structure.boards.sort((a, b) => a.orderIndex - b.orderIndex);
    
    // Ensure each board has proper columns
    structure.boards.forEach(board => {
      // Sort columns by order
      board.columns.sort((a, b) => a.orderIndex - b.orderIndex);
      
      // Ensure standard columns exist
      const columnTypes = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
      columnTypes.forEach((type, index) => {
        if (!board.columns.some(c => c.type === type)) {
          board.columns.push({
            name: type.replace('_', ' '),
            type: type,
            color: projectStructureBuilder.getColumnColor(type),
            orderIndex: index,
            wipLimit: type === 'IN_PROGRESS' ? 3 : 0,
            tasks: []
          });
        }
      });
      
      // Re-sort after adding missing columns
      board.columns.sort((a, b) => a.orderIndex - b.orderIndex);
    });
    
    return structure;
  },

  /**
   * Get column color by type
   */
  getColumnColor: (type) => {
    const colors = {
      TODO: '#6b7280',
      IN_PROGRESS: '#3b82f6',
      REVIEW: '#a855f7',
      DONE: '#22c55e',
      BACKLOG: '#6b7280',
      BLOCKED: '#ef4444'
    };
    
    return colors[type] || '#6b7280';
  },

  /**
   * Export structure to JSON
   */
  exportToJson: (structure) => {
    return JSON.stringify(structure, null, 2);
  },

  /**
   * Import structure from JSON
   */
  importFromJson: (json) => {
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to parse project structure JSON:', e);
      return null;
    }
  }
};