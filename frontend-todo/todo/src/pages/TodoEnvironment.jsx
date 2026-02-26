import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Calendar,
  Clock,
  Flag,
  Users,
  Plus,
  Search,
  Filter,
  SortDesc,
  CheckCircle,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Save,
  ChevronDown,
  Calendar as CalendarIcon,
  ListTodo,
  Layout,
  Grid
} from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

function TodoEnvironment() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // list, grid, calendar
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all',
    date: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const { currentWorkspace, userProfile } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'NORMAL',
    dueDate: '',
    dueTime: '',
    assignedToId: '',
    projectId: '',
    boardId: '',
    labels: [],
    reminder: false,
    reminderTime: '15'
  });

  useEffect(() => {
    if (currentWorkspace) {
      fetchData();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    filterAndSortTasks();
  }, [tasks, filters, searchQuery, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch projects
      const projectsRes = await API.get(`/projects?workspaceId=${currentWorkspace.id}`);
      setProjects(projectsRes.data);

      // Fetch all tasks
      const tasksRes = await API.get("/todo");
      
      // Process tasks
      let allTasks = [];
      if (Array.isArray(tasksRes.data)) {
        tasksRes.data.forEach(item => {
          if (item.todos && Array.isArray(item.todos)) {
            allTasks = [...allTasks, ...item.todos];
          } else if (item.id && item.title) {
            allTasks.push(item);
          }
        });
      }
      
      setTasks(allTasks);
      setFilteredTasks(allTasks);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTasks = () => {
    let filtered = [...tasks];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => 
        task.status?.toLowerCase() === filters.status.toLowerCase()
      );
    }

    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => 
        task.priority?.toUpperCase() === filters.priority.toUpperCase()
      );
    }

    // Apply project filter
    if (filters.project !== 'all') {
      filtered = filtered.filter(task => 
        task.projectId === parseInt(filters.project)
      );
    }

    // Apply date filter
    if (filters.date !== 'all') {
      const today = new Date();
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        
        switch(filters.date) {
          case 'today':
            return isToday(dueDate);
          case 'tomorrow':
            return isTomorrow(dueDate);
          case 'week':
            return isThisWeek(dueDate);
          case 'overdue':
            return dueDate < today && task.status !== 'COMPLETED';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'dueDate':
          return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        case 'priority':
          const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'NORMAL': 1, 'LOW': 0 };
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  };

  const createTask = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      // Combine date and time
      let dueDateTime = null;
      if (formData.dueDate) {
        dueDateTime = formData.dueTime 
          ? `${formData.dueDate}T${formData.dueTime}`
          : `${formData.dueDate}T23:59:59`;
      }

      const taskData = {
        ...formData,
        dueDate: dueDateTime,
        status: 'PENDING'
      };

      const response = await API.post("/todo", taskData);
      
      setTasks(prev => [...prev, response.data]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Task created successfully');
      
      // Set reminder if enabled
      if (formData.reminder && dueDateTime) {
        scheduleReminder(response.data);
      }

    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  };

  const updateTask = async () => {
    if (!formData.title.trim() || !editingTask) return;

    try {
      let dueDateTime = null;
      if (formData.dueDate) {
        dueDateTime = formData.dueTime 
          ? `${formData.dueDate}T${formData.dueTime}`
          : `${formData.dueDate}T23:59:59`;
      }

      const response = await API.put(`/todo/${editingTask.id}`, {
        ...formData,
        dueDate: dueDateTime
      });
      
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? response.data : task
      ));
      
      setEditingTask(null);
      setShowCreateModal(false);
      resetForm();
      toast.success('Task updated successfully');

    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await API.delete(`/todo/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const updateTaskStatus = async (taskId, currentStatus) => {
    try {
      const response = await API.put(`/todo/status/${taskId}`);
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: response.data.status } : task
      ));
      
      toast.success(`Task marked as ${response.data.status}`);
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Failed to update task");
    }
  };

  const scheduleReminder = (task) => {
    if (!task.dueDate) return;
    
    const dueTime = new Date(task.dueDate).getTime();
    const now = new Date().getTime();
    const reminderMinutes = parseInt(formData.reminderTime);
    const reminderTime = dueTime - (reminderMinutes * 60 * 1000);
    
    if (reminderTime > now) {
      setTimeout(() => {
        toast.custom((t) => (
          <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-purple-500/30">
            <div className="flex items-center gap-3">
              <Clock className="text-purple-400" size={20} />
              <div>
                <p className="font-medium">Task Reminder</p>
                <p className="text-sm text-slate-300">{task.title} is due in {reminderMinutes} minutes</p>
              </div>
            </div>
          </div>
        ), { duration: 5000 });
      }, reminderTime - now);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'NORMAL',
      dueDate: '',
      dueTime: '',
      assignedToId: '',
      projectId: '',
      boardId: '',
      labels: [],
      reminder: false,
      reminderTime: '15'
    });
  };

  const editTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'NORMAL',
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      dueTime: task.dueDate ? format(new Date(task.dueDate), 'HH:mm') : '',
      assignedToId: task.assignedTo?.id || '',
      projectId: task.projectId || '',
      boardId: task.boardId || '',
      labels: task.labels || [],
      reminder: false,
      reminderTime: '15'
    });
    setShowCreateModal(true);
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
      MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      NORMAL: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      LOW: 'bg-green-500/20 text-green-400 border-green-500/30'
    };
    return colors[priority] || colors.NORMAL;
  };

  const getStatusBadge = (status) => {
    const colors = {
      COMPLETED: 'bg-green-500/20 text-green-400',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
      PENDING: 'bg-yellow-500/20 text-yellow-400'
    };
    return colors[status] || colors.PENDING;
  };

  if (loading) {
    return <TodoSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">My Tasks</h1>
            <button
              onClick={() => {
                setEditingTask(null);
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
            >
              <Plus size={18} />
              New Task
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="priority">Sort by Priority</option>
              <option value="status">Sort by Status</option>
              <option value="created">Sort by Created</option>
            </select>

            <div className="flex rounded-xl overflow-hidden border border-slate-600">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}
              >
                <ListTodo size={18} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 ${viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'bg-slate-700/50 text-slate-400'}`}
              >
                <CalendarIcon size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={task.status === 'COMPLETED'}
                      onChange={() => updateTaskStatus(task.id, task.status)}
                      className="mt-1 w-5 h-5 rounded border-slate-600 text-purple-600 focus:ring-purple-500"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`text-lg font-medium text-white ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => editTask(task)}
                            className="p-1 hover:bg-slate-700 rounded-lg"
                          >
                            <Edit2 size={16} className="text-slate-400" />
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 hover:bg-slate-700 rounded-lg"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {task.priority && (
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityBadge(task.priority)}`}>
                            <Flag size={12} className="inline mr-1" />
                            {task.priority}
                          </span>
                        )}

                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(task.status)}`}>
                          {task.status || 'PENDING'}
                        </span>

                        {task.dueDate && (
                          <span className={`flex items-center gap-1 text-xs ${
                            new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                              ? 'text-red-400'
                              : 'text-slate-400'
                          }`}>
                            <Clock size={12} />
                            {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                          </span>
                        )}

                        {task.assignedTo && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Users size={12} />
                            {task.assignedTo.name}
                          </span>
                        )}

                        {task.labels?.map(label => (
                          <span key={label} className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <CheckCircle size={48} className="mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400">No tasks found</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3 text-purple-400 hover:text-purple-300"
                >
                  Create your first task
                </button>
              </div>
            )}
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 border border-slate-700 hover:bg-slate-800 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <input
                    type="checkbox"
                    checked={task.status === 'COMPLETED'}
                    onChange={() => updateTaskStatus(task.id, task.status)}
                    className="w-5 h-5 rounded border-slate-600 text-purple-600"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => editTask(task)}
                      className="p-1 hover:bg-slate-700 rounded"
                    >
                      <Edit2 size={14} className="text-slate-400" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 hover:bg-slate-700 rounded"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>

                <h3 className={`text-white font-medium mb-2 ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-sm text-slate-400 mb-3">{task.description}</p>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {task.priority && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(task.priority)}`}>
                      {task.priority}
                    </span>
                  )}
                  
                  {task.dueDate && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {format(new Date(task.dueDate), 'MMM d')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'calendar' && (
          <CalendarView tasks={filteredTasks} />
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingTask(null);
                  resetForm();
                }}
                className="p-1 hover:bg-slate-700 rounded-lg"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Task title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />

              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="NORMAL">Normal Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>

                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Due Time</label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                  className="rounded border-slate-600 text-purple-600"
                />
                <label htmlFor="reminder" className="text-sm text-slate-300">
                  Set reminder
                </label>
                
                {formData.reminder && (
                  <select
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                    className="ml-2 px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                  >
                    <option value="5">5 min before</option>
                    <option value="15">15 min before</option>
                    <option value="30">30 min before</option>
                    <option value="60">1 hour before</option>
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-slate-400 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTask ? updateTask : createTask}
                  disabled={!formData.title.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Calendar View Component
function CalendarView({ tasks }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {monthName} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-slate-700 rounded-lg"
          >
            <ChevronDown size={18} className="text-slate-400 rotate-90" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-slate-700 rounded-lg"
          >
            <ChevronDown size={18} className="text-slate-400 -rotate-90" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-24 bg-slate-700/20 rounded-lg" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
          const dayTasks = getTasksForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={i}
              className={`h-24 p-2 rounded-lg border ${
                isToday 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-slate-700 bg-slate-700/20'
              } overflow-y-auto`}
            >
              <div className="text-sm font-medium text-white mb-1">{i + 1}</div>
              {dayTasks.slice(0, 2).map(task => (
                <div
                  key={task.id}
                  className="text-xs px-1 py-0.5 mb-0.5 bg-purple-600/20 text-purple-300 rounded truncate"
                >
                  {task.title}
                </div>
              ))}
              {dayTasks.length > 2 && (
                <div className="text-xs text-slate-400">+{dayTasks.length - 2} more</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Skeleton Loader
function TodoSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="animate-pulse">
        <div className="h-8 w-48 bg-slate-700 rounded mb-4" />
        <div className="h-10 w-full bg-slate-700 rounded mb-6" />
        
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-20 bg-slate-700 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TodoEnvironment;