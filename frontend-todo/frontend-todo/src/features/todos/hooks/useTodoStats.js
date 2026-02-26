import { useState, useEffect } from 'react';

export const useTodoStats = (todos) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    dueToday: 0,
    inProgress: 0,
    blocked: 0
  });

  useEffect(() => {
    if (todos.length > 0) {
      updateStats();
    }
  }, [todos]);

  const updateStats = () => {
    const now = new Date();
    const completed = todos.filter(t => t.status === 'COMPLETED').length;
    const pending = todos.filter(t => t.status !== 'COMPLETED').length;
    const overdue = todos.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      return new Date(t.dueDate) < now;
    }).length;
    const dueToday = todos.filter(t => {
      if (!t.dueDate || t.status === 'COMPLETED') return false;
      const dueDate = new Date(t.dueDate);
      return dueDate.toDateString() === now.toDateString();
    }).length;
    const inProgress = todos.filter(t => t.status === 'IN_PROGRESS').length;
    const blocked = todos.filter(t => t.status === 'BLOCKED').length;

    setStats({
      total: todos.length,
      completed,
      pending,
      overdue,
      dueToday,
      inProgress,
      blocked
    });
  };

  return stats;
};