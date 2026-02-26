// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\app\config\routesConfig.js

export const ROUTES = {
  // Public routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_OTP: '/verify-otp',
  GOOGLE_SUCCESS: '/google-success',

  // Protected app routes
  APP: {
    DASHBOARD: '/app/dashboard',
    PROJECTS: '/app/projects',
    PROJECT_DETAIL: (id) => `/app/projects/${id}`,
    TODOS: '/app/todos',
    TIME_CAPSULE: '/app/time-capsule',
    WORKSPACE: '/app/workspace',
    PROFILE: '/app/profile',
    SETTINGS: '/app/settings',
    HELP: '/app/help',
    
    // AI Assistant routes
    AI_ASSISTANT: {
      ROOT: '/app/ai-assistant',
      CHAT: '/app/ai-assistant/chat',
      PLANS: '/app/ai-assistant/plans',
      PATHS: '/app/ai-assistant/paths',
      ENTERPRISE: '/app/ai-assistant/enterprise',
    }
  }
};

export const AI_ASSISTANT_ROUTES = [
  { path: ROUTES.APP.AI_ASSISTANT.CHAT, label: 'AI Chat', icon: 'MessageSquare' },
  { path: ROUTES.APP.AI_ASSISTANT.PLANS, label: 'Learning Plans', icon: 'Sparkles' },
  { path: ROUTES.APP.AI_ASSISTANT.PATHS, label: 'Learning Paths', icon: 'GitBranch' },
  { path: ROUTES.APP.AI_ASSISTANT.ENTERPRISE, label: 'Enterprise AI', icon: 'Zap' }
];

export const NAVIGATION_ITEMS = [
  { path: ROUTES.APP.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.APP.PROJECTS, label: 'Projects', icon: 'FolderKanban' },
  { path: ROUTES.APP.TODOS, label: 'Tasks', icon: 'ListTodo' },
  { path: ROUTES.APP.TIME_CAPSULE, label: 'Time Capsule', icon: 'Clock' },
  { path: ROUTES.APP.WORKSPACE, label: 'Workspace', icon: 'Users' },
  { path: ROUTES.APP.PROFILE, label: 'Profile', icon: 'User' },
  {
    label: 'AI Assistant',
    icon: 'Brain',
    children: AI_ASSISTANT_ROUTES
  },
  { path: ROUTES.APP.SETTINGS, label: 'Settings', icon: 'Settings' },
  { path: ROUTES.APP.HELP, label: 'Help', icon: 'HelpCircle' }
];