/**
 * Authentication Screen
 * 
 * Handles login and signup in a unified interface
 */

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import theme from '../../theme'

export default function AuthScreen() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [country, setCountry] = useState('India')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)

  const validateEmail = (value) => {
    if (value && !value.includes('@')) {
      setEmailError('Invalid email')
      return false
    } else {
      setEmailError('')
      return true
    }
  }

  const validatePassword = (value) => {
    if (value && value.length < 6) {
      setPasswordError('Requires a longer password')
      return false
    } else {
      setPasswordError('')
      return true
    }
  }

  // Check if form is valid for submission
  const isLoginValid = email.includes('@') && password.length >= 6
  const isSignupValid = name.trim() !== '' && dob !== '' && email.includes('@') && password.length >= 6

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        if (!name || !dob) {
          setError('Please fill in all fields')
          setLoading(false)
          return
        }
        await signUp(email, password, { name, dob, country })
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.bgPrimary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: theme.colors.bgModal,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xxl,
        border: `1px solid ${theme.colors.borderSubtle}`
      }}>
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: theme.spacing.xxl }}>
          <h1 style={{
            fontSize: theme.typography.h1,
            fontWeight: theme.typography.bold,
            color: theme.colors.textPrimary,
            marginBottom: theme.spacing.xs
          }}>
            Payment Tracker
          </h1>
        </div>

        {/* Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.xl
        }}>
          <button
            onClick={() => setMode('login')}
            style={{
              flex: 1,
              padding: theme.spacing.md,
              border: mode === 'login' ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.sm,
              background: mode === 'login' ? theme.colors.accentPurple : theme.colors.bgCardDark,
              color: theme.colors.textPrimary,
              fontSize: theme.typography.body,
              fontWeight: theme.typography.medium,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              padding: theme.spacing.md,
              border: mode === 'signup' ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.sm,
              background: mode === 'signup' ? theme.colors.accentPurple : theme.colors.bgCardDark,
              color: theme.colors.textPrimary,
              fontSize: theme.typography.body,
              fontWeight: theme.typography.medium,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.md,
                  background: theme.colors.bgPrimary,
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.body,
                  fontFamily: theme.typography.fontFamily
                }}
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.md,
                  background: theme.colors.bgPrimary,
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.body,
                  fontFamily: theme.typography.fontFamily
                }}
              />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.md,
                  background: theme.colors.bgPrimary,
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.body,
                  fontFamily: theme.typography.fontFamily
                }}
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </>
          )}

          <div style={{ marginBottom: theme.spacing.md }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
              }}
              onBlur={(e) => {
                setEmailTouched(true)
                validateEmail(e.target.value)
              }}
              required
              style={{
                width: '100%',
                padding: theme.spacing.md,
                border: `1px solid ${emailError ? '#ff6b9d' : theme.colors.borderSubtle}`,
                borderRadius: theme.borderRadius.md,
                background: theme.colors.bgPrimary,
                color: theme.colors.textPrimary,
                fontSize: theme.typography.body,
                fontFamily: theme.typography.fontFamily
              }}
            />
            {emailTouched && emailError && (
              <div style={{
                color: '#ff6b9d',
                fontSize: theme.typography.bodySmall,
                marginTop: theme.spacing.xs
              }}>
                {emailError}
              </div>
            )}
          </div>
          <div style={{ marginBottom: theme.spacing.md }}>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  validatePassword(e.target.value)
                }}
                onBlur={(e) => validatePassword(e.target.value)}
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  paddingRight: '40px',
                  border: `1px solid ${passwordError ? '#ff6b9d' : theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.md,
                  background: theme.colors.bgPrimary,
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.body,
                  fontFamily: theme.typography.fontFamily
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.colors.textSecondary,
                  fontSize: '16px'
                }}
              >
                {showPassword ? '👁️' : '👁️'}
              </button>
            </div>
            {passwordError && (
              <div style={{
                color: '#ff6b9d',
                fontSize: theme.typography.bodySmall,
                marginTop: theme.spacing.xs
              }}>
                {passwordError}
              </div>
            )}
          </div>

          {mode === 'login' && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: theme.spacing.lg
            }}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  fontSize: theme.typography.bodySmall,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div style={{
              padding: theme.spacing.md,
              marginBottom: theme.spacing.md,
              background: theme.colors.expense + '20',
              border: `1px solid ${theme.colors.expense}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.expense,
              fontSize: theme.typography.bodySmall
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'login' ? !isLoginValid : !isSignupValid)}
            style={{
              width: '100%',
              padding: theme.spacing.md,
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              background: theme.colors.accentPurple,
              color: theme.colors.textPrimary,
              fontSize: theme.typography.body,
              fontWeight: theme.typography.medium,
              cursor: (loading || (mode === 'login' ? !isLoginValid : !isSignupValid)) ? 'not-allowed' : 'pointer',
              opacity: (loading || (mode === 'login' ? !isLoginValid : !isSignupValid)) ? 0.4 : 1,
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>


      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div 
          onClick={() => setShowForgotPassword(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: theme.colors.bgModal,
              backdropFilter: theme.backdropFilter,
              WebkitBackdropFilter: theme.backdropFilter,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.xl,
              border: `1px solid ${theme.colors.borderSubtle}`,
              maxWidth: '300px',
              textAlign: 'center'
            }}
          >
            <p style={{
              fontSize: theme.typography.body,
              color: theme.colors.textPrimary,
              marginBottom: theme.spacing.md
            }}>
              Send Amaya 10 rupees and contact him 😝
            </p>
            <button
              onClick={() => setShowForgotPassword(false)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                border: 'none',
                borderRadius: theme.borderRadius.sm,
                background: theme.colors.accentPurple,
                color: theme.colors.textPrimary,
                fontSize: theme.typography.bodySmall,
                fontWeight: theme.typography.medium,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
