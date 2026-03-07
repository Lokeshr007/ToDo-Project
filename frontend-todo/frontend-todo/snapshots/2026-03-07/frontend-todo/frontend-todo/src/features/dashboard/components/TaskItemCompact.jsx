import { useState } from "react";
import { Loader, Clock, FolderKanban, Users, Flag, CheckCircle, PlayCircle, PauseCircle, AlertCircle } from "lucide-react";
import { format } from 'date-fns';

/**
 * Compact task item for the dashboard.
 */
function TaskItemCompact({ task, onStatusChange, getPriorityBadge, getStatusIcon, showDate }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    setIsUpdating(true);
    await onStatusChange(task.id, task.status);
    setIsUpdating(false);
  };

  // Internal helper if getStatusIcon is not provided
  const renderStatusIcon = (status) => {
    if (getStatusIcon) return getStatusIcon(status);
    
    switch(status) {
      case 'COMPLETED': return <CheckCircle size={16} className="text-green-400" />;
      case 'IN_PROGRESS': return <PlayCircle size={16} className="text-blue-400" />;
      case 'PENDING': return <PauseCircle size={16} className="text-yellow-400" />;
      case 'BLOCKED': return <AlertCircle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
      <button
        onClick={handleStatusChange}
        disabled={isUpdating}
        className="mt-0.5 flex-shrink-0"
      >
        {isUpdating ? (
          <Loader size={18} className="text-purple-400 animate-spin" />
        ) : (
          renderStatusIcon(task.status)
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className={`text-sm text-white truncate ${
            task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
          }`}>
            {task.title}
          </span>
          {task.priority && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 w-fit ${getPriorityBadge(task.priority)}`}>
              <Flag size={10} />
              {task.priority}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
          {showDate && task.dueDate && (
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {format(new Date(task.dueDate), 'MMM d, h:mm a')}
            </span>
          )}
          {task.project?.name && (
            <span className="flex items-center gap-1">
              <FolderKanban size={10} />
              {task.project.name}
            </span>
          )}
          {task.assignedTo?.name && (
            <span className="flex items-center gap-1">
              <Users size={10} />
              {task.assignedTo.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskItemCompact;
