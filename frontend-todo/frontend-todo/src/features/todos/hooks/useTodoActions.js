import { useState } from 'react';
import API from '@/services/api';
import { taskToast } from '@/shared/components/QuantumToaster';
import { formatTodoData, processTodoResponse } from '../utils/todoHelpers';

export const useTodoActions = (setTodos) => {
  const [loading, setLoading] = useState(false);

  const fetchTodos = async (params = {}) => {
    try {
      setLoading(true);
      const response = await API.get("/todos", { params });
      
      let allTodos = [];
      if (Array.isArray(response.data)) {
        allTodos = response.data.map(processTodoResponse);
      }
      setTodos(allTodos);
      return allTodos;
    } catch (error) {
      console.error("Failed to fetch todos:", error);
      toast.error("Failed to load tasks");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (formData) => {
    try {
      const todoData = formatTodoData(formData);
      console.log("Creating todo with data:", todoData); // Debug log
      
      const response = await API.post("/todos", todoData);
      
      const newTodo = processTodoResponse(response.data);
      setTodos(prev => [newTodo, ...prev]);
      toast.success('Task created successfully');
      return newTodo;
    } catch (error) {
      console.error("Failed to create todo:", error);
      console.error("Error response:", error.response?.data); // Debug log
      toast.error(error.response?.data?.error || "Failed to create task");
      throw error;
    }
  };

  const updateTodo = async (id, formData) => {
    try {
      const todoData = formatTodoData(formData);
      console.log("Updating todo with data:", todoData); // Debug log
      
      const response = await API.put(`/todos/${id}`, todoData);
      
      const updatedTodo = processTodoResponse(response.data);
      setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo));
      toast.success('Task updated successfully');
      return updatedTodo;
    } catch (error) {
      console.error("Failed to update todo:", error);
      console.error("Error response:", error.response?.data); // Debug log
      toast.error(error.response?.data?.error || "Failed to update task");
      throw error;
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await API.delete(`/todos/${id}`);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast.success(response.data?.message || 'Task deleted successfully');
      return response.data;
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast.error(error.response?.data?.error || "Failed to delete task");
      throw error;
    }
  };

  const toggleTodoStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      const response = await API.patch(`/todos/${id}/status`, { status: newStatus });
      
      const updatedTodo = processTodoResponse(response.data);
      setTodos(prev => prev.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      
      toast.success(`Task marked as ${newStatus}`);
    } catch (error) {
      console.error("Failed to update todo status:", error);
      toast.error("Failed to update task");
    }
  };

  const bulkDelete = async (ids, permanent = false) => {
    try {
      setLoading(true);
      await API.post("/todos/bulk/delete", { ids, permanent });
      setTodos(prev => prev.filter(todo => !ids.includes(todo.id)));
      toast.success(`Deleted ${ids.length} tasks`);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Failed to delete multiple tasks");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoStatus,
    bulkDelete
  };
};