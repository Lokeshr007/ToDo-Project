import React from 'react';
import { X, Save } from 'lucide-react';

const GoalModal = ({ 
  show, 
  onClose, 
  editingGoal, 
  formData, 
  setFormData, 
  onSave, 
  todos 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Goal Title *</label>
            <input
              type="text"
              placeholder="e.g., Read 10 books"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea
              placeholder="What do you want to achieve?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="2"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Goal Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Target</label>
              <input
                type="number"
                min="1"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="e.g., 5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Unit</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="e.g., tasks, hours, pages"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Link to Tasks (Optional)</label>
            <select
              multiple
              value={formData.linkedTasks}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, linkedTasks: selected });
              }}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white h-24 focus:outline-none focus:ring-2 focus:ring-purple-500 scrollbar-thin scrollbar-thumb-slate-700"
            >
              {todos.map(todo => (
                <option key={todo.id} value={todo.id} className="py-1 px-2 hover:bg-purple-600/20">{todo.title || todo.item}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1 ml-1 font-medium italic">Hold Ctrl/Cmd to select multiple</p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
            <input
              type="checkbox"
              id="reminder"
              checked={formData.reminder}
              onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900 transition-all cursor-pointer"
            />
            <label htmlFor="reminder" className="text-sm font-medium text-slate-300 cursor-pointer">
              Set daily reminder
            </label>
            
            {formData.reminder && (
              <input
                type="time"
                value={formData.reminderTime}
                onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                className="ml-auto px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all font-bold"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Theme Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-12 h-10 bg-transparent border-0 rounded-xl cursor-pointer"
              />
              <div className="text-xs text-slate-500 font-mono uppercase">{formData.color}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!formData.title.trim() || !formData.target}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all"
          >
            <Save size={18} />
            {editingGoal ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
