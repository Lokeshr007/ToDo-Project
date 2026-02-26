import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const themes = {
  dark: {
    name: 'Dark',
    bg: 'bg-[#0a0a0f]',
    card: 'bg-[#1a1a2e]',
    border: 'border-[#2a2a3a]',
    text: 'text-gray-200',
    textSecondary: 'text-gray-400',
    hover: 'hover:bg-[#252538]',
    accent: 'bg-[#7c3aed]',
    accentHover: 'hover:bg-[#6d28d9]',
    sidebar: 'bg-[#11111f]',
    header: 'bg-[#0f0f1a]',
    input: 'bg-[#252538] border-[#35354a]',
    modal: 'bg-[#1a1a2e]'
  },
  light: {
    name: 'Light',
    bg: 'bg-gray-50',
    card: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    hover: 'hover:bg-gray-50',
    accent: 'bg-blue-600',
    accentHover: 'hover:bg-blue-700',
    sidebar: 'bg-white',
    header: 'bg-white',
    input: 'bg-white border-gray-300',
    modal: 'bg-white'
  },
  system: {
    name: 'System Default',
    // Will be determined by system preference
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  const [systemTheme, setSystemTheme] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemTheme(e.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', currentTheme);
    
    // Apply theme to html element
    const theme = currentTheme === 'system' ? systemTheme : currentTheme;
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [currentTheme, systemTheme]);

  const themeStyles = currentTheme === 'system' 
    ? themes[systemTheme] 
    : themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ 
      theme: currentTheme,
      themes,
      themeStyles,
      setTheme: setCurrentTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);