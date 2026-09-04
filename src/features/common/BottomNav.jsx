import { useNavigate, useLocation } from 'react-router-dom'
import theme from '../../theme'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const navItems = [
    { id: 'home', label: 'Home', path: '/', icon: '/home-4-svgrepo-com.svg', size: '24px' },
    { id: 'payments', label: 'Payments', path: '/payments', icon: '/currency-inr-bold-svgrepo-com.svg', size: '24px' },
    { id: 'insights', label: 'Insights', path: '/insights', icon: '/insights-svgrepo-com.svg', size: '24px' },
    { id: 'settleup', label: 'Settle Up', path: '/settleup', icon: '/friend-svgrepo-com.svg', size: '24px' },
    { id: 'settings', label: 'Settings', path: '/settings', icon: '/settings-svgrepo-com.svg', size: '22px' }
  ]
  
  const isActive = (path) => location.pathname === path
  
  const handleNavClick = (path) => {
    if (location.pathname === path) {
      return // Already on this page
    }
    
    navigate(path)
  }
  
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: theme.colors.bgSecondary,
      borderTop: 'none',
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      padding: `${theme.spacing.sm} 0 ${theme.spacing.md} 0`,
      maxWidth: theme.layout.maxWidth,
      margin: '0 auto',
      zIndex: theme.zIndex.bottomNav,
      paddingTop: theme.spacing.md
    }}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => handleNavClick(item.path)}
          style={{
            background: 'none',
            border: 'none',
            padding: '0',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            color: isActive(item.path) ? theme.colors.accentPurple : theme.colors.textSecondary,
            transition: theme.transitions.smooth,
            minWidth: '60px',
            position: 'relative',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {/* Top indicator line */}
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isActive(item.path) ? '40px' : '0px',
            height: '4px',
            background: isActive(item.path) ? theme.colors.accentPurple : 'transparent',
            borderRadius: '0 0 4px 4px',
            transition: theme.transitions.smooth,
            boxShadow: isActive(item.path) ? '0 2px 16px rgba(124, 111, 255, 0.8)' : 'none'
          }} />
          
          <img 
            src={item.icon} 
            alt={item.label}
            style={{ 
              width: item.size || '26px', 
              height: item.size || '26px',
              filter: isActive(item.path) 
                ? 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(222deg)'
                : 'brightness(0) invert(1) opacity(0.6)',
              transition: 'all 0.3s ease'
            }} 
          />
          <span style={{ 
            fontWeight: isActive(item.path) ? theme.typography.semiBold : theme.typography.medium,
            letterSpacing: '0.01em',
            color: isActive(item.path) ? theme.colors.accentPurple : theme.colors.textSecondary,
            whiteSpace: 'nowrap',
            fontSize: '10px'
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
