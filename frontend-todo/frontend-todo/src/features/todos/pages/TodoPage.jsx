import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import API from "@/services/api";
import { useWorkspace } from "@/app/providers/WorkspaceContext";

// Components
import ViewToggle from "../components/common/ViewToggle";
import EmptyState from "../components/common/EmptyState";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import ActiveTimer from "../components/Timer/ActiveTimer";
import FilterBar from "../components/TodoFilters/FilterBar";
import AdvancedFilters from "../components/TodoFilters/AdvancedFilters";
import StatsHeader from "../components/TodoStats/StatsHeader";
import TodoForm from "../components/TodoModal/TodoForm";
import TodoListItem from "../components/TodoList/TodoListItem";
import TodoGridItem from "../components/TodoList/TodoGridItem";

// Hooks
import { useTodoActions } from "../hooks/useTodoActions";
import { useTodoFilters } from "../hooks/useTodoFilters";
import { useTodoStats } from "../hooks/useTodoStats";
import { useTimer } from "../hooks/useTimer";
import { useComments } from "../hooks/useComments";

// Utils
import { validateTodoForm } from "../utils/todoHelpers";
import { getPriorityColor, getStatusColor } from "../utils/todoHelpers";

function Todos() {
  const [todos, setTodos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedTodos, setExpandedTodos] = useState(new Set());
  const [formData, setFormData] = useState({
    item: '',
    description: '',
    priority: 'NORMAL',
    dueDate: '',
    dueTime: '',
    assignedToId: '',
    projectId: '',
    boardId: '',
    columnId: '',
    storyPoints: '',
    labels: []
  });
  const [formErrors, setFormErrors] = useState({});

  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspace();

  // Custom hooks
  const { loading, fetchTodos, createTodo, updateTodo, deleteTodo, toggleTodoStatus } = useTodoActions(setTodos);
  const { filters, setters, filteredTodos } = useTodoFilters(todos);
  const stats = useTodoStats(todos);
  const { activeTimer, elapsedTime, checkActiveTimer, startTimer, stopTimer } = useTimer();
  const { comments, loadingComments, commentText, fetchComments, addComment, updateCommentText } = useComments();

  // Initial data fetching
  useEffect(() => {
    if (currentWorkspace) {
      fetchTodos();
      fetchProjects();
      fetchUsers();
      checkActiveTimer();
    }
  }, [currentWorkspace]);

  const fetchProjects = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const response = await API.get(`/projects`, {
        params: { workspaceId: currentWorkspace.id }
      });
      setProjects(response.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const fetchUsers = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const response = await API.get(`/workspaces/${currentWorkspace.id}/members`);
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleCreateTodo = async () => {
    const errors = validateTodoForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await createTodo(formData);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleUpdateTodo = async () => {
    const errors = validateTodoForm(formData, true);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await updateTodo(editingTodo.id, formData);
      setEditingTodo(null);
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleTimerStopped = (data) => {
    setTodos(prev => prev.map(todo => 
      todo.id === data.todo.id 
        ? { ...todo, actualHours: data.todo.actualHours }
        : todo
    ));
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
      boardId: '',
      columnId: '',
      storyPoints: '',
      labels: []
    });
    setFormErrors({});
  };

  const editTodo = (todo) => {
    setEditingTodo(todo);
    setFormData({
      item: todo.item || todo.title || '',
      description: todo.description || '',
      priority: todo.priority || 'NORMAL',
      dueDate: todo.dueDate || '',
      dueTime: todo.dueDateTime ? todo.dueDateTime.split('T')[1]?.substring(0, 5) : '',
      assignedToId: todo.assignedTo?.id || '',
      projectId: todo.project?.id || '',
      boardId: todo.board?.id || '',
      columnId: todo.boardColumn?.id || '',
      storyPoints: todo.storyPoints || '',
      labels: todo.labels || []
    });
    setShowCreateModal(true);
  };

  const toggleExpand = (todoId) => {
    setExpandedTodos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(todoId)) {
        newSet.delete(todoId);
      } else {
        newSet.add(todoId);
        fetchComments(todoId);
      }
      return newSet;
    });
  };

  const exportTodos = () => {
    const dataStr = JSON.stringify(filteredTodos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `todos-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Tasks exported successfully');
  };

  if (loading && todos.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Tasks</h1>
              <StatsHeader stats={stats} />
            </div>
            
            <div className="flex items-center gap-3">
              {activeTimer && (
                <ActiveTimer 
                  elapsedTime={elapsedTime} 
                  onStop={() => stopTimer(handleTimerStopped)} 
                />
              )}

              <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />

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
          <FilterBar
            searchQuery={filters.searchQuery}
            onSearchChange={setters.setSearchQuery}
            filter={filters.filter}
            onFilterChange={setters.setFilter}
            onToggleFilters={() => setShowFilters(!showFilters)}
            showFilters={showFilters}
            onExport={exportTodos}
            onRefresh={() => fetchTodos()}
          />

          {/* Advanced Filters */}
          {showFilters && (
            <AdvancedFilters
              projects={projects}
              users={users}
              filters={filters}
              setters={setters}
            />
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
                    expanded={expandedTodos.has(todo.id)}
                    onToggleExpand={() => toggleExpand(todo.id)}
                    onStatusChange={toggleTodoStatus}
                    onEdit={editTodo}
                    onDelete={deleteTodo}
                    onStartTimer={startTimer}
                    onStopTimer={() => stopTimer(handleTimerStopped)}
                    activeTimer={activeTimer}
                    comments={comments[todo.id] || []}
                    loadingComments={loadingComments[todo.id]}
                    commentText={commentText[todo.id] || ''}
                    onCommentTextChange={(text) => updateCommentText(todo.id, text)}
                    onAddComment={() => addComment(todo.id)}
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
                    onStartTimer={startTimer}
                    activeTimer={activeTimer}
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
            searchQuery={filters.searchQuery}
            filter={filters.filter}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <TodoForm
          formData={formData}
          setFormData={setFormData}
          formErrors={formErrors}
          projects={projects}
          users={users}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTodo(null);
            resetForm();
          }}
          onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
          submitLabel={editingTodo ? 'Update' : 'Create'}
        />
      )}
    </div>
  );
}

export default Todos;