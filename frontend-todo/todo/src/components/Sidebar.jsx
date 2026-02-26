// frontend/src/components/Sidebar.jsx
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
  Star
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
    // Check if sidebar state is saved in localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      setCollapsed(JSON.parse(savedState));
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
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error('Failed to logout');
    }
  };

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      collapsed ? 'justify-center' : ''
    } ${
      isActive
        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

  if (!mounted) {
    return null; // Prevent flash of wrong state
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
          <p className="text-xs text-gray-500 mt-1">Workspace Manager</p>
        )}
      </div>

      {/* User Info - Only show when expanded */}
      {!collapsed && user && (
        <div className="mb-6 p-3 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>
        </div>
      )}

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

        <NavLink to="/app/profile" className={linkStyle}>
          <User size={18} />
          {!collapsed && "Profile"}
        </NavLink>

        <NavLink to="/app/ai" className={linkStyle}>
          <Sparkles size={18} />
          {!collapsed && "AI Assistant"}
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

      {/* Version Info - Only when expanded */}
      {!collapsed && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">v1.0.0</p>
        </div>
      )}
    </div>
  );
}

export default Sidebar;