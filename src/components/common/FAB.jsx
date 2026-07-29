import theme from '../../theme'

export default function FAB({ onClick, icon = '+' }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c6fff 0%, #a78bff 100%)',
        border: 'none',
        color: '#fff',
        fontSize: '28px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.fab,
        transition: theme.transitions.smooth,
        fontWeight: theme.typography.light,
        lineHeight: 1,
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      {icon}
    </button>
  )
}
