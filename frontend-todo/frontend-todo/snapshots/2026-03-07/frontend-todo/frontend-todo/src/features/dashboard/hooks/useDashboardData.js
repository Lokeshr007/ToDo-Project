import { useState, useCallback, useEffect } from "react";
import API from "@/services/api";
import { format, isToday, startOfWeek, subDays } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * Custom hook for centralizing dashboard data fetching and calculations.
 * 
 * @param {Object} currentWorkspace The active workspace object.
 */
export const useDashboardData = (currentWorkspace) => {
  const [projects, setProjects] = useState([]);
  const [boards, setBoards] = useState([]);
  const [allTodos, setAllTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalBoards: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    overdueTasks: 0,
    todayTasks: 0,
    completionRate: 0,
    tasksByPriority: { HIGH: 0, MEDIUM: 0, NORMAL: 0, LOW: 0 },
    tasksByProject: [],
    weeklyProgress: []
  });
  const [quickStats, setQuickStats] = useState({
    bestDay: 'Wednesday',
    focusTime: 4.2,
    tasksCompletedToday: 0,
    productivityScore: 85
  });

  const generateWeeklyProgress = useCallback((tasks) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const date = subDays(new Date(), 6 - index);
      const dayTasks = tasks.filter(t => {
        if (!t.createdAt) return false;
        const taskDate = new Date(t.createdAt);
        return taskDate.toDateString() === date.toDateString();
      });
      const completed = dayTasks.filter(t => t.status === 'COMPLETED').length;
      
      return {
        day,
        total: dayTasks.length,
        completed,
        date: format(date, 'MMM dd')
      };
    });
  }, []);

  const calculateProductivityScore = useCallback((tasks) => {
    if (tasks.length === 0) return 85;
    
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const onTime = tasks.filter(t => {
      if (t.status === 'COMPLETED' && t.dueDate && t.completedAt) {
        return new Date(t.completedAt) <= new Date(t.dueDate);
      }
      return false;
    }).length;
    
    const baseScore = Math.round((completed / tasks.length) * 100);
    const timelinessBonus = completed > 0 ? Math.round((onTime / completed) * 20) : 0;
    
    return Math.min(baseScore + timelinessBonus, 100);
  }, []);

  const findBestDay = useCallback((tasks) => {
    const dayCount = { 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 };
    
    tasks.forEach(task => {
      if (task.completedAt) {
        const day = format(new Date(task.completedAt), 'EEEE');
        dayCount[day] = (dayCount[day] || 0) + 1;
      }
    });
    
    return Object.entries(dayCount).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }, []);

  const fetchRecentActivities = useCallback(async (tasksFallback = []) => {
    try {
      const response = await API.get('/users/activity?limit=10');
      setRecentActivities(response.data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
      const mockActivities = tasksFallback.slice(0, 5).map((todo, index) => ({
        id: index,
        type: todo.status === 'COMPLETED' ? 'task_completed' : 'task_updated',
        user: todo.assignedTo?.name || 'System',
        target: todo.title,
        time: todo.updatedAt ? format(new Date(todo.updatedAt), 'HH:mm') : 'recent',
        icon: todo.status === 'COMPLETED' ? 'check' : 'edit'
      }));
      setRecentActivities(mockActivities);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    try {
      // Fetch projects
      const projectsRes = await API.get(`/projects?workspaceId=${currentWorkspace.id}`);
      setProjects(projectsRes.data);

      // Fetch boards
      let allBoards = [];
      for (const project of projectsRes.data) {
        try {
          const boardsRes = await API.get(`/boards?projectId=${project.id}`);
          allBoards = [...allBoards, ...boardsRes.data];
        } catch (error) {
          console.error(`Failed boards for ${project.id}:`, error);
        }
      }
      setBoards(allBoards);

      // Fetch todos
      const todosRes = await API.get("/todos");
      
      let allTasks = [];
      let tasksCompletedToday = 0;
      const today = new Date().toDateString();
      
      if (Array.isArray(todosRes.data)) {
        allTasks = todosRes.data.map(todo => ({
          id: todo.id,
          title: todo.item || todo.title,
          description: todo.description || '',
          status: todo.status || 'PENDING',
          priority: todo.priority || 'NORMAL',
          dueDate: todo.dueDate,
          completedAt: todo.completedAt,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
          assignedTo: todo.assignedTo ? { id: todo.assignedTo.id, name: todo.assignedTo.name } : null,
          project: todo.project ? { id: todo.project.id, name: todo.project.name } : null,
          board: todo.board ? { id: todo.board.id, name: todo.board.name } : null
        }));

        tasksCompletedToday = allTasks.filter(t => 
          t.status === 'COMPLETED' && t.completedAt && new Date(t.completedAt).toDateString() === today
        ).length;
      }
      setAllTodos(allTasks);

      // Calculations
      const now = new Date();
      const completed = allTasks.filter(t => t.status === 'COMPLETED').length;
      const pending = allTasks.filter(t => t.status === 'PENDING').length;
      const inProgress = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const overdue = allTasks.filter(t => !(!t.dueDate || t.status === 'COMPLETED') && new Date(t.dueDate) < now).length;
      const todayTasks = allTasks.filter(t => t.dueDate && isToday(new Date(t.dueDate))).length;

      const tasksByPriority = {
        HIGH: allTasks.filter(t => t.priority === 'HIGH').length,
        MEDIUM: allTasks.filter(t => t.priority === 'MEDIUM').length,
        NORMAL: allTasks.filter(t => t.priority === 'NORMAL').length,
        LOW: allTasks.filter(t => t.priority === 'LOW').length
      };

      const tasksByProject = projectsRes.data.map(p => ({
        name: p.name,
        count: allTasks.filter(t => t.project?.id === p.id).length,
        completed: allTasks.filter(t => t.project?.id === p.id && t.status === 'COMPLETED').length
      })).filter(p => p.count > 0);

      const weeklyProgress = generateWeeklyProgress(allTasks);
      const productivityScore = calculateProductivityScore(allTasks);

      setQuickStats({
        tasksCompletedToday,
        productivityScore,
        bestDay: findBestDay(allTasks),
        focusTime: 4.2
      });

      setStats({
        totalProjects: projectsRes.data.length,
        totalBoards: allBoards.length,
        totalTasks: allTasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        inProgressTasks: inProgress,
        overdueTasks: overdue,
        todayTasks,
        completionRate: allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0,
        tasksByPriority,
        tasksByProject,
        weeklyProgress
      });

      fetchRecentActivities(allTasks);

    } catch (error) {
      console.error("Dashboard hook error:", error);
      toast.error("Failed to load dashboard sync");
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, generateWeeklyProgress, calculateProductivityScore, findBestDay, fetchRecentActivities]);

  const updateTaskStatus = async (todoId, currentStatus) => {
    try {
      const targetStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      const response = await API.patch(`/todos/${todoId}/status`, { status: targetStatus });
      setAllTodos(prev => prev.map(t => t.id === todoId ? { ...t, status: response.data.status } : t));
      toast.success(`Task marked as ${response.data.status}`);
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update task");
    }
  };

  useEffect(() => {
    if (currentWorkspace) {
      fetchDashboardData();
    }
  }, [currentWorkspace, fetchDashboardData]);

  return {
    projects,
    boards,
    allTodos,
    loading,
    recentActivities,
    stats,
    quickStats,
    fetchDashboardData,
    updateTaskStatus
  };
};
