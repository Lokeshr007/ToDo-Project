// frontend/src/components/board/BoardTaskCard.jsx
import { Calendar, Flag, User, MoreVertical } from "lucide-react";
import { useState } from "react";

function BoardTaskCard({ task }) {
  const [showMenu, setShowMenu] = useState(false);

  const priorityColors = {
    HIGH: "text-red-600 bg-red-50 border-red-200",
    MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-200",
    LOW: "text-green-600 bg-green-50 border-green-200"
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.overdue;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 hover:shadow-md transition-all group">
      
      {/* Header with priority */}
      <div className="flex items-start justify-between mb-2">
        <div className={`text-xs px-2 py-1 rounded-full border ${priorityColors[task.priority]}`}>
          <Flag size={10} className="inline mr-1" />
          {task.priority}
        </div>
        
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 rounded"
        >
          <MoreVertical size={14} className="text-slate-400" />
        </button>
      </div>

      {/* Title */}
      <h4 className="font-medium text-slate-900 text-sm mb-1">
        {task.title}
      </h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-slate-500 mb-2 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer metadata */}
      <div className="flex items-center gap-2 text-xs mt-2">
        
        {/* Due Date */}
        {task.dueDate && (
          <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            isOverdue ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
          }`}>
            <Calendar size={10} />
            {formatDate(task.dueDate)}
          </span>
        )}

        {/* Assignee */}
        {task.assignedTo && (
          <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
            <User size={10} />
            {task.assignedTo.split(' ')[0] || task.assignedToEmail?.split('@')[0]}
          </span>
        )}

        {/* Project Tag */}
        {task.projectName && (
          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
            {task.projectName}
          </span>
        )}
      </div>

      {/* Menu Dropdown */}
      {showMenu && (
        <div className="absolute mt-1 right-0 w-40 bg-white rounded-lg shadow-lg border py-1 z-10">
          <button className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50">
            Edit
          </button>
          <button className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50">
            Assign
          </button>
          <button className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50">
            Set Due Date
          </button>
          <button className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default BoardTaskCard;