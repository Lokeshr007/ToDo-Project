// frontend/src/components/TopBar.jsx
import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, Settings, LogOut, ChevronDown, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from 'react-hot-toast';

function TopBar() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { user, profile, currentWorkspace, logout, switchWorkspace } = useAuth();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await API.get("/workspaces");
        setWorkspaces(response.data);
      } catch (error) {
        console.error("Failed to fetch workspaces:", error);
      }
    };

    if (user) {
      fetchWorkspaces();
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (currentWorkspace) {
      setSelectedWorkspace(currentWorkspace);
    }
  }, [currentWorkspace]);

  useEffect(() => {
    // Close menus when clicking outside
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      // This would come from your backend
      const mockNotifications = [
        { id: 1, message: "Task 'Design review' is due today", type: "warning", read: false },
        { id: 2, message: "John assigned you a new task", type: "info", read: false },
        { id: 3, message: "Project 'Mobile App' completed", type: "success", read: true }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      // Search tasks
      const tasksResponse = await API.get(`/todo/search?q=${query}`);
      // Search projects
      const projectsResponse = await API.get(`/projects/search?q=${query}&workspaceId=${currentWorkspace?.id}`);
      
      const results = [
        ...tasksResponse.data.map(t => ({ ...t, type: 'task' })),
        ...projectsResponse.data.map(p => ({ ...p, type: 'project' }))
      ];
      
      setSearchResults(results.slice(0, 5));
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const handleWorkspaceChange = (workspaceId) => {
    const workspace = workspaces.find(w => w.id === parseInt(workspaceId));
    if (workspace) {
      switchWorkspace(workspace);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const getInitials = () => {
    if (profile?.name) {
      return profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (profile?.name) return profile.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left Section - Workspace Selector & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Workspace Selector */}
          {selectedWorkspace && workspaces.length > 0 && (
            <div className="relative">
              <select
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors"
                value={selectedWorkspace.id}
                onChange={(e) => handleWorkspaceChange(e.target.value)}
              >
                {workspaces.map(workspace => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          )}

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks, projects..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors text-sm"
            />

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {searchResults.map(result => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    onClick={() => {
                      if (result.type === 'task') {
                        navigate(`/app/todos?id=${result.id}`);
                      } else {
                        navigate(`/app/projects/${result.id}`);
                      }
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                  >
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                      result.type === 'task' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {result.type === 'task' ? 'T' : 'P'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {result.title || result.name || result.item}
                      </p>
                      <p className="text-xs text-gray-500">
                        {result.type === 'task' ? 'Task' : 'Project'}
                      </p>
                    </div>
                  </button>
                ))}
                
                {searchResults.length === 5 && (
                  <div className="px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
                    <button 
                      className="text-blue-600 hover:underline"
                      onClick={() => {
                        navigate(`/app/search?q=${searchQuery}`);
                        setShowSearchResults(false);
                      }}
                    >
                      View all results
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors"
            >
              <Bell size={20} className="text-gray-600" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <button
                        key={notification.id}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className={`w-2 h-2 mt-2 rounded-full ${
                          notification.type === 'warning' ? 'bg-yellow-500' :
                          notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">Just now</p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Bell size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-2 border-t border-gray-100">
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    View all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {getInitials()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                <p className="text-xs text-gray-500">{profile?.email || user?.email}</p>
              </div>
              <ChevronDown size={16} className="text-gray-500 hidden md:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500 mt-1">{profile?.email || user?.email}</p>
                </div>

                {/* Menu Items */}
                <Link
                  to="/app/profile"
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User size={16} className="text-gray-500" />
                  Profile
                </Link>

                <Link
                  to="/app/settings"
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings size={16} className="text-gray-500" />
                  Settings
                </Link>

                <div className="border-t border-gray-100 my-1"></div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;