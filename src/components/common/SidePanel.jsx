import { useNavigate } from 'react-router-dom'
import theme from '../../theme'

export default function SidePanel({ isOpen, onClose }) {
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
            background: 'rgba(0,0,0,0.7)',
            zIndex: 200
          }}
        />
      )}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '240px',
        maxWidth: '240px',
        background: theme.colors.bgModal,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: theme.transitions.normal,
        zIndex: 201,
        overflowY: 'auto',
        padding: theme.spacing.xl,
        borderLeft: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: theme.shadows.strong
      }}>
        <MenuItem label="Profile" onClick={() => handleNavigate('/profile')} />
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
        padding: theme.spacing.lg,
        marginTop: theme.spacing.lg,
        background: theme.colors.bgCard,
        border: `1px solid ${theme.colors.borderSubtle}`,
        borderRadius: theme.borderRadius.sm,
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontSize: theme.typography.h5,
        color: theme.colors.textPrimary,
        fontWeight: theme.typography.medium
      }}
    >
      {label}
      {subtitle && <div style={{ fontSize: theme.typography.caption, color: theme.colors.textSecondary, marginTop: '4px' }}>{subtitle}</div>}
    </button>
  )
}
