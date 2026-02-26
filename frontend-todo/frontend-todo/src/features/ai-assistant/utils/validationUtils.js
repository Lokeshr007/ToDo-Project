// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\utils\validationUtils.js

/**
 * Validate learning plan form
 */
export const validatePlanForm = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  } else if (data.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }
  
  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  
  if (!data.durationDays) {
    errors.durationDays = 'Duration is required';
  } else if (data.durationDays < 7) {
    errors.durationDays = 'Duration must be at least 7 days';
  } else if (data.durationDays > 365) {
    errors.durationDays = 'Duration cannot exceed 365 days';
  }
  
  if (data.estimatedTotalHours && data.estimatedTotalHours > 24 * data.durationDays) {
    errors.estimatedTotalHours = 'Total hours cannot exceed 24 hours per day';
  }
  
  if (data.recommendedDailyHours && data.recommendedDailyHours > 12) {
    errors.recommendedDailyHours = 'Recommended daily hours cannot exceed 12';
  }
  
  return errors;
};

/**
 * Validate task form
 */
export const validateTaskForm = (data) => {
  const errors = {};
  
  if (!data.title?.trim()) {
    errors.title = 'Task title is required';
  } else if (data.title.length < 3) {
    errors.title = 'Task title must be at least 3 characters';
  } else if (data.title.length > 200) {
    errors.title = 'Task title must be less than 200 characters';
  }
  
  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }
  
  if (data.dayNumber && (data.dayNumber < 1 || data.dayNumber > 365)) {
    errors.dayNumber = 'Day must be between 1 and 365';
  }
  
  if (data.estimatedHours && (data.estimatedHours < 0.25 || data.estimatedHours > 12)) {
    errors.estimatedHours = 'Estimated hours must be between 0.25 and 12';
  }
  
  if (data.priority && !['HIGH', 'MEDIUM', 'LOW'].includes(data.priority)) {
    errors.priority = 'Invalid priority value';
  }
  
  return errors;
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file, options = {}) => {
  const errors = [];
  const maxSize = options.maxSize || 20 * 1024 * 1024; // 20MB default
  const allowedTypes = options.allowedTypes || ['pdf', 'doc', 'docx', 'txt', 'md'];
  
  if (!file) {
    errors.push('No file selected');
    return errors;
  }
  
  const ext = file.name.split('.').pop()?.toLowerCase();
  
  if (!allowedTypes.includes(ext)) {
    errors.push(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  if (file.size > maxSize) {
    errors.push(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
  }
  
  return errors;
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return errors;
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate, endDate) => {
  const errors = [];
  
  if (!startDate) {
    errors.push('Start date is required');
  }
  
  if (!endDate) {
    errors.push('End date is required');
  }
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      errors.push('End date must be after start date');
    }
    
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > 365) {
      errors.push('Date range cannot exceed 365 days');
    }
  }
  
  return errors;
};

/**
 * Validate workspace settings
 */
export const validateWorkspaceSettings = (data) => {
  const errors = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Workspace name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Workspace name must be at least 2 characters';
  } else if (data.name.length > 50) {
    errors.name = 'Workspace name must be less than 50 characters';
  }
  
  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  
  return errors;
};