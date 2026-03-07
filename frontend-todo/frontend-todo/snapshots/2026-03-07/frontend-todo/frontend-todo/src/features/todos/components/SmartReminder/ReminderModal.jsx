import React from 'react';
import { X, Save, Smartphone, Mail, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const ReminderModal = ({ 
  show, 
  onClose, 
  editingReminder, 
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
            {editingReminder ? 'Edit Reminder' : 'Schedule New Reminder'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Title *</label>
            <input
              type="text"
              placeholder="What should we remind you about?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Description</label>
            <textarea
              placeholder="Add some details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="2"
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Reminder Type</label>
            <select
              value={formData.reminderType}
              onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="before">Before task due</option>
              <option value="after">After task due</option>
              <option value="specific">Specific date/time</option>
            </select>
          </div>

          {formData.reminderType !== 'specific' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Link to Task</label>
              <select
                value={formData.todoId}
                onChange={(e) => setFormData({ ...formData, todoId: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="">Select a task</option>
                {todos.map(todo => (
                  <option key={todo.id} value={todo.id}>
                    {todo.title || todo.item} {todo.dueDate ? `(Due: ${format(new Date(todo.dueDate), 'MMM d')})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.reminderType === 'before' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Remind me before</label>
              <select
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: parseInt(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="1440">1 day</option>
              </select>
            </div>
          )}

          {formData.reminderType === 'specific' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Date</label>
                <input
                  type="date"
                  value={formData.specificDate}
                  onChange={(e) => setFormData({ ...formData, specificDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5 pl-1">Time</label>
                <input
                  type="time"
                  value={formData.specificTime}
                  onChange={(e) => setFormData({ ...formData, specificTime: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 pl-1">Notification Channels</label>
            <div className="flex gap-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.channels.includes('push')}
                  onChange={(e) => {
                    const channels = e.target.checked
                      ? [...formData.channels, 'push']
                      : formData.channels.filter(c => c !== 'push');
                    setFormData({ ...formData, channels });
                  }}
                  className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"
                />
                <Smartphone size={16} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-wider">Push</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.channels.includes('email')}
                  onChange={(e) => {
                    const channels = e.target.checked
                      ? [...formData.channels, 'email']
                      : formData.channels.filter(c => c !== 'email');
                    setFormData({ ...formData, channels });
                  }}
                  className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"
                />
                <Mail size={16} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-wider">Email</span>
              </label>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-900/30 rounded-xl border border-dotted border-slate-700 hover:bg-slate-900/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.smartDelay}
                onChange={(e) => setFormData({ ...formData, smartDelay: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">Smart Delay</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Adjust automatically if you're busy</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-900/30 rounded-xl border border-dotted border-slate-700 hover:bg-slate-900/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.followUp}
                onChange={(e) => setFormData({ ...formData, followUp: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">Auto Follow-up</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nag me if task is not completed</p>
              </div>
            </label>
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
            disabled={!formData.title.trim()}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Save size={18} />
            {editingReminder ? 'Update' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderModal;
