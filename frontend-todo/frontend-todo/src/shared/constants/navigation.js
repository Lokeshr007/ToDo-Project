// frontend/src/shared/constants/navigation.js
export const mainNavigation = [
  {
    path: '/app/dashboard',
    icon: 'LayoutDashboard',
    label: 'Dashboard'
  },
  {
    path: '/app/projects',
    icon: 'FolderKanban',
    label: 'Projects'
  },
  {
    path: '/app/todos',
    icon: 'ListTodo',
    label: 'Tasks',
    children: [
      { path: '/app/todos', label: 'All Tasks', exact: true },
      { path: '/app/todos?filter=today', label: 'Today' },
      { path: '/app/todos?filter=upcoming', label: 'Upcoming' }
    ]
  },
  {
    path: '/app/todo-environment',
    icon: 'Layers',
    label: 'Todo Environment'
  },
  {
    path: '/app/time-capsule',
    icon: 'Clock',
    label: 'Time Capsule'
  },
  {
    path: '/app/boards',
    icon: 'Compass',
    label: 'Boards'
  },
  {
    path: '/app/ai-assistant',
    icon: 'Sparkles',
    label: 'AI Assistant',
    highlight: true,
    badge: 'NEW'
  },
  {
    path: '/app/discoveries',
    icon: 'Compass',
    label: 'Discoveries'
  },
  {
    path: '/app/workspace',
    icon: 'Users',
    label: 'Workspace'
  },
  {
    path: '/app/profile',
    icon: 'User',
    label: 'Profile'
  },
  {
    path: '/app/settings',
    icon: 'Settings',
    label: 'Settings'
  },
  {
    path: '/app/help',
    icon: 'HelpCircle',
    label: 'Help'
  }
];