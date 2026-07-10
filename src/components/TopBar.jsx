import { useNavigate, useLocation } from 'react-router-dom'

export default function TopBar({ onMenuClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const showBackButton = location.pathname !== '/'
  
  return (
    <div style={{
      minHeight: '70px',
      background: '#fff',
      borderBottom: '1px solid #e5e5e3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      maxWidth: '480px',
      margin: '0 auto'
    }}>
      {showBackButton ? (
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            fontSize: '24px',
            color: '#1a1a1a'
          }}
        >
          ←
        </button>
      ) : (
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: '22px', 
            fontWeight: 700, 
            color: '#1a1a1a', 
            margin: 0,
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            letterSpacing: '-0.01em',
            lineHeight: 1.2
          }}>
            Tracker
          </h1>
          <p style={{ 
            fontSize: '13px', 
            color: '#64748b',
            margin: '2px 0 0 0',
            fontStyle: 'italic',
            fontWeight: 400,
            letterSpacing: '0.01em'
          }}>
            This application has no limitation.
          </p>
        </div>
      )}
      <button
        onClick={onMenuClick}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          opacity: 0.5,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
      >
        <div style={{ width: '20px', height: '2px', background: '#6b7280', borderRadius: '1px' }} />
        <div style={{ width: '20px', height: '2px', background: '#6b7280', borderRadius: '1px' }} />
        <div style={{ width: '20px', height: '2px', background: '#6b7280', borderRadius: '1px' }} />
      </button>
    </div>
  )
}
