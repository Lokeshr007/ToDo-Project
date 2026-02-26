import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellRing,
  BellOff,
  Clock,
  Calendar,
  X,
  Check,
  Zap,
  Mail,
  MessageSquare,
  Smartphone,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Save,
  AlertCircle,
  Moon,
  Sun,
  Coffee
} from 'lucide-react';
import { format, addMinutes, isBefore, isAfter, differenceInMinutes } from 'date-fns';
import { useAuth } from '@/app/providers/AuthContext';
import { reminderApi } from '../api/reminderApi';
import { todoApi } from '@/services/api/todoApi';
import toast from 'react-hot-toast';

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
    reminderFrequency: 'once', // once, twice, escalating
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
    reminderType: 'before', // before, after, specific
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

  useEffect(() => {
    fetchReminders();
    fetchTodos();
    loadPreferences();
    checkPendingReminders();
    
    // Set up interval to check reminders
    const interval = setInterval(checkPendingReminders, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const fetchReminders = async () => {
    try {
      const data = await reminderApi.getPendingReminders();
      setReminders(data);
    } catch (error) {
      console.error('Failed to fetch reminders:', error);
    }
  };

  const fetchTodos = async () => {
    try {
      const data = await todoApi.getTodos();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  const loadPreferences = async () => {
    try {
      const data = await reminderApi.getReminderPreferences();
      if (data) {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const checkPendingReminders = async () => {
    try {
      const now = new Date();
      const dueReminders = reminders.filter(reminder => {
        if (reminder.completed) return false;
        
        const reminderTime = new Date(reminder.scheduledFor);
        return isBefore(reminderTime, now) && !reminder.triggered;
      });

      dueReminders.forEach(reminder => {
        showReminder(reminder);
        markReminderTriggered(reminder.id);
      });

      // Check for upcoming reminders (within next 5 minutes)
      const upcomingReminders = reminders.filter(reminder => {
        if (reminder.completed || reminder.triggered) return false;
        
        const reminderTime = new Date(reminder.scheduledFor);
        const minutesUntil = differenceInMinutes(reminderTime, now);
        return minutesUntil > 0 && minutesUntil <= 5 && !reminder.notified;
      });

      if (upcomingReminders.length > 0) {
        setPendingReminders(upcomingReminders);
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  };

  const showReminder = (reminder) => {
    setActiveReminder(reminder);
    
    // Play sound if enabled
    if (preferences.pushEnabled) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Audio play failed:', e));
    }

    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(reminder.title, {
        body: reminder.description || 'Your reminder is due',
        icon: '/icon.png',
        tag: reminder.id.toString()
      });
    }

    // Show toast
    toast.custom((t) => (
      <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-purple-500/30 max-w-md">
        <div className="flex items-start gap-3">
          <BellRing className="text-purple-400 animate-pulse" size={20} />
          <div className="flex-1">
            <p className="font-medium">{reminder.title}</p>
            {reminder.description && (
              <p className="text-sm text-slate-300 mt-1">{reminder.description}</p>
            )}
            {reminder.todo && (
              <p className="text-xs text-purple-400 mt-1">
                Task: {reminder.todo.title}
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleReminderAction(reminder.id, 'complete')}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
              >
                Complete
              </button>
              <button
                onClick={() => handleReminderAction(reminder.id, 'snooze', 15)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg"
              >
                Snooze 15m
              </button>
              <button
                onClick={() => handleReminderAction(reminder.id, 'snooze', 60)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg"
              >
                1h
              </button>
              <button
                onClick={() => setActiveReminder(null)}
                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 0 }); // Don't auto-dismiss
  };

  const handleReminderAction = async (id, action, value = null) => {
    try {
      switch(action) {
        case 'complete':
          await reminderApi.completeReminder(id);
          setReminders(prev => prev.map(r => 
            r.id === id ? { ...r, completed: true } : r
          ));
          toast.success('Reminder completed');
          break;

        case 'snooze':
          await reminderApi.snoozeReminder(id, value);
          const snoozedTime = addMinutes(new Date(), value);
          setReminders(prev => prev.map(r => 
            r.id === id ? { ...r, scheduledFor: snoozedTime.toISOString(), snoozed: true } : r
          ));
          toast.success(`Reminder snoozed for ${value} minutes`);
          break;
      }

      setActiveReminder(null);
      toast.dismiss(); // Close toast
    } catch (error) {
      console.error('Failed to handle reminder:', error);
      toast.error('Failed to process reminder');
    }
  };

  const createReminder = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a reminder title');
      return;
    }

    try {
      let scheduledFor;
      
      if (formData.reminderType === 'before' && formData.todoId) {
        const todo = todos.find(t => t.id === parseInt(formData.todoId));
        if (!todo || !todo.dueDate) {
          toast.error('Selected task has no due date');
          return;
        }
        scheduledFor = addMinutes(new Date(todo.dueDate), -formData.leadTime);
      } else if (formData.reminderType === 'specific') {
        scheduledFor = new Date(`${formData.specificDate}T${formData.specificTime}`);
      }

      if (scheduledFor && isBefore(scheduledFor, new Date())) {
        toast.error('Reminder time must be in the future');
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
      toast.success('Reminder scheduled successfully');

      // Schedule intelligent follow-up if enabled
      if (formData.followUp && formData.todoId) {
        scheduleFollowUpReminder(response);
      }
    } catch (error) {
      console.error('Failed to create reminder:', error);
      toast.error('Failed to create reminder');
    }
  };

  const scheduleFollowUpReminder = (reminder) => {
    // Schedule a follow-up reminder if task not completed
    const checkInterval = setInterval(async () => {
      const todo = todos.find(t => t.id === reminder.todoId);
      if (todo?.status === 'COMPLETED') {
        clearInterval(checkInterval);
      } else {
        // Check if we should send follow-up
        const hoursSinceReminder = differenceInMinutes(new Date(), new Date(reminder.scheduledFor)) / 60;
        
        if (hoursSinceReminder >= 1 && hoursSinceReminder < 2) {
          // Send first follow-up
          toast.custom((t) => (
            <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-yellow-500/30">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-yellow-400" size={20} />
                <div>
                  <p className="font-medium">Still working on it?</p>
                  <p className="text-sm text-slate-300">
                    Your task "{reminder.title}" is still pending
                  </p>
                </div>
              </div>
            </div>
          ), { duration: 8000 });
        } else if (hoursSinceReminder >= 4) {
          // Send urgent follow-up
          toast.custom((t) => (
            <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-red-500/30">
              <div className="flex items-center gap-3">
                <Zap className="text-red-400" size={20} />
                <div>
                  <p className="font-medium">Task overdue for reminder!</p>
                  <p className="text-sm text-slate-300">
                    Don't forget to complete "{reminder.title}"
                  </p>
                </div>
              </div>
            </div>
          ), { duration: 10000 });
          
          clearInterval(checkInterval);
        }
      }
    }, 30 * 60 * 1000); // Check every 30 minutes
  };

  const savePreferences = async () => {
    try {
      await reminderApi.setReminderPreferences(preferences);
      setShowPreferences(false);
      toast.success('Preferences saved');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const deleteReminder = async (id) => {
    if (!window.confirm('Delete this reminder?')) return;

    try {
      await reminderApi.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      toast.success('Reminder deleted');
    } catch (error) {
      console.error('Failed to delete reminder:', error);
      toast.error('Failed to delete reminder');
    }
  };

  const markReminderTriggered = async (id) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, triggered: true } : r
    ));
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

  const requestNotificationPermission = () => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="text-purple-400" size={24} />
            Smart Reminders
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={requestNotificationPermission}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg"
            >
              Enable Notifications
            </button>
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
            >
              Preferences
            </button>
          </div>
        </div>

        {/* Pending Reminders Alert */}
        {pendingReminders.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <BellRing className="text-yellow-400 animate-pulse" size={18} />
              <span className="text-sm text-yellow-300">
                {pendingReminders.length} reminder{pendingReminders.length > 1 ? 's' : ''} coming up
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <div className="p-6 bg-slate-700/30 border-b border-slate-700">
          <h3 className="text-white font-medium mb-4">Reminder Preferences</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  onChange={(e) => setPreferences({ ...preferences, emailEnabled: e.target.checked })}
                  className="rounded border-slate-600"
                />
                <Mail size={16} className="text-slate-400" />
                <span className="text-sm text-slate-300">Email</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.pushEnabled}
                  onChange={(e) => setPreferences({ ...preferences, pushEnabled: e.target.checked })}
                  className="rounded border-slate-600"
                />
                <Smartphone size={16} className="text-slate-400" />
                <span className="text-sm text-slate-300">Push</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.smsEnabled}
                  onChange={(e) => setPreferences({ ...preferences, smsEnabled: e.target.checked })}
                  className="rounded border-slate-600"
                />
                <MessageSquare size={16} className="text-slate-400" />
                <span className="text-sm text-slate-300">SMS</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Quiet Hours Start</label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => setPreferences({ ...preferences, quietHoursStart: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Quiet Hours End</label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => setPreferences({ ...preferences, quietHoursEnd: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Default Lead Time (minutes)</label>
              <input
                type="number"
                value={preferences.defaultLeadTime}
                onChange={(e) => setPreferences({ ...preferences, defaultLeadTime: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                min="5"
                max="120"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.weekdayOnly}
                  onChange={(e) => setPreferences({ ...preferences, weekdayOnly: e.target.checked })}
                  className="rounded border-slate-600"
                />
                <span className="text-sm text-slate-300">Weekdays only</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.intelligentReminders}
                  onChange={(e) => setPreferences({ ...preferences, intelligentReminders: e.target.checked })}
                  className="rounded border-slate-600"
                />
                <span className="text-sm text-slate-300">Intelligent reminders</span>
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-3 py-1 text-slate-400 hover:bg-slate-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Reminder Button */}
      <div className="p-6">
        <button
          onClick={() => {
            setEditingReminder(null);
            resetForm();
            setShowCreateModal(true);
          }}
          className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Schedule Reminder
        </button>
      </div>

      {/* Reminders List */}
      <div className="px-6 pb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Upcoming Reminders</h3>
        <div className="space-y-3">
          {reminders
            .filter(r => !r.completed && !r.triggered)
            .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
            .map(reminder => {
              const reminderTime = new Date(reminder.scheduledFor);
              const isSoon = differenceInMinutes(reminderTime, new Date()) <= 30;

              return (
                <div
                  key={reminder.id}
                  className={`p-4 bg-slate-700/30 rounded-xl border ${
                    isSoon ? 'border-yellow-500/30' : 'border-slate-700'
                  } hover:bg-slate-700/50 transition-colors group`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Bell
                        size={18}
                        className={isSoon ? 'text-yellow-400' : 'text-slate-400'}
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{reminder.title}</h4>
                        {reminder.description && (
                          <p className="text-sm text-slate-400 mt-1">{reminder.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock size={12} />
                            {format(reminderTime, 'MMM d, h:mm a')}
                          </span>
                          {reminder.todo && (
                            <span className="flex items-center gap-1 text-purple-400">
                              <ChevronRight size={12} />
                              {reminder.todo.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleReminderAction(reminder.id, 'snooze', 15)}
                        className="p-1 hover:bg-slate-600 rounded"
                        title="Snooze 15 minutes"
                      >
                        <Clock size={14} className="text-slate-400" />
                      </button>
                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className="p-1 hover:bg-slate-600 rounded"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          {reminders.filter(r => !r.completed).length === 0 && (
            <div className="text-center py-8">
              <BellOff size={32} className="mx-auto text-slate-600 mb-2" />
              <p className="text-slate-400">No pending reminders</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Reminder Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingReminder ? 'Edit Reminder' : 'Schedule Reminder'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingReminder(null);
                  resetForm();
                }}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Reminder title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />

              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />

              <div>
                <label className="block text-sm text-slate-400 mb-1">Reminder Type</label>
                <select
                  value={formData.reminderType}
                  onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                >
                  <option value="before">Before task due</option>
                  <option value="after">After task due</option>
                  <option value="specific">Specific date/time</option>
                </select>
              </div>

              {formData.reminderType !== 'specific' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Link to Task</label>
                  <select
                    value={formData.todoId}
                    onChange={(e) => setFormData({ ...formData, todoId: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    <option value="">Select a task</option>
                    {todos.map(todo => (
                      <option key={todo.id} value={todo.id}>
                        {todo.title} {todo.dueDate ? `(Due: ${format(new Date(todo.dueDate), 'MMM d')})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.reminderType === 'before' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Remind me before</label>
                  <select
                    value={formData.leadTime}
                    onChange={(e) => setFormData({ ...formData, leadTime: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.specificDate}
                      onChange={(e) => setFormData({ ...formData, specificDate: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.specificTime}
                      onChange={(e) => setFormData({ ...formData, specificTime: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm text-slate-400 mb-1">Channels</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('push')}
                      onChange={(e) => {
                        const channels = e.target.checked
                          ? [...formData.channels, 'push']
                          : formData.channels.filter(c => c !== 'push');
                        setFormData({ ...formData, channels });
                      }}
                      className="rounded border-slate-600"
                    />
                    <Smartphone size={14} className="text-slate-400" />
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('email')}
                      onChange={(e) => {
                        const channels = e.target.checked
                          ? [...formData.channels, 'email']
                          : formData.channels.filter(c => c !== 'email');
                        setFormData({ ...formData, channels });
                      }}
                      className="rounded border-slate-600"
                    />
                    <Mail size={14} className="text-slate-400" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.smartDelay}
                    onChange={(e) => setFormData({ ...formData, smartDelay: e.target.checked })}
                    className="rounded border-slate-600"
                  />
                  <span className="text-sm text-slate-300">
                    Smart delay (adjust if you're busy)
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.followUp}
                    onChange={(e) => setFormData({ ...formData, followUp: e.target.checked })}
                    className="rounded border-slate-600"
                  />
                  <span className="text-sm text-slate-300">
                    Follow-up if not completed
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingReminder(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-slate-400 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={createReminder}
                  disabled={!formData.title.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={16} />
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Reminder Modal */}
      {activeReminder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border-2 border-purple-500/50 shadow-2xl">
            <div className="text-center">
              <BellRing size={48} className="mx-auto text-purple-400 animate-pulse mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">{activeReminder.title}</h3>
              {activeReminder.description && (
                <p className="text-slate-300 mb-4">{activeReminder.description}</p>
              )}
              {activeReminder.todo && (
                <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400">Linked Task:</p>
                  <p className="text-white">{activeReminder.todo.title}</p>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleReminderAction(activeReminder.id, 'complete')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Complete
                </button>
                <button
                  onClick={() => handleReminderAction(activeReminder.id, 'snooze', 15)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Snooze 15m
                </button>
                <button
                  onClick={() => setActiveReminder(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartReminder;