import { useNavigate, useLocation } from 'react-router-dom'

export default function TopBar({ onMenuClick, appName }) {
  const navigate = useNavigate()
  const location = useLocation()
  const showBackButton = location.pathname !== '/'
  
  return (
    <div style={{
      height: '60px',
      background: '#fff',
      borderBottom: '1px solid #e5e5e3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
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
        <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#1a1a1a', margin: 0 }}>{appName || 'AMAYA'}</h1>
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
          gap: '4px'
        }}
      >
        <div style={{ width: '24px', height: '2px', background: '#1a1a1a' }} />
        <div style={{ width: '24px', height: '2px', background: '#1a1a1a' }} />
        <div style={{ width: '24px', height: '2px', background: '#1a1a1a' }} />
      </button>
    </div>
  )
}
