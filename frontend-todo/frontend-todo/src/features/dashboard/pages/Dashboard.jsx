// frontend/src/pages/Dashboard.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import API from "@/services/api";
import { useAuth } from "@/app/providers/AuthContext";
import { useWorkspace } from "@/app/providers/WorkspaceContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FolderKanban,
  Calendar,
  ChevronRight,
  PlusCircle,
  Users,
  BarChart3,
  ListTodo,
  TrendingUp,
  Award,
  Target,
  Sparkles,
  Activity,
  Star,
  Zap,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Flag,
  Loader,
  Layout,
  GitBranch,
  PlayCircle,
  PauseCircle,
  Edit2
} from "lucide-react";
import { format, isToday, isPast, parseISO, subDays, startOfWeek, endOfWeek, isThisWeek } from 'date-fns';
import toast from 'react-hot-toast';

function Dashboard() {
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
  
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();

  // Memoized values for performance
  const todayTasks = useMemo(() => 
    allTodos.filter(t => t.dueDate && isToday(new Date(t.dueDate)) && t.status !== 'COMPLETED'),
    [allTodos]
  );

  const upcomingTasks = useMemo(() => 
    allTodos.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      const dueDate = new Date(t.dueDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 3);
      return dueDate > new Date() && dueDate <= tomorrow;
    }),
    [allTodos]
  );

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [currentWorkspace?.id]);

  const fetchDashboardData = async () => {
    if (!currentWorkspace?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching dashboard data for workspace:", currentWorkspace.id);
      
      // Fetch all data in parallel for better performance
      const [projectsRes, todosRes] = await Promise.all([
        API.get('/projects', {
          params: { workspaceId: currentWorkspace.id }
        }).catch(err => {
          console.error("Projects fetch error:", err);
          return { data: [] };
        }),
        API.get("/todos").catch(err => {
          console.error("Todos fetch error:", err);
          return { data: [] };
        })
      ]);

      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : [];
      const todosData = Array.isArray(todosRes.data) ? todosRes.data : [];
      
      console.log("Projects data:", projectsData);
      console.log("Todos data:", todosData);
      
      setProjects(projectsData);

      // Initialize allBoards as empty array
      let allBoards = [];

      // Fetch boards for each project in parallel
      if (projectsData.length > 0) {
        const boardPromises = projectsData.map(project => 
          API.get('/boards', {
            params: { projectId: project.id }
          }).catch(err => {
            console.error(`Failed to fetch boards for project ${project.id}:`, err);
            return { data: [] };
          })
        );
        
        const boardResponses = await Promise.all(boardPromises);
        allBoards = boardResponses.flatMap(res => Array.isArray(res.data) ? res.data : []);
        setBoards(allBoards);
      }

      // Process tasks
      let allTasks = [];
      let tasksCompletedToday = 0;
      const today = new Date().toDateString();
      
      if (todosData.length > 0) {
        allTasks = todosData.map(todo => ({
          id: todo.id,
          title: todo.item || todo.title || 'Untitled',
          description: todo.description || '',
          status: todo.status || 'PENDING',
          priority: todo.priority || 'NORMAL',
          dueDate: todo.dueDate,
          completedAt: todo.completedAt,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
          assignedTo: todo.assignedTo ? {
            id: todo.assignedTo.id,
            name: todo.assignedTo.name,
            email: todo.assignedTo.email
          } : null,
          project: todo.project ? {
            id: todo.project.id,
            name: todo.project.name
          } : null,
          board: todo.board ? {
            id: todo.board.id,
            name: todo.board.name
          } : null
        }));

        // Count tasks completed today
        tasksCompletedToday = allTasks.filter(t => {
          if (t.status === 'COMPLETED' && t.completedAt) {
            return new Date(t.completedAt).toDateString() === today;
          }
          return false;
        }).length;
      }

      setAllTodos(allTasks);

      // Calculate stats (handle empty tasks)
      const now = new Date();
      const completed = allTasks.filter(t => t.status === 'COMPLETED').length;
      const pending = allTasks.filter(t => t.status === 'PENDING').length;
      const inProgress = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
      const overdue = allTasks.filter(t => {
        if (!t.dueDate || t.status === 'COMPLETED') return false;
        return new Date(t.dueDate) < now;
      }).length;
      const todayTasksCount = allTasks.filter(t => {
        if (!t.dueDate) return false;
        return isToday(new Date(t.dueDate));
      }).length;

      // Tasks by priority
      const tasksByPriority = {
        HIGH: allTasks.filter(t => t.priority === 'HIGH').length,
        MEDIUM: allTasks.filter(t => t.priority === 'MEDIUM').length,
        NORMAL: allTasks.filter(t => t.priority === 'NORMAL').length,
        LOW: allTasks.filter(t => t.priority === 'LOW').length
      };

      // Tasks by project
      const tasksByProject = projectsData.map(project => ({
        name: project.name,
        count: allTasks.filter(t => t.project?.id === project.id).length,
        completed: allTasks.filter(t => t.project?.id === project.id && t.status === 'COMPLETED').length
      })).filter(p => p.count > 0);

      // Weekly progress (handle empty tasks)
      const weeklyProgress = generateWeeklyProgress(allTasks);

      // Calculate productivity score
      const productivityScore = calculateProductivityScore(allTasks);

      setQuickStats(prev => ({
        ...prev,
        tasksCompletedToday,
        productivityScore,
        bestDay: findBestDay(allTasks)
      }));

      setStats({
        totalProjects: projectsData.length,
        totalBoards: allBoards.length,
        totalTasks: allTasks.length,
        completedTasks: completed,
        pendingTasks: pending,
        inProgressTasks: inProgress,
        overdueTasks: overdue,
        todayTasks: todayTasksCount,
        completionRate: allTasks.length > 0 ? Math.round((completed / allTasks.length) * 100) : 0,
        tasksByPriority,
        tasksByProject,
        weeklyProgress
      });

      // Generate activities from todos (handle empty todos)
      if (allTasks.length > 0) {
        const activities = allTasks
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 10)
          .map((todo, index) => ({
            id: index,
            type: todo.status === 'COMPLETED' ? 'task_completed' : 'task_updated',
            user: todo.assignedTo?.name || user?.name || 'System',
            target: todo.title,
            time: todo.updatedAt ? format(new Date(todo.updatedAt), 'HH:mm') : 'recent',
            icon: todo.status === 'COMPLETED' ? 'check' : 'edit'
          }));
        setRecentActivities(activities);
      } else {
        setRecentActivities([]);
      }

    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyProgress = (tasks) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    
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
  };

  const calculateProductivityScore = (tasks) => {
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
  };

  const findBestDay = (tasks) => {
    const dayCount = { 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0, 'Sunday': 0 };
    
    tasks.forEach(task => {
      if (task.completedAt) {
        const day = format(new Date(task.completedAt), 'EEEE');
        dayCount[day] = (dayCount[day] || 0) + 1;
      }
    });
    
    // Find the day with max count, default to Wednesday if all zero
    const maxDay = Object.entries(dayCount).reduce((a, b) => a[1] > b[1] ? a : b);
    return maxDay[1] > 0 ? maxDay[0] : 'Wednesday';
  };

  const updateTaskStatus = async (todoId, currentStatus) => {
    try {
      const response = await API.patch(`/todos/${todoId}/status`, { 
        status: currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED' 
      });
      
      setAllTodos(prev => 
        prev.map(todo => todo.id === todoId ? { ...todo, status: response.data.status } : todo)
      );
      
      toast.success(`Task marked as ${response.data.status}`);
      
      // Refresh dashboard data
      fetchDashboardData();
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'from-red-500 to-red-600';
      case 'MEDIUM': return 'from-yellow-500 to-yellow-600';
      case 'NORMAL': return 'from-blue-500 to-blue-600';
      case 'LOW': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'NORMAL': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle size={16} className="text-green-400" />;
      case 'IN_PROGRESS': return <PlayCircle size={16} className="text-blue-400" />;
      case 'PENDING': return <PauseCircle size={16} className="text-yellow-400" />;
      case 'BLOCKED': return <AlertCircle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <FolderKanban size={64} className="mx-auto text-purple-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Workspace Selected</h2>
          <p className="text-slate-400 mb-4">Please select or create a workspace to get started</p>
          <Link
            to="/app/workspaces"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusCircle size={20} />
            Manage Workspaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Welcome Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-slate-400">
                Here's what's happening in <span className="text-purple-400 font-semibold">{currentWorkspace?.name}</span>
              </p>
            </div>
            
            {/* Date */}
            <div className="bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700">
              <span className="text-slate-300">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard
            icon={<BarChart3 size={20} />}
            label="Total Tasks"
            value={stats.totalTasks}
            trend={stats.totalTasks > 0 ? 12 : 0}
            color="blue"
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            label="Completed"
            value={stats.completedTasks}
            subtext={`${stats.completionRate}% rate`}
            trend={stats.completionRate}
            color="green"
            bgColor="bg-gradient-to-br from-green-500 to-green-600"
          />
          <StatCard
            icon={<Activity size={20} />}
            label="In Progress"
            value={stats.inProgressTasks}
            subtext={`${stats.pendingTasks} pending`}
            trend={stats.inProgressTasks > 0 ? -3 : 0}
            color="purple"
            bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <StatCard
            icon={<AlertCircle size={20} />}
            label="Overdue"
            value={stats.overdueTasks}
            trend={stats.overdueTasks > 0 ? 2 : 0}
            color="red"
            bgColor="bg-gradient-to-br from-red-500 to-red-600"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Progress Chart */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-400" />
                  Weekly Progress
                </h2>
                <div className="flex gap-2">
                  <span className="text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-lg">
                    {stats.totalTasks} total tasks
                  </span>
                </div>
              </div>
              
              <div className="h-40 flex items-end justify-between gap-2">
                {stats.weeklyProgress.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col items-center">
                      <div className="relative w-full h-32 bg-slate-700 rounded-lg overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-500 to-purple-400 transition-all"
                          style={{ height: day.total > 0 ? `${(day.completed / day.total) * 100}%` : '0%' }}
                        />
                        {day.total > 0 && (
                          <div className="absolute top-1 right-1 text-[10px] text-white bg-black/20 px-1 rounded">
                            {day.completed}/{day.total}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{day.day}</span>
                    <span className="text-[10px] text-slate-500">{day.date}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar size={20} className="text-purple-400" />
                  Today's Schedule
                  {todayTasks.length > 0 && (
                    <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                      {todayTasks.length} tasks
                    </span>
                  )}
                </h2>
                <Link to="/app/todos?filter=today" className="text-sm text-purple-400 hover:text-purple-300">
                  View all
                </Link>
              </div>
              
              <div className="space-y-3">
                {todayTasks.length > 0 ? (
                  todayTasks.slice(0, 4).map(task => (
                    <TaskItemCompact 
                      key={task.id} 
                      task={task} 
                      onStatusChange={updateTaskStatus}
                      getPriorityBadge={getPriorityBadge}
                      getStatusIcon={getStatusIcon}
                    />
                  ))
                ) : (
                  <EmptyTaskState onCreateClick={() => navigate('/app/todos?create=true')} />
                )}
              </div>
            </div>

            {/* Upcoming Tasks */}
            {upcomingTasks.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-yellow-400" />
                  Upcoming (Next 3 Days)
                </h2>
                <div className="space-y-3">
                  {upcomingTasks.slice(0, 3).map(task => (
                    <TaskItemCompact 
                      key={task.id} 
                      task={task} 
                      onStatusChange={updateTaskStatus}
                      getPriorityBadge={getPriorityBadge}
                      getStatusIcon={getStatusIcon}
                      showDate
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Projects Overview */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FolderKanban size={20} className="text-purple-400" />
                  Projects Overview
                </h2>
                <Link to="/app/projects" className="text-sm text-purple-400 hover:text-purple-300">
                  View all
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {projects.slice(0, 4).map(project => {
                  const projectTasks = allTodos.filter(t => t.project?.id === project.id);
                  const completed = projectTasks.filter(t => t.status === 'COMPLETED').length;
                  const progress = projectTasks.length > 0 ? (completed / projectTasks.length) * 100 : 0;
                  
                  return (
                    <Link
                      key={project.id}
                      to={`/app/projects/${project.id}`}
                      className="bg-slate-700/30 p-3 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-purple-500/20 rounded">
                          <FolderKanban size={14} className="text-purple-400" />
                        </div>
                        <span className="text-sm text-white truncate">{project.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">{projectTasks.length} tasks</span>
                        <span className="text-purple-400">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-1 bg-slate-600 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Insights & Activities */}
          <div className="space-y-6">
            {/* Priority Distribution */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart size={20} className="text-purple-400" />
                Priority Distribution
              </h2>
              
              <div className="space-y-4">
                {Object.entries(stats.tasksByPriority).map(([priority, count]) => (
                  <div key={priority}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">{priority}</span>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r ${getPriorityColor(priority)}`}
                        style={{ width: `${stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Activity size={20} className="text-purple-400" />
                Recent Activity
              </h2>
              
              <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                {recentActivities.length > 0 ? (
                  recentActivities.map(activity => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-4">No recent activities</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles size={18} />
                Productivity Score
              </h3>
              
              <div className="text-4xl font-bold mb-2">{quickStats.productivityScore}%</div>
              <p className="text-purple-100 text-sm mb-4">Overall completion rate</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs opacity-80">Best Day</p>
                  <p className="font-semibold">{quickStats.bestDay}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs opacity-80">Today's Tasks</p>
                  <p className="font-semibold">{quickStats.tasksCompletedToday}</p>
                  <p className="text-xs mt-1">completed</p>
                </div>
              </div>
            </div>

            {/* Project Distribution */}
            {stats.tasksByProject.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 sm:p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FolderKanban size={20} className="text-purple-400" />
                  Tasks by Project
                </h2>
                
                <div className="space-y-3">
                  {stats.tasksByProject.slice(0, 4).map(project => (
                    <div key={project.name}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400 truncate max-w-[150px]">{project.name}</span>
                        <span className="text-white">{project.completed}/{project.count}</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                          style={{ width: `${(project.completed / project.count) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact Task Item
function TaskItemCompact({ task, onStatusChange, getPriorityBadge, getStatusIcon, showDate }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    setIsUpdating(true);
    await onStatusChange(task.id, task.status);
    setIsUpdating(false);
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
      <button
        onClick={handleStatusChange}
        disabled={isUpdating}
        className="mt-0.5 flex-shrink-0"
      >
        {isUpdating ? (
          <Loader size={18} className="text-purple-400 animate-spin" />
        ) : (
          getStatusIcon(task.status)
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className={`text-sm text-white truncate ${
            task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
          }`}>
            {task.title}
          </span>
          {task.priority && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 w-fit ${getPriorityBadge(task.priority)}`}>
              <Flag size={10} />
              {task.priority}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
          {showDate && task.dueDate && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {format(new Date(task.dueDate), 'MMM d, h:mm a')}
            </span>
          )}
          {task.project?.name && (
            <span className="flex items-center gap-1">
              <FolderKanban size={10} />
              {task.project.name}
            </span>
          )}
          {task.assignedTo?.name && (
            <span className="flex items-center gap-1">
              <Users size={10} />
              {task.assignedTo.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Enhanced Stat Card
function StatCard({ icon, label, value, subtext, trend, color, bgColor }) {
  const isPositive = trend >= 0;
  
  return (
    <div className={`${bgColor} rounded-xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/20 rounded-lg">
          {icon}
        </div>
        {trend !== undefined && trend !== 0 && (
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            isPositive ? 'bg-green-500/30' : 'bg-red-500/30'
          }`}>
            {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      
      <div>
        <p className="text-2xl sm:text-3xl font-bold mb-1">{value}</p>
        <p className="text-xs sm:text-sm text-white/80">{label}</p>
        {subtext && <p className="text-xs text-white/60 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

// Activity Item
function ActivityItem({ activity }) {
  const getIcon = () => {
    switch(activity.icon) {
      case 'plus': return <PlusCircle size={14} className="text-blue-400" />;
      case 'check': return <CheckCircle size={14} className="text-green-400" />;
      case 'folder': return <FolderKanban size={14} className="text-purple-400" />;
      case 'move': return <Activity size={14} className="text-yellow-400" />;
      case 'edit': return <Edit2 size={14} className="text-orange-400" />;
      default: return <Star size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-slate-700 rounded-lg">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm text-white">
          <span className="font-medium">{activity.user}</span> {activity.type === 'task_created' ? 'created' : 
            activity.type === 'task_completed' ? 'completed' :
            activity.type === 'project_created' ? 'created project' :
            activity.type === 'task_updated' ? 'updated' :
            'updated'} <span className="font-medium">{activity.target}</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
      </div>
    </div>
  );
}

// Empty Task State
function EmptyTaskState({ onCreateClick }) {
  return (
    <div className="text-center py-8">
      <Calendar size={40} className="mx-auto text-slate-500 mb-3" />
      <p className="text-slate-400">No tasks scheduled for today</p>
      <button 
        onClick={onCreateClick}
        className="mt-3 text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Create Task
      </button>
    </div>
  );
}

// Skeleton Loader
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4 sm:p-6">
      <div className="animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="h-8 w-64 bg-slate-700 rounded mb-2" />
          <div className="h-4 w-96 bg-slate-700 rounded" />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 sm:h-32 bg-slate-700 rounded-xl" />
          ))}
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 sm:h-64 bg-slate-700 rounded-xl" />
            <div className="h-64 sm:h-80 bg-slate-700 rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-slate-700 rounded-xl" />
            <div className="h-64 bg-slate-700 rounded-xl" />
            <div className="h-40 bg-slate-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;