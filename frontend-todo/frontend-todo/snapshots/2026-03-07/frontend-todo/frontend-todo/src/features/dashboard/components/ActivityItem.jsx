import { PlusCircle, CheckCircle, FolderKanban, Activity, Edit2, Star } from "lucide-react";

/**
 * Single activity record for the dashboard activity list.
 */
function ActivityItem({ activity }) {
  const getIcon = () => {
    switch(activity.icon) {
      case 'plus': return <PlusCircle size={14} className="text-blue-400" />;
      case 'check': return <CheckCircle size={14} className="text-green-400" />;
      case 'folder': return <FolderKanban size={14} className="text-purple-400" />;
      case 'move': return <Activity size={14} className="text-yellow-400" />;
      case 'edit': return <Edit2 size={14} className="text-orange-400" />;
      default: return <Star size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 bg-slate-700 rounded-lg">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm text-white">
          <span className="font-medium">{activity.user}</span> {
            activity.type === 'task_created' ? 'created' : 
            activity.type === 'task_completed' ? 'completed' :
            activity.type === 'project_created' ? 'created project' :
            activity.type === 'task_updated' ? 'updated' :
            'updated'
          } <span className="font-medium">{activity.target}</span>
        </p>
        <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
      </div>
    </div>
  );
}

export default ActivityItem;
