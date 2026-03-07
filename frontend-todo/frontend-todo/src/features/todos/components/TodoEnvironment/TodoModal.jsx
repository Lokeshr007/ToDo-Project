import React from 'react';
import { X, Save, Clock, Flag, Hash } from 'lucide-react';

const TodoModal = ({ 
  show, 
  onClose, 
  editingTask, 
  formData, 
  setFormData, 
  projects, 
  onSave 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
      <div className="bg-slate-900 border border-slate-700/50 rounded-[2.5rem] p-8 w-full max-w-xl shadow-[0_0_100px_rgba(37,99,235,0.1)] relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                {editingTask ? 'Edit Directive' : 'New Operational Goal'}
              </h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Operational Parameters Configuration</p>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-700/50"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Objective Title</label>
               <input
                 type="text"
                 placeholder="Define objective..."
                 value={formData.item}
                 onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                 className="w-full px-6 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                 autoFocus
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Context / Decription</label>
               <textarea
                 placeholder="Detailed operational parameters..."
                 value={formData.description}
                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                 rows="3"
                 className="w-full px-6 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none font-medium text-sm"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Priority Vector</label>
                 <select
                   value={formData.priority}
                   onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                   className="w-full px-5 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                 >
                   <option value="HIGH">Level 1: Fatal</option>
                   <option value="MEDIUM">Level 2: Urgent</option>
                   <option value="NORMAL">Level 3: Operational</option>
                   <option value="LOW">Level 4: Routine</option>
                 </select>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Node</label>
                 <select
                   value={formData.projectId}
                   onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                   className="w-full px-5 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer"
                 >
                   <option value="">Detached Node</option>
                   {projects.map(project => (
                     <option key={project.id} value={project.id}>{project.name}</option>
                   ))}
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Temporal Deadline</label>
                <div className="relative">
                   <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                   <input
                     type="date"
                     value={formData.dueDate}
                     onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                     className="w-full pl-12 pr-6 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-bold"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Precision Time</label>
                <input
                  type="time"
                  value={formData.dueTime}
                  onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                   className="w-full px-6 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50">
              <input
                type="checkbox"
                id="reminder"
                checked={formData.reminder}
                onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                className="w-4 h-4 rounded-lg bg-slate-800 border-slate-700 text-blue-600 focus:ring-blue-500/50"
              />
              <label htmlFor="reminder" className="text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">
                Initialize Reminder Protocol
              </label>
              
              {formData.reminder && (
                <select
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  className="ml-auto px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-black uppercase text-blue-400 focus:outline-none"
                >
                  <option value="5">T-5 mins</option>
                  <option value="15">T-15 mins</option>
                  <option value="30">T-30 mins</option>
                  <option value="60">T-1 hour</option>
                </select>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-10">
              <button
                onClick={onClose}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl transition-all"
              >
                Abort
              </button>
              <button
                onClick={onSave}
                disabled={!formData.item.trim()}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all"
              >
                <Save size={18} />
                {editingTask ? 'Commit Changes' : 'Execute Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoModal;
