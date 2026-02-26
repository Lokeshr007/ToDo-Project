import React, { useState } from 'react';
import {
  Clock, Flag, Users, CheckCircle, Loader,
  Edit2, Trash2, FolderKanban, Tag, BarChart,
  ChevronDown, ChevronRight, Play, StopCircle,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import CommentsList from '../TodoComments/CommentsList';
import CommentInput from '../TodoComments/CommentInput';
import { formatDueDate } from '../../utils/dateHelpers';
import toast from 'react-hot-toast';

const TodoListItem = ({ 
  todo, expanded, onToggleExpand, onStatusChange, onEdit, onDelete,
  onStartTimer, onStopTimer, activeTimer, comments, loadingComments,
  commentText, onCommentTextChange, onAddComment,
  getPriorityColor, getStatusColor 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async () => {
    setIsUpdating(true);
    try {
      await onStatusChange(todo.id, todo.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show custom toast confirmation
    toast.custom((t) => (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl z-50">
        <p className="text-white mb-3">Delete task "{todo.title || todo.item}"?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-sm text-gray-400 hover:bg-gray-700 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setIsDeleting(true);
              try {
                await onDelete(todo.id);
              } finally {
                setIsDeleting(false);
              }
            }}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center gap-1"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader size={14} className="animate-spin" /> : null}
            Delete
          </button>
        </div>
      </div>
    ), { 
      duration: 10000,
      position: 'top-center',
    });
  };

  const isActiveTimer = activeTimer && activeTimer.todo?.id === todo.id;
  const dueDateInfo = formatDueDate(todo);

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors">
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-3 flex-1">
            <button
              onClick={handleStatusChange}
              disabled={isUpdating}
              className="mt-1 flex-shrink-0 group focus:outline-none"
              type="button"
            >
              {isUpdating ? (
                <Loader size={20} className="text-purple-400 animate-spin" />
              ) : (
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  todo.status === 'COMPLETED' 
                    ? 'bg-green-500 border-green-500 hover:bg-green-600' 
                    : 'border-gray-500 hover:border-purple-400 group-hover:scale-110'
                }`}>
                  {todo.status === 'COMPLETED' && <CheckCircle size={14} className="text-white" />}
                </div>
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h3 className={`text-white font-medium ${todo.status === 'COMPLETED' ? 'line-through text-gray-400' : ''}`}>
                  {todo.title || todo.item}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {todo.priority && (
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(todo.priority)}`}>
                      <Flag size={12} className="inline mr-1" />
                      {todo.priority}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
                    {todo.status}
                  </span>
                </div>
              </div>
              
              {todo.description && (
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{todo.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {dueDateInfo && (
                  <span className={`flex items-center gap-1 ${dueDateInfo.className || 'text-gray-400'}`}>
                    <Clock size={14} />
                    {dueDateInfo.text}
                  </span>
                )}

                {todo.project?.name && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <FolderKanban size={14} />
                    {todo.project.name}
                  </span>
                )}

                {todo.assignedTo?.name && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Users size={14} />
                    {todo.assignedTo.name}
                  </span>
                )}

                {todo.storyPoints && (
                  <span className="flex items-center gap-1 text-gray-400">
                    <BarChart size={14} />
                    {todo.storyPoints} pts
                  </span>
                )}

                {todo.labels && todo.labels.length > 0 && (
                  <div className="flex items-center gap-1">
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
          </div>

          <div className="flex items-center gap-2">
            {/* Timer Button */}
            {todo.status !== 'COMPLETED' && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  isActiveTimer ? onStopTimer() : onStartTimer(todo.id);
                }}
                className={`p-2 rounded-lg transition-colors focus:outline-none ${
                  isActiveTimer 
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                    : 'hover:bg-gray-700 text-gray-400'
                }`}
                title={isActiveTimer ? "Stop Timer" : "Start Timer"}
                type="button"
              >
                {isActiveTimer ? <StopCircle size={16} /> : <Play size={16} />}
              </button>
            )}

            {/* Expand/Collapse Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-2 hover:bg-gray-700 rounded-lg focus:outline-none"
              title={expanded ? "Hide Details" : "Show Details"}
              type="button"
            >
              {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
            </button>

            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(todo);
              }}
              className="p-2 hover:bg-gray-700 rounded-lg focus:outline-none"
              title="Edit"
              type="button"
            >
              <Edit2 size={16} className="text-gray-400" />
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-gray-700 rounded-lg focus:outline-none group"
              title="Delete"
              type="button"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader size={16} className="text-red-400 animate-spin" />
              ) : (
                <Trash2 size={16} className="text-gray-400 group-hover:text-red-400 transition-colors" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-gray-700 p-4 bg-gray-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column - Details */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <MessageSquare size={16} />
                Details
              </h4>
              
              {todo.description && (
                <div>
                  <p className="text-sm text-gray-400">{todo.description}</p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-300">
                    {todo.createdAt ? format(new Date(todo.createdAt), 'MMM d, yyyy h:mm a') : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Created by:</span>
                  <span className="text-gray-300">{todo.createdBy?.name || 'Unknown'}</span>
                </div>
                {todo.updatedAt && todo.updatedAt !== todo.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last updated:</span>
                    <span className="text-gray-300">
                      {format(new Date(todo.updatedAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                {todo.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed:</span>
                    <span className="text-gray-300">
                      {format(new Date(todo.completedAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                )}
                {todo.actualHours > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time spent:</span>
                    <span className="text-gray-300">{todo.actualHours} hours</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Comments */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <MessageSquare size={16} />
                Comments ({comments?.length || 0})
              </h4>

              <CommentsList comments={comments || []} loading={loadingComments} />

              <CommentInput
                value={commentText || ''}
                onChange={(text) => onCommentTextChange(text)}
                onSend={() => onAddComment(todo.id)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoListItem;