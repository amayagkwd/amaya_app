import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import theme from '../theme'

export default function Weather({ data, updateStore }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [openedFromUrl, setOpenedFromUrl] = useState(false)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    showTemperature: true,
    showWeather: true,
    rainCheck: false,
    startTime: '09:00',
    endTime: '18:00'
  })

  // Auto-open edit for new cards or URL parameter
  useEffect(() => {
    // Check URL parameter first
    const editParam = searchParams.get('edit')
    if (editParam !== null) {
      const editIndex = parseInt(editParam, 10)
      if (!isNaN(editIndex) && editIndex >= 0 && editIndex < data.weatherCards?.length) {
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
    const newCardIndex = data.weatherCards?.findIndex(card => card.isNew)
    if (newCardIndex !== -1) {
      handleStartEdit(newCardIndex)
      // Remove isNew flag
      const updatedWeatherCards = [...data.weatherCards]
      delete updatedWeatherCards[newCardIndex].isNew
      updateStore(current => ({
        ...current,
        weatherCards: updatedWeatherCards
      }))
    }
  }, [data.weatherCards, searchParams])

  const handleStartCreate = () => {
    setIsCreating(true)
    setEditingIndex(null)
    setFormData({
      name: '',
      showTemperature: true,
      showWeather: true,
      rainCheck: false,
      startTime: '09:00',
      endTime: '18:00'
    })
  }

  const handleStartEdit = (index) => {
    const weatherCard = data.weatherCards[index]
    setEditingIndex(index)
    setIsCreating(false)
    setFormData({
      name: weatherCard.name,
      showTemperature: weatherCard.showTemperature !== false,
      showWeather: weatherCard.showWeather !== false,
      rainCheck: weatherCard.rainCheck || false,
      startTime: weatherCard.startTime || '09:00',
      endTime: weatherCard.endTime || '18:00'
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
      showTemperature: true,
      showWeather: true,
      rainCheck: false,
      startTime: '09:00',
      endTime: '18:00'
    })
  }

  const canSave = formData.name.trim()

  const handleSave = () => {
    if (!canSave) return

    const weatherCardData = {
      name: formData.name.trim(),
      showTemperature: formData.showTemperature,
      showWeather: formData.showWeather,
      rainCheck: formData.rainCheck,
      startTime: formData.startTime,
      endTime: formData.endTime
    }

    if (editingIndex !== null) {
      const updatedWeatherCards = [...data.weatherCards]
      updatedWeatherCards[editingIndex] = weatherCardData
      updateStore(current => ({
        ...current,
        weatherCards: updatedWeatherCards
      }))
    } else {
      updateStore(current => ({
        ...current,
        weatherCards: [...current.weatherCards, weatherCardData]
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
    if (confirm('Delete this weather card?')) {
      const updatedWeatherCards = data.weatherCards.filter((_, i) => i !== index)
      
      // Also update the cards array - remove one 'weather' entry
      const weatherIndex = data.cards.indexOf('weather')
      const updatedCards = [...data.cards]
      if (weatherIndex !== -1) {
        updatedCards.splice(weatherIndex, 1)
      }
      
      updateStore(current => ({
        ...current,
        weatherCards: updatedWeatherCards,
        cards: updatedCards
      }))
    }
  }

  const showForm = isCreating || editingIndex !== null

  return (
    <div style={{ padding: theme.spacing.xl }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xxl }}>
        <h2 style={{ fontSize: theme.typography.h2, margin: 0, color: theme.colors.textPrimary }}>Weather</h2>
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
            <span>Add new weather</span>
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
            {editingIndex !== null ? 'Edit Weather Card' : 'Create New Weather Card'}
          </h3>

          <div style={{ marginBottom: theme.spacing.lg }}>
            <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textPrimary }}>
              Card name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Home Weather"
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

          <div style={{
            background: theme.colors.bgCard,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            marginBottom: theme.spacing.lg,
            border: `1px solid ${theme.colors.borderSubtle}`,
            boxShadow: theme.shadows.card
          }}>
            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <div style={{ 
                flex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.sm,
                background: theme.colors.bgCardDark,
                borderRadius: theme.borderRadius.sm
              }}>
                <div style={{ fontSize: theme.typography.bodySmall, fontWeight: theme.typography.semiBold, color: theme.colors.textPrimary }}>
                  Show Temperature
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showTemperature: !formData.showTemperature })}
                  style={{
                    width: '44px',
                    height: '26px',
                    borderRadius: '13px',
                    border: 'none',
                    background: formData.showTemperature ? theme.colors.accentPurple : theme.colors.borderMedium,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: theme.transitions.fast
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: theme.colors.textPrimary,
                    position: 'absolute',
                    top: '2px',
                    left: formData.showTemperature ? '20px' : '2px',
                    transition: theme.transitions.fast,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>

              <div style={{ 
                flex: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.sm,
                background: theme.colors.bgCardDark,
                borderRadius: theme.borderRadius.sm
              }}>
                <div style={{ fontSize: theme.typography.bodySmall, fontWeight: theme.typography.semiBold, color: theme.colors.textPrimary }}>
                  Show Weather
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showWeather: !formData.showWeather })}
                  style={{
                    width: '44px',
                    height: '26px',
                    borderRadius: '13px',
                    border: 'none',
                    background: formData.showWeather ? theme.colors.accentPurple : theme.colors.borderMedium,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: theme.transitions.fast
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: theme.colors.textPrimary,
                    position: 'absolute',
                    top: '2px',
                    left: formData.showWeather ? '20px' : '2px',
                    transition: theme.transitions.fast,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </button>
              </div>
            </div>
          </div>

          <div style={{
            background: theme.colors.bgCard,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            borderRadius: theme.borderRadius.lg,
            padding: theme.spacing.md,
            border: `1px solid ${theme.colors.borderSubtle}`,
            boxShadow: theme.shadows.card,
            marginBottom: theme.spacing.xxl
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.md
            }}>
              <div style={{ fontSize: theme.typography.body, fontWeight: theme.typography.semiBold, color: theme.colors.textPrimary }}>
                Rain Check
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, rainCheck: !formData.rainCheck })}
                style={{
                  width: '52px',
                  height: '32px',
                  borderRadius: '16px',
                  border: 'none',
                  background: formData.rainCheck ? theme.colors.accentPurple : theme.colors.borderMedium,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: theme.transitions.fast
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: theme.colors.textPrimary,
                  position: 'absolute',
                  top: '2px',
                  left: formData.rainCheck ? '22px' : '2px',
                  transition: theme.transitions.fast,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: theme.typography.tiny, 
                  color: theme.colors.textSecondary, 
                  marginBottom: '4px' 
                }}>
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  disabled={!formData.rainCheck}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: `1px solid ${theme.colors.borderSubtle}`,
                    borderRadius: '6px',
                    fontSize: theme.typography.caption,
                    background: formData.rainCheck ? theme.colors.bgCardDark : theme.colors.bgSecondary,
                    color: formData.rainCheck ? theme.colors.textPrimary : theme.colors.textMuted,
                    cursor: formData.rainCheck ? 'pointer' : 'not-allowed',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ 
                fontSize: theme.typography.body, 
                color: theme.colors.textSecondary, 
                marginTop: theme.spacing.lg
              }}>
                →
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: theme.typography.tiny, 
                  color: theme.colors.textSecondary, 
                  marginBottom: '4px' 
                }}>
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  disabled={!formData.rainCheck}
                  style={{
                    width: '100%',
                    padding: '6px',
                    border: `1px solid ${theme.colors.borderSubtle}`,
                    borderRadius: '6px',
                    fontSize: theme.typography.caption,
                    background: formData.rainCheck ? theme.colors.bgCardDark : theme.colors.bgSecondary,
                    color: formData.rainCheck ? theme.colors.textPrimary : theme.colors.textMuted,
                    cursor: formData.rainCheck ? 'pointer' : 'not-allowed',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
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
              {editingIndex !== null ? 'Save Changes' : 'Create Weather Card'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {data.weatherCards.length === 0 ? (
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
              <p style={{ margin: `0 0 ${theme.spacing.lg} 0`, fontSize: theme.typography.h6 }}>No weather cards yet</p>
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
                Create your first weather card
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {data.weatherCards.map((weatherCard, index) => (
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
                      {weatherCard.name}
                    </h3>
                    <div style={{ marginTop: theme.spacing.sm, fontSize: theme.typography.bodySmall, color: theme.colors.textSecondary }}>
                      {weatherCard.showTemperature && weatherCard.showWeather ? 'Temperature & Weather' :
                       weatherCard.showTemperature ? 'Temperature Only' :
                       weatherCard.showWeather ? 'Weather Only' : 'Display Options Off'}
                      {weatherCard.rainCheck && ` • Rain Check: ${weatherCard.startTime} - ${weatherCard.endTime}`}
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
