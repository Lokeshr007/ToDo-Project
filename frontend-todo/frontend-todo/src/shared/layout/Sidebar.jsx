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
import { taskToast } from "@/shared/components/QuantumToaster";

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
      taskToast.error('Failed to logout');
    }
  };

  const toggleAiDropdown = () => {
    setAiDropdownOpen(!aiDropdownOpen);
  };

    const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      collapsed ? 'justify-center' : ''
    } ${
      isActive
        ? "bg-purple-600 text-white"
        : "text-gray-400 hover:text-white hover:bg-gray-800"
    }`;

    const dropdownLinkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
      collapsed ? 'justify-center' : 'pl-10'
    } ${
      isActive
        ? "bg-purple-600/20 text-purple-400"
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
      className={`relative ${collapsed ? 'w-20' : 'w-64'} bg-slate-900 border-r border-slate-800 p-6 transition-all duration-300 flex flex-col h-screen sticky top-0 shadow-xl`}
    >
      {/* Styled Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-purple-600 dark:bg-purple-500 rounded-full border-2 border-slate-900 dark:border-slate-800 text-white flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all z-50 shadow-lg"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <div className={`flex items-center justify-center transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
          <ChevronLeft size={14} strokeWidth={3} />
        </div>
      </button>

      {/* Logo */}
      <div className="mb-10">
        <h1 className={`text-2xl font-black text-white transition-all tracking-tight ${collapsed ? 'text-center text-xl' : ''}`}>
          {collapsed ? 'TF' : 'TaskFlow'}
        </h1>
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
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



        <NavLink to="/app/workspaces" className={linkStyle}>
          <Users size={18} />
          {!collapsed && "Workspaces"}
        </NavLink>

        {/* AI Assistant Dropdown */}
        <div className="space-y-1">
          <button
            onClick={toggleAiDropdown}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-400 hover:text-white hover:bg-gray-800 ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <Sparkles size={18} className="text-purple-400" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">AI Tools</span>
                {aiDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </>
            )}
          </button>

          {aiDropdownOpen && !collapsed && (
            <div className="space-y-1 mt-1">
              <NavLink to="/app/ai/assistant" className={dropdownLinkStyle}>
                <Sparkles size={16} />
                Basic Assistant
              </NavLink>
              <NavLink to="/app/ai/enterprise" className={dropdownLinkStyle}>
                <Zap size={16} />
                Advanced AI
              </NavLink>
              <NavLink to="/app/ai/learning-paths" className={dropdownLinkStyle}>
                <ClipboardList size={16} />
                Learning Paths
              </NavLink>
              <NavLink to="/app/ai/project-structure" className={dropdownLinkStyle}>
                <FolderKanban size={16} />
                Project Structure
              </NavLink>
              <NavLink to="/app/ai/workload" className={dropdownLinkStyle}>
                <BarChart size={16} />
                Workload Stats
              </NavLink>
            </div>
          )}

          {collapsed && aiDropdownOpen && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 bg-gray-800 rounded-lg p-2 shadow-xl z-50 min-w-48">
              <NavLink to="/app/ai/assistant" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Basic Assistant
              </NavLink>
              <NavLink to="/app/ai/enterprise" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Advanced AI
              </NavLink>
              <NavLink to="/app/ai/learning-paths" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Learning Paths
              </NavLink>
              <NavLink to="/app/ai/project-structure" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Project Structure
              </NavLink>
              <NavLink to="/app/ai/workload" className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded">
                Workload Stats
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
