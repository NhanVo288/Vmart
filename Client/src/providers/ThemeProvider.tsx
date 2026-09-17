import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const STORAGE_KEY = 'theme-mode';

interface ThemeContextValue {
  mode: 'light' | 'dark';
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'light';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // indigo (Tailwind indigo-*)
          primary: mode === 'dark' ? {
            main: '#818cf8',   // indigo-400
            light: '#a5b4fc',  // indigo-300
            dark: '#6366f1',   // indigo-500
            contrastText: '#fff',
          } : {
            main: '#4f46e5',   // indigo-600
            light: '#6366f1',  // indigo-500
            dark: '#4338ca',   // indigo-700
            contrastText: '#fff',
          },
          // violet (Tailwind violet-*) — accent/secondary instead of plain slate
          secondary: mode === 'dark' ? {
            main: '#c4b5fd',   // violet-300
            light: '#e8e5f7',  // violet-200
            dark: '#a78bfa',   // violet-400
          } : {
            main: '#7c3aed',   // violet-600
            light: '#8b5cf6',  // violet-500
            dark: '#6d28d9',   // violet-700
          },
          background: {
            default: mode === 'dark' ? '#0f172a' : '#f8fafc',  // slate-900 / slate-50
            paper: mode === 'dark' ? '#1e293b' : '#ffffff',    // slate-800 / white
          },
          text: {
            primary: mode === 'dark' ? '#f1f5f9' : '#1e293b',   // slate-100 / slate-800 (أهدأ من الأسود الفاقع)
            secondary: mode === 'dark' ? '#cfd5dd' : '#64748b', // slate-400 / slate-500
          },
          divider: mode === 'dark' ? '#334155' : '#e2e8f0',     // slate-700 / slate-200
          error: mode === 'dark' ? {
            main: '#f87171',   // red-400
            light: '#fca5a5',  // red-300
            dark: '#dc2626',   // red-600
          } : {
            main: '#dc2626',   // red-600
            light: '#ef4444',  // red-500
            dark: '#b91c1c',   // red-700
          },
          warning: mode === 'dark' ? {
            main: '#fbbf24',   // amber-400
            light: '#fde68a',  // amber-200
            dark: '#f59e0b',   // amber-500
          } : {
            main: '#d97706',   // amber-600 (أهدأ من amber-500 الفاقع في اللايت)
            light: '#f59e0b',  // amber-500
            dark: '#b45309',   // amber-700
          },
          info: mode === 'dark' ? {
            main: '#38bdf8',   // sky-400
            light: '#7dd3fc',  // sky-300
            dark: '#0ea5e9',   // sky-500
          } : {
            main: '#0284c7',   // sky-600
            light: '#0ea5e9',  // sky-500
            dark: '#075985',   // sky-800
          },
          success: mode === 'dark' ? {
            main: '#4ade80',   // green-400
            light: '#86efac',  // green-300
            dark: '#22c55e',   // green-500
          } : {
            main: '#16a34a',   // green-600
            light: '#22c55e',  // green-500
            dark: '#15803d',   // green-700
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === 'dark' ? '#0f172a' : '#f8fafc',
              },
              'input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active': {
                WebkitBackgroundClip: 'text !important',
                WebkitTextFillColor: `${mode === 'dark' ? '#f1f5f9' : '#1e293b'} !important`,
                caretColor: `${mode === 'dark' ? '#f1f5f9' : '#1e293b'} !important`,
                WebkitBoxShadow: '0 0 0px 1000px transparent inset !important',
                boxShadow: '0 0 0px 1000px transparent inset !important',
                transition: 'background-color 5000000s ease-in-out 0s !important',
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: { color: '#ede9fe' },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                '&.Mui-selected': {
                  '& .MuiListItemText-primary': { color: 'inherit' },
                  '& .MuiListItemText-secondary': { color: 'inherit' },
                  '& .MuiListItemIcon-root': { color: 'inherit' },
                },
              },
            },
          },
        },
      }),
    [mode],
  );

  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
