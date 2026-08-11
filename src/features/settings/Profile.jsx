import { useState } from 'react'
import theme, { componentStyles } from '../../theme'

export default function Profile({ data, updateStore }) {
  const [saved, setSaved] = useState({})
  const [editing, setEditing] = useState(null)
  const [editValues, setEditValues] = useState({})
  
  const handleEdit = (field) => {
    setEditing(field)
    setEditValues({ [field]: data.profile[field] })
  }
  
  const handleSave = (field) => {
    updateStore(current => ({
      ...current,
      profile: { ...current.profile, [field]: editValues[field] }
    }))
    setEditing(null)
    setSaved({ ...saved, [field]: true })
    setTimeout(() => setSaved(s => ({ ...s, [field]: false })), 1000)
  }
  
  const handleCancel = () => {
    setEditing(null)
    setEditValues({})
  }
  
  return (
    <div style={componentStyles.pageContainer}>
      <h2 style={componentStyles.pageHeader}>Profile</h2>
      
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
    </div>
  )
}

function ProfileField({ label, value, isEditing, editValue, onEditValueChange, onEdit, onSave, onCancel, saved, type = 'text', displayValue }) {
  return (
    <div style={{
      background: theme.colors.bgCard,
      backdropFilter: theme.backdropFilter,
      WebkitBackdropFilter: theme.backdropFilter,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.lg,
      border: saved ? `2px solid ${theme.colors.success}` : `1px solid ${theme.colors.borderSubtle}`,
      transition: theme.transitions.normal,
      boxShadow: theme.shadows.card
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
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
