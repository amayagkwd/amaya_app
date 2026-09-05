import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import theme, { componentStyles } from '../../theme'
import * as DataRepository from '../../repositories/dataRepository'

export default function Profile({ data, updateStore }) {
  const { signOut, user } = useAuth()
  const [saved, setSaved] = useState({})
  const [editing, setEditing] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [loggingOut, setLoggingOut] = useState(false)
  
  const handleEdit = (field) => {
    setEditing(field)
    setEditValues({ [field]: data.profile[field] })
  }
  
  const handleSave = async (field) => {
    const updatedProfile = { ...data.profile, [field]: editValues[field] }
    
    // Save to Supabase
    try {
      await DataRepository.updateProfile(updatedProfile)
    } catch (error) {
      console.error('Error updating profile in Supabase:', error)
    }
    
    updateStore(current => ({
      ...current,
      profile: updatedProfile
    }))
    setEditing(null)
    setSaved({ ...saved, [field]: true })
    setTimeout(() => setSaved(s => ({ ...s, [field]: false })), 1000)
  }
  
  const handleCancel = () => {
    setEditing(null)
    setEditValues({})
  }
  
  const handleLogout = async () => {
    if (!confirm('Are you sure you want to logout?')) return
    
    setLoggingOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
      alert('Failed to logout. Please try again.')
      setLoggingOut(false)
    }
  }
  
  return (
    <div style={componentStyles.pageContainer}>
      <h2 style={componentStyles.pageHeader}>Profile</h2>
      
      {user && (
        <div style={{
          padding: theme.spacing.md,
          marginBottom: theme.spacing.lg,
          background: theme.colors.bgCardDark,
          borderRadius: theme.borderRadius.md,
          border: `1px solid ${theme.colors.borderSubtle}`
        }}>
          <div style={{
            fontSize: theme.typography.bodySmall,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xs
          }}>
            Logged in as
          </div>
          <div style={{
            fontSize: theme.typography.body,
            color: theme.colors.textPrimary
          }}>
            {user.email}
          </div>
        </div>
      )}
      
      <ProfileField
        label="Name"
        value={data.profile.name}
        isEditing={editing === 'name'}
        editValue={editValues.name}
        onEditValueChange={(val) => setEditValues({ ...editValues, name: val })}
        onEdit={() => handleEdit('name')}
        onSave={() => handleSave('name')}
        onCancel={handleCancel}
        saved={saved.name}
      />
      
      <ProfileField
        label="Date of Birth"
        value={data.profile.dob}
        isEditing={editing === 'dob'}
        editValue={editValues.dob}
        onEditValueChange={(val) => setEditValues({ ...editValues, dob: val })}
        onEdit={() => handleEdit('dob')}
        onSave={() => handleSave('dob')}
        onCancel={handleCancel}
        saved={saved.dob}
        type="date"
        displayValue={data.profile.dob ? new Date(data.profile.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : data.profile.dob}
      />
      
      <ProfileField
        label="Country"
        value={data.profile.country}
        isEditing={editing === 'country'}
        editValue={editValues.country}
        onEditValueChange={(val) => setEditValues({ ...editValues, country: val })}
        onEdit={() => handleEdit('country')}
        onSave={() => handleSave('country')}
        onCancel={handleCancel}
        saved={saved.country}
      />
      
      {/* Logout Button */}
      <div style={{ marginTop: theme.spacing.xxl }}>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            width: '100%',
            padding: theme.spacing.lg,
            background: '#ff6b9d',
            color: theme.colors.textPrimary,
            border: 'none',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.body,
            fontWeight: theme.typography.medium,
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            opacity: loggingOut ? 0.6 : 1,
            transition: 'opacity 0.2s',
            fontFamily: theme.typography.fontFamily
          }}
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  )
}

function ProfileField({ label, value, isEditing, editValue, onEditValueChange, onEdit, onSave, onCancel, saved, type = 'text', displayValue }) {
  return (
    <div style={{
      background: theme.colors.bgCard,
      backdropFilter: theme.backdropFilter,
      WebkitBackdropFilter: theme.backdropFilter,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      border: saved ? `2px solid ${theme.colors.success}` : `1px solid ${theme.colors.borderSubtle}`,
      transition: theme.transitions.normal,
      boxShadow: theme.shadows.card
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs }}>
        <label style={{ fontSize: theme.typography.body, color: theme.colors.textSecondary, fontWeight: theme.typography.medium }}>
          {label}
        </label>
        {!isEditing && (
          <button
            onClick={onEdit}
            style={{
              background: 'none',
              border: 'none',
              color: theme.colors.accentPurple,
              cursor: 'pointer',
              fontSize: theme.typography.body,
              fontWeight: theme.typography.medium,
              padding: '4px 8px'
            }}
          >
            Edit
          </button>
        )}
      </div>
      
      {isEditing ? (
        <div>
          <input
            type={type}
            value={editValue}
            onChange={(e) => onEditValueChange(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: theme.spacing.md,
              border: `2px solid ${theme.colors.accentPurple}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.h5,
              marginBottom: theme.spacing.md,
              boxSizing: 'border-box',
              background: theme.colors.bgCardDark,
              color: theme.colors.textPrimary,
              outline: 'none'
            }}
          />
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <button
              onClick={onSave}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                background: theme.colors.accentPurple,
                color: theme.colors.textPrimary,
                border: 'none',
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.body,
                fontWeight: theme.typography.medium,
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                background: theme.colors.bgCardDark,
                color: theme.colors.textSecondary,
                border: `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: theme.borderRadius.sm,
                fontSize: theme.typography.body,
                fontWeight: theme.typography.medium,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: theme.typography.h4, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
            {displayValue || value}
          </div>
          {saved && (
            <div style={{ fontSize: theme.typography.caption, color: theme.colors.success, marginTop: '4px' }}>
              ✓ Saved
            </div>
          )}
        </>
      )}
    </div>
  )
}
