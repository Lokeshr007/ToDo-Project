import { useState, useEffect } from 'react';
import { reminderApi } from '../api/reminderApi';
import { taskToast } from '@/shared/components/QuantumToaster';

export const useReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReminders();
    fetchPreferences();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const data = await reminderApi.getPendingReminders();
      setReminders(data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Failed to fetch reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const data = await reminderApi.getReminderPreferences();
      setPreferences(data);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  const scheduleReminder = async (reminderData) => {
    try {
      const newReminder = await reminderApi.scheduleReminder(reminderData);
      setReminders(prev => [...prev, newReminder]);
      taskToast.success('Reminder scheduled');
      return newReminder;
    } catch (err) {
      taskToast.error('Failed to schedule reminder');
      throw err;
    }
  };

  const snoozeReminder = async (id, minutes) => {
    try {
      await reminderApi.snoozeReminder(id, minutes);
      setReminders(prev => prev.map(r => 
        r.id === id ? { ...r, snoozed: true } : r
      ));
      taskToast.success(`Snoozed for ${minutes} minutes`);
    } catch (err) {
      taskToast.error('Failed to snooze reminder');
      throw err;
    }
  };

  const completeReminder = async (id) => {
    try {
      await reminderApi.completeReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      taskToast.success('Reminder completed');
    } catch (err) {
      taskToast.error('Failed to complete reminder');
      throw err;
    }
  };

  const deleteReminder = async (id) => {
    try {
      await reminderApi.deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      taskToast.success('Reminder deleted');
    } catch (err) {
      taskToast.error('Failed to delete reminder');
      throw err;
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      await reminderApi.setReminderPreferences(newPreferences);
      setPreferences(newPreferences);
      taskToast.success('Preferences updated');
    } catch (err) {
      taskToast.error('Failed to update preferences');
      throw err;
    }
  };

  const getUpcomingReminders = (hours = 24) => {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return reminders.filter(r => {
      const reminderTime = new Date(r.scheduledFor);
      return reminderTime > now && reminderTime < future;
    });
  };

  return {
    reminders,
    preferences,
    loading,
    error,
    scheduleReminder,
    snoozeReminder,
    completeReminder,
    deleteReminder,
    updatePreferences,
    getUpcomingReminders,
    refreshReminders: fetchReminders
  };
};
