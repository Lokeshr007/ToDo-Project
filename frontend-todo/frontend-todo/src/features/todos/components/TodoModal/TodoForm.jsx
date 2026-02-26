import React from 'react';
import { Save, X } from 'lucide-react';
import LabelsInput from './LabelsInput';
import { getTodayDate } from '../../utils/dateHelpers';

const TodoForm = ({ 
  formData, 
  setFormData, 
  formErrors, 
  projects, 
  users, 
  onClose, 
  onSubmit, 
  submitLabel 
}) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddLabel = (label) => {
    handleChange('labels', [...(formData.labels || []), label]);
  };

  const handleRemoveLabel = (index) => {
    const newLabels = formData.labels.filter((_, i) => i !== index);
    handleChange('labels', newLabels);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            {submitLabel === 'Create' ? 'Create New Task' : 'Edit Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title - Note: Backend expects 'item' not 'title' */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.item}
              onChange={(e) => handleChange('item', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                formErrors.item ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Enter task title"
              autoFocus
            />
            {formErrors.item && (
              <p className="text-xs text-red-400 mt-1">{formErrors.item}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows="3"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Project</label>
              <select
                value={formData.projectId}
                onChange={(e) => handleChange('projectId', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">No Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>

            {/* Assignee - Note: Backend expects 'assignedToId' */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Assignee</label>
              <select
                value={formData.assignedToId}
                onChange={(e) => handleChange('assignedToId', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name || user.email}</option>
                ))}
              </select>
            </div>

            {/* Story Points */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Story Points</label>
              <input
                type="number"
                min="0"
                value={formData.storyPoints}
                onChange={(e) => handleChange('storyPoints', e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Due Date & Time</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  min={getTodayDate()}
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.dueDate ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {formErrors.dueDate && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.dueDate}</p>
                )}
              </div>
              <div>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => handleChange('dueTime', e.target.value)}
                  className={`w-full px-4 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    formErrors.dueTime ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {formErrors.dueTime && (
                  <p className="text-xs text-red-400 mt-1">{formErrors.dueTime}</p>
                )}
              </div>
            </div>
          </div>

          {/* Labels */}
          <LabelsInput
            labels={formData.labels}
            onAddLabel={handleAddLabel}
            onRemoveLabel={handleRemoveLabel}
          />

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!formData.item?.trim()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={16} />
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoForm;