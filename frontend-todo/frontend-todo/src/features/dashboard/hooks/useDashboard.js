import { useQuery } from "@tanstack/react-query";
import API from "@/services/api";
import { 
  format, 
  isToday, 
  startOfWeek, 
  subDays 
} from 'date-fns';

export const useDashboard = (workspaceId) => {
  return useQuery({
    queryKey: ["dashboard", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;

      // Parallel fetching for performance
      const [projectsRes, todosRes] = await Promise.all([
        API.get('/projects', { params: { workspaceId } }),
        API.get("/todos") // Backend filters by workspace via interceptor or manually on backend
      ]);

      const projects = projectsRes.data || [];
      const todos = todosRes.data || [];

      // Fetch boards for each project
      const boardPromises = projects.map(project => 
        API.get('/boards', { params: { projectId: project.id } })
          .catch(() => ({ data: [] }))
      );
      const boardResponses = await Promise.all(boardPromises);
      const boards = boardResponses.flatMap(res => res.data || []);

      // Calculate Stats
      const stats = processStats(projects, todos, boards);

      return {
        projects,
        todos,
        boards,
        stats,
        activities: processActivities(todos)
      };
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

const processStats = (projects, todos, boards) => {
  const now = new Date();
  const completed = todos.filter(t => t.status === 'COMPLETED').length;
  const inProgress = todos.filter(t => t.status === 'IN_PROGRESS').length;
  const overdue = todos.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'COMPLETED').length;
  
  return {
    totalProjects: projects.length,
    totalBoards: boards.length,
    totalTasks: todos.length,
    completedTasks: completed,
    inProgressTasks: inProgress,
    overdueTasks: overdue,
    completionRate: todos.length > 0 ? Math.round((completed / todos.length) * 100) : 0,
    weeklyProgress: generateWeeklyProgress(todos)
  };
};

const generateWeeklyProgress = (tasks) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, index) => {
    const date = subDays(new Date(), 6 - index);
    const dayTasks = tasks.filter(t => t.createdAt && new Date(t.createdAt).toDateString() === date.toDateString());
    const completed = dayTasks.filter(t => t.status === 'COMPLETED').length;
    return {
      day,
      total: dayTasks.length,
      completed,
      date: format(date, 'MMM dd')
    };
  });
};

const processActivities = (todos) => {
  return todos
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10)
    .map((todo, index) => ({
      id: index,
      type: todo.status === 'COMPLETED' ? 'task_completed' : 'task_updated',
      user: todo.assignedTo?.name || 'User',
      target: todo.item || todo.title || 'Untitled',
      time: todo.updatedAt ? format(new Date(todo.updatedAt), 'HH:mm') : 'recent',
      icon: todo.status === 'COMPLETED' ? 'check' : 'edit'
    }));
};
