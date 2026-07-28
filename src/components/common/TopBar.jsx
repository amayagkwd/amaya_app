import { useNavigate, useLocation } from 'react-router-dom'
import theme from '../../theme'

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const showBackButton = location.pathname !== '/'
  
  return (
    <div style={{
      minHeight: theme.layout.topBarHeight,
      background: theme.colors.bgSecondary,
      borderBottom: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: `${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing.xl}`,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: theme.zIndex.topBar,
      maxWidth: theme.layout.maxWidth,
      margin: '0 auto'
    }}>
      {showBackButton ? (
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            fontSize: '24px',
            color: '#ffffff',
            position: 'absolute',
            left: '20px'
          }}
        >
          ←
        </button>
      ) : null}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: theme.typography.h4, 
          fontWeight: theme.typography.bold, 
          color: theme.colors.textPrimary, 
          margin: 0,
          fontFamily: theme.typography.fontFamilyHeading,
          letterSpacing: '0.1em',
          lineHeight: 1.4,
          textTransform: 'uppercase'
        }}>
          Tracker
        </h1>
        <p style={{ 
          fontSize: theme.typography.micro, 
          color: theme.colors.textSecondary,
          margin: '4px 0 0 0',
          fontWeight: theme.typography.medium,
          letterSpacing: '0.15em',
          textTransform: 'uppercase'
        }}>
          This application has no limitation
        </p>
      </div>
      {!showBackButton && (
        <button
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            opacity: 0.6,
            transition: 'opacity 0.2s',
            position: 'absolute',
            right: '20px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
        >
          <div style={{ width: '22px', height: '2.5px', background: '#ffffff', borderRadius: '2px' }} />
          <div style={{ width: '22px', height: '2.5px', background: '#ffffff', borderRadius: '2px' }} />
          <div style={{ width: '22px', height: '2.5px', background: '#ffffff', borderRadius: '2px' }} />
        </button>
      )}
    </div>
  )
}
