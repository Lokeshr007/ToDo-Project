import { useState, useEffect, useRef } from "react";
import { 
  Search, Bell, User, Settings, LogOut, ChevronDown, Home, Loader,
  CheckCircle, AlertCircle, MessageCircle, UserPlus, BellOff,
  Clock, FolderKanban, Mail, CheckCheck, X
} from "lucide-react";
import { useAuth } from "@/app/providers/AuthContext";
import { useWorkspace } from "@/app/providers/WorkspaceContext";
import { useNavigate, Link } from "react-router-dom";
import API from "@/services/api";
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

function TopBar() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  
  const { user, logout } = useAuth();
  const { currentWorkspace, switchWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch workspaces
  useEffect(() => {
    if (user) {
      fetchWorkspaces();
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    if (currentWorkspace) {
      setSelectedWorkspace(currentWorkspace);
    }
  }, [currentWorkspace]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchWorkspaces = async () => {
    try {
      const response = await API.get("/workspaces");
      const workspacesData = Array.isArray(response.data) ? response.data : [];
      setWorkspaces(workspacesData);
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
      setWorkspaces([]);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const response = await API.get("/notifications", {
        params: { limit: 10 }
      });
      
      const notificationsData = Array.isArray(response.data) ? response.data : [];
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await API.get("/notifications/unread/count");
      if (response.data && typeof response.data.count === 'number') {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setLoading(true);
    try {
      const params = { q: query };
      if (currentWorkspace?.id) {
        params.workspaceId = currentWorkspace.id;
      }
      
      const response = await API.get("/search", { params });
      const searchData = Array.isArray(response.data) ? response.data : [];
      setSearchResults(searchData);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceChange = async (workspaceId) => {
    if (!workspaceId) return;
    
    try {
      const workspace = workspaces.find(w => w.id === parseInt(workspaceId));
      if (workspace) {
        setSearchResults([]);
        setSearchQuery('');
        setShowSearchResults(false);
        
        switchWorkspace(workspace);
        toast.success(`Switched to ${workspace.name}`);
        navigate('/app/dashboard');
      }
    } catch (error) {
      console.error("Failed to switch workspace:", error);
      toast.error("Failed to switch workspace");
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.post("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type, icon) => {
    if (icon) {
      switch(icon) {
        case 'CheckCircle': return <CheckCircle size={16} className="text-green-500" />;
        case 'AlertCircle': return <AlertCircle size={16} className="text-red-500" />;
        case 'MessageCircle': return <MessageCircle size={16} className="text-purple-500" />;
        case 'UserPlus': return <UserPlus size={16} className="text-blue-500" />;
        case 'Clock': return <Clock size={16} className="text-yellow-500" />;
        case 'FolderKanban': return <FolderKanban size={16} className="text-indigo-500" />;
        case 'Mail': return <Mail size={16} className="text-pink-500" />;
        default: return <Bell size={16} className="text-gray-500" />;
      }
    }
    
    switch(type) {
      case 'TASK_ASSIGNED': return <UserPlus size={16} className="text-blue-500" />;
      case 'TASK_COMPLETED': return <CheckCircle size={16} className="text-green-500" />;
      case 'TASK_OVERDUE': return <AlertCircle size={16} className="text-red-500" />;
      case 'COMMENT_ADDED': return <MessageCircle size={16} className="text-purple-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

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

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    setShowNotifications(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm px-4 sm:px-6 py-2 sm:py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          {/* Home Button */}
          <Link 
            to="/app/dashboard" 
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Home size={20} className="text-gray-600" />
          </Link>

          {/* Workspace Selector */}
          {selectedWorkspace && workspaces.length > 0 && (
            <div className="relative hidden sm:block">
              <select
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-gray-100 transition-colors min-w-[200px]"
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors text-sm"
            />

            {/* Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="px-4 py-8 text-center">
                    <Loader size={24} className="mx-auto mb-2 text-gray-400 animate-spin" />
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(result => (
                    <button
                      key={`${result.type}-${result.id}`}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                      onClick={() => {
                        if (result.type === 'task') {
                          navigate(`/app/todos?id=${result.id}`);
                        } else if (result.type === 'project') {
                          navigate(`/app/projects/${result.id}`);
                        } else if (result.type === 'board') {
                          navigate(`/app/boards/${result.id}`);
                        }
                        setShowSearchResults(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                        result.type === 'task' ? 'bg-blue-100 text-blue-600' :
                        result.type === 'project' ? 'bg-purple-100 text-purple-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {result.type === 'task' ? 'T' : result.type === 'project' ? 'P' : 'B'}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {result.title || result.name || result.item}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {result.type} • {result.workspace?.name || 'No workspace'}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <Search size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No results found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  fetchNotifications();
                }
              }}
              className="p-2 hover:bg-gray-100 rounded-lg relative transition-colors"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 ring-2 ring-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        title="Mark all as read"
                      >
                        <CheckCheck size={14} />
                        <span className="hidden sm:inline">Mark all read</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <div className="px-4 py-8 text-center">
                      <Loader size={24} className="mx-auto mb-2 text-gray-400 animate-spin" />
                      <p className="text-sm text-gray-500">Loading...</p>
                    </div>
                  ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                      <button
                        key={notification.id}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 transition-colors ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type, notification.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timeAgo || 
                              (notification.createdAt && 
                                formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }))}
                          </p>
                        </div>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <BellOff size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                      <p className="text-xs mt-1">You're all caught up!</p>
                    </div>
                  )}
                </div>
                
                <div className="px-4 py-2 border-t border-gray-100">
                  <Link 
                    to="/app/notifications"
                    className="text-sm text-blue-600 hover:text-blue-700 block text-center"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 sm:gap-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={getDisplayName()}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  getInitials()
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user?.email}</p>
              </div>
              <ChevronDown size={16} className="text-gray-500 hidden md:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{user?.email}</p>
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
