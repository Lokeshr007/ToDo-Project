// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\shared\layout\Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderKanban, 
  ListTodo,
  Sparkles, 
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  HelpCircle,
  Clock,
  Users,
  Brain,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthContext";
import toast from 'react-hot-toast';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout, currentWorkspace } = useAuth();

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setCollapsed(JSON.parse(savedState));
    }
    
    // Check if AI dropdown should be open based on current route
    const path = window.location.pathname;
    if (path.includes('/app/ai')) {
      setAiDropdownOpen(true);
    }
  }, []);

  const handleToggle = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error('Failed to logout');
    }
  };

  const toggleAiDropdown = () => {
    setAiDropdownOpen(!aiDropdownOpen);
  };

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      collapsed ? 'justify-center' : ''
    } ${
      isActive
        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  const dropdownLinkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
      collapsed ? 'justify-center' : 'pl-10'
    } ${
      isActive
        ? "bg-gradient-to-r from-purple-600/50 to-indigo-600/50 text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  if (!mounted) {
    return null;
  }

  return (
    <div 
      className={`relative ${collapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 p-6 transition-all duration-300 flex flex-col h-screen sticky top-0 shadow-2xl`}
    >
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute -right-3 top-20 bg-gray-800 border border-gray-700 rounded-full p-1.5 hover:bg-gray-700 transition-colors z-10 shadow-lg"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={14} className="text-gray-300" />
        ) : (
          <ChevronLeft size={14} className="text-gray-300" />
        )}
      </button>

      {/* Logo */}
      <div className="mb-10">
        <h1 className={`text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent transition-all ${collapsed ? 'text-center text-xl' : ''}`}>
          {collapsed ? 'TF' : 'TaskFlow'}
        </h1>
        {!collapsed && (
          <p className="text-xs text-gray-500 mt-1">
            {currentWorkspace?.name || 'Workspace Manager'}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        <NavLink to="/app/dashboard" className={linkStyle}>
          <LayoutDashboard size={18} />
          {!collapsed && "Dashboard"}
        </NavLink>

        <NavLink to="/app/projects" className={linkStyle}>
          <FolderKanban size={18} />
          {!collapsed && "Projects"}
        </NavLink>

        <NavLink to="/app/todos" className={linkStyle}>
          <ListTodo size={18} />
          {!collapsed && "Tasks"}
        </NavLink>

        <NavLink to="/app/time-capsule" className={linkStyle}>
          <Clock size={18} />
          {!collapsed && "Time Capsule"}
        </NavLink>

        <NavLink to="/app/workspace" className={linkStyle}>
          <Users size={18} />
          {!collapsed && "Workspace"}
        </NavLink>

        {/* AI Assistant Dropdown */}
        <div className="space-y-1">
          <button
            onClick={toggleAiDropdown}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-gray-800 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Brain size={18} className="text-purple-400" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">AI Assistant</span>
                {aiDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </>
            )}
          </button>

          {aiDropdownOpen && !collapsed && (
            <div className="space-y-1 mt-1">
              <NavLink to="/app/ai-assistant" className={dropdownLinkStyle}>
                <Sparkles size={16} />
                Basic Assistant
              </NavLink>
              <NavLink to="/app/ai/enterprise" className={dropdownLinkStyle}>
                <Zap size={16} />
                Enterprise AI
              </NavLink>
              <NavLink to="/app/ai/learning-paths" className={dropdownLinkStyle}>
                <Brain size={16} />
                Learning Paths
              </NavLink>
            </div>
          )}

          {collapsed && aiDropdownOpen && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-800 rounded-lg p-2 shadow-xl z-50 min-w-48">
              <NavLink to="/app/ai-assistant" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Basic Assistant
              </NavLink>
              <NavLink to="/app/ai/enterprise" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Enterprise AI
              </NavLink>
              <NavLink to="/app/ai/learning-paths" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Learning Paths
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/app/profile" className={linkStyle}>
          <User size={18} />
          {!collapsed && "Profile"}
        </NavLink>

        <NavLink to="/app/settings" className={linkStyle}>
          <Settings size={18} />
          {!collapsed && "Settings"}
        </NavLink>
      </nav>

      {/* Bottom Section */}
      <div className="space-y-1 mt-auto pt-4 border-t border-gray-800">
        {/* Help Link */}
        <NavLink to="/app/help" className={linkStyle}>
          <HelpCircle size={18} />
          {!collapsed && "Help"}
        </NavLink>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-400 hover:text-red-400 hover:bg-red-600/10 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </div>

      {/* Version Info */}
      {!collapsed && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">v1.0.0</p>
        </div>
      )}
    </div>
  );
}

export default Sidebar;