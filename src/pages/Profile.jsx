import { useState } from 'react'
import { exportData } from '../store'

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
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 24px 0' }}>Profile</h2>
      
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
          padding: '16px',
          marginTop: '32px',
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 500,
          cursor: 'pointer'
        }}
      >
        Export data
      </button>
    </div>
  )
}

function ProfileField({ label, value, isEditing, editValue, onEditValueChange, onEdit, onSave, onCancel, saved, type = 'text', displayValue }) {
  return (
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '12px',
      marginBottom: '16px',
      border: saved ? '2px solid #10b981' : '1px solid #e5e5e3',
      transition: 'border-color 0.3s'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>
          {label}
        </label>
        {!isEditing && (
          <button
            onClick={onEdit}
            style={{
              background: 'none',
              border: 'none',
              color: '#4f46e5',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
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
              padding: '10px',
              border: '2px solid #4f46e5',
              borderRadius: '8px',
              fontSize: '16px',
              marginBottom: '12px',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onSave}
              style={{
                flex: 1,
                padding: '10px',
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '10px',
                background: '#f3f4f6',
                color: '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '18px', fontWeight: 500, color: '#1a1a1a' }}>
            {displayValue || value}
          </div>
          {saved && (
            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
              ✓ Saved
            </div>
          )}
        </>
      )}
    </div>
  )
}
