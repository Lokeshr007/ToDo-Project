// frontend/src/features/profile/components/tabs/ActivityTab.jsx
import { 
  Activity, 
  Edit2, 
  Camera, 
  Key, 
  LogOut, 
  Lock 
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

function ActivityTab({ activities }) {
  const getActivityIcon = (type) => {
    switch(type) {
      case 'PROFILE_UPDATE': return <Edit2 size={14} className="text-blue-400" />;
      case 'AVATAR_UPLOAD': 
      case 'COVER_UPLOAD': return <Camera size={14} className="text-green-400" />;
      case 'PASSWORD_CHANGE': return <Key size={14} className="text-yellow-400" />;
      case 'SESSION_REVOKE': 
      case 'ALL_SESSIONS_REVOKE': return <LogOut size={14} className="text-red-400" />;
      case '2FA_ENABLE': 
      case '2FA_VERIFY': 
      case '2FA_DISABLE': return <Lock size={14} className="text-purple-400" />;
      default: return <Activity size={14} className="text-gray-400" />;
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'PROFILE_UPDATE': return 'bg-blue-100';
      case 'AVATAR_UPLOAD': 
      case 'COVER_UPLOAD': return 'bg-green-100';
      case 'PASSWORD_CHANGE': return 'bg-yellow-100';
      case 'SESSION_REVOKE': 
      case 'ALL_SESSIONS_REVOKE': return 'bg-red-100';
      case '2FA_ENABLE': 
      case '2FA_VERIFY': 
      case '2FA_DISABLE': return 'bg-purple-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map(activity => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 ${getActivityColor(activity.type)} rounded-lg`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No recent activity</p>
        )}
      </div>
    </div>
  );
}

export default ActivityTab;