import { useState, useEffect } from 'react'

const availableCards = [
  { id: 'payments', name: 'Payments', icon: '💰', description: 'Track income and expenses' },
  { id: 'maps', name: 'Maps', icon: '🗺️', description: 'Location and navigation' },
  { id: 'weather', name: 'Weather', icon: '🌤️', description: 'Weather updates' },
  { id: 'counter', name: 'Counter', icon: '🔢', description: 'Track daily counts' }
]

export default function CardSelectionModal({ isOpen, onClose, onUpdateCards, activeCards }) {
  const [selectedCards, setSelectedCards] = useState([])
  
  useEffect(() => {
    if (isOpen) {
      setSelectedCards([...activeCards])
    }
  }, [isOpen, activeCards])
  
  if (!isOpen) return null
  
  const handleToggleCard = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId)
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }
  
  const handleSave = () => {
    onUpdateCards(selectedCards)
    onClose()
  }
  
  const hasChanges = JSON.stringify(selectedCards.sort()) !== JSON.stringify([...activeCards].sort())
  
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 400
        }}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff',
        borderRadius: '16px',
        padding: '24px',
        zIndex: 401,
        maxWidth: '400px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 600 }}>
          Manage cards
        </h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#6b7280' }}>
          Select the cards you want on your dashboard
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {availableCards.map(card => {
              const isSelected = selectedCards.includes(card.id)
              return (
                <button
                  key={card.id}
                  onClick={() => handleToggleCard(card.id)}
                  style={{
                    aspectRatio: '1',
                    padding: '16px',
                    border: `2px solid ${isSelected ? '#4f46e5' : '#e5e5e3'}`,
                    borderRadius: '12px',
                    background: isSelected ? '#f9fafb' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    position: 'relative',
                    textAlign: 'center'
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#4f46e5',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      ✓
                    </div>
                  )}
                  <span style={{ fontSize: '36px' }}>{card.icon}</span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>
                      {card.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.3 }}>
                      {card.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
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
          <button
            onClick={handleSave}
            disabled={selectedCards.length === 0}
            style={{
              flex: 1,
              padding: '12px',
              background: selectedCards.length > 0 ? '#4f46e5' : '#e5e5e3',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: selectedCards.length > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            {hasChanges ? 'Save Changes' : 'Done'}
          </button>
        </div>
      </div>
    </>
  )
}
