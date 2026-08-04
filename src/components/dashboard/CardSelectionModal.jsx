import { useState, useEffect } from 'react'
import theme from '../../theme'

const availableCards = [
  { id: 'payments', name: 'Payments', icon: '/currency-inr-bold-svgrepo-com.svg', description: 'Track your payments', unique: true },
  { id: 'maps', name: 'Maps', icon: '/map_start.svg', description: 'Location and navigation', unique: false },
  { id: 'weather', name: 'Weather', icon: '/weather-9-svgrepo-com.svg', description: 'Weather updates', unique: false },
  { id: 'counter', name: 'Counter', icon: '🔢', description: 'Track daily counts', unique: false }
]

export default function CardSelectionModal({ isOpen, onClose, onUpdateCards, activeCards, data, updateStore }) {
  const [cardCounts, setCardCounts] = useState({})
  
  useEffect(() => {
    if (isOpen) {
      // Count occurrences based on actual card instances
      const counts = {}
      
      // Count payments (unique card)
      if (activeCards.includes('payments')) {
        counts.payments = 1
      }
      
      // Count maps based on actual mapCards array
      const mapCardsCount = data?.mapCards?.length || 0
      if (mapCardsCount > 0) {
        counts.maps = mapCardsCount
      }
      
      // Count weather based on actual weatherCards array
      const weatherCardsCount = data?.weatherCards?.length || 0
      if (weatherCardsCount > 0) {
        counts.weather = weatherCardsCount
      }
      
      // Count counter (for now, just check if it exists in activeCards)
      if (activeCards.includes('counter')) {
        counts.counter = 1
      }
      
      setCardCounts(counts)
    }
  }, [isOpen, activeCards, data?.mapCards?.length, data?.weatherCards?.length])
  
  if (!isOpen) return null
  
  const handleAddCard = (cardId, isUnique) => {
    if (isUnique) {
      // For unique cards (like payments), just toggle
      if (cardCounts[cardId]) {
        setCardCounts(prev => {
          const updated = { ...prev }
          delete updated[cardId]
          return updated
        })
      } else {
        setCardCounts(prev => ({ ...prev, [cardId]: 1 }))
      }
    } else {
      // For non-unique cards, increment count and create empty instance
      const currentCount = cardCounts[cardId] || 0
      const newCount = currentCount + 1
      
      // Create empty instances for the card type
      if (cardId === 'maps') {
        const existingMaps = data?.mapCards || []
        const newMap = {
          name: `Map ${existingMaps.length + 1}`,
          locationType: 'two',
          location1: '',
          location1Label: '',
          location2: '',
          location2Label: '',
          transportMode: 'car',
          isNew: true
        }
        updateStore(current => ({
          ...current,
          mapCards: [...(current.mapCards || []), newMap]
        }))
      } else if (cardId === 'weather') {
        const existingWeather = data?.weatherCards || []
        const newWeather = {
          name: `Weather ${existingWeather.length + 1}`,
          showTemperature: true,
          showWeather: true,
          rainCheck: false,
          startTime: '09:00',
          endTime: '18:00',
          isNew: true
        }
        updateStore(current => ({
          ...current,
          weatherCards: [...(current.weatherCards || []), newWeather]
        }))
      } else if (cardId === 'counter') {
        // Counter doesn't need instances, just tracking
      }
      
      setCardCounts(prev => ({
        ...prev,
        [cardId]: newCount
      }))
    }
  }
  
  const handleSave = () => {
    // Convert counts back to array of card IDs
    const newCards = []
    Object.entries(cardCounts).forEach(([cardId, count]) => {
      for (let i = 0; i < count; i++) {
        newCards.push(cardId)
      }
    })
    onUpdateCards(newCards)
    onClose()
  }
  
  const hasCards = Object.keys(cardCounts).length > 0
  const hasChanges = JSON.stringify(activeCards.sort()) !== JSON.stringify(
    Object.entries(cardCounts).flatMap(([id, count]) => Array(count).fill(id)).sort()
  )
  
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
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
        background: theme.colors.bgModal,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        borderRadius: theme.borderRadius.xxxl,
        padding: theme.spacing.xxxl,
        zIndex: theme.zIndex.modal + 1,
        maxWidth: '440px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: `1px solid ${theme.colors.borderMedium}`,
        boxShadow: theme.shadows.strong
      }}>
        <h3 style={{ 
          margin: `0 0 ${theme.spacing.sm} 0`, 
          fontSize: theme.typography.h3, 
          fontWeight: theme.typography.semiBold,
          color: theme.colors.textPrimary
        }}>
          Add Dashboard Cards
        </h3>
        <p style={{ 
          margin: `0 0 ${theme.spacing.xxl} 0`, 
          fontSize: theme.typography.body, 
          color: theme.colors.textSecondary,
          lineHeight: 1.5
        }}>
          Customize your dashboard with the cards you need
        </p>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: theme.spacing.md, 
          marginBottom: theme.spacing.xxl 
        }}>
          {availableCards.map(card => {
            const count = cardCounts[card.id] || 0
            const isAdded = count > 0
            
            return (
              <div
                key={card.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.lg,
                  padding: theme.spacing.lg,
                  background: theme.colors.bgCard,
                  backdropFilter: theme.backdropFilter,
                  WebkitBackdropFilter: theme.backdropFilter,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.lg,
                  transition: theme.transitions.normal
                }}
              >
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {card.icon.startsWith('/') ? (
                    <img 
                      src={card.icon} 
                      alt={card.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        filter: 'brightness(0) saturate(100%) invert(88%) sepia(8%) saturate(295%) hue-rotate(186deg) brightness(94%) contrast(88%)'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '32px' }}>{card.icon}</span>
                  )}
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: theme.typography.h5, 
                    fontWeight: theme.typography.semiBold, 
                    color: theme.colors.textPrimary,
                    marginBottom: '2px'
                  }}>
                    {card.name}
                  </div>
                  <div style={{ 
                    fontSize: theme.typography.bodySmall, 
                    color: theme.colors.textSecondary,
                    lineHeight: 1.4
                  }}>
                    {card.description}
                  </div>
                </div>
                
                <button
                  onClick={() => handleAddCard(card.id, card.unique)}
                  style={{
                    minWidth: '80px',
                    padding: '10px 16px',
                    background: 'transparent',
                    color: theme.colors.textPrimary,
                    border: `1px dashed ${isAdded ? theme.colors.accentBlue : theme.colors.borderMedium}`,
                    borderRadius: theme.borderRadius.sm,
                    fontSize: theme.typography.bodySmall,
                    fontWeight: theme.typography.semiBold,
                    cursor: 'pointer',
                    transition: theme.transitions.fast,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.accentBlue
                  }}
                  onMouseLeave={(e) => {
                    if (!isAdded) {
                      e.currentTarget.style.borderColor = theme.colors.borderMedium
                    }
                  }}
                >
                  {card.unique ? (
                    isAdded ? (
                      <>
                        <span style={{ fontSize: '14px', color: theme.colors.accentBlue }}>✓</span>
                        <span>Added</span>
                      </>
                    ) : (
                      <span>Add</span>
                    )
                  ) : (
                    count === 0 ? (
                      <span>Add</span>
                    ) : (
                      <>
                        <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span>
                        <span>{count}</span>
                      </>
                    )
                  )}
                </button>
              </div>
            )
          })}
        </div>
        
        <div style={{ display: 'flex', gap: theme.spacing.md }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: theme.spacing.lg,
              background: 'rgba(255, 255, 255, 0.05)',
              color: theme.colors.textSecondary,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.h6,
              fontWeight: theme.typography.medium,
              cursor: 'pointer',
              transition: theme.transitions.normal
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasCards}
            style={{
              flex: 1,
              padding: theme.spacing.lg,
              background: hasCards ? theme.colors.accentPurple : 'rgba(255, 255, 255, 0.1)',
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.h6,
              fontWeight: theme.typography.semiBold,
              cursor: hasCards ? 'pointer' : 'not-allowed',
              boxShadow: hasCards ? theme.shadows.glow.purple : 'none',
              opacity: hasCards ? 1 : 0.5,
              transition: theme.transitions.normal
            }}
            onMouseEnter={(e) => {
              if (hasCards) {
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {hasChanges ? 'Save Changes' : 'Done'}
          </button>
        </div>
      </div>
    </>
  )
}
