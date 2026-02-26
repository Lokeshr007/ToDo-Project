import { Sun, Moon, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import API from "@/services/api";
import toast from 'react-hot-toast';
import { useTheme } from "@/app/providers/ThemeContext";
import { useLanguage } from "@/app/providers/LanguageContext";
import { getTimezones, formatTimezone, getUserTimezone } from "@/shared/utils/timezone";

function PreferencesTab({ formData, handleInputChange, isEditing }) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [localPreferences, setLocalPreferences] = useState({
    compactView: false,
    showWeekNumbers: true,
    startWeekOnMonday: true,
    autoSave: true,
    soundEnabled: true,
    desktopNotifications: true,
    timezone: getUserTimezone()
  });

  // Load preferences when component mounts
  useEffect(() => {
    loadPreferences();
  }, []);

  // Update local state when formData changes
  useEffect(() => {
    if (formData?.preferences) {
      setLocalPreferences(prev => ({
        ...prev,
        ...formData.preferences
      }));
    }
  }, [formData]);

  // Apply theme when it changes from preferences
  useEffect(() => {
    if (localPreferences.theme && localPreferences.theme !== theme) {
      setTheme(localPreferences.theme);
    }
  }, [localPreferences.theme]);

  // Apply language when it changes from preferences
  useEffect(() => {
    if (localPreferences.language && localPreferences.language !== language) {
      setLanguage(localPreferences.language);
    }
  }, [localPreferences.language]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const response = await API.get("/users/preferences");
      const data = response.data;
      
      const newPreferences = {
        compactView: data.compactView ?? false,
        showWeekNumbers: data.showWeekNumbers ?? true,
        startWeekOnMonday: data.startWeekOnMonday ?? true,
        autoSave: data.autoSave ?? true,
        soundEnabled: data.soundEnabled ?? true,
        desktopNotifications: data.desktopNotifications ?? true,
        theme: data.theme ?? theme,
        language: data.language ?? language,
        timezone: data.timezone ?? getUserTimezone()
      };

      setLocalPreferences(newPreferences);

      // Update parent form data
      handleInputChange({ 
        target: { 
          name: 'preferences', 
          value: newPreferences 
        } 
      });

      // Apply theme and language from loaded preferences
      if (data.theme && data.theme !== theme) {
        setTheme(data.theme);
      }
      if (data.language && data.language !== language) {
        setLanguage(data.language);
      }

    } catch (error) {
      console.error("Failed to load preferences:", error);
      if (error.response?.status !== 401) {
        toast.error(t('failedToLoad'));
      }
    } finally {
      setLoading(false);
    }
  };

  const savePreference = async (key, value) => {
    setSaving(true);
    try {
      await API.put(`/users/preferences/${key}`, { value });
      
      // Update local state
      setLocalPreferences(prev => ({ ...prev, [key]: value }));
      
      // Update parent form data
      handleInputChange({ 
        target: { 
          name: 'preferences', 
          value: {
            ...formData?.preferences,
            [key]: value
          }
        } 
      });

      // Apply global changes
      if (key === 'theme') {
        setTheme(value);
      } else if (key === 'language') {
        setLanguage(value);
      }
      
      toast.success(`${key} ${t('updated')}`, { duration: 2000 });
    } catch (error) {
      console.error("Failed to save preference:", error);
      toast.error(error.response?.data?.message || t('failedToSave'));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    if (!isEditing) return;
    try {
      await savePreference('theme', newTheme);
    } catch (error) {
      // Error already handled
    }
  };

  const handleLanguageChange = async (e) => {
    if (!isEditing) return;
    const newLanguage = e.target.value;
    try {
      await savePreference('language', newLanguage);
    } catch (error) {
      e.target.value = localPreferences.language;
    }
  };

  const handleTimezoneChange = async (e) => {
    if (!isEditing) return;
    const newTimezone = e.target.value;
    try {
      await savePreference('timezone', newTimezone);
    } catch (error) {
      e.target.value = localPreferences.timezone;
    }
  };

  const handleCheckboxChange = async (e) => {
    if (!isEditing) return;
    const { name, checked } = e.target;
    try {
      await savePreference(name, checked);
    } catch (error) {
      e.target.checked = !checked;
    }
  };

  const handleResetToDefault = async () => {
    if (!isEditing) return;
    if (!window.confirm(t('resetConfirm'))) return;
    
    setSaving(true);
    try {
      await API.post("/users/preferences/reset");
      await loadPreferences();
      toast.success(t('preferencesReset'));
    } catch (error) {
      console.error("Failed to reset preferences:", error);
      toast.error(t('failedToSave'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex justify-center items-center py-12">
        <Loader size={24} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('preferences')}
        </h3>
        <div className="flex items-center gap-2">
          {isEditing && (
            <button
              onClick={handleResetToDefault}
              disabled={saving}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {t('resetToDefault')}
            </button>
          )}
          {saving && (
            <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse flex items-center gap-1">
              <Loader size={12} className="animate-spin" />
              {t('saving')}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('theme')}
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              disabled={!isEditing || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                localPreferences.theme === 'light'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              } ${(!isEditing || saving) && 'opacity-50 cursor-not-allowed'}`}
            >
              <Sun size={16} />
              {t('light')}
            </button>
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              disabled={!isEditing || saving}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                localPreferences.theme === 'dark'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              } ${(!isEditing || saving) && 'opacity-50 cursor-not-allowed'}`}
            >
              <Moon size={16} />
              {t('dark')}
            </button>
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('language')}
          </label>
          <div className="relative">
            <select
              value={localPreferences.language}
              onChange={handleLanguageChange}
              disabled={!isEditing || saving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            >
              <option value="en">{t('english')}</option>
              <option value="es">{t('spanish')}</option>
              <option value="fr">{t('french')}</option>
              <option value="de">{t('german')}</option>
              <option value="it">{t('italian')}</option>
              <option value="pt">{t('portuguese')}</option>
              <option value="ru">{t('russian')}</option>
              <option value="ja">{t('japanese')}</option>
              <option value="ko">{t('korean')}</option>
              <option value="zh">{t('chinese')}</option>
              <option value="ar">{t('arabic')}</option>
              <option value="hi">{t('hindi')}</option>
            </select>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('timezone')}
          </label>
          <div className="relative">
            <select
              value={localPreferences.timezone}
              onChange={handleTimezoneChange}
              disabled={!isEditing || saving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
            >
              {getTimezones().map(tz => (
                <option key={tz} value={tz}>{formatTimezone(tz)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {t('displayPreferences') || 'Display Preferences'}
          </h4>
          
          <div className="space-y-3">
            {[
              { key: 'compactView', label: t('compactView') },
              { key: 'showWeekNumbers', label: t('showWeekNumbers') },
              { key: 'startWeekOnMonday', label: t('startWeekOnMonday') },
              { key: 'autoSave', label: t('autoSave') },
              { key: 'soundEnabled', label: t('soundEnabled') },
              { key: 'desktopNotifications', label: t('desktopNotifications') }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between group">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name={key}
                    checked={localPreferences[key]}
                    onChange={handleCheckboxChange}
                    disabled={!isEditing || saving}
                    className="sr-only peer"
                  />
                  <div className={`w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                    !isEditing && 'opacity-50'
                  }`}></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Info message when not editing */}
        {!isEditing && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              {t('clickToEdit')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PreferencesTab;