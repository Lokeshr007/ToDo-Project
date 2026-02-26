export const getTimezones = () => {
  try {
    return Intl.supportedValuesOf('timeZone');
  } catch (e) {
    return [
      'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
      'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 
      'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney',
      'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Nairobi',
      'Africa/Lagos', 'Africa/Casablanca', 'Africa/Tunis'
    ];
  }
};

export const formatTimezone = (timezone) => {
  return timezone.replace(/_/g, ' ');
};

export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'UTC';
  }
};