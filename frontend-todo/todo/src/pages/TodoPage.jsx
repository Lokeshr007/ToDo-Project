// frontend/src/pages/Todos.jsx
import { useState, useEffect } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import { 
  Plus,
  Search,
  Filter,
  Clock,
  Flag,
  Users,
  CheckCircle,
  AlertCircle,
  X,
  Edit2,
  Trash2,
  Calendar,
  ChevronDown,
  Save,
  Loader,
  FolderKanban,
  ListTodo,
  Grid,
  RefreshCw,
  Download,
  Upload
} from "lucide-react";
import { format, isToday, isTomorrow, isThisWeek, isPast } from 'date-fns';
import toast from 'react-hot-toast';

function Todos() {
  const [todos, setTodos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, grid, compact
  const [sortBy, setSortBy] = useState('dueDate');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  });
  
  const { currentWorkspace } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    item: '',
    description: '',
    priority: 'NORMAL',
    dueDate: '',
    dueTime: '',
    assignedToId: '',
    projectId: '',
    boardId: ''
  });

  useEffect(() => {
    if (currentWorkspace) {
      fetchTodos();
      fetchProjects();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    updateStats();
  }, [todos]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await API.get("/todo");
      console.log("Todos fetched:", response.data);
      
      // Process todos
      let allTodos = [];
      if (Array.isArray(response.data)) {
        allTodos = response.data.map(todo => ({
          id: todo.id,
          item: todo.item,
          title: todo.item,
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
          project: todo.project,
          board: todo.board,
          workspace: todo.workspace
        }));
      }
      setTodos(allTodos);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await API.get(`/projects?workspaceId=${currentWorkspace.id}`);
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const updateStats = () => {
    const now = new Date();
    setStats({
      total: todos.length,
      completed: todos.filter(t => t.status === 'COMPLETED').length,
      pending: todos.filter(t => t.status !== 'COMPLETED').length,
      overdue: todos.filter(t => {
        if (!t.dueDate || t.status === 'COMPLETED') return false;
        return new Date(t.dueDate) < now;
      }).length
    });
  };

  const createTodo = async () => {
    if (!formData.item.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      // Combine date and time
      let dueDateTime = null;
      if (formData.dueDate && formData.dueTime) {
        dueDateTime = `${formData.dueDate}T${formData.dueTime}:00`;
      } else if (formData.dueDate) {
        dueDateTime = `${formData.dueDate}T23:59:59`;
      }

      const todoData = {
        item: formData.item,
        description: formData.description,
        priority: formData.priority,
        dueDate: dueDateTime,
        assignedToId: formData.assignedToId || null,
        projectId: formData.projectId || null,
        boardId: formData.boardId || null
      };

      const response = await API.post("/todo", todoData);
      
      const newTodo = {
        id: response.data.id,
        item: response.data.item,
        title: response.data.item,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        dueDate: response.data.dueDate,
        assignedTo: response.data.assignedTo,
        project: response.data.project,
        board: response.data.board
      };
      
      setTodos(prev => [newTodo, ...prev]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Task created successfully');
    } catch (error) {
      console.error("Failed to create todo:", error);
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  const updateTodo = async () => {
    if (!formData.item.trim() || !editingTodo) return;

    try {
      let dueDateTime = null;
      if (formData.dueDate && formData.dueTime) {
        dueDateTime = `${formData.dueDate}T${formData.dueTime}:00`;
      } else if (formData.dueDate) {
        dueDateTime = `${formData.dueDate}T23:59:59`;
      }

      const response = await API.put(`/todo/${editingTodo.id}`, {
        item: formData.item,
        description: formData.description,
        priority: formData.priority,
        dueDate: dueDateTime,
        assignedToId: formData.assignedToId || null,
        projectId: formData.projectId || null,
        boardId: formData.boardId || null
      });
      
      const updatedTodo = {
        id: response.data.id,
        item: response.data.item,
        title: response.data.item,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        dueDate: response.data.dueDate,
        assignedTo: response.data.assignedTo,
        project: response.data.project,
        board: response.data.board
      };
      
      setTodos(prev => prev.map(todo => 
        todo.id === editingTodo.id ? updatedTodo : todo
      ));
      
      setEditingTodo(null);
      setShowCreateModal(false);
      resetForm();
      toast.success('Task updated successfully');
    } catch (error) {
      console.error("Failed to update todo:", error);
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const deleteTodo = async (todoId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await API.delete(`/todo/${todoId}`);
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast.error("Failed to delete task");
    }
  };

  const toggleTodoStatus = async (todoId, currentStatus) => {
    try {
      const response = await API.put(`/todo/status/${todoId}`);
      setTodos(prev => prev.map(todo => 
        todo.id === todoId ? { ...todo, status: response.data.status } : todo
      ));
      toast.success(`Task marked as ${response.data.status}`);
    } catch (error) {
      console.error("Failed to update todo status:", error);
      toast.error("Failed to update task");
    }
  };

  const resetForm = () => {
    setFormData({
      item: '',
      description: '',
      priority: 'NORMAL',
      dueDate: '',
      dueTime: '',
      assignedToId: '',
      projectId: '',
      boardId: ''
    });
  };

  const editTodo = (todo) => {
    setEditingTodo(todo);
    setFormData({
      item: todo.item || '',
      description: todo.description || '',
      priority: todo.priority || 'NORMAL',
      dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
      dueTime: todo.dueDate ? todo.dueDate.split('T')[1]?.substring(0, 5) : '',
      assignedToId: todo.assignedTo?.id || '',
      projectId: todo.project?.id || '',
      boardId: todo.board?.id || ''
    });
    setShowCreateModal(true);
  };

  const getFilteredTodos = () => {
    let filtered = [...todos];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(todo => 
        (todo.item || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (todo.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply project filter
    if (selectedProject !== 'all') {
      filtered = filtered.filter(todo => todo.project?.id === parseInt(selectedProject));
    }

    // Apply priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(todo => todo.priority === selectedPriority);
    }

    // Apply status filter
    switch(filter) {
      case 'pending':
        filtered = filtered.filter(todo => todo.status !== 'COMPLETED');
        break;
      case 'completed':
        filtered = filtered.filter(todo => todo.status === 'COMPLETED');
        break;
      case 'overdue':
        const now = new Date();
        filtered = filtered.filter(todo => 
          todo.dueDate && 
          new Date(todo.dueDate) < now && 
          todo.status !== 'COMPLETED'
        );
        break;
      case 'today':
        filtered = filtered.filter(todo => 
          todo.dueDate && isToday(new Date(todo.dueDate))
        );
        break;
      case 'tomorrow':
        filtered = filtered.filter(todo => 
          todo.dueDate && isTomorrow(new Date(todo.dueDate))
        );
        break;
      case 'week':
        filtered = filtered.filter(todo => 
          todo.dueDate && isThisWeek(new Date(todo.dueDate))
        );
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'dueDate':
          return (new Date(a.dueDate || 0)) - (new Date(b.dueDate || 0));
        case 'priority':
          const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'NORMAL': 1, 'LOW': 0 };
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        case 'status':
          const statusWeight = { 'PENDING': 0, 'IN_PROGRESS': 1, 'COMPLETED': 2 };
          return (statusWeight[a.status] || 0) - (statusWeight[b.status] || 0);
        case 'created':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'NORMAL': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400';
      case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const exportTodos = () => {
    const filteredTodos = getFilteredTodos();
    const dataStr = JSON.stringify(filteredTodos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `todos-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Tasks exported successfully');
  };

  if (loading) {
    return <TodosSkeleton />;
  }

  const filteredTodos = getFilteredTodos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Tasks</h1>
              <p className="text-sm text-gray-400 mt-1">
                {stats.pending} pending • {stats.completed} completed • {stats.overdue} overdue
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex rounded-lg overflow-hidden border border-gray-700">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  title="List View"
                >
                  <ListTodo size={18} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingTodo(null);
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm sm:text-base"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">New Task</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">All Tasks</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="today">Due Today</option>
                <option value="tomorrow">Due Tomorrow</option>
                <option value="week">This Week</option>
                <option value="overdue">Overdue</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2 rounded-lg border transition-colors ${
                  showFilters 
                    ? 'bg-purple-600 border-purple-500 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Filter size={18} />
              </button>

              <button
                onClick={exportTodos}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
                title="Export Tasks"
              >
                <Download size={18} />
              </button>

              <button
                onClick={fetchTodos}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Projects</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Priorities</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                    <option value="created">Created Date</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Todo List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {filteredTodos.length > 0 ? (
          <>
            {viewMode === 'list' && (
              <div className="space-y-3">
                {filteredTodos.map(todo => (
                  <TodoListItem
                    key={todo.id}
                    todo={todo}
                    onStatusChange={toggleTodoStatus}
                    onEdit={editTodo}
                    onDelete={deleteTodo}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}

            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTodos.map(todo => (
                  <TodoGridItem
                    key={todo.id}
                    todo={todo}
                    onStatusChange={toggleTodoStatus}
                    onEdit={editTodo}
                    onDelete={deleteTodo}
                    getPriorityColor={getPriorityColor}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState 
            onCreateClick={() => {
              setEditingTodo(null);
              resetForm();
              setShowCreateModal(true);
            }}
            searchQuery={searchQuery}
            filter={filter}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TodoModal
          title={editingTodo ? 'Edit Task' : 'Create New Task'}
          formData={formData}
          setFormData={setFormData}
          projects={projects}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTodo(null);
            resetForm();
          }}
          onSubmit={editingTodo ? updateTodo : createTodo}
          submitLabel={editingTodo ? 'Update' : 'Create'}
        />
      )}
    </div>
  );
}

// Todo List Item Component
function TodoListItem({ todo, onStatusChange, onEdit, onDelete, getPriorityColor, getStatusColor }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    setIsUpdating(true);
    await onStatusChange(todo.id, todo.status);
    setIsUpdating(false);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 border border-gray-700 hover:bg-gray-800 transition-colors group">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            onClick={handleStatusChange}
            disabled={isUpdating}
            className="mt-1 flex-shrink-0"
          >
            {isUpdating ? (
              <Loader size={20} className="text-purple-400 animate-spin" />
            ) : (
              <div className={`w-5 h-5 rounded border-2 ${
                todo.status === 'COMPLETED' 
                  ? 'bg-purple-500 border-purple-500' 
                  : 'border-gray-500 hover:border-purple-400'
              } flex items-center justify-center transition-colors`}>
                {todo.status === 'COMPLETED' && <CheckCircle size={14} className="text-white" />}
              </div>
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h3 className={`text-white font-medium ${todo.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
                {todo.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {todo.priority && (
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
                    <Flag size={12} className="inline mr-1" />
                    {todo.priority}
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
                  {todo.status}
                </span>
              </div>
            </div>
            
            {todo.description && (
              <p className="text-sm text-gray-400 mb-3">{todo.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm">
              {todo.dueDate && (
                <span className={`flex items-center gap-1 ${
                  new Date(todo.dueDate) < new Date() && todo.status !== 'COMPLETED'
                    ? 'text-red-400'
                    : 'text-gray-400'
                }`}>
                  <Clock size={14} />
                  {format(new Date(todo.dueDate), 'MMM d, h:mm a')}
                </span>
              )}

              {todo.project?.name && (
                <span className="flex items-center gap-1 text-gray-400">
                  <FolderKanban size={14} />
                  {todo.project.name}
                </span>
              )}

              {todo.assignedTo?.name && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Users size={14} />
                  {todo.assignedTo.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(todo)}
            className="p-2 hover:bg-gray-700 rounded-lg"
            title="Edit"
          >
            <Edit2 size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 hover:bg-gray-700 rounded-lg"
            title="Delete"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Todo Grid Item Component
function TodoGridItem({ todo, onStatusChange, onEdit, onDelete, getPriorityColor, getStatusColor }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    setIsUpdating(true);
    await onStatusChange(todo.id, todo.status);
    setIsUpdating(false);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 border border-gray-700 hover:bg-gray-800 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <button
          onClick={handleStatusChange}
          disabled={isUpdating}
          className="flex-shrink-0"
        >
          {isUpdating ? (
            <Loader size={20} className="text-purple-400 animate-spin" />
          ) : (
            <div className={`w-5 h-5 rounded border-2 ${
              todo.status === 'COMPLETED' 
                ? 'bg-purple-500 border-purple-500' 
                : 'border-gray-500 hover:border-purple-400'
            } flex items-center justify-center transition-colors`}>
              {todo.status === 'COMPLETED' && <CheckCircle size={14} className="text-white" />}
            </div>
          )}
        </button>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(todo)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Edit2 size={14} className="text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>

      <h3 className={`text-white font-medium mb-2 ${todo.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
        {todo.title}
      </h3>
      
      {todo.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{todo.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {todo.priority && (
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
            {todo.priority}
          </span>
        )}
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
          {todo.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {todo.dueDate && (
          <div className={`flex items-center gap-2 ${
            new Date(todo.dueDate) < new Date() && todo.status !== 'COMPLETED'
              ? 'text-red-400'
              : 'text-gray-400'
          }`}>
            <Clock size={14} />
            <span className="truncate">{format(new Date(todo.dueDate), 'MMM d, h:mm a')}</span>
          </div>
        )}

        {todo.project?.name && (
          <div className="flex items-center gap-2 text-gray-400">
            <FolderKanban size={14} />
            <span className="truncate">{todo.project.name}</span>
          </div>
        )}

        {todo.assignedTo?.name && (
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={14} />
            <span className="truncate">{todo.assignedTo.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Todo Modal Component
function TodoModal({ title, formData, setFormData, projects, onClose, onSubmit, submitLabel }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Task title *"
            value={formData.item}
            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />

          <textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows="3"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />

          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="NORMAL">Normal Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          <select
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Project (Optional)</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="time"
              value={formData.dueTime}
              onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!formData.item.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={16} />
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onCreateClick, searchQuery, filter }) {
  let message = "Create your first task to get started";
  
  if (searchQuery) {
    message = "No tasks match your search criteria";
  } else if (filter === 'completed') {
    message = "No completed tasks yet";
  } else if (filter === 'pending') {
    message = "No pending tasks";
  } else if (filter === 'overdue') {
    message = "No overdue tasks";
  } else if (filter === 'today') {
    message = "No tasks due today";
  }

  return (
    <div className="text-center py-12">
      <CheckCircle size={48} className="mx-auto text-gray-500 mb-3" />
      <p className="text-gray-400 mb-4">{message}</p>
      <button
        onClick={onCreateClick}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
      >
        <Plus size={18} />
        Create Task
      </button>
    </div>
  );
}

// Skeleton Loader
function TodosSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4 sm:p-6">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-800 rounded mb-6" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Todos;