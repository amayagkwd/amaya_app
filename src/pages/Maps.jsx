import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import theme from '../theme'

export default function Maps({ data, updateStore }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [openedFromUrl, setOpenedFromUrl] = useState(false)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    locationType: 'two',
    location1: '',
    location1Label: '',
    location2: '',
    location2Label: '',
    transportMode: 'car'
  })

  // Auto-open edit for new cards or URL parameter
  useEffect(() => {
    // Check URL parameter first
    const editParam = searchParams.get('edit')
    if (editParam !== null) {
      const editIndex = parseInt(editParam, 10)
      if (!isNaN(editIndex) && editIndex >= 0 && editIndex < data.mapCards?.length) {
        setOpenedFromUrl(true)
        handleStartEdit(editIndex)
        // Clear the URL parameter after opening
        const newParams = new URLSearchParams(searchParams)
        newParams.delete('edit')
        setSearchParams(newParams, { replace: true })
        return
      }
    }
    
    // Then check for new cards
    const newCardIndex = data.mapCards?.findIndex(card => card.isNew)
    if (newCardIndex !== -1) {
      handleStartEdit(newCardIndex)
      // Remove isNew flag
      const updatedMapCards = [...data.mapCards]
      delete updatedMapCards[newCardIndex].isNew
      updateStore(current => ({
        ...current,
        mapCards: updatedMapCards
      }))
    }
  }, [data.mapCards, searchParams])

  const handleStartCreate = () => {
    setIsCreating(true)
    setEditingIndex(null)
    setFormData({
      name: '',
      locationType: 'two',
      location1: '',
      location1Label: '',
      location2: '',
      location2Label: '',
      transportMode: 'car'
    })
  }

  const handleStartEdit = (index) => {
    const mapCard = data.mapCards[index]
    setEditingIndex(index)
    setIsCreating(false)
    setFormData({
      name: mapCard.name,
      locationType: mapCard.locationType || 'two',
      location1: mapCard.location1 || '',
      location1Label: mapCard.location1Label || '',
      location2: mapCard.location2 || '',
      location2Label: mapCard.location2Label || '',
      transportMode: mapCard.transportMode
    })
  }

  const handleCancel = () => {
    if (openedFromUrl) {
      // If opened from URL, navigate back to dashboard
      navigate(-1)
      setOpenedFromUrl(false)
    }
    setIsCreating(false)
    setEditingIndex(null)
    setFormData({
      name: '',
      locationType: 'two',
      location1: '',
      location1Label: '',
      location2: '',
      location2Label: '',
      transportMode: 'car'
    })
  }

  const canSave = formData.name.trim() && 
    (formData.locationType === 'one' ? formData.location1.trim() : 
     (formData.location1.trim() && formData.location2.trim()))

  const handleSave = () => {
    if (!canSave) return

    const mapCardData = {
      name: formData.name.trim(),
      locationType: formData.locationType,
      location1: formData.locationType === 'two' ? formData.location1.trim() : formData.location1.trim(),
      location1Label: formData.location1Label.trim() || null,
      location2: formData.locationType === 'two' ? formData.location2.trim() : null,
      location2Label: formData.locationType === 'two' ? (formData.location2Label.trim() || null) : null,
      transportMode: formData.transportMode
    }

    if (editingIndex !== null) {
      const updatedMapCards = [...data.mapCards]
      updatedMapCards[editingIndex] = mapCardData
      updateStore(current => ({
        ...current,
        mapCards: updatedMapCards
      }))
    } else {
      updateStore(current => ({
        ...current,
        mapCards: [...current.mapCards, mapCardData]
      }))
    }

    // Navigate back if opened from URL
    if (openedFromUrl) {
      navigate(-1)
      setOpenedFromUrl(false)
    }

    handleCancel()
  }

  const handleDelete = (index) => {
    if (confirm('Delete this map?')) {
      const updatedMapCards = data.mapCards.filter((_, i) => i !== index)
      
      // Also update the cards array - remove one 'maps' entry
      const mapsIndex = data.cards.indexOf('maps')
      const updatedCards = [...data.cards]
      if (mapsIndex !== -1) {
        updatedCards.splice(mapsIndex, 1)
      }
      
      updateStore(current => ({
        ...current,
        mapCards: updatedMapCards,
        cards: updatedCards
      }))
    }
  }

  const showForm = isCreating || editingIndex !== null

  return (
    <div style={{ padding: theme.spacing.xl }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xxl }}>
        <h2 style={{ fontSize: theme.typography.h2, margin: 0, color: theme.colors.textPrimary }}>Maps</h2>
        {!showForm && (
          <button
            onClick={handleStartCreate}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              background: theme.colors.accentPurple,
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.body,
              fontWeight: theme.typography.medium,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: theme.typography.h5 }}>+</span>
            <span>Add new map</span>
          </button>
        )}
      </div>

      {showForm ? (
        <div style={{
          background: theme.colors.bgCard,
          backdropFilter: theme.backdropFilter,
          WebkitBackdropFilter: theme.backdropFilter,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.xxl,
          marginBottom: theme.spacing.xl,
          border: `1px solid ${theme.colors.borderSubtle}`,
          boxShadow: theme.shadows.card
        }}>
          <h3 style={{ margin: `0 0 ${theme.spacing.xl} 0`, fontSize: theme.typography.h4, fontWeight: theme.typography.semiBold, color: theme.colors.textPrimary }}>
            {editingIndex !== null ? 'Edit Map' : 'Create New Map'}
          </h3>

          <div style={{ marginBottom: theme.spacing.lg }}>
            <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
              Map name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              Location type
            </label>
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, locationType: 'one' })}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: formData.locationType === 'one' ? theme.colors.accentPurple : theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  border: formData.locationType === 'one' ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  cursor: 'pointer',
                  fontSize: theme.typography.body,
                  fontWeight: theme.typography.medium
                }}
              >
                One Location
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, locationType: 'two' })}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: formData.locationType === 'two' ? theme.colors.accentPurple : theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  border: formData.locationType === 'two' ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  cursor: 'pointer',
                  fontSize: theme.typography.body,
                  fontWeight: theme.typography.medium
                }}
              >
                Two Locations
              </button>
            </div>
            <p style={{ margin: `${theme.spacing.sm} 0 0 0`, fontSize: theme.typography.bodySmall, color: theme.colors.textSecondary }}>
              {formData.locationType === 'one' ? 'Navigate from your current location' : 'Navigate between two specific locations'}
            </p>
          </div>

          <div style={{ marginBottom: theme.spacing.lg }}>
            <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
              {formData.locationType === 'one' ? 'Destination *' : 'Location 1 *'}
            </label>
            <input
              type="text"
              value={formData.location1}
              onChange={(e) => setFormData({ ...formData, location1: e.target.value })}
              placeholder={formData.locationType === 'one' ? 'e.g. Charminar Hyderabad' : 'e.g. Inorbit Mall Hyderabad'}
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
              value={formData.location1Label}
              onChange={(e) => setFormData({ ...formData, location1Label: e.target.value })}
              placeholder={formData.locationType === 'one' ? 'e.g. Office' : 'e.g. Home'}
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

          {formData.locationType === 'two' && (
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
                Location 2 *
              </label>
              <input
                type="text"
                value={formData.location2}
                onChange={(e) => setFormData({ ...formData, location2: e.target.value })}
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
                value={formData.location2Label}
                onChange={(e) => setFormData({ ...formData, location2Label: e.target.value })}
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
          )}

          <div style={{ marginBottom: theme.spacing.xxl }}>
            <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
              Transport mode
            </label>
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, transportMode: 'car' })}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: formData.transportMode === 'car' ? theme.colors.accentPurple : theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  border: formData.transportMode === 'car' ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
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
                onClick={() => setFormData({ ...formData, transportMode: 'bike' })}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: formData.transportMode === 'bike' ? theme.colors.accentPurple : theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  border: formData.transportMode === 'bike' ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
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
              onClick={handleCancel}
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
              {editingIndex !== null ? 'Save Changes' : 'Create Map'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {data.mapCards.length === 0 ? (
            <div style={{
              background: theme.colors.bgCard,
              backdropFilter: theme.backdropFilter,
              WebkitBackdropFilter: theme.backdropFilter,
              borderRadius: theme.borderRadius.lg,
              padding: '40px 20px',
              textAlign: 'center',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.borderSubtle}`,
              boxShadow: theme.shadows.card
            }}>
              <p style={{ margin: `0 0 ${theme.spacing.lg} 0`, fontSize: theme.typography.h6 }}>No maps yet</p>
              <button
                onClick={handleStartCreate}
                style={{
                  padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                  background: theme.colors.accentPurple,
                  color: theme.colors.textPrimary,
                  border: 'none',
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.body,
                  fontWeight: theme.typography.medium,
                  cursor: 'pointer'
                }}
              >
                Create your first map
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {data.mapCards.map((mapCard, index) => (
                <div
                  key={index}
                  onClick={() => handleStartEdit(index)}
                  style={{
                    background: theme.colors.bgCard,
                    backdropFilter: theme.backdropFilter,
                    WebkitBackdropFilter: theme.backdropFilter,
                    borderRadius: theme.borderRadius.lg,
                    padding: theme.spacing.xl,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    border: `1px solid ${theme.colors.borderSubtle}`,
                    boxShadow: theme.shadows.card,
                    cursor: 'pointer',
                    transition: theme.transitions.normal
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.colors.bgCard
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: theme.typography.h4, fontWeight: theme.typography.semiBold, color: theme.colors.textPrimary }}>
                      {mapCard.name}
                    </h3>
                    {mapCard.locationType === 'one' ? (
                      <p style={{ margin: 0, fontSize: theme.typography.bodySmall, color: theme.colors.textSecondary }}>
                        Current location → {mapCard.location1Label || 'Destination'}
                      </p>
                    ) : (
                      mapCard.location1Label && mapCard.location2Label && (
                        <p style={{ margin: 0, fontSize: theme.typography.bodySmall, color: theme.colors.textSecondary }}>
                          {mapCard.location1Label} → {mapCard.location2Label}
                        </p>
                      )
                    )}
                    <div style={{ marginTop: theme.spacing.sm, fontSize: theme.typography.bodySmall, color: theme.colors.textSecondary }}>
                      {mapCard.transportMode === 'car' ? '🚗 Car' : '🏍️ Bike'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(index)
                      }}
                      className="btn-delete"
                      style={{ outline: 'none' }}
                    >
                      <img 
                        src="/trash-blank-alt-svgrepo-com.svg" 
                        alt="Delete"
                        style={{ filter: 'invert(50%) sepia(20%) saturate(1000%) hue-rotate(320deg) brightness(100%) contrast(90%)' }}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
