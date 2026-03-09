import { useState, useEffect } from "react";
import {
  Search, Plus, Filter, Trash2, FolderKanban,
  LayoutGrid, List as ListIcon, Calendar as CalendarIcon,
  Sparkles, Clock, Target, Bell, BarChart3, Flame, Brain, Timer, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { taskToast } from "@/shared/components/QuantumToaster";
import { useNavigate, useSearchParams } from 'react-router-dom';

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
import AITaskGenerator from "../components/AI/AITaskGenerator";
import TimeBlockScheduler from '../components/TimeBlockScheduler';
import GoalTracker from '../components/GoalTracker.jsx';
import SmartReminder from '../components/SmartReminder';
import ConsistencyCalendar from '../components/ConsistencyCalendar.jsx';
import FocusMode from '../components/FocusMode.jsx';
import TaskAnalytics from '../components/TaskAnalytics.jsx';
import StreakCounter from '../components/StreakCounter.jsx';

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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [groupByProject, setGroupByProject] = useState(false);
  const [activeMode, setActiveMode] = useState('tasks'); // 'tasks' or 'insights'
  const [timeCapsuleTab, setTimeCapsuleTab] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date());
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
  const [searchParams] = useSearchParams();
  const { currentWorkspace } = useWorkspace();

  // Custom hooks
  const { loading, fetchTodos, createTodo, updateTodo, deleteTodo, toggleTodoStatus, bulkDelete } = useTodoActions(setTodos);
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

  // Handle opening task from search URL
  useEffect(() => {
    const todoId = searchParams.get('id');
    if (todoId && todos.length > 0) {
      const todo = todos.find(t => t.id === parseInt(todoId));
      if (todo) {
        setEditingTodo(todo);
        setFormData({
          item: todo.item || '',
          description: todo.description || '',
          priority: todo.priority || 'NORMAL',
          dueDate: todo.dueDate || '',
          dueTime: todo.dueTime || '',
          assignedToId: todo.assignedTo?.id || '',
          projectId: todo.project?.id || '',
          boardId: todo.board?.id || '',
          columnId: todo.boardColumn?.id || '',
          storyPoints: todo.storyPoints || '',
          labels: todo.labels || []
        });
        setShowCreateModal(true);
      }
    }
  }, [searchParams, todos]);

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

  const toggleSelect = (todoId) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(todoId)) {
        newSet.delete(todoId);
      } else {
        newSet.add(todoId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTodos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTodos.map(t => t.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} tasks?`)) {
      try {
        await bulkDelete(Array.from(selectedIds));
        setSelectedIds(new Set());
      } catch (error) {
        // Handled in hook
      }
    }
  };

  const exportTodos = () => {
    const dataStr = JSON.stringify(filteredTodos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `todos-${format(new Date(), 'yyyy-MM-dd')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    taskToast.success('Tasks exported successfully');
  };

  if (loading && todos.length === 0) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Header - Fixed offset for TopBar */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-lg sticky top-[64px] z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg">
                <LayoutGrid size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Tasks</h1>
                <p className="text-gray-400 text-xs mt-0.5">Manage your daily workflow</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <button
                onClick={() => setActiveMode('tasks')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeMode === 'tasks'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <ListIcon size={16} />
                Tasks
              </button>
              <button
                onClick={() => setActiveMode('insights')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  activeMode === 'insights'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Sparkles size={16} />
                Time Capsule
              </button>
            </div>

            <div className="flex items-center gap-3">
              {activeTimer && activeMode === 'tasks' && (
                <ActiveTimer
                  elapsedTime={elapsedTime}
                  onStop={() => stopTimer(handleTimerStopped)}
                />
              )}
              
              <button
                onClick={() => {
                  setEditingTodo(null);
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all font-bold text-sm"
              >
                <Plus size={18} />
                New Task
              </button>
            </div>
          </div>

          {activeMode === 'tasks' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 mt-4">
                <StatsHeader stats={stats} />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setTimeCapsuleTab('analytics');
                      setActiveMode('insights');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-purple-400 rounded-lg border border-white/10 transition-all font-bold text-xs"
                    title="Smart Task Import"
                  >
                    <Sparkles size={16} />
                    <span className="hidden sm:inline text-white">AI Task Maker</span>
                  </button>
                  <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-4 py-2 border-b border-white/5 mb-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/40 rounded-lg border border-white/5">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredTodos.length && filteredTodos.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select All</span>
                </div>
                
                <div className="h-4 w-px bg-white/10 hidden sm:block" />

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
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <AdvancedFilters
                  projects={projects}
                  users={users}
                  filters={filters}
                  setters={setters}
                />
              )}

              {/* Floating Bulk Actions Bar */}
              {selectedIds.size > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex items-center gap-3 pr-6 border-r border-slate-200 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {selectedIds.size}
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-white text-sm font-bold leading-none">Selected</p>
                      <button 
                        onClick={() => setSelectedIds(new Set())}
                        className="text-[10px] text-purple-500 hover:text-purple-600 font-bold uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setGroupByProject(!groupByProject)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        groupByProject 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {groupByProject ? 'Ungroup' : 'Group by Project'}
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all text-xs font-bold shadow-md shadow-rose-500/10"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeMode === 'insights' ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Column - Navigation */}
              <div className="w-full md:w-64 space-y-2">
                {[
                  { id: 'schedule', label: 'Time Blocks', icon: Clock, color: 'text-purple-400' },
                  { id: 'goals', label: 'Goals', icon: Target, color: 'text-green-400' },
                  { id: 'reminders', label: 'Reminders', icon: Bell, color: 'text-yellow-400' },
                  { id: 'consistency', label: 'Consistency', icon: Flame, color: 'text-orange-400' },
                  { id: 'focus', label: 'Focus Mode', icon: Zap, color: 'text-blue-400' },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-pink-400' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setTimeCapsuleTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      timeCapsuleTab === tab.id 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                        : 'bg-gray-800/40 text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                    }`}
                  >
                    <tab.icon size={18} className={timeCapsuleTab === tab.id ? 'text-white' : tab.color} />
                    <span className="font-bold text-sm tracking-wide">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Right Column - Content */}
              <div className="flex-1 min-h-[600px] bg-gray-900/40 backdrop-blur-md rounded-3xl border border-gray-800/50 p-6">
                <div className="mb-6 flex items-center justify-between">
                  <StreakCounter />
                  <AITaskGenerator workspaceId={currentWorkspace?.id} onTasksGenerated={fetchTodos} />
                </div>
                
                {timeCapsuleTab === 'schedule' && <TimeBlockScheduler selectedDate={selectedDate} />}
                {timeCapsuleTab === 'goals' && <GoalTracker />}
                {timeCapsuleTab === 'reminders' && <SmartReminder />}
                {timeCapsuleTab === 'consistency' && <ConsistencyCalendar />}
                {timeCapsuleTab === 'focus' && <FocusMode />}
                {timeCapsuleTab === 'analytics' && <TaskAnalytics />}
              </div>
            </div>
          </div>
        ) : filteredTodos.length > 0 ? (
          <>
            {groupByProject ? (
              <div className="space-y-8">
                {projects.map(project => {
                  const projectTasks = filteredTodos.filter(t => t.project?.id === project.id);
                  if (projectTasks.length === 0) return null;
                  return (
                    <div key={project.id} className="space-y-3">
                      <div className="flex items-center gap-3 mb-2 px-2">
                        <FolderKanban size={18} className="text-purple-400" />
                        <h2 className="text-lg font-bold text-white">{project.name}</h2>
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-full">
                          {projectTasks.length}
                        </span>
                      </div>
                      <div className={viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
                        {projectTasks.map(todo => (
                          viewMode === 'list' ? (
                            <TodoListItem
                              key={todo.id}
                              todo={todo}
                              selected={selectedIds.has(todo.id)}
                              onSelect={() => toggleSelect(todo.id)}
                              expanded={expandedTodos.has(todo.id)}
                              onToggleExpand={() => toggleExpand(todo.id)}
                              onStatusChange={toggleTodoStatus}
                              onEdit={editTodo}
                              onDelete={deleteTodo}
                              onStartTimer={startTimer}
                              onStopTimer={() => stopTimer(handleTimerStopped)}
                              activeTimer={activeTimer}
                        elapsedTime={elapsedTime}
                              comments={comments[todo.id] || []}
                              loadingComments={loadingComments[todo.id]}
                              commentText={commentText[todo.id] || ''}
                              onCommentTextChange={(text) => updateCommentText(todo.id, text)}
                              onAddComment={() => addComment(todo.id)}
                              getPriorityColor={getPriorityColor}
                              getStatusColor={getStatusColor}
                            />
                          ) : (
                            <TodoGridItem
                              key={todo.id}
                              todo={todo}
                              selected={selectedIds.has(todo.id)}
                              onSelect={() => toggleSelect(todo.id)}
                              onStatusChange={toggleTodoStatus}
                              onEdit={editTodo}
                              onDelete={deleteTodo}
                              onStartTimer={startTimer}
                              onStopTimer={() => stopTimer(handleTimerStopped)}
                              activeTimer={activeTimer}
                        elapsedTime={elapsedTime}
                              getPriorityColor={getPriorityColor}
                              getStatusColor={getStatusColor}
                            />
                          )
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Unassigned to any project */}
                {filteredTodos.filter(t => !t.project).length > 0 && (
                   <div className="space-y-3">
                    <div className="flex items-center gap-3 mb-2 px-2">
                      <h2 className="text-lg font-bold text-gray-400">No Project</h2>
                    </div>
                    <div className={viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
                      {filteredTodos.filter(t => !t.project).map(todo => (
                        viewMode === 'list' ? (
                          <TodoListItem
                            key={todo.id}
                            todo={todo}
                            selected={selectedIds.has(todo.id)}
                            onSelect={() => toggleSelect(todo.id)}
                            expanded={expandedTodos.has(todo.id)}
                            onToggleExpand={() => toggleExpand(todo.id)}
                            onStatusChange={toggleTodoStatus}
                            onEdit={editTodo}
                            onDelete={deleteTodo}
                            onStartTimer={startTimer}
                            onStopTimer={() => stopTimer(handleTimerStopped)}
                            activeTimer={activeTimer}
                        elapsedTime={elapsedTime}
                            comments={comments[todo.id] || []}
                            loadingComments={loadingComments[todo.id]}
                            commentText={commentText[todo.id] || ''}
                            onCommentTextChange={(text) => updateCommentText(todo.id, text)}
                            onAddComment={() => addComment(todo.id)}
                            getPriorityColor={getPriorityColor}
                            getStatusColor={getStatusColor}
                          />
                        ) : (
                          <TodoGridItem
                            key={todo.id}
                            todo={todo}
                            selected={selectedIds.has(todo.id)}
                            onSelect={() => toggleSelect(todo.id)}
                            onStatusChange={toggleTodoStatus}
                            onEdit={editTodo}
                            onDelete={deleteTodo}
                            onStartTimer={startTimer}
                            activeTimer={activeTimer}
                        elapsedTime={elapsedTime}
                            getPriorityColor={getPriorityColor}
                            getStatusColor={getStatusColor}
                          />
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {viewMode === 'list' && (
                  <div className="space-y-3">
                    {filteredTodos.map(todo => (
                      <TodoListItem
                        key={todo.id}
                        todo={todo}
                        selected={selectedIds.has(todo.id)}
                        onSelect={() => toggleSelect(todo.id)}
                        expanded={expandedTodos.has(todo.id)}
                        onToggleExpand={() => toggleExpand(todo.id)}
                        onStatusChange={toggleTodoStatus}
                        onEdit={editTodo}
                        onDelete={deleteTodo}
                        onStartTimer={startTimer}
                        onStopTimer={() => stopTimer(handleTimerStopped)}
                        activeTimer={activeTimer}
                        elapsedTime={elapsedTime}
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
                        selected={selectedIds.has(todo.id)}
                        onSelect={() => toggleSelect(todo.id)}
                        onStatusChange={toggleTodoStatus}
                        onEdit={editTodo}
                        onDelete={deleteTodo}
                        onStartTimer={startTimer}
                        activeTimer={activeTimer}
                        elapsedTime={elapsedTime}
                        getPriorityColor={getPriorityColor}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                )}
              </>
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
            extraAction={<AITaskGenerator workspaceId={currentWorkspace?.id} onTasksGenerated={fetchTodos} />}
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