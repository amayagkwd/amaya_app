import { useState } from 'react'
import { getCurrencyByCountry } from '../../utils/countries'
import theme from '../../theme'

export default function InitialBalanceModal({ onComplete, onSkip, country }) {
  const [amount, setAmount] = useState('')
  const currencySymbol = getCurrencyByCountry(country)
  
  const canSave = amount && parseFloat(amount) >= 0
  
  const handleSave = () => {
    if (canSave) {
      onComplete(parseFloat(amount))
    }
  }
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: theme.colors.bgModal,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        borderRadius: theme.borderRadius.xxxl,
        padding: '40px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: theme.shadows.strong,
        border: `1px solid ${theme.colors.borderMedium}`
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            💰
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: theme.typography.semiBold,
            color: theme.colors.textPrimary,
            margin: '0 0 8px 0'
          }}>
            Initial Balance
          </h2>
          <p style={{
            fontSize: theme.typography.h6,
            color: theme.colors.textSecondary,
            margin: 0,
            lineHeight: '1.5'
          }}>
            Enter your current balance to start tracking your finances
          </p>
        </div>
        
        <div style={{
          position: 'relative',
          marginBottom: '24px'
        }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: theme.typography.body,
            color: theme.colors.textPrimary,
            fontWeight: theme.typography.medium
          }}>
            Current Balance
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              placeholder="0"
              style={{
                width: '100%',
                padding: '16px 16px 16px 40px',
                border: `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: theme.borderRadius.lg,
                fontSize: theme.typography.h4,
                fontWeight: theme.typography.semiBold,
                color: theme.colors.textPrimary,
                boxSizing: 'border-box',
                background: theme.colors.bgCardDark,
                outline: 'none'
              }}
            />
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: theme.typography.h4,
              fontWeight: theme.typography.semiBold,
              color: theme.colors.textSecondary
            }}>
              {currencySymbol}
            </span>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <button
            type="button"
            onClick={onSkip}
            style={{
              flex: 1,
              padding: '16px',
              background: 'transparent',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.h5,
              fontWeight: theme.typography.medium,
              cursor: 'pointer',
              transition: theme.transitions.fast
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.colors.borderMedium
              e.currentTarget.style.color = theme.colors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.colors.borderSubtle
              e.currentTarget.style.color = theme.colors.textSecondary
            }}
          >
            Skip
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            style={{
              flex: 1,
              padding: '16px',
              background: canSave ? theme.colors.accentPurple : 'rgba(255, 255, 255, 0.1)',
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.h5,
              fontWeight: theme.typography.semiBold,
              cursor: canSave ? 'pointer' : 'not-allowed',
              transition: theme.transitions.fast,
              boxShadow: canSave ? theme.shadows.glow.purple : 'none',
              opacity: canSave ? 1 : 0.5
            }}
            onMouseDown={(e) => {
              if (canSave) {
                e.currentTarget.style.transform = 'scale(0.98)'
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
