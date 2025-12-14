export interface Theme {
  background: string;
  foreground: string;
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  tertiary: string;
  'tertiary-foreground': string;
  quaternary: string;
  'quaternary-foreground': string;
  muted: string;
  'muted-foreground': string;
  accent: string;
  'accent-foreground': string;
  destructive: string;
  'destructive-foreground': string;

  card: string;
  'card-foreground': string;
  popover: string;
  'popover-foreground': string;
  border: string;
  input: string;
  ring: string;

  'chart-1': string;
  'chart-2': string;
  'chart-3': string;
  'chart-4': string;
  'chart-5': string;

  sidebar: string;
  'sidebar-foreground': string;
  'sidebar-primary': string;
  'sidebar-primary-foreground': string;
  'sidebar-accent': string;
  'sidebar-accent-foreground': string;
  'sidebar-border': string;
  'sidebar-ring': string;

  'scrollbar-thumb': string;
  'scrollbar-thumb-hover': string;

  'primary-font': string;
  radius: string;
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  Object.entries(theme).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

export function getCurrentTheme(): Theme {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  const theme: Partial<Theme> = {};

  const themeKeys: (keyof Theme)[] = [
    'background',
    'foreground',
    'primary',
    'primary-foreground',
    'secondary',
    'secondary-foreground',
    'tertiary',
    'tertiary-foreground',
    'quaternary',
    'quaternary-foreground',
    'muted',
    'muted-foreground',
    'accent',
    'accent-foreground',
    'destructive',
    'destructive-foreground',
    'card',
    'card-foreground',
    'popover',
    'popover-foreground',
    'border',
    'input',
    'ring',
    'chart-1',
    'chart-2',
    'chart-3',
    'chart-4',
    'chart-5',
    'sidebar',
    'sidebar-foreground',
    'sidebar-primary',
    'sidebar-primary-foreground',
    'sidebar-accent',
    'sidebar-accent-foreground',
    'sidebar-border',
    'sidebar-ring',
    'scrollbar-thumb',
    'scrollbar-thumb-hover',
    'primary-font',
    'radius',
  ];

  themeKeys.forEach(key => {
    const value = computedStyle.getPropertyValue(`--${key}`);
    if (value) {
      theme[key] = value.trim();
    }
  });

  return theme as Theme;
}
