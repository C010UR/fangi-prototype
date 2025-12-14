import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type Theme, applyTheme } from './theme';
import { themes } from './themes';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme, themeId?: string) => void;
  themes: { id: string; name: string; theme: Theme; description: string }[];
  currentThemeId: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: Theme;
}

export function ThemeProvider({ children, initialTheme = themes[0].theme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [currentThemeId, setCurrentThemeId] = useState<string>('mycelium-green');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme, themeId?: string) => {
    setThemeState(newTheme);
    if (themeId) {
      setCurrentThemeId(themeId);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes, currentThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
