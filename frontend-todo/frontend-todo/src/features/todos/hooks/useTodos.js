import { useState, useEffect, useCallback } from 'react';
import { todoApi } from '@/services/api/todoApi';
import { useNotification } from '@/app/providers/NotificationContext';

export const useTodos = (initialFilters = {}) => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [stats, setStats] = useState(null);
  const { showNotification } = useNotification();

  // Load todos with filters
  const loadTodos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await todoApi.getTodos(filters);
      setTodos(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      showNotification('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification]);

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const data = await todoApi.getTodoStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    loadTodos();
    loadStats();
  }, [loadTodos, loadStats]);

  // Create task
  const createTodo = async (todoData) => {
    try {
      const newTodo = await todoApi.createTodo(todoData);
      setTodos(prev => [newTodo, ...prev]);
      showNotification('Task created successfully', 'success');
      loadStats(); // Refresh stats
      return newTodo;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to create task', 'error');
      throw err;
    }
  };

  // Update task
  const updateTodo = async (id, todoData) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, todoData);
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      showNotification('Task updated successfully', 'success');
      loadStats(); // Refresh stats
      return updatedTodo;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update task', 'error');
      throw err;
    }
  };

  // Update task status
  const updateTodoStatus = async (id, status) => {
    try {
      const updatedTodo = await todoApi.updateTodoStatus(id, status);
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      loadStats(); // Refresh stats
      return updatedTodo;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update task status', 'error');
      throw err;
    }
  };

  // Delete task
  const deleteTodo = async (id) => {
    try {
      await todoApi.deleteTodo(id);
      setTodos(prev => prev.filter(t => t.id !== id));
      showNotification('Task deleted successfully', 'success');
      loadStats(); // Refresh stats
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete task', 'error');
      throw err;
    }
  };

  // Restore task
  const restoreTodo = async (id) => {
    try {
      const restoredTodo = await todoApi.restoreTodo(id);
      setTodos(prev => [restoredTodo, ...prev]);
      showNotification('Task restored successfully', 'success');
      loadStats(); // Refresh stats
      return restoredTodo;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to restore task', 'error');
      throw err;
    }
  };

  // Search tasks
  const searchTodos = async (query) => {
    if (!query.trim()) {
      loadTodos();
      return;
    }
    
    setLoading(true);
    try {
      const results = await todoApi.searchTodos(query);
      setTodos(results);
    } catch (err) {
      showNotification('Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({});
  };

  return {
    todos,
    loading,
    error,
    stats,
    filters,
    setFilters,
    loadTodos,
    createTodo,
    updateTodo,
    updateTodoStatus,
    deleteTodo,
    restoreTodo,
    searchTodos,
    clearFilters,
  };
};