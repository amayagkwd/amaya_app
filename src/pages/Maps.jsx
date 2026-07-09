import { useState } from 'react'

export default function Maps({ data, updateStore }) {
  const [editingIndex, setEditingIndex] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    locationType: 'two',
    location1: '',
    location1Label: '',
    location2: '',
    location2Label: '',
    transportMode: 'car'
  })

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

    handleCancel()
  }

  const handleDelete = (index) => {
    if (confirm('Delete this map?')) {
      const updatedMapCards = data.mapCards.filter((_, i) => i !== index)
      updateStore(current => ({
        ...current,
        mapCards: updatedMapCards
      }))
    }
  }

  const showForm = isCreating || editingIndex !== null

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', margin: 0 }}>Maps</h2>
        {!showForm && (
          <button
            onClick={handleStartCreate}
            style={{
              padding: '10px 16px',
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '16px' }}>+</span>
            <span>Add new map</span>
          </button>
        )}
      </div>

      {showForm ? (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
            {editingIndex !== null ? 'Edit Map' : 'Create New Map'}
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
              Map name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              Location type
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, locationType: 'one' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: formData.locationType === 'one' ? '#4f46e5' : '#f9f9f7',
                  color: formData.locationType === 'one' ? '#fff' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                One Location
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, locationType: 'two' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: formData.locationType === 'two' ? '#4f46e5' : '#f9f9f7',
                  color: formData.locationType === 'two' ? '#fff' : '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Two Locations
              </button>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
              {formData.locationType === 'one' ? 'Navigate from your current location' : 'Navigate between two specific locations'}
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
              {formData.locationType === 'one' ? 'Destination *' : 'Location 1 *'}
            </label>
            <input
              type="text"
              value={formData.location1}
              onChange={(e) => setFormData({ ...formData, location1: e.target.value })}
              placeholder={formData.locationType === 'one' ? 'e.g. Charminar Hyderabad' : 'e.g. Inorbit Mall Hyderabad'}
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
              value={formData.location1Label}
              onChange={(e) => setFormData({ ...formData, location1Label: e.target.value })}
              placeholder={formData.locationType === 'one' ? 'e.g. Office' : 'e.g. Home'}
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

          {formData.locationType === 'two' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                Location 2 *
              </label>
              <input
                type="text"
                value={formData.location2}
                onChange={(e) => setFormData({ ...formData, location2: e.target.value })}
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
                value={formData.location2Label}
                onChange={(e) => setFormData({ ...formData, location2Label: e.target.value })}
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
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
              Transport mode
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, transportMode: 'car' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: formData.transportMode === 'car' ? '#4f46e5' : '#f9f9f7',
                  color: formData.transportMode === 'car' ? '#fff' : '#1a1a1a',
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
                onClick={() => setFormData({ ...formData, transportMode: 'bike' })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: formData.transportMode === 'bike' ? '#4f46e5' : '#f9f9f7',
                  color: formData.transportMode === 'bike' ? '#fff' : '#1a1a1a',
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
              onClick={handleCancel}
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
              {editingIndex !== null ? 'Save Changes' : 'Create Map'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {data.mapCards.length === 0 ? (
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p style={{ margin: '0 0 16px 0', fontSize: '15px' }}>No maps yet</p>
              <button
                onClick={handleStartCreate}
                style={{
                  padding: '10px 20px',
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Create your first map
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.mapCards.map((mapCard, index) => (
                <div
                  key={index}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>
                      {mapCard.name}
                    </h3>
                    {mapCard.locationType === 'one' ? (
                      <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                        Current location → {mapCard.location1Label || 'Destination'}
                      </p>
                    ) : (
                      mapCard.location1Label && mapCard.location2Label && (
                        <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                          {mapCard.location1Label} → {mapCard.location2Label}
                        </p>
                      )
                    )}
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280' }}>
                      {mapCard.transportMode === 'car' ? '🚗 Car' : '🏍️ Bike'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleStartEdit(index)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#6b7280'
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      style={{
                        padding: '8px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#ef4444'
                      }}
                    >
                      🗑️
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
