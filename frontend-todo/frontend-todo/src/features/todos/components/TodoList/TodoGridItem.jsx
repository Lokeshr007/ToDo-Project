import React, { useState } from 'react';
import {
  Clock, Flag, Users, CheckCircle, Loader,
  Edit2, Trash2, FolderKanban, Tag, Play,
  BarChart
} from 'lucide-react';
import { formatDueDate } from '../../utils/dateHelpers';

const TodoGridItem = ({ 
  todo, onStatusChange, onEdit, onDelete, onStartTimer, 
  activeTimer, getPriorityColor, getStatusColor 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async () => {
    setIsUpdating(true);
    await onStatusChange(todo.id, todo.status);
    setIsUpdating(false);
  };

  const isActiveTimer = activeTimer && activeTimer.todo?.id === todo.id;
  const dueDateInfo = formatDueDate(todo);

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg p-4 border border-gray-700 hover:bg-gray-800 transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <button
          onClick={handleStatusChange}
          disabled={isUpdating}
          className="flex-shrink-0"
        >
          {isUpdating ? (
            <Loader size={20} className="text-purple-400 animate-spin" />
          ) : (
            <div className={`w-5 h-5 rounded border-2 ${
              todo.status === 'COMPLETED' 
                ? 'bg-green-500 border-green-500' 
                : 'border-gray-500 hover:border-purple-400'
            } flex items-center justify-center transition-colors`}>
              {todo.status === 'COMPLETED' && <CheckCircle size={14} className="text-white" />}
            </div>
          )}
        </button>

        <div className="flex gap-1">
          {todo.status !== 'COMPLETED' && (
            <button
              onClick={() => onStartTimer(todo.id)}
              className={`p-1 hover:bg-gray-700 rounded ${isActiveTimer ? 'bg-red-500/20' : ''}`}
              title="Start Timer"
            >
              <Play size={14} className={isActiveTimer ? 'text-red-400' : 'text-gray-400'} />
            </button>
          )}
          <button
            onClick={() => onEdit(todo)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Edit2 size={14} className="text-gray-400" />
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Trash2 size={14} className="text-red-400" />
          </button>
        </div>
      </div>

      <h3 className={`text-white font-medium mb-2 ${todo.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
        {todo.title}
      </h3>
      
      {todo.description && (
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{todo.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {todo.priority && (
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
            {todo.priority}
          </span>
        )}
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
          {todo.status}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        {dueDateInfo && (
          <div className={`flex items-center gap-2 ${dueDateInfo.className || 'text-gray-400'}`}>
            <Clock size={14} />
            <span className="truncate">{dueDateInfo.text}</span>
          </div>
        )}

        {todo.project?.name && (
          <div className="flex items-center gap-2 text-gray-400">
            <FolderKanban size={14} />
            <span className="truncate">{todo.project.name}</span>
          </div>
        )}

        {todo.assignedTo?.name && (
          <div className="flex items-center gap-2 text-gray-400">
            <Users size={14} />
            <span className="truncate">{todo.assignedTo.name}</span>
          </div>
        )}

        {todo.storyPoints && (
          <div className="flex items-center gap-2 text-gray-400">
            <BarChart size={14} />
            <span className="truncate">{todo.storyPoints} pts</span>
          </div>
        )}

        {todo.labels && todo.labels.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <Tag size={14} className="text-gray-400" />
            {todo.labels.slice(0, 2).map((label, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
                {label}
              </span>
            ))}
            {todo.labels.length > 2 && (
              <span className="text-xs text-gray-500">+{todo.labels.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoGridItem;