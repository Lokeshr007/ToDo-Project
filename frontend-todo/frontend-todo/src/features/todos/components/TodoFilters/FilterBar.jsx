import React from 'react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';

const FilterBar = ({ 
  searchQuery, 
  onSearchChange, 
  filter, 
  onFilterChange,
  onToggleFilters,
  showFilters,
  onExport,
  onRefresh
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="today">Due Today</option>
          <option value="tomorrow">Due Tomorrow</option>
          <option value="week">This Week</option>
          <option value="overdue">Overdue</option>
          <option value="assigned">Assigned to me</option>
          <option value="created">Created by me</option>
        </select>

        <button
          onClick={onToggleFilters}
          className={`px-3 py-2 rounded-lg border transition-colors ${
            showFilters 
              ? 'bg-purple-600 border-purple-500 text-white' 
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Filter size={18} />
        </button>

        <button
          onClick={onExport}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
          title="Export Tasks"
        >
          <Download size={18} />
        </button>

        <button
          onClick={onRefresh}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:bg-gray-700 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
