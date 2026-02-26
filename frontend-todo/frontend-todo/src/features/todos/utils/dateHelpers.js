import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

// Safe date formatter that handles invalid dates
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Unknown';
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, formatStr);
  } catch (error) {
    return '';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    return '';
  }
};

export const formatDueDate = (todo) => {
  if (!todo.dueDate && !todo.dueDateTime) return null;
  
  try {
    const dueDate = todo.dueDateTime 
      ? new Date(todo.dueDateTime) 
      : new Date(todo.dueDate);
    
    if (isNaN(dueDate.getTime())) return null;
    
    const now = new Date();
    const isOverdue = dueDate < now && todo.status !== 'COMPLETED';
    
    let text = '';
    if (isToday(dueDate)) {
      text = 'Today';
    } else if (isTomorrow(dueDate)) {
      text = 'Tomorrow';
    } else if (isYesterday(dueDate)) {
      text = 'Yesterday';
    } else {
      text = format(dueDate, 'MMM d, yyyy');
    }
    
    if (todo.dueDateTime) {
      text += ` at ${format(dueDate, 'h:mm a')}`;
    }
    
    return {
      text,
      className: isOverdue ? 'text-red-400' : 'text-gray-400'
    };
  } catch (error) {
    return null;
  }
};

export const getTodayDate = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};