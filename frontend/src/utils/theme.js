const common = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 15,
      elevation: 10,
    },
  },
};

export const darkTheme = {
  ...common,
  colors: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    primaryLight: '#818cf8',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceLight: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    border: '#334155',
    divider: '#1e293b',
    white: '#ffffff',
    black: '#000000',
    glass: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

export const lightTheme = {
  ...common,
  colors: {
    primary: '#4f46e5',
    primaryDark: '#3730a3',
    primaryLight: '#6366f1',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceLight: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    border: '#e2e8f0',
    divider: '#f1f5f9',
    white: '#ffffff',
    black: '#000000',
    glass: 'rgba(0, 0, 0, 0.03)',
    glassBorder: 'rgba(0, 0, 0, 0.05)',
  },
};

// For backward compatibility while refactoring
export const theme = darkTheme;
export default theme;

