/**
 * Migration Modal
 * 
 * Offers to migrate localStorage data to Supabase after authentication
 */

import { useState } from 'react'
import theme from '../../theme'

export default function MigrationModal({ onMigrate, onSkip }) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  const [migrating, setMigrating] = useState(false)

  const handleMigrate = async () => {
    setMigrating(true)
    await onMigrate()
    setMigrating(false)
  }

  const handleSkipClick = () => {
    setShowSkipWarning(true)
  }

  const handleConfirmSkip = () => {
    // Note: We won't actually delete data, just skip migration
    onSkip()
  }

  const handleCancelSkip = () => {
    setShowSkipWarning(false)
  }

  if (migrating) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.colors.bgPrimary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        zIndex: theme.zIndex.modal
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: `3px solid ${theme.colors.borderSubtle}`,
          borderTop: `3px solid ${theme.colors.accentPurple}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: theme.spacing.xl
        }} />
        <h2 style={{
          fontSize: theme.typography.h3,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.sm,
          textAlign: 'center'
        }}>
          1 moment please
        </h2>
        <p style={{
          fontSize: theme.typography.body,
          color: theme.colors.textSecondary,
          textAlign: 'center',
          maxWidth: '320px'
        }}>
          Now you will be able to access your data using any device with your account
        </p>
        <p style={{
          fontSize: theme.typography.bodySmall,
          color: theme.colors.textMuted,
          marginTop: theme.spacing.md
        }}>
          Migrating data...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  if (showSkipWarning) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
        zIndex: theme.zIndex.modal
      }}>
        <div style={{
          background: theme.colors.bgModal,
          backdropFilter: theme.backdropFilter,
          WebkitBackdropFilter: theme.backdropFilter,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing.xxl,
          maxWidth: '400px',
          width: '100%',
          border: `1px solid ${theme.colors.borderSubtle}`
        }}>
          <h2 style={{
            fontSize: theme.typography.h3,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.lg,
            textAlign: 'center'
          }}>
            Are you sure?
          </h2>
          <p style={{
            fontSize: theme.typography.body,
            color: theme.colors.textSecondary,
            lineHeight: 1.6,
            marginBottom: theme.spacing.xl,
            textAlign: 'center'
          }}>
            This means all your local storage and previous transactions will be deleted and this isn't reversible. You will start from scratch.
          </p>
          
          <div style={{
            display: 'flex',
            gap: theme.spacing.md,
            marginTop: theme.spacing.xl
          }}>
            <button
              onClick={handleCancelSkip}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: theme.borderRadius.sm,
                background: theme.colors.bgCardDark,
                color: theme.colors.textPrimary,
                fontSize: theme.typography.body,
                fontWeight: theme.typography.medium,
                cursor: 'pointer'
              }}
            >
              No
            </button>
            <button
              onClick={handleConfirmSkip}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                border: 'none',
                borderRadius: theme.borderRadius.sm,
                background: '#ff6b9d',
                color: theme.colors.textPrimary,
                fontSize: theme.typography.body,
                fontWeight: theme.typography.medium,
                cursor: 'pointer'
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: theme.colors.bgPrimary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      zIndex: theme.zIndex.modal
    }}>
      <div style={{
        background: theme.colors.bgModal,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xxl,
        maxWidth: '400px',
        width: '100%',
        border: `1px solid ${theme.colors.borderSubtle}`
      }}>
        <h1 style={{
          fontSize: theme.typography.h2,
          fontWeight: theme.typography.bold,
          color: theme.colors.textPrimary,
          marginBottom: theme.spacing.md,
          textAlign: 'center'
        }}>
          We found previous data
        </h1>
        <p style={{
          fontSize: theme.typography.body,
          color: theme.colors.textSecondary,
          lineHeight: 1.6,
          marginBottom: theme.spacing.xl,
          textAlign: 'center'
        }}>
          Would you like to use this?
        </p>
        
        <div style={{
          display: 'flex',
          gap: theme.spacing.md,
          marginTop: theme.spacing.xl
        }}>
          <button
            onClick={handleSkipClick}
            style={{
              flex: 1,
              padding: theme.spacing.md,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.sm,
              background: theme.colors.bgCardDark,
              color: theme.colors.textPrimary,
              fontSize: theme.typography.body,
              fontWeight: theme.typography.medium,
              cursor: 'pointer'
            }}
          >
            Skip
          </button>
          <button
            onClick={handleMigrate}
            style={{
              flex: 1,
              padding: theme.spacing.md,
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              background: theme.colors.accentPurple,
              color: theme.colors.textPrimary,
              fontSize: theme.typography.body,
              fontWeight: theme.typography.medium,
              cursor: 'pointer'
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  )
}
