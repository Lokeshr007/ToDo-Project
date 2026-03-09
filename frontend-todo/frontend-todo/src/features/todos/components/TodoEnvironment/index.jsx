import React, { useState, useEffect, useCallback } from "react";
import API from "@/services/api";
import { useAuth } from "@/app/providers/AuthContext";
import { useWorkspace } from "@/app/providers/WorkspaceContext";
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { taskToast } from '@/shared/components/QuantumToaster';

import TodoHeader from "./TodoHeader";
import TodoListView from "./TodoListView";
import TodoGridView from "./TodoGridView";
import TodoCalendarView from "./TodoCalendarView";
import TodoModal from "./TodoModal";
import TodoSkeleton from "./TodoSkeleton";

const TodoEnvironment = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    project: 'all',
    date: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const { currentWorkspace } = useWorkspace();

  const [formData, setFormData] = useState({
    item: '',
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

  const fetchData = useCallback(async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    try {
      const projectsRes = await API.get(`/projects?workspaceId=${currentWorkspace.id}`);
      setProjects(projectsRes.data);

      const tasksRes = await API.get("/todos");
      let allTasks = [];
      if (Array.isArray(tasksRes.data)) {
        allTasks = tasksRes.data.map(todo => ({
          id: todo.id,
          title: todo.item || todo.title,
          description: todo.description || '',
          status: todo.status || 'PENDING',
          priority: todo.priority || 'NORMAL',
          dueDate: todo.dueDate,
          completedAt: todo.completedAt,
          createdAt: todo.createdAt,
          updatedAt: todo.updatedAt,
          assignedTo: todo.assignedTo,
          projectId: todo.project?.id,
          project: todo.project,
          boardId: todo.board?.id,
          board: todo.board,
          labels: todo.labels || []
        }));
      }
      setTasks(allTasks);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      taskToast.error("Failed to load operational data");
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = [...tasks];

    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status?.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority?.toUpperCase() === filters.priority.toUpperCase());
    }

    if (filters.project !== 'all') {
      filtered = filtered.filter(task => task.projectId === parseInt(filters.project));
    }

    if (filters.date !== 'all') {
      const today = new Date();
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        switch(filters.date) {
          case 'today': return isToday(dueDate);
          case 'tomorrow': return isTomorrow(dueDate);
          case 'week': return isThisWeek(dueDate);
          case 'overdue': return dueDate < today && task.status !== 'COMPLETED';
          default: return true;
        }
      });
    }

    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'dueDate': return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
        case 'priority':
          const pw = { 'HIGH': 3, 'MEDIUM': 2, 'NORMAL': 1, 'LOW': 0 };
          return (pw[b.priority] || 0) - (pw[a.priority] || 0);
        case 'status': return (a.status || '').localeCompare(b.status || '');
        case 'created': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default: return 0;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, filters, searchQuery, sortBy]);

  const handleSave = async () => {
    if (!formData.item.trim()) return;

    try {
      let dueDateTime = null;
      if (formData.dueDate) {
        dueDateTime = formData.dueTime ? `${formData.dueDate}T${formData.dueTime}:00` : `${formData.dueDate}T23:59:59`;
      }

      const taskData = {
        item: formData.item,
        description: formData.description,
        priority: formData.priority,
        dueDate: dueDateTime,
        assignedToId: formData.assignedToId || null,
        projectId: formData.projectId || null,
        boardId: formData.boardId || null,
        status: editingTask ? editingTask.status : 'PENDING'
      };

      const response = editingTask 
        ? await API.put(`/todos/${editingTask.id}`, taskData)
        : await API.post("/todos", taskData);
      
      const processed = {
        id: response.data.id,
        title: response.data.item,
        item: response.data.item,
        description: response.data.description,
        status: response.data.status,
        priority: response.data.priority,
        dueDate: response.data.dueDate,
        assignedTo: response.data.assignedTo,
        projectId: response.data.project?.id,
        project: response.data.project,
        boardId: response.data.board?.id,
        board: response.data.board
      };
      
      setTasks(prev => editingTask 
        ? prev.map(t => t.id === editingTask.id ? processed : t)
        : [processed, ...prev]
      );
      
      setShowCreateModal(false);
      resetForm();
      taskToast.success(editingTask ? 'Directive Updated' : 'Directive Initialized');
    } catch (error) {
      console.error("Save error:", error);
      taskToast.error("Operation Failed");
    }
  };

  const handleToggleStatus = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      const response = await API.patch(`/todos/${taskId}/status`, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: response.data.status } : t));
      taskToast.success(`Directive: ${response.data.status}`);
    } catch (error) {
      taskToast.error("Status Sync Failed");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Confirm deletion of operational node?')) return;
    try {
      await API.delete(`/todos/${taskId}`);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      taskToast.success('Node Decommissioned');
    } catch (error) {
      taskToast.error("Decommission Failed");
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      item: '', description: '', priority: 'NORMAL', dueDate: '', dueTime: '',
      assignedToId: '', projectId: '', boardId: '', labels: [], reminder: false, reminderTime: '15'
    });
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setFormData({
      item: task.title || '',
      description: task.description || '',
      priority: task.priority || 'NORMAL',
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      dueTime: task.dueDate ? format(new Date(task.dueDate), 'HH:mm') : '',
      projectId: task.projectId || '',
      reminder: false,
      reminderTime: '15'
    });
    setShowCreateModal(true);
  };

  const getPriorityBadge = (p) => {
    const map = {
      HIGH: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
      MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      NORMAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    return map[p] || map.NORMAL;
  };

  const getStatusBadge = (s) => {
    const map = {
      COMPLETED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      IN_PROGRESS: 'bg-blue-600/10 text-blue-400 border border-blue-500/20',
      PENDING: 'bg-slate-800 text-slate-500 border border-slate-700',
      BACKLOG: 'bg-slate-900 text-slate-600 border border-slate-800'
    };
    return map[s] || map.PENDING;
  };

  if (loading) return <TodoSkeleton />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
      <TodoHeader 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        filters={filters} setFilters={setFilters}
        projects={projects} sortBy={sortBy} setSortBy={setSortBy}
        viewMode={viewMode} setViewMode={setViewMode}
        onNewTask={() => { resetForm(); setShowCreateModal(true); }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {viewMode === 'list' && (
          <TodoListView 
            tasks={filteredTasks} onToggleStatus={handleToggleStatus}
            onEdit={openEdit} onDelete={handleDelete}
            getPriorityBadge={getPriorityBadge} getStatusBadge={getStatusBadge}
          />
        )}

        {viewMode === 'grid' && (
          <TodoGridView 
            tasks={filteredTasks} onToggleStatus={handleToggleStatus}
            onEdit={openEdit} onDelete={handleDelete}
            getPriorityBadge={getPriorityBadge} getStatusBadge={getStatusBadge}
          />
        )}

        {viewMode === 'calendar' && (
          <TodoCalendarView tasks={filteredTasks} onTaskClick={openEdit} />
        )}
      </div>

      <TodoModal 
        show={showCreateModal} onClose={() => setShowCreateModal(false)}
        editingTask={editingTask} formData={formData} setFormData={setFormData}
        projects={projects} onSave={handleSave}
      />

      {/* Neural Grain Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] mix-blend-overlay">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilterSub">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilterSub)" />
        </svg>
      </div>
    </div>
  );
};

export default TodoEnvironment;

