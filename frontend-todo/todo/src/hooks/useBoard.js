import { useState, useEffect, useCallback } from 'react';
import { boardApi } from '../services/api/boardApi';
import { columnApi } from '../services/api/columnApi';
import { todoApi } from '../services/api/todoApi';
import { useNotification } from '../context/NotificationContext';

export const useBoard = (boardId) => {
  const [board, setBoard] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activity, setActivity] = useState([]);
  const { showNotification } = useNotification();

  // Load board data
  const loadBoard = useCallback(async () => {
    if (!boardId) return;
    
    setLoading(true);
    try {
      const data = await boardApi.getBoard(boardId);
      setBoard(data);
      setColumns(data.columns || []);
    } catch (err) {
      showNotification('Failed to load board', 'error');
    } finally {
      setLoading(false);
    }
  }, [boardId, showNotification]);

  // Load board activity
  const loadActivity = useCallback(async () => {
    if (!boardId) return;
    
    try {
      const data = await boardApi.getBoardActivity(boardId);
      setActivity(data);
    } catch (err) {
      console.error('Failed to load activity:', err);
    }
  }, [boardId]);

  useEffect(() => {
    loadBoard();
    loadActivity();
  }, [loadBoard, loadActivity]);

  // Create column
  const createColumn = async (columnData) => {
    try {
      const newColumn = await columnApi.createColumn(boardId, columnData);
      setColumns(prev => [...prev, newColumn]);
      showNotification('Column created successfully', 'success');
      return newColumn;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to create column', 'error');
      throw err;
    }
  };

  // Update column
  const updateColumn = async (columnId, columnData) => {
    try {
      const updatedColumn = await columnApi.updateColumn(columnId, columnData);
      setColumns(prev => prev.map(c => c.id === columnId ? updatedColumn : c));
      showNotification('Column updated successfully', 'success');
      return updatedColumn;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update column', 'error');
      throw err;
    }
  };

  // Delete column
  const deleteColumn = async (columnId) => {
    try {
      await columnApi.deleteColumn(columnId);
      setColumns(prev => prev.filter(c => c.id !== columnId));
      showNotification('Column deleted successfully', 'success');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete column', 'error');
      throw err;
    }
  };

  // Reorder columns
  const reorderColumns = async (columnOrder) => {
    try {
      await columnApi.reorderColumns(boardId, columnOrder);
      // Update local state with new order
      const newColumns = [...columns].sort((a, b) => 
        columnOrder.indexOf(a.id) - columnOrder.indexOf(b.id)
      );
      setColumns(newColumns);
    } catch (err) {
      showNotification('Failed to reorder columns', 'error');
    }
  };

  // Create task in column
  const createTask = async (columnId, taskData) => {
    try {
      const newTask = await todoApi.createTodo({
        ...taskData,
        columnId,
        boardId
      });
      
      // Update column's tasks
      setColumns(prev => prev.map(col => {
        if (col.id === columnId) {
          return {
            ...col,
            tasks: [...(col.tasks || []), newTask]
          };
        }
        return col;
      }));
      
      showNotification('Task created successfully', 'success');
      return newTask;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to create task', 'error');
      throw err;
    }
  };

  // Move task between columns
  const moveTask = async (taskId, sourceColumnId, destinationColumnId, newOrderIndex) => {
    try {
      await columnApi.moveTask(taskId, sourceColumnId, destinationColumnId, newOrderIndex);
      
      // Update local state
      setColumns(prev => {
        const sourceColumn = prev.find(c => c.id === sourceColumnId);
        const destColumn = prev.find(c => c.id === destinationColumnId);
        const task = sourceColumn?.tasks?.find(t => t.id === taskId);
        
        if (!task) return prev;

        return prev.map(col => {
          if (col.id === sourceColumnId) {
            return {
              ...col,
              tasks: col.tasks?.filter(t => t.id !== taskId) || []
            };
          }
          if (col.id === destinationColumnId) {
            const newTasks = [...(col.tasks || [])];
            newTasks.splice(newOrderIndex, 0, task);
            return {
              ...col,
              tasks: newTasks
            };
          }
          return col;
        });
      });
      
      // Refresh activity
      loadActivity();
    } catch (err) {
      showNotification('Failed to move task', 'error');
      throw err;
    }
  };

  // Update task
  const updateTask = async (taskId, taskData) => {
    try {
      const updatedTask = await todoApi.updateTodo(taskId, taskData);
      
      // Update task in all columns
      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks?.map(t => t.id === taskId ? updatedTask : t) || []
      })));
      
      showNotification('Task updated successfully', 'success');
      return updatedTask;
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update task', 'error');
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    try {
      await todoApi.deleteTodo(taskId);
      
      // Remove task from all columns
      setColumns(prev => prev.map(col => ({
        ...col,
        tasks: col.tasks?.filter(t => t.id !== taskId) || []
      })));
      
      showNotification('Task deleted successfully', 'success');
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete task', 'error');
      throw err;
    }
  };

  return {
    board,
    columns,
    loading,
    activity,
    loadBoard,
    loadActivity,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createTask,
    moveTask,
    updateTask,
    deleteTask,
  };
};