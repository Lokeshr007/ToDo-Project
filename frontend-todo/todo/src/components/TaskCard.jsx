// src/components/TaskCard.jsx
import { Calendar, Flag, User, MoreVertical } from "lucide-react";
import { useState } from "react";
import API from "../services/api";

function TaskCard({ task, onUpdate, onDelete }) {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [showMenu, setShowMenu] = useState(false);

  const priorityColors = {
    HIGH: "text-red-600 bg-red-50",
    MEDIUM: "text-yellow-600 bg-yellow-50",
    LOW: "text-green-600 bg-green-50"
  };

  const handleToggle = async () => {
    try {
      const response = await API.put(`/todo/status/${task.id}`);
      setIsCompleted(response.data.completed);
      onUpdate?.(response.data);
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this task?")) {
      try {
        await API.delete(`/todo/${task.id}`);
        onDelete?.(task.id);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all">
      
      <div className="flex items-start gap-3">
        
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${
            isCompleted 
              ? 'bg-blue-500 border-blue-500' 
              : 'border-slate-300 hover:border-blue-400'
          }`}
        >
          {isCompleted && (
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1">
          
          {/* Title and Menu */}
          <div className="flex items-start justify-between">
            <h3 className={`font-medium ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
              {task.title}
            </h3>
            
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <MoreVertical size={16} className="text-slate-400" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border py-1 z-10">
                  <button 
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <p className="text-sm text-slate-500 mt-1">{task.description}</p>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-3 mt-3 text-xs">
            
            {/* Priority */}
            {task.priority && (
              <span className={`px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                <Flag size={12} className="inline mr-1" />
                {task.priority}
              </span>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-slate-500">
                <Calendar size={12} />
                {formatDate(task.dueDate)}
              </span>
            )}

            {/* Project */}
            {task.project && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                {task.project.name}
              </span>
            )}

            {/* Assigned User */}
            {task.assignedUser && (
              <span className="flex items-center gap-1 text-slate-500">
                <User size={12} />
                {task.assignedUser.email?.split('@')[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;