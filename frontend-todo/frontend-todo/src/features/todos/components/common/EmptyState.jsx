import React from 'react';
import { CheckCircle, Plus } from 'lucide-react';

const EmptyState = ({ onCreateClick, searchQuery, filter, extraAction }) => {
  let message = "Create your first task to get started";
  let subMessage = "Get started by creating your first task";
  
  if (searchQuery) {
    message = "No tasks match your search";
    subMessage = "Try different keywords or clear filters";
  } else if (filter === 'completed') {
    message = "No completed tasks yet";
    subMessage = "Tasks you complete will appear here";
  } else if (filter === 'pending') {
    message = "No pending tasks";
    subMessage = "All tasks are completed!";
  } else if (filter === 'overdue') {
    message = "No overdue tasks";
    subMessage = "You're all caught up!";
  } else if (filter === 'today') {
    message = "No tasks due today";
    subMessage = "Take a break or plan ahead";
  }

  return (
    <div className="text-center py-12">
      <CheckCircle size={48} className="mx-auto text-gray-500 mb-3" />
      <p className="text-gray-400 mb-2">{message}</p>
      <p className="text-sm text-gray-500 mb-6">{subMessage}</p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all font-bold"
        >
          <Plus size={18} />
          Manual Task
        </button>
        {extraAction}
      </div>
    </div>
  );
};

export default EmptyState;
