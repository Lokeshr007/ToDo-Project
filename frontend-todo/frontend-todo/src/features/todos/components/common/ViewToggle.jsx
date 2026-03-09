import React from 'react';
import { ListTodo, Grid } from 'lucide-react';

const ViewToggle = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-700">
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 transition-all ${
          viewMode === 'list' 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
        title="List View"
      >
        <ListTodo size={18} />
      </button>
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 transition-all ${
          viewMode === 'grid' 
            ? 'bg-purple-600 text-white' 
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
        title="Grid View"
      >
        <Grid size={18} />
      </button>
    </div>
  );
};

export default ViewToggle;
