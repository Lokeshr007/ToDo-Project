import React from 'react';
import { Mail, Smartphone, MessageSquare } from 'lucide-react';

const ReminderPreferences = ({ preferences, setPreferences, onSave, onCancel }) => {
  return (
    <div className="p-6 bg-slate-700/30 border-b border-slate-700 animate-in slide-in-from-top duration-300">
      <h3 className="text-white font-medium mb-4">Reminder Preferences</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={preferences.emailEnabled}
              onChange={(e) => setPreferences({ ...preferences, emailEnabled: e.target.checked })}
              className="rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
            />
            <Mail size={16} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Email</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={preferences.pushEnabled}
              onChange={(e) => setPreferences({ ...preferences, pushEnabled: e.target.checked })}
              className="rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
            />
            <Smartphone size={16} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Push</span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={preferences.smsEnabled}
              onChange={(e) => setPreferences({ ...preferences, smsEnabled: e.target.checked })}
              className="rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
            />
            <MessageSquare size={16} className="text-slate-400 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">SMS</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Quiet Hours Start</label>
            <input
              type="time"
              value={preferences.quietHoursStart}
              onChange={(e) => setPreferences({ ...preferences, quietHoursStart: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Quiet Hours End</label>
            <input
              type="time"
              value={preferences.quietHoursEnd}
              onChange={(e) => setPreferences({ ...preferences, quietHoursEnd: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Default Lead Time (minutes)</label>
          <input
            type="number"
            value={preferences.defaultLeadTime}
            onChange={(e) => setPreferences({ ...preferences, defaultLeadTime: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            min="5"
            max="120"
          />
        </div>

        <div className="flex flex-col gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.weekdayOnly}
              onChange={(e) => setPreferences({ ...preferences, weekdayOnly: e.target.checked })}
              className="rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
            />
            <span className="text-sm text-slate-300">Weekdays only (don't alert on weekends)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.intelligentReminders}
              onChange={(e) => setPreferences({ ...preferences, intelligentReminders: e.target.checked })}
              className="rounded border-slate-600 text-purple-600 focus:ring-purple-500 bg-slate-800"
            />
            <span className="text-sm text-slate-300">Intelligent reminders (automatic follow-ups)</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-900/20 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderPreferences;
