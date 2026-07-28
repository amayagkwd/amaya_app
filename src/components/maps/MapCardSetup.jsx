import { useState } from 'react'
import theme from '../../theme'

export default function MapCardSetup({ isOpen, onClose, onSave }) {
  const [cardName, setCardName] = useState('')
  const [location1, setLocation1] = useState('')
  const [location1Label, setLocation1Label] = useState('')
  const [location2, setLocation2] = useState('')
  const [location2Label, setLocation2Label] = useState('')
  const [transportMode, setTransportMode] = useState('car')
  
  if (!isOpen) return null
  
  const canSave = cardName.trim() && location1.trim() && location2.trim()
  
  const handleSave = () => {
    if (canSave) {
      onSave({
        name: cardName.trim(),
        location1: location1.trim(),
        location1Label: location1Label.trim() || null,
        location2: location2.trim(),
        location2Label: location2Label.trim() || null,
        transportMode
      })
      setCardName('')
      setLocation1('')
      setLocation1Label('')
      setLocation2('')
      setLocation2Label('')
      setTransportMode('car')
      onClose()
    }
  }
  
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 500
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: theme.colors.bgModal,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xxl,
        zIndex: 501,
        maxWidth: '420px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: theme.shadows.strong
      }}>
        <h3 style={{ margin: `0 0 ${theme.spacing.xl} 0`, fontSize: theme.typography.h3, fontWeight: theme.typography.semiBold, color: theme.colors.textPrimary }}>
          Create Maps Card
        </h3>
        
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
            Card name *
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="e.g. Morning Commute"
            style={{
              width: '100%',
              padding: theme.spacing.md,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.h6,
              boxSizing: 'border-box',
              outline: 'none',
              background: theme.colors.bgCardDark,
              color: theme.colors.textPrimary
            }}
          />
        </div>
        
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
            Location 1 *
          </label>
          <input
            type="text"
            value={location1}
            onChange={(e) => setLocation1(e.target.value)}
            placeholder="e.g. Inorbit Mall Hyderabad"
            style={{
              width: '100%',
              padding: theme.spacing.md,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.h6,
              boxSizing: 'border-box',
              outline: 'none',
              marginBottom: '4px',
              background: theme.colors.bgCardDark,
              color: theme.colors.textPrimary
            }}
          />
          <p style={{ margin: `0 0 ${theme.spacing.sm} 0`, fontSize: theme.typography.caption, color: theme.colors.textMuted }}>
            Be specific — add area and city for best results (e.g. BSR Mens PG Madhapur Hyderabad)
          </p>
          <input
            type="text"
            value={location1Label}
            onChange={(e) => setLocation1Label(e.target.value)}
            placeholder="e.g. Home"
            style={{
              width: '100%',
              padding: theme.spacing.md,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.h6,
              boxSizing: 'border-box',
              outline: 'none',
              background: theme.colors.bgCardDark,
              color: theme.colors.textPrimary
            }}
          />
        </div>
        
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
            Location 2 *
          </label>
          <input
            type="text"
            value={location2}
            onChange={(e) => setLocation2(e.target.value)}
            placeholder="e.g. Charminar Hyderabad"
            style={{
              width: '100%',
              padding: theme.spacing.md,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.h6,
              boxSizing: 'border-box',
              outline: 'none',
              marginBottom: '4px',
              background: theme.colors.bgCardDark,
              color: theme.colors.textPrimary
            }}
          />
          <p style={{ margin: `0 0 ${theme.spacing.sm} 0`, fontSize: theme.typography.caption, color: theme.colors.textMuted }}>
            Be specific — add area and city for best results (e.g. BSR Mens PG Madhapur Hyderabad)
          </p>
          <input
            type="text"
            value={location2Label}
            onChange={(e) => setLocation2Label(e.target.value)}
            placeholder="e.g. Office"
            style={{
              width: '100%',
              padding: theme.spacing.md,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.h6,
              boxSizing: 'border-box',
              outline: 'none',
              background: theme.colors.bgCardDark,
              color: theme.colors.textPrimary
            }}
          />
        </div>
        
        <div style={{ marginBottom: theme.spacing.xxl }}>
          <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
            Transport mode
          </label>
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <button
              type="button"
              onClick={() => setTransportMode('car')}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                background: transportMode === 'car' ? theme.colors.accentPurple : theme.colors.bgCardDark,
                color: theme.colors.textPrimary,
                border: transportMode === 'car' ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: theme.borderRadius.sm,
                cursor: 'pointer',
                fontSize: theme.typography.body,
                fontWeight: theme.typography.medium
              }}
            >
              🚗 Car
            </button>
            <button
              type="button"
              onClick={() => setTransportMode('bike')}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                background: transportMode === 'bike' ? theme.colors.accentPurple : theme.colors.bgCardDark,
                color: theme.colors.textPrimary,
                border: transportMode === 'bike' ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: theme.borderRadius.sm,
                cursor: 'pointer',
                fontSize: theme.typography.body,
                fontWeight: theme.typography.medium
              }}
            >
              🏍️ Bike
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
          <button
            onClick={onClose}
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
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              flex: 1,
              padding: theme.spacing.md,
              background: canSave ? theme.colors.accentPurple : theme.colors.bgCardDark,
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.body,
              fontWeight: theme.typography.medium,
              cursor: canSave ? 'pointer' : 'not-allowed',
              opacity: canSave ? 1 : 0.5
            }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}
