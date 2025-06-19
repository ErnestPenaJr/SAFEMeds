export const DesignSystem = {
  colors: {
    primary: {
      blue: '#4A90E2',
      lightBlue: '#6BA3E8',
      gradientBlue: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)',
    },
    backgrounds: {
      coral: '#FF6B6B',
      turquoise: '#4ECDC4',
      lightBlue: '#87CEEB',
      purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      white: '#FFFFFF',
      offWhite: '#FAFAFA',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#666666',
      onDark: '#FFFFFF',
      muted: '#999999',
    },
    interactive: {
      accent: '#F0F4FF',
      ring: '#4A90E2',
      border: '#E5E7EB',
    },
  },
  
  typography: {
    fontFamilies: {
      primary: 'Montserrat-Regular',
      primaryMedium: 'Montserrat-Medium',
      primarySemiBold: 'Montserrat-SemiBold',
      primaryBold: 'Montserrat-Bold',
      display: 'RussoOne-Regular',
    },
    sizes: {
      hero: 28,
      title: 24,
      subtitle: 18,
      body: 16,
      caption: 14,
      label: 12,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 20,
    xl: 24,
    full: 9999,
  },
  
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 32,
      elevation: 8,
    },
    elevated: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.12,
      shadowRadius: 48,
      elevation: 12,
    },
    button: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
    },
  },
  
  glassmorphism: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
} as const;