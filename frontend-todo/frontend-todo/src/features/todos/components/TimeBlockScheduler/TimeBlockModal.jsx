import React from 'react';
import { X, Save } from 'lucide-react';

const TimeBlockModal = ({ 
  show, 
  onClose, 
  editingBlock, 
  formData, 
  setFormData, 
  onSave, 
  categories, 
  todos 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">
            {editingBlock ? 'Refine Time Block' : 'Initialize Focus Session'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto px-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Session Title *</label>
            <input
              type="text"
              placeholder="e.g., Deep Focus Architecture"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Details</label>
            <textarea
              placeholder="What specific tasks are planned?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="2"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Commence</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Conclude</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Category Optimization</label>
            <div className="grid grid-cols-3 gap-2.5">
              {categories.map(cat => {
                const Icon = cat.icon;
                const isActive = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ 
                      ...formData, 
                      category: cat.id,
                      color: cat.color 
                    })}
                    className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-950/20 translate-y-[-2px]'
                        : 'border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
                    }`}
                  >
                    <Icon size={18} style={{ color: cat.color }} className={isActive ? 'animate-pulse' : ''} />
                    <span className={`text-[10px] mt-1.5 font-bold uppercase tracking-tighter ${isActive ? 'text-white' : 'text-slate-500'}`}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Attach to Task</label>
            <select
              value={formData.todoId}
              onChange={(e) => setFormData({ ...formData, todoId: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium cursor-pointer"
            >
              <option value="">Detached session</option>
              {todos.map(todo => (
                <option key={todo.id} value={todo.id}>{todo.title || todo.item}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-700/50">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.recurring}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-slate-900 transition-all cursor-pointer"
            />
            <label htmlFor="recurring" className="text-sm font-bold text-slate-300 cursor-pointer">
              Recurring schedule
            </label>
            
            {formData.recurring && (
              <select
                value={formData.recurringType}
                onChange={(e) => setFormData({ ...formData, recurringType: e.target.value })}
                className="ml-auto px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-purple-500 uppercase cursor-pointer"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekly">Weekly</option>
              </select>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
          >
            Abort
          </button>
          <button
            onClick={onSave}
            disabled={!formData.title.trim()}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Save size={18} />
            {editingBlock ? 'Commit' : 'Initialize'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeBlockModal;
