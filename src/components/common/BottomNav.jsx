import { useNavigate, useLocation } from 'react-router-dom'
import theme from '../../theme'

export default function BottomNav({ activeCards }) {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Build nav items based on active cards
  const navItems = [
    { id: 'home', label: 'Home', path: '/', icon: '/home-svgrepo-com.svg', alwaysShow: true }
  ]
  
  if (activeCards.includes('payments')) {
    navItems.push({ id: 'payments', label: 'Payments', path: '/payments', icon: '/currency-inr-bold-svgrepo-com.svg' })
  }
  
  if (activeCards.includes('maps')) {
    navItems.push({ id: 'maps', label: 'Maps', path: '/maps', icon: '/map-pin-alt-svgrepo-com.svg' })
  }
  
  if (activeCards.includes('weather')) {
    navItems.push({ id: 'weather', label: 'Weather', path: '/weather', icon: '/weather-9-svgrepo-com.svg' })
  }
  
  if (activeCards.includes('counter')) {
    navItems.push({ id: 'counter', label: 'Counter', path: '/counter', icon: '🔢' })
  }
  
  const isActive = (path) => location.pathname === path
  
  const handleNavClick = (path) => {
    if (path === '/') {
      // When navigating to home from another page, replace to avoid back button going to that page
      if (location.pathname !== '/') {
        navigate('/', { replace: true })
      }
    } else {
      // For other nav items, use normal navigation so phone back button works
      if (location.pathname !== path) {
        navigate(path)
      }
    }
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
            minWidth: '70px',
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
          
          {item.icon.startsWith('/') ? (
            <img 
              src={item.icon} 
              alt={item.label}
              style={{ 
                width: '26px', 
                height: '26px',
                filter: isActive(item.path) 
                  ? 'invert(61%) sepia(52%) saturate(3187%) hue-rotate(222deg) brightness(102%) contrast(101%)'
                  : 'invert(60%) sepia(10%) saturate(500%) hue-rotate(194deg) brightness(95%) contrast(85%)',
                transition: 'all 0.3s ease'
              }} 
            />
          ) : (
            <span style={{ 
              fontSize: '26px',
              filter: isActive(item.path) ? 'drop-shadow(0 0 8px rgba(124, 111, 255, 0.6))' : 'none',
              transition: 'all 0.3s ease'
            }}>
              {item.icon}
            </span>
          )}
          <span style={{ 
            fontSize: theme.typography.tiny, 
            fontWeight: isActive(item.path) ? theme.typography.semiBold : theme.typography.medium,
            letterSpacing: '0.01em',
            color: isActive(item.path) ? theme.colors.accentPurple : theme.colors.textSecondary
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
