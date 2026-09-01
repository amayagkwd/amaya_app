import theme from '../../theme'

export default function AddTransactionTip({ onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      {/* Semi-transparent overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          pointerEvents: 'auto'
        }}
        onClick={onDismiss}
      />

      {/* Tooltip pointing to add button */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(68px + 56px + 32px)', // Bottom nav height + button height + spacing
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '12px',
          pointerEvents: 'auto',
          zIndex: 10000
        }}
      >
        {/* Message box */}
        <div
          style={{
            background: theme.colors.bgModal,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            padding: '16px 20px',
            borderRadius: theme.borderRadius.xl,
            boxShadow: theme.shadows.strong,
            border: `1px solid ${theme.colors.borderMedium}`,
            maxWidth: '220px'
          }}
        >
          <p
            style={{
              margin: '0 0 16px 0',
              fontSize: theme.typography.h6,
              fontWeight: theme.typography.medium,
              color: theme.colors.textPrimary,
              lineHeight: '1.4',
              textAlign: 'center'
            }}
          >
            Tap here to enter transactions
          </p>
          
          <button
            onClick={onDismiss}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: theme.colors.accentPurple,
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.body,
              fontWeight: theme.typography.semiBold,
              cursor: 'pointer',
              boxShadow: theme.shadows.glow.purple,
              transition: theme.transitions.fast
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Got it!
          </button>
        </div>

        {/* Curved arrow pointing down to the button */}
        <svg
          width="60"
          height="40"
          viewBox="0 0 60 40"
          fill="none"
          style={{
            marginRight: '8px',
            filter: 'drop-shadow(0 2px 8px rgba(124, 111, 255, 0.3))'
          }}
        >
          <path
            d="M 10 5 Q 30 5, 40 20 T 50 35"
            stroke={theme.colors.accentPurple}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
          {/* Arrow head */}
          <path
            d="M 50 35 L 45 30 M 50 35 L 47 40"
            stroke={theme.colors.accentPurple}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
