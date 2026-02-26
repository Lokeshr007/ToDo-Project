import api from '@/services/api';

export const reminderApi = {
  // Schedule a reminder
  scheduleReminder: async (reminderData) => {
    const response = await api.post('/reminders/schedule', reminderData);
    return response.data;
  },

  // Get pending reminders
  getPendingReminders: async () => {
    const response = await api.get('/reminders/pending');
    return response.data;
  },

  // Snooze reminder
  snoozeReminder: async (id, minutes) => {
    const response = await api.post(`/reminders/${id}/snooze`, { minutes });
    return response.data;
  },

  // Set reminder preferences
  setReminderPreferences: async (preferences) => {
    const response = await api.post('/reminders/preferences', preferences);
    return response.data;
  },

  // Get reminder preferences
  getReminderPreferences: async () => {
    const response = await api.get('/reminders/preferences');
    return response.data;
  },

  // Mark reminder as completed
  completeReminder: async (id) => {
    const response = await api.post(`/reminders/${id}/complete`);
    return response.data;
  }
};