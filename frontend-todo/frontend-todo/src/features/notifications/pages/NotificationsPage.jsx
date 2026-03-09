import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  Bell, CheckCircle, AlertCircle, MessageCircle, UserPlus, Clock, 
  FolderKanban, Mail, CheckCheck, Trash2, ArrowLeft, Loader, BellOff,
  Filter, X
} from "lucide-react";
import { formatDistanceToNow, format } from 'date-fns';
import API from "@/services/api";
import { taskToast } from '@/shared/components/QuantumToaster';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await API.get("/notifications", {
        params: { limit: 50, filter: filter !== 'all' ? filter : undefined }
      });
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      tasktaskToast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.post("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      tasktaskToast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      tasktaskToast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      tasktaskToast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      tasktaskToast.error("Failed to delete notification");
    }
  };

  const getNotificationIcon = (type, icon) => {
    if (icon) {
      switch(icon) {
        case 'CheckCircle': return <CheckCircle size={18} className="text-emerald-500" />;
        case 'AlertCircle': return <AlertCircle size={18} className="text-red-500" />;
        case 'MessageCircle': return <MessageCircle size={18} className="text-purple-500" />;
        case 'UserPlus': return <UserPlus size={18} className="text-blue-500" />;
        case 'Clock': return <Clock size={18} className="text-yellow-500" />;
        case 'FolderKanban': return <FolderKanban size={18} className="text-indigo-500" />;
        case 'Mail': return <Mail size={18} className="text-pink-500" />;
        default: return <Bell size={18} className="text-gray-400" />;
      }
    }
    
    switch(type) {
      case 'TASK_ASSIGNED': return <UserPlus size={18} className="text-blue-500" />;
      case 'TASK_COMPLETED': return <CheckCircle size={18} className="text-emerald-500" />;
      case 'TASK_OVERDUE': return <AlertCircle size={18} className="text-red-500" />;
      case 'COMMENT_ADDED': return <MessageCircle size={18} className="text-purple-500" />;
      default: return <Bell size={18} className="text-gray-400" />;
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) markAsRead(notification.id);
    if (notification.actionUrl) navigate(notification.actionUrl);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-100 pb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Notifications
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Neural activity feed & alerts
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-gray-50 border border-gray-100 rounded-xl">
            {['all', 'unread', 'read'].map((f) => (
              <button
                key={f}
                className={`px-4 py-1.5 text-[10px] font-bold rounded-lg capitalize transition-all ${
                  filter === f ? 'bg-white text-blue-600 shadow-sm border border-gray-100' : 'text-gray-500 hover:text-gray-900'
                }`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
          >
            <CheckCheck size={16} />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20">
            <Loader size={40} className="text-blue-500 animate-spin mb-4" />
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Syncing Feed...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-6 hover:bg-gray-50/50 cursor-pointer transition-all flex items-start gap-5 relative group ${
                  !notification.read ? 'bg-blue-50/20' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center border transition-all ${
                  !notification.read 
                    ? 'bg-white border-blue-200 shadow-sm' 
                    : 'bg-gray-50 border-gray-100'
                }`}>
                  {getNotificationIcon(notification.type, notification.icon)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h3 className={`text-base font-bold tracking-tight ${!notification.read ? 'text-gray-900' : 'text-gray-500'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 transition-opacity whitespace-nowrap">
                      {notification.timeAgo || 
                        (notification.createdAt && 
                          formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }))}
                    </span>
                  </div>
                  
                  <p className={`text-sm leading-relaxed mb-2 font-medium ${!notification.read ? 'text-gray-600' : 'text-gray-400'}`}>
                    {notification.message}
                  </p>
                  
                  {notification.createdAt && (
                    <div className="flex items-center gap-2">
                      <Clock size={10} className="text-gray-400" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={(e) => deleteNotification(notification.id, e)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
               <BellOff size={32} className="text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 mb-2">Neural Feed Empty</h3>
             <p className="text-gray-500 text-sm max-w-xs font-medium">
               Everything is up to date. We'll alert you when there's new activity in the system.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
