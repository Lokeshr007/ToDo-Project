import React from 'react';
import { Loader } from 'lucide-react';
import { formatRelativeTime, formatDateTime } from '../../utils/dateHelpers';

const CommentsList = ({ comments, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader size={20} className="text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-2">No comments yet</p>;
  }

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {comments.map(comment => (
        <div key={comment.id || Math.random()} className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-white">
              {comment.author?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-300">{comment.content || ''}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentsList;
