import { useNavigate, useLocation } from 'react-router-dom'

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
      // When navigating to home, replace current entry and clear forward history
      navigate('/', { replace: true })
    } else {
      // For other nav items, replace to avoid stacking
      navigate(path, { replace: true })
    }
  }
  
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid #e5e5e3',
      display: 'flex',
      justifyContent: 'space-evenly',
      alignItems: 'center',
      padding: '8px 0',
      maxWidth: '480px',
      margin: '0 auto',
      zIndex: 100
    }}>
      {navItems.map(item => (
        <button
          key={item.id}
          onClick={() => handleNavClick(item.path)}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: isActive(item.path) ? '#4f46e5' : '#6b7280',
            transition: 'color 0.2s',
            minWidth: '60px'
          }}
        >
          {item.icon.startsWith('/') ? (
            <img 
              src={item.icon} 
              alt={item.label}
              style={{ 
                width: '20px', 
                height: '20px',
                filter: isActive(item.path) 
                  ? 'invert(32%) sepia(94%) saturate(1945%) hue-rotate(231deg) brightness(91%) contrast(91%)'
                  : 'invert(47%) sepia(8%) saturate(562%) hue-rotate(182deg) brightness(93%) contrast(88%)'
              }} 
            />
          ) : (
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
          )}
          <span style={{ 
            fontSize: '11px', 
            fontWeight: isActive(item.path) ? 600 : 400 
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  )
}
