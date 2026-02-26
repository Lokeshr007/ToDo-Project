export const getPriorityColor = (priority) => {
  switch(priority) {
    case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'NORMAL': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

export const getStatusColor = (status) => {
  switch(status) {
    case 'COMPLETED': return 'bg-green-500/20 text-green-400';
    case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400';
    case 'PENDING': return 'bg-yellow-500/20 text-yellow-400';
    case 'REVIEW': return 'bg-purple-500/20 text-purple-400';
    case 'BLOCKED': return 'bg-red-500/20 text-red-400';
    case 'ARCHIVED': return 'bg-gray-500/20 text-gray-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};

export const getPriorityWeight = (priority) => {
  const weights = { 'HIGH': 3, 'MEDIUM': 2, 'NORMAL': 1, 'LOW': 0 };
  return weights[priority] || 0;
};

export const getStatusWeight = (status) => {
  const weights = { 'PENDING': 0, 'IN_PROGRESS': 1, 'REVIEW': 2, 'BLOCKED': 3, 'COMPLETED': 4 };
  return weights[status] || 0;
};

export const validateTodoForm = (formData, isEditing = false) => {
  const errors = {};
  
  if (!formData.item?.trim()) {
    errors.item = "Task title is required";
  }
  
  if (formData.dueDate && !isEditing) {
    const selectedDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.dueDate = "Due date cannot be in the past";
    }
  }
  
  if (formData.dueDate && formData.dueTime && !isEditing) {
    const dateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
    if (dateTime < new Date()) {
      errors.dueTime = "Due time cannot be in the past";
    }
  }
  
  return errors;
};

export const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const formatTodoData = (formData) => ({
  item: formData.item.trim(),
  description: formData.description,
  priority: formData.priority,
  dueDate: formData.dueDate || null,
  dueTime: formData.dueTime || null,
  assignedToId: formData.assignedToId || null,
  projectId: formData.projectId || null,
  boardId: formData.boardId || null,
  columnId: formData.columnId || null,
  storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : null,
  labels: formData.labels.filter(l => l.trim() !== '')
});

export const processTodoResponse = (todo) => ({
  ...todo,
  title: todo.item || todo.title,
  overdue: todo.overdue || (todo.dueDate && !todo.completedAt && new Date(todo.dueDate) < new Date())
});

