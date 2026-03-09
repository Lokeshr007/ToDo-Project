import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellRing, BellOff, Plus, Bell as BellIcon, BellRing as BellRingIcon } from 'lucide-react';
import { format, addMinutes, isBefore, differenceInMinutes } from 'date-fns';
import { reminderApi } from '../../api/reminderApi';
import { todoApi } from '@/services/api/todoApi';
import { taskToast } from '@/shared/components/QuantumToaster';

import ReminderPreferences from './ReminderPreferences';
import ReminderItem from './ReminderItem';
import ReminderModal from './ReminderModal';

const SmartReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [todos, setTodos] = useState([]);
  const [preferences, setPreferences] = useState({
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    defaultLeadTime: 15,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    weekdayOnly: false,
    intelligentReminders: true,
    reminderFrequency: 'once',
    maxReminders: 3
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [pendingReminders, setPendingReminders] = useState([]);
  const [activeReminder, setActiveReminder] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    todoId: '',
    reminderType: 'before',
    leadTime: 15,
    specificTime: format(new Date(), 'HH:mm'),
    specificDate: format(new Date(), 'yyyy-MM-dd'),
    recurring: false,
    recurringPattern: 'daily',
    priority: 'medium',
    channels: ['push'],
    smartDelay: false,
    followUp: false
  });

  const fetchReminders = useCallback(async () => {
    try {
      const data = await reminderApi.getPendingReminders();
      setReminders(data || []);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    }
  }, []);

  const fetchTodos = useCallback(async () => {
    try {
      const data = await todoApi.getTodos();
      setTodos(data || []);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const data = await reminderApi.getReminderPreferences();
      if (data) setPreferences(data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  }, []);

  const handleReminderAction = async (id, action, value = null) => {
    try {
      switch(action) {
        case 'complete':
          await reminderApi.completeReminder(id);
          setReminders(prev => prev.map(r => 
            r.id === id ? { ...r, completed: true } : r
          ));
          taskToast.success('Reminder completed');
          break;

        case 'snooze':
          await reminderApi.snoozeReminder(id, value);
          const snoozedTime = addMinutes(new Date(), value);
          setReminders(prev => prev.map(r => 
            r.id === id ? { ...r, scheduledFor: snoozedTime.toISOString(), snoozed: true } : r
          ));
          taskToast.success(`Reminder snoozed for ${value} minutes`);
          break;
      }
      setActiveReminder(null);
      taskToast.dismiss();
    } catch (error) {
      console.error('Failed to handle reminder:', error);
      taskToast.error('Failed to process reminder');
    }
  };

  const showReminder = useCallback((reminder) => {
    setActiveReminder(reminder);
    if (preferences.pushEnabled) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    }
    if (Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.description || 'Your reminder is due',
        icon: '/icon.png',
        tag: reminder.id.toString()
      });
    }

    taskToast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-800 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-purple-500/50 p-4`}>
        <div className="flex-1 w-0 pt-0.5">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <BellRingIcon className="h-10 w-10 text-purple-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-base font-bold text-white uppercase tracking-tight">
                {reminder.title}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {reminder.description || 'Time to get things done!'}
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    handleReminderAction(reminder.id, 'complete');
                    taskToast.dismiss(t.id);
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors border border-purple-400/30"
                >
                  Complete
                </button>
                <button
                  onClick={() => {
                    handleReminderAction(reminder.id, 'snooze', 15);
                    taskToast.dismiss(t.id);
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
                >
                  Snooze 15m
                </button>
                <button
                  onClick={() => taskToast.dismiss(t.id)}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 30000 });
  }, [preferences.pushEnabled]);

  const checkPendingReminders = useCallback(() => {
    const now = new Date();
    const dueReminders = reminders.filter(reminder => {
      if (reminder.completed || reminder.triggered) return false;
      const reminderTime = new Date(reminder.scheduledFor);
      return isBefore(reminderTime, now);
    });

    dueReminders.forEach(reminder => {
      showReminder(reminder);
      setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, triggered: true } : r));
    });

    const upcomingReminders = reminders.filter(reminder => {
      if (reminder.completed || reminder.triggered) return false;
      const reminderTime = new Date(reminder.scheduledFor);
      const minutesUntil = differenceInMinutes(reminderTime, now);
      return minutesUntil > 0 && minutesUntil <= 5;
    });

    if (upcomingReminders.length > 0) {
      setPendingReminders(upcomingReminders);
    }
  }, [reminders, showReminder]);

  useEffect(() => {
    fetchReminders();
    fetchTodos();
    loadPreferences();
  }, [fetchReminders, fetchTodos, loadPreferences]);

  useEffect(() => {
    const interval = setInterval(checkPendingReminders, 60000);
    return () => clearInterval(interval);
  }, [checkPendingReminders]);

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      taskToast.error('Please enter a reminder title');
      return;
    }

    try {
      let scheduledFor;
      if (formData.reminderType === 'before' && formData.todoId) {
        const todo = todos.find(t => String(t.id) === String(formData.todoId));
        if (!todo || !todo.dueDate) {
          taskToast.error('Selected task has no due date');
          return;
        }
        scheduledFor = addMinutes(new Date(todo.dueDate), -formData.leadTime);
      } else if (formData.reminderType === 'specific') {
        scheduledFor = new Date(`${formData.specificDate}T${formData.specificTime}`);
      }

      if (scheduledFor && isBefore(scheduledFor, new Date())) {
        taskToast.error('Reminder time must be in the future');
        return;
      }

      const reminderData = {
        ...formData,
        scheduledFor: scheduledFor?.toISOString(),
        todoId: formData.todoId || null,
        createdAt: new Date().toISOString()
      };

      const response = await reminderApi.scheduleReminder(reminderData);
      setReminders(prev => [...prev, response]);
      setShowCreateModal(false);
      resetForm();
      taskToast.success('Reminder scheduled successfully');
    } catch (error) {
      console.error('Failed to create reminder:', error);
      taskToast.error('Failed to create reminder');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      todoId: '',
      reminderType: 'before',
      leadTime: 15,
      specificTime: format(new Date(), 'HH:mm'),
      specificDate: format(new Date(), 'yyyy-MM-dd'),
      recurring: false,
      recurringPattern: 'daily',
      priority: 'medium',
      channels: ['push'],
      smartDelay: false,
      followUp: false
    });
  };

  const handlePreferencesSave = async () => {
    try {
      await reminderApi.setReminderPreferences(preferences);
      setShowPreferences(false);
      taskToast.success('Preferences saved');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      taskToast.error('Failed to save preferences');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;
    try {
      await reminderApi.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      taskToast.success('Reminder deleted');
    } catch (error) {
      console.error('Failed to delete reminder:', error);
    }
  };

  return (
    <div className="bg-slate-800/40 backdrop-blur-2xl rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-8 border-b border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30">
              <BellIcon className="text-purple-400" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Smart Reminders</h2>
              <p className="text-sm text-slate-400 font-medium">Never miss a deadline again</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                showPreferences 
                  ? 'bg-slate-700 text-white border-slate-600 shadow-inner' 
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => {
                setEditingReminder(null);
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-purple-900/40 transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              New Reminder
            </button>
          </div>
        </div>

        {pendingReminders.length > 0 && (
          <div className="mt-6 p-4 bg-purple-900/20 border border-purple-700/50 rounded-2xl flex items-center gap-4 animate-pulse">
            <div className="p-2 bg-purple-600/30 rounded-xl">
              <BellRingIcon className="text-purple-400" size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-purple-300">Approaching Reminders</p>
              <p className="text-xs text-purple-400/80 font-medium">{pendingReminders.length} alert{pendingReminders.length > 1 ? 's' : ''} in the next 5 minutes</p>
            </div>
          </div>
        )}
      </div>

      <ReminderPreferences 
        preferences={preferences} 
        setPreferences={setPreferences}
        onSave={handlePreferencesSave}
        onCancel={() => setShowPreferences(false)}
        show={showPreferences}
      />

      {/* Reminders List */}
      <div className="p-8">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 pl-1">Scheduled Timeline</h3>
        <div className="space-y-4">
          {reminders
            .filter(r => !r.completed && !r.triggered)
            .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
            .map(reminder => (
              <ReminderItem
                key={reminder.id}
                reminder={reminder}
                onSnooze={handleReminderAction}
                onDelete={handleDelete}
              />
            ))}

          {reminders.filter(r => !r.completed && !r.triggered).length === 0 && (
            <div className="text-center py-16 bg-slate-900/20 rounded-3xl border border-dashed border-slate-700/50">
              <div className="p-4 bg-slate-800/50 rounded-full w-fit mx-auto mb-4">
                <BellOff size={32} className="text-slate-600" />
              </div>
              <p className="text-slate-400 font-bold mb-1">Peace and quiet</p>
              <p className="text-xs text-slate-500 font-medium">You have no upcoming reminders scheduled</p>
            </div>
          )}
        </div>
      </div>

      <ReminderModal
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingReminder(null);
          resetForm();
        }}
        editingReminder={editingReminder}
        formData={formData}
        setFormData={setFormData}
        onSave={handleCreate}
        todos={todos}
      />
    </div>
  );
};

export default SmartReminder;
