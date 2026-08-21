import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'
import theme, { componentStyles } from '../../theme'

export default function BudgetSetup({ data, updateStore }) {
  const navigate = useNavigate()
  
  const existingBudget = data.settings?.budget || null
  
  const [mode, setMode] = useState(existingBudget?.mode || 'spend')
  const [amount, setAmount] = useState(existingBudget?.amount?.toString() || '')
  const [isEnabled, setIsEnabled] = useState(existingBudget?.enabled || false)

  const handleSave = () => {
    if (isEnabled && (!amount || parseFloat(amount) <= 0)) {
      // Don't save if budget is enabled but amount is invalid
      return
    }

    updateStore(current => ({
      ...current,
      settings: {
        ...current.settings,
        budget: {
          enabled: isEnabled,
          mode: mode,
          amount: parseFloat(amount) || 0
        }
      }
    }))

    navigate('/settings')
  }

  return (
    <>
      <div style={componentStyles.backgroundShine} />
      
      <div style={{ ...componentStyles.pageContainer, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/settings')}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              padding: '8px',
              marginLeft: '-8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h2 style={{ ...componentStyles.pageHeader, margin: '0 0 0 8px' }}>Set Monthly Budget</h2>
        </div>

        {/* Enable/Disable Toggle */}
        <div style={componentStyles.settingsCard}>
          <div style={{
            ...componentStyles.settingsButton,
            cursor: 'default'
          }}>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <h3 style={componentStyles.settingsTitle}>
                Enable Budget Tracking
              </h3>
              <p style={componentStyles.settingsDescription}>
                Track your daily spending allowance
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                style={{ display: 'none' }}
              />
              <div style={{
                width: '48px',
                height: '28px',
                borderRadius: '14px',
                background: isEnabled ? theme.colors.accentPurple : theme.colors.bgCardDark,
                position: 'relative',
                transition: theme.transitions.normal,
                border: `1px solid ${isEnabled ? theme.colors.accentPurple : theme.colors.borderSubtle}`
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: theme.colors.textPrimary,
                  position: 'absolute',
                  top: '3px',
                  left: isEnabled ? '24px' : '3px',
                  transition: theme.transitions.normal,
                  boxShadow: theme.shadows.card
                }} />
              </div>
            </label>
          </div>
        </div>

        {isEnabled && (
          <>
            {/* Mode Selection */}
            <div style={componentStyles.settingsCard}>
              <h3 style={{
                ...componentStyles.settingsTitle,
                padding: '0 16px 12px 16px',
                margin: 0
              }}>
                Budget Mode
              </h3>

              <button
                onClick={() => setMode('spend')}
                style={{
                  ...componentStyles.settingsButton,
                  background: mode === 'spend' ? 'rgba(124, 111, 255, 0.15)' : 'transparent',
                  borderTop: `1px solid ${theme.colors.borderSubtle}`
                }}
                onMouseEnter={(e) => {
                  if (mode !== 'spend') {
                    Object.assign(e.currentTarget.style, componentStyles.settingsButtonHover)
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== 'spend') {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ ...componentStyles.settingsTitle, margin: 0 }}>
                      Spend X
                    </h3>
                    {mode === 'spend' && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: theme.colors.accentPurple,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p style={componentStyles.settingsDescription}>
                    Fixed monthly spending cap
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMode('keep')}
                style={{
                  ...componentStyles.settingsButton,
                  background: mode === 'keep' ? 'rgba(124, 111, 255, 0.15)' : 'transparent',
                  borderTop: `1px solid ${theme.colors.borderSubtle}`
                }}
                onMouseEnter={(e) => {
                  if (mode !== 'keep') {
                    Object.assign(e.currentTarget.style, componentStyles.settingsButtonHover)
                  }
                }}
                onMouseLeave={(e) => {
                  if (mode !== 'keep') {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ ...componentStyles.settingsTitle, margin: 0 }}>
                      Keep Balance X
                    </h3>
                    {mode === 'keep' && (
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: theme.colors.accentPurple,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p style={componentStyles.settingsDescription}>
                    Maintain a minimum savings balance
                  </p>
                </div>
              </button>
            </div>

            {/* Amount Input */}
            <div style={componentStyles.settingsCard}>
              <div style={{ padding: '16px' }}>
                <h3 style={{ ...componentStyles.settingsTitle, margin: '0 0 4px 0' }}>
                  {mode === 'spend' ? 'Monthly Spend Limit' : 'Savings Goal Balance'}
                </h3>
                <p style={{ ...componentStyles.settingsDescription, marginBottom: '12px' }}>
                  {mode === 'spend' 
                    ? 'Set your total spending limit for the month'
                    : 'Set the minimum balance you want to maintain'}
                </p>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: theme.colors.bgCardDark,
                  border: `1px solid ${theme.colors.borderMedium}`,
                  borderRadius: theme.borderRadius.xl,
                  padding: '12px 16px',
                  fontSize: '20px',
                  fontWeight: 700
                }}>
                  <span style={{ color: theme.colors.textSecondary, marginRight: '8px' }}>
                    {data.profile.country === 'India' ? '₹' : '$'}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    style={{
                      flex: 1,
                      background: 'none',
                      border: 'none',
                      color: theme.colors.textPrimary,
                      fontSize: '20px',
                      fontWeight: 700,
                      outline: 'none',
                      fontFamily: theme.typography.fontFamily
                    }}
                  />
                </div>
                
                {isEnabled && (!amount || parseFloat(amount) <= 0) && (
                  <p style={{
                    marginTop: '8px',
                    fontSize: theme.typography.bodySmall,
                    color: theme.colors.accentPink,
                    margin: '8px 0 0 0'
                  }}>
                    Please enter a limit
                  </p>
                )}
              </div>
            </div>

            {/* Explanation Card */}
            <div style={{
              ...componentStyles.settingsCard,
              background: 'rgba(124, 111, 255, 0.08)',
              border: `1px solid rgba(124, 111, 255, 0.25)`
            }}>
              <div style={{ padding: '16px' }}>
                <h3 style={{ ...componentStyles.settingsTitle, margin: '0 0 4px 0', color: theme.colors.accentPurple }}>
                  How it works
                </h3>
                <p style={{ ...componentStyles.settingsDescription, lineHeight: 1.6 }}>
                  {mode === 'spend' 
                    ? 'Your daily allowance is calculated by dividing your remaining budget by days left in the month. Overspending one day reduces your allowance for the rest of the month.'
                    : 'Your daily allowance is based on current balance minus your savings goal. Getting extra income increases your daily allowance automatically.'}
                </p>
              </div>
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%',
            padding: '14px',
            marginTop: '20px',
            background: theme.colors.accentPurple,
            color: theme.colors.textPrimary,
            border: 'none',
            borderRadius: theme.borderRadius.xl,
            fontSize: theme.typography.h5,
            fontWeight: theme.typography.semiBold,
            cursor: 'pointer',
            transition: theme.transitions.normal,
            boxShadow: theme.shadows.glow.purple
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(124, 111, 255, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = theme.shadows.glow.purple
          }}
        >
          Save
        </button>
      </div>
    </>
  )
}
