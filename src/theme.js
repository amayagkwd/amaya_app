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
    topBarHeight: '64px',
    bottomNavHeight: '70px',
  },
  
  // Backdrop Filter
  backdropFilter: 'blur(20px)',
  
  // Dashboard specific colors
  dashboardColors: {
    page: '#02050A',
    card: 'rgba(15, 22, 29, 0.92)',
    white: '#F7F8FA',
    muted: '#A8B3C7',
    mutedDark: '#6B7892',
    cyan: '#00E5CC',
    cyanSoft: 'rgba(0, 229, 204, 0.15)',
    violet: '#8B72FF',
    violetSoft: 'rgba(139, 114, 255, 0.18)',
    pink: '#FF6B9D',
    pinkSoft: 'rgba(255, 107, 157, 0.15)',
    border: 'rgba(157, 174, 196, 0.18)',
  },
  
  // Dashboard shadows
  dashboardShadows: {
    card: '0 18px 50px rgba(0, 0, 0, 0.28)',
    cyan: '0 0 30px rgba(0, 229, 204, 0.12)',
  },
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
  
  // Page specific styles
  pageContainer: {
    padding: theme.spacing.xl,
  },
  
  pageHeader: {
    fontSize: theme.typography.h2,
    margin: `0 0 ${theme.spacing.xxl} 0`,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamilyHeading,
    fontWeight: theme.typography.bold,
  },
  
  pageHeaderSimple: {
    fontSize: theme.typography.h2,
    margin: 0,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamilyHeading,
    fontWeight: theme.typography.bold,
  },
  
  // Settings/Profile card container
  settingsCard: {
    background: theme.colors.bgCard,
    backdropFilter: theme.backdropFilter,
    WebkitBackdropFilter: theme.backdropFilter,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    border: `1px solid ${theme.colors.borderSubtle}`,
    boxShadow: theme.shadows.card,
    overflow: 'hidden',
  },
  
  settingsButton: {
    width: '100%',
    padding: theme.spacing.xl,
    background: 'transparent',
    color: theme.colors.textPrimary,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: theme.transitions.normal,
  },
  
  settingsButtonHover: {
    background: 'rgba(255, 255, 255, 0.03)',
  },
  
  settingsTitle: {
    fontSize: theme.typography.h4,
    margin: `0 0 ${theme.spacing.sm} 0`,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.semiBold,
  },
  
  settingsDescription: {
    fontSize: theme.typography.body,
    color: theme.colors.textSecondary,
    margin: 0,
    lineHeight: 1.5,
  },
  
  // Dashboard greeting
  greeting: {
    fontSize: theme.typography.h2,
    margin: '0',
    fontFamily: theme.typography.fontFamilyHeading,
    fontWeight: theme.typography.bold,
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    color: theme.colors.textPrimary,
  },
  
  greetingDate: {
    color: theme.colors.textSecondary,
    margin: `0 0 ${theme.spacing.xxl} 0`,
    fontSize: theme.typography.bodySmall,
    fontWeight: theme.typography.medium,
  },
  
  // Dashboard card styles
  dashboardCard: {
    borderRadius: '28px',
    border: `1px solid ${theme.dashboardColors.border}`,
    boxShadow: theme.dashboardShadows.card,
    boxSizing: 'border-box',
    background: `
      radial-gradient(circle at 100% 0%, rgba(0,229,204,0.055), transparent 34%),
      linear-gradient(145deg, rgba(18,26,34,0.96), rgba(10,16,22,0.98))
    `,
  },
  
  dashboardIconBox: (accent, background) => ({
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    color: accent,
    background,
    boxShadow: `0 0 22px ${background}`,
  }),
  
  // Forecast card
  forecastCard: {
    minHeight: 110,
    position: 'relative',
    overflow: 'hidden',
    padding: '16px',
    borderRadius: '22px',
    border: '1px solid #292d3a',
    background: 'linear-gradient(155deg, #111821 0%, #10141c 100%)',
  },
  
  // Background shine effect (for page backgrounds)
  backgroundShine: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 100% 0%, rgba(0,229,204,0.08) 0%, rgba(0,229,204,0.04) 25%, transparent 50%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
}

export default theme
