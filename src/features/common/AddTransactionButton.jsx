import theme from '../../theme'

export default function AddTransactionButton({ onClick, mode = 'transaction' }) {
  return (
    <button
      id="tutorial-add-button"
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: 'calc(68px + 16px)',
        right: '20px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #7c6fff, #9d8fff)',
        color: '#ffffff',
        border: 'none',
        fontSize: '24px',
        fontWeight: 300,
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(124, 111, 255, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.fab,
        transition: 'all 0.3s ease',
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.1)'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(124, 111, 255, 0.6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(124, 111, 255, 0.5)'
      }}
    >
      +
    </button>
  )
}
