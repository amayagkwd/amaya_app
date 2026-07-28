// Global Theme Configuration
export const theme = {
  // Colors
  colors: {
    // Backgrounds
    bgPrimary: '#010409',
    bgSecondary: '#0d1117',
    bgCard: 'rgba(22, 27, 34, 0.8)',
    bgCardHover: 'rgba(22, 27, 34, 0.95)',
    bgCardDark: 'rgba(13, 17, 23, 0.6)',
    bgModal: 'rgba(22, 27, 34, 0.95)',
    bgMapOverlay: 'rgba(6, 8, 12, 0.7)',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: '#8b92b0',
    textMuted: '#5a6080',
    textDisabled: 'rgba(255, 255, 255, 0.4)',
    textOnDark: 'rgba(255, 255, 255, 0.6)',
    
    // Accents
    accentCyan: '#00e5cc',
    accentPink: '#ff6b9d',
    accentPurple: '#7c6fff',
    accentBlue: '#5b9eff',
    accentOrange: '#ffb84d',
    
    // Borders
    borderSubtle: 'rgba(139, 146, 176, 0.12)',
    borderMedium: 'rgba(139, 146, 176, 0.2)',
    borderDashed: 'rgba(124, 111, 255, 0.3)',
    borderDashedHover: 'rgba(124, 111, 255, 0.5)',
    
    // Status
    success: '#00e5cc',
    error: '#ff6b9d',
  },
  
  // Typography
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    fontFamilyHeading: "'Space Grotesk', 'Inter', sans-serif",
    
    // Font sizes
    h1: '40px',
    h2: '32px',
    h3: '20px',
    h4: '18px',
    h5: '16px',
    h6: '15px',
    body: '14px',
    bodySmall: '13px',
    caption: '12px',
    tiny: '11px',
    micro: '10px',
    large: '64px',
    xlarge: '56px',
    
    // Font weights
    light: 300,
    regular: 400,
    medium: 500,
    semiBold: 600,
    bold: 700,
    extraBold: 800,
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    huge: '48px',
  },
  
  // Border Radius
  borderRadius: {
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '14px',
    xxl: '20px',
    xxxl: '24px',
    round: '50%',
  },
  
  // Shadows
  shadows: {
    card: '0 8px 24px rgba(0, 0, 0, 0.4)',
    cardHover: '0 12px 32px rgba(0, 0, 0, 0.5)',
    strong: '0 16px 48px rgba(0, 0, 0, 0.5)',
    fab: '0 8px 24px rgba(124, 111, 255, 0.5), 0 0 0 0 rgba(124, 111, 255, 0.4)',
    fabHover: '0 12px 32px rgba(124, 111, 255, 0.6), 0 0 48px rgba(124, 111, 255, 0.5)',
    glow: {
      cyan: '0 2px 12px rgba(0, 229, 204, 0.3)',
      pink: '0 2px 12px rgba(255, 107, 157, 0.3)',
      purple: '0 4px 16px rgba(124, 111, 255, 0.4)',
    },
  },
  
  // Transitions
  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    smooth: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Z-index
  zIndex: {
    modal: 101,
    overlay: 100,
    fab: 50,
    bottomNav: 100,
    topBar: 100,
  },
  
  // Layout
  layout: {
    maxWidth: '480px',
    topBarHeight: '88px',
    bottomNavHeight: '70px',
  },
  
  // Backdrop Filter
  backdropFilter: 'blur(20px)',
}

// Helper function to create gradient backgrounds
export const gradients = {
  purple: 'linear-gradient(135deg, #7c6fff 0%, #a78bff 100%)',
  card: 'linear-gradient(to bottom, #ffffff, #fefeff)',
}

// Helper function for component styles
export const componentStyles = {
  card: {
    padding: theme.spacing.xxl,
    background: theme.colors.bgCard,
    backdropFilter: theme.backdropFilter,
    WebkitBackdropFilter: theme.backdropFilter,
    borderRadius: theme.borderRadius.xxxl,
    border: `1px solid ${theme.colors.borderSubtle}`,
    boxShadow: theme.shadows.card,
    transition: theme.transitions.smooth,
  },
  
  cardHover: {
    background: theme.colors.bgCardHover,
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows.cardHover,
  },
  
  button: {
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
    transition: theme.transitions.normal,
    fontFamily: theme.typography.fontFamily,
  },
  
  buttonPrimary: {
    padding: '14px 48px',
    background: 'rgba(124, 111, 255, 0.2)',
    color: theme.colors.accentPurple,
    border: '1px solid rgba(124, 111, 255, 0.35)',
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.typography.h6,
    fontWeight: theme.typography.semiBold,
  },
  
  input: {
    width: '100%',
    padding: '14px',
    border: `1px solid ${theme.colors.borderSubtle}`,
    borderRadius: theme.borderRadius.xl,
    fontSize: theme.typography.body,
    background: theme.colors.bgCardDark,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    outline: 'none',
  },
}

export default theme
