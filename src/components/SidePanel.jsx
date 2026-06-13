import { useNavigate } from 'react-router-dom'

export default function SidePanel({ isOpen, onClose, hasWeatherCard, hasCounterCard }) {
  const navigate = useNavigate()
  
  const handleNavigate = (path) => {
    navigate(path)
    onClose()
  }
  
  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 200
          }}
        />
      )}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '75%',
        maxWidth: '360px',
        background: '#fff',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        zIndex: 201,
        overflowY: 'auto',
        padding: '20px'
      }}>
        <MenuItem label="Profile" onClick={() => handleNavigate('/profile')} />
        <MenuItem label="Payments" onClick={() => handleNavigate('/payments')} />
        <MenuItem label="Maps" onClick={() => handleNavigate('/maps')} />
        {hasWeatherCard && (
          <MenuItem label="Weather" onClick={() => handleNavigate('/weather')} />
        )}
        {hasCounterCard && (
          <MenuItem label="Counter" onClick={() => handleNavigate('/counter')} />
        )}
      </div>
    </>
  )
}

function MenuItem({ label, onClick, disabled, subtitle }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '16px',
        marginTop: '16px',
        background: '#f9f9f7',
        border: 'none',
        borderRadius: '8px',
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: '16px'
      }}
    >
      {label}
      {subtitle && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{subtitle}</div>}
    </button>
  )
}
