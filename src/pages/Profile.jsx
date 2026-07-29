import { useState, useRef } from 'react'
import { exportData, importData } from '../store'
import theme from '../theme'

export default function Profile({ data, updateStore }) {
  const [saved, setSaved] = useState({})
  const [editing, setEditing] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/json') {
      setSelectedFile(file)
      setShowImportModal(true)
    }
  }

  const handleImportConfirm = () => {
    if (selectedFile) {
      importData(selectedFile, (success, importedData) => {
        if (success) {
          updateStore(importedData)
          setShowImportModal(false)
          setSelectedFile(null)
          window.location.reload()
        }
      })
    }
  }

  const handleImportCancel = () => {
    setShowImportModal(false)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  return (
    <div style={{ padding: theme.spacing.xl }}>
      <h2 style={{ fontSize: theme.typography.h2, margin: `0 0 ${theme.spacing.xxl} 0`, color: theme.colors.textPrimary }}>Profile</h2>
      
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
      
      <button
        onClick={exportData}
        style={{
          width: '100%',
          padding: theme.spacing.lg,
          marginTop: theme.spacing.xxxl,
          background: theme.colors.accentPurple,
          color: theme.colors.textPrimary,
          border: 'none',
          borderRadius: theme.borderRadius.sm,
          fontSize: theme.typography.h5,
          fontWeight: theme.typography.medium,
          cursor: 'pointer'
        }}
      >
        Export data
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%',
          padding: theme.spacing.lg,
          marginTop: theme.spacing.md,
          background: 'rgba(124, 111, 255, 0.2)',
          color: theme.colors.accentPurple,
          border: `1px solid rgba(124, 111, 255, 0.35)`,
          borderRadius: theme.borderRadius.sm,
          fontSize: theme.typography.h5,
          fontWeight: theme.typography.medium,
          cursor: 'pointer'
        }}
      >
        Import data
      </button>

      {showImportModal && (
        <>
          <div
            onClick={handleImportCancel}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: theme.zIndex.modal
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(28, 33, 40, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: theme.borderRadius.xxxl,
            padding: theme.spacing.xxxl,
            width: '90%',
            maxWidth: '420px',
            zIndex: theme.zIndex.modal + 1,
            border: `1px solid ${theme.colors.borderMedium}`,
            boxShadow: theme.shadows.strong
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: theme.borderRadius.xl,
              background: 'rgba(255, 107, 157, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(255, 107, 157, 0.3)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b9d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>

            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: theme.typography.h3, 
              fontWeight: theme.typography.bold, 
              color: theme.colors.textPrimary,
              textAlign: 'center',
              letterSpacing: '-0.01em'
            }}>
              Replace All Data?
            </h3>

            <p style={{ 
              margin: '0 0 28px 0', 
              fontSize: theme.typography.body, 
              color: theme.colors.textSecondary,
              textAlign: 'center',
              lineHeight: 1.6
            }}>
              All your current data will be permanently replaced with the imported data. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <button
                onClick={handleImportCancel}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: theme.borderRadius.xl,
                  cursor: 'pointer',
                  fontSize: theme.typography.h6,
                  fontWeight: theme.typography.semiBold,
                  transition: theme.transitions.normal
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImportConfirm}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'linear-gradient(135deg, #ff6b9d, #ff8bb3)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: theme.borderRadius.xl,
                  cursor: 'pointer',
                  fontSize: theme.typography.h6,
                  fontWeight: theme.typography.semiBold,
                  boxShadow: theme.shadows.glow.pink,
                  transition: theme.transitions.normal
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 157, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = theme.shadows.glow.pink
                }}
              >
                Replace Data
              </button>
            </div>
          </div>
        </>
      )}
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
