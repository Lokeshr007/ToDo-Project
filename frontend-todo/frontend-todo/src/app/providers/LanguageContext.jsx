import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Navigation
    dashboard: 'Dashboard',
    projects: 'Projects',
    todos: 'Todos',
    boards: 'Boards',
    profile: 'Profile',
    settings: 'Settings',
    
    // Profile
    profileInformation: 'Profile Information',
    personalInfo: 'Personal Info',
    preferences: 'Preferences',
    security: 'Security',
    activity: 'Activity',
    
    // Theme
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System Default',
    
    // Language
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
    french: 'French',
    german: 'German',
    italian: 'Italian',
    portuguese: 'Portuguese',
    russian: 'Russian',
    japanese: 'Japanese',
    korean: 'Korean',
    chinese: 'Chinese',
    arabic: 'Arabic',
    hindi: 'Hindi',
    
    // Timezone
    timezone: 'Timezone',
    
    // Preferences
    compactView: 'Compact View',
    showWeekNumbers: 'Show Week Numbers',
    startWeekOnMonday: 'Start Week on Monday',
    autoSave: 'Auto-save Changes',
    soundEnabled: 'Sound Enabled',
    desktopNotifications: 'Desktop Notifications',
    
    // Messages
    clickToEdit: 'Click the Edit button above to modify preferences',
    resetToDefault: 'Reset to Default',
    resetConfirm: 'Reset all preferences to default values?',
    saving: 'Saving...',
    updated: 'updated',
    preferencesUpdated: 'Preferences updated',
    preferencesReset: 'Preferences reset to default',
    failedToLoad: 'Failed to load preferences',
    failedToSave: 'Failed to save preference',
  },
  es: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    
    dashboard: 'Panel',
    projects: 'Proyectos',
    todos: 'Tareas',
    boards: 'Tableros',
    profile: 'Perfil',
    settings: 'Ajustes',
    
    profileInformation: 'Información de Perfil',
    personalInfo: 'Información Personal',
    preferences: 'Preferencias',
    security: 'Seguridad',
    activity: 'Actividad',
    
    theme: 'Tema',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Predeterminado del Sistema',
    
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
    french: 'Francés',
    german: 'Alemán',
    italian: 'Italiano',
    portuguese: 'Portugués',
    russian: 'Ruso',
    japanese: 'Japonés',
    korean: 'Coreano',
    chinese: 'Chino',
    arabic: 'Árabe',
    hindi: 'Hindi',
    
    timezone: 'Zona Horaria',
    
    compactView: 'Vista Compacta',
    showWeekNumbers: 'Mostrar Números de Semana',
    startWeekOnMonday: 'Comenzar Semana en Lunes',
    autoSave: 'Guardado Automático',
    soundEnabled: 'Sonido Activado',
    desktopNotifications: 'Notificaciones de Escritorio',
    
    clickToEdit: 'Haga clic en el botón Editar arriba para modificar preferencias',
    resetToDefault: 'Restablecer a Valores Predeterminados',
    resetConfirm: '¿Restablecer todas las preferencias a valores predeterminados?',
    saving: 'Guardando...',
    updated: 'actualizado',
    preferencesUpdated: 'Preferencias actualizadas',
    preferencesReset: 'Preferencias restablecidas a valores predeterminados',
    failedToLoad: 'Error al cargar preferencias',
    failedToSave: 'Error al guardar preferencia',
  },
  fr: {
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    
    dashboard: 'Tableau de Bord',
    projects: 'Projets',
    todos: 'Tâches',
    boards: 'Tableaux',
    profile: 'Profil',
    settings: 'Paramètres',
    
    profileInformation: 'Informations du Profil',
    personalInfo: 'Informations Personnelles',
    preferences: 'Préférences',
    security: 'Sécurité',
    activity: 'Activité',
    
    theme: 'Thème',
    light: 'Clair',
    dark: 'Sombre',
    system: 'Défaut Système',
    
    language: 'Langue',
    english: 'Anglais',
    spanish: 'Espagnol',
    french: 'Français',
    german: 'Allemand',
    italian: 'Italien',
    portuguese: 'Portugais',
    russian: 'Russe',
    japanese: 'Japonais',
    korean: 'Coréen',
    chinese: 'Chinois',
    arabic: 'Arabe',
    hindi: 'Hindi',
    
    timezone: 'Fuseau Horaire',
    
    compactView: 'Vue Compacte',
    showWeekNumbers: 'Afficher les Numéros de Semaine',
    startWeekOnMonday: 'Commencer la Semaine le Lundi',
    autoSave: 'Sauvegarde Automatique',
    soundEnabled: 'Son Activé',
    desktopNotifications: 'Notifications Bureau',
    
    clickToEdit: 'Cliquez sur le bouton Modifier ci-dessus pour modifier les préférences',
    resetToDefault: 'Réinitialiser aux Valeurs par Défaut',
    resetConfirm: 'Réinitialiser toutes les préférences aux valeurs par défaut ?',
    saving: 'Sauvegarde...',
    updated: 'mis à jour',
    preferencesUpdated: 'Préférences mises à jour',
    preferencesReset: 'Préférences réinitialisées',
    failedToLoad: 'Échec du chargement des préférences',
    failedToSave: 'Échec de la sauvegarde de la préférence',
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    // Set html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage,
      t,
      translations
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};