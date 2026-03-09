import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const AdvancedFilters = ({ 
  projects,
  users,
  filters,
  setters,
  onClose
}) => {
  return (
    <div className="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Project</label>
          <select
            value={filters.selectedProject}
            onChange={(e) => setters.setSelectedProject(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Priority</label>
          <select
            value={filters.selectedPriority}
            onChange={(e) => setters.setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Status</label>
          <select
            value={filters.selectedStatus}
            onChange={(e) => setters.setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="BLOCKED">Blocked</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Assignee</label>
          <select
            value={filters.selectedAssignee}
            onChange={(e) => setters.setSelectedAssignee(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Assignees</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showCompleted"
            checked={filters.showCompleted}
            onChange={(e) => setters.setShowCompleted(e.target.checked)}
            className="rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
          />
          <label htmlFor="showCompleted" className="text-sm text-gray-300">
            Show completed tasks
          </label>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => setters.setSortBy(e.target.value)}
            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
            <option value="created">Created</option>
            <option value="title">Title</option>
          </select>
          <button
            onClick={() => setters.setSortOrder(filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 hover:bg-gray-700 rounded"
          >
            {filters.sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;
