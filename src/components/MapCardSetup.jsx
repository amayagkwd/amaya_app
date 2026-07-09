import { useState } from 'react'

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
          background: 'rgba(0,0,0,0.5)',
          zIndex: 500
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
        zIndex: 501,
        maxWidth: '420px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 600 }}>
          Create Maps Card
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            Card name *
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="e.g. Morning Commute"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '15px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            Location 1 *
          </label>
          <input
            type="text"
            value={location1}
            onChange={(e) => setLocation1(e.target.value)}
            placeholder="e.g. Inorbit Mall Hyderabad"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '15px',
              boxSizing: 'border-box',
              outline: 'none',
              marginBottom: '4px'
            }}
          />
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9ca3af' }}>
            Be specific — add area and city for best results (e.g. BSR Mens PG Madhapur Hyderabad)
          </p>
          <input
            type="text"
            value={location1Label}
            onChange={(e) => setLocation1Label(e.target.value)}
            placeholder="e.g. Home"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '15px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            Location 2 *
          </label>
          <input
            type="text"
            value={location2}
            onChange={(e) => setLocation2(e.target.value)}
            placeholder="e.g. Charminar Hyderabad"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '15px',
              boxSizing: 'border-box',
              outline: 'none',
              marginBottom: '4px'
            }}
          />
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#9ca3af' }}>
            Be specific — add area and city for best results (e.g. BSR Mens PG Madhapur Hyderabad)
          </p>
          <input
            type="text"
            value={location2Label}
            onChange={(e) => setLocation2Label(e.target.value)}
            placeholder="e.g. Office"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '15px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
            Transport mode
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setTransportMode('car')}
              style={{
                flex: 1,
                padding: '12px',
                background: transportMode === 'car' ? '#4f46e5' : '#f9f9f7',
                color: transportMode === 'car' ? '#fff' : '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              🚗 Car
            </button>
            <button
              type="button"
              onClick={() => setTransportMode('bike')}
              style={{
                flex: 1,
                padding: '12px',
                background: transportMode === 'bike' ? '#4f46e5' : '#f9f9f7',
                color: transportMode === 'bike' ? '#fff' : '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              🏍️ Bike
            </button>
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
            disabled={!canSave}
            style={{
              flex: 1,
              padding: '12px',
              background: canSave ? '#4f46e5' : '#e5e5e3',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: canSave ? 'pointer' : 'not-allowed'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}
