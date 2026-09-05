import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import theme, { componentStyles } from '../../theme'
import * as DataRepository from '../../repositories/dataRepository'

export default function BudgetSetup({ data, updateStore }) {
  const navigate = useNavigate()
  
  const existingBudget = data.settings?.budget || null
  
  const [mode, setMode] = useState(existingBudget?.mode || 'spend')
  const [amount, setAmount] = useState(existingBudget?.amount?.toString() || '')
  const [isEnabled, setIsEnabled] = useState(existingBudget?.enabled || false)

  const saveBudget = async (enabled, budgetMode, budgetAmount) => {
    const updatedSettings = {
      ...data.settings,
      budget: {
        enabled: enabled,
        mode: budgetMode,
        amount: parseFloat(budgetAmount) || 0
      }
    }
    
    // Save to Supabase
    try {
      await DataRepository.updateSettings(updatedSettings)
    } catch (error) {
      console.error('Error updating budget in Supabase:', error)
    }
    
    updateStore(current => ({
      ...current,
      settings: updatedSettings
    }))
  }

  return (
    <>
      <div style={componentStyles.backgroundShine} />
      
      <div style={{ ...componentStyles.pageContainer, position: 'relative', zIndex: 1 }}>
        <h2 style={componentStyles.pageHeader}>Set Monthly Budget</h2>

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
                onChange={(e) => {
                  const newValue = e.target.checked
                  setIsEnabled(newValue)
                  // Save immediately when toggling
                  saveBudget(newValue, mode, amount)
                }}
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
                onClick={() => {
                  setMode('spend')
                  saveBudget(isEnabled, 'spend', amount)
                }}
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
                onClick={() => {
                  setMode('keep')
                  saveBudget(isEnabled, 'keep', amount)
                }}
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
                    onBlur={(e) => saveBudget(isEnabled, mode, e.target.value)}
                    onKeyDown={(e) => {
                      // Prevent arrow keys from changing the value
                      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        e.preventDefault()
                      }
                    }}
                    onWheel={(e) => {
                      // Prevent scroll from changing the value
                      e.target.blur()
                    }}
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
      </div>
    </>
  )
}
