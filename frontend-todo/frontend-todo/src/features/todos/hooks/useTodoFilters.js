import { useState, useMemo } from 'react';
import { getPriorityWeight, getStatusWeight } from '../utils/todoHelpers';

export const useTodoFilters = (todos) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const filteredTodos = useMemo(() => {
    let filtered = [...todos];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(todo => 
        (todo.item || todo.title || '').toLowerCase().includes(query) ||
        (todo.description || '').toLowerCase().includes(query) ||
        (todo.project?.name || '').toLowerCase().includes(query) ||
        (todo.assignedTo?.name || '').toLowerCase().includes(query)
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
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(todo => todo.status === selectedStatus);
    }

    // Apply assignee filter
    if (selectedAssignee !== 'all') {
      filtered = filtered.filter(todo => todo.assignedTo?.id === parseInt(selectedAssignee));
    }

    // Apply show/hide completed
    if (!showCompleted) {
      filtered = filtered.filter(todo => todo.status !== 'COMPLETED');
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'dueDate':
          const aDate = a.dueDateTime || a.dueDate;
          const bDate = b.dueDateTime || b.dueDate;
          comparison = (aDate ? new Date(aDate) : new Date(8640000000000000)) - 
                      (bDate ? new Date(bDate) : new Date(8640000000000000));
          break;
        case 'priority':
          comparison = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
          break;
        case 'status':
          comparison = getStatusWeight(a.status) - getStatusWeight(b.status);
          break;
        case 'created':
          comparison = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          break;
        case 'title':
          comparison = (a.item || a.title || '').localeCompare(b.item || b.title || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [todos, searchQuery, selectedProject, selectedPriority, selectedStatus, 
      selectedAssignee, showCompleted, sortBy, sortOrder]);

  return {
    filters: {
      filter,
      searchQuery,
      sortBy,
      sortOrder,
      selectedProject,
      selectedPriority,
      selectedStatus,
      selectedAssignee,
      showCompleted
    },
    setters: {
      setFilter,
      setSearchQuery,
      setSortBy,
      setSortOrder,
      setSelectedProject,
      setSelectedPriority,
      setSelectedStatus,
      setSelectedAssignee,
      setShowCompleted
    },
    filteredTodos
  };
};