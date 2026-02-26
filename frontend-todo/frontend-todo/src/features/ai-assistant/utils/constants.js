// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\utils\constants.js

export const AI_CONSTANTS = {
  // Plan categories
  PLAN_CATEGORIES: [
    { value: 'DEVELOPMENT', label: 'Development', icon: '💻', color: 'blue' },
    { value: 'LANGUAGE', label: 'Language', icon: '🗣️', color: 'green' },
    { value: 'BUSINESS', label: 'Business', icon: '💼', color: 'yellow' },
    { value: 'FITNESS', label: 'Fitness', icon: '💪', color: 'orange' },
    { value: 'ACADEMIC', label: 'Academic', icon: '📚', color: 'purple' },
    { value: 'CREATIVE', label: 'Creative', icon: '🎨', color: 'pink' },
    { value: 'TECHNOLOGY', label: 'Technology', icon: '⚙️', color: 'indigo' },
    { value: 'SCIENCE', label: 'Science', icon: '🔬', color: 'cyan' },
    { value: 'ARTS', label: 'Arts', icon: '🎭', color: 'rose' },
    { value: 'MUSIC', label: 'Music', icon: '🎵', color: 'fuchsia' }
  ],

  // Difficulty levels
  DIFFICULTY_LEVELS: [
    { value: 'BEGINNER', label: 'Beginner', color: 'green' },
    { value: 'INTERMEDIATE', label: 'Intermediate', color: 'yellow' },
    { value: 'ADVANCED', label: 'Advanced', color: 'red' },
    { value: 'EXPERT', label: 'Expert', color: 'purple' }
  ],

  // Priority levels
  PRIORITY_LEVELS: [
    { value: 'HIGH', label: 'High', color: 'red' },
    { value: 'MEDIUM', label: 'Medium', color: 'yellow' },
    { value: 'LOW', label: 'Low', color: 'green' }
  ],

  // Learning styles
  LEARNING_STYLES: [
    { value: 'VISUAL', label: 'Visual', icon: '👁️', description: 'Learn best with images and diagrams' },
    { value: 'AUDITORY', label: 'Auditory', icon: '👂', description: 'Learn best with sound and music' },
    { value: 'READING', label: 'Reading/Writing', icon: '📖', description: 'Learn best with text' },
    { value: 'KINESTHETIC', label: 'Kinesthetic', icon: '🖐️', description: 'Learn best with hands-on activities' }
  ],

  // Task statuses
  TASK_STATUSES: [
    { value: 'PENDING', label: 'Pending', color: 'yellow' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
    { value: 'REVIEW', label: 'Review', color: 'purple' },
    { value: 'COMPLETED', label: 'Completed', color: 'green' },
    { value: 'BLOCKED', label: 'Blocked', color: 'red' },
    { value: 'ARCHIVED', label: 'Archived', color: 'gray' }
  ],

  // Column types
  COLUMN_TYPES: [
    { value: 'TODO', label: 'To Do', color: '#6b7280' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
    { value: 'REVIEW', label: 'Review', color: '#a855f7' },
    { value: 'DONE', label: 'Done', color: '#22c55e' },
    { value: 'BACKLOG', label: 'Backlog', color: '#6b7280' },
    { value: 'CUSTOM', label: 'Custom', color: '#6366f1' }
  ],

  // File upload limits
  FILE_UPLOAD: {
    MAX_SIZE_MB: 20,
    MAX_SIZE_BYTES: 20 * 1024 * 1024,
    ALLOWED_TYPES: ['pdf', 'doc', 'docx', 'txt', 'md'],
    ALLOWED_MIME_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/markdown'
    ]
  },

  // AI confidence thresholds
  CONFIDENCE_THRESHOLDS: {
    HIGH: 80,
    MEDIUM: 60,
    LOW: 40
  },

  // Default plan settings
  DEFAULT_PLAN: {
    durationDays: 60,
    recommendedDailyHours: 4,
    estimatedTotalHours: 240,
    difficulty: 'INTERMEDIATE',
    category: 'DEVELOPMENT'
  },

  // Progress indicators
  PROGRESS: {
    MILESTONE_DAYS: [7, 14, 30, 45, 60],
    REVIEW_FREQUENCY: 7,
    BREAK_INTERVAL: 45, // minutes
    BREAK_DURATION: 10 // minutes
  },

  // Colors for visualization
  COLORS: {
    primary: ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'],
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    gray: '#6b7280'
  },

  // API endpoints
  API_ENDPOINTS: {
    PARSE_PLAN: '/api/ai/parse-plan',
    GENERATE_TASKS: '/api/ai/generate-tasks',
    CHAT: '/api/ai/chat',
    ENTERPRISE_PROCESS: '/api/ai/enterprise/process',
    ENTERPRISE_FILE: '/api/ai/enterprise/process-file',
    ENTERPRISE_CHAT: '/api/ai/enterprise/process-natural-language',
    CONTEXT: '/api/ai/context'
  },

  // Error messages
  ERROR_MESSAGES: {
    FILE_TOO_LARGE: 'File size exceeds maximum limit',
    INVALID_FILE_TYPE: 'File type not supported',
    PARSE_FAILED: 'Failed to parse document',
    GENERATE_FAILED: 'Failed to generate tasks',
    NETWORK_ERROR: 'Network error. Please check your connection',
    UNAUTHORIZED: 'Session expired. Please login again',
    NOT_FOUND: 'Resource not found',
    SERVER_ERROR: 'Server error. Please try again later'
  },

  // Success messages
  SUCCESS_MESSAGES: {
    PLAN_PARSED: 'Plan parsed successfully!',
    TASKS_GENERATED: 'Tasks generated successfully!',
    TASKS_SAVED: 'Tasks saved to your workspace!',
    CONTEXT_CLEARED: 'Conversation context cleared'
  },

  // Local storage keys
  STORAGE_KEYS: {
    AI_SESSION: 'ai_session',
    AI_CONTEXT: 'ai_context',
    LAST_PLAN: 'last_ai_plan'
  },

  // Animation durations
  ANIMATION: {
    FAST: 150,
    MEDIUM: 300,
    SLOW: 500
  }
};