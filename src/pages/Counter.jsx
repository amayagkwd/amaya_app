import { useState, useEffect } from 'react'
import { formatDate } from '../utils/formatDate'

export default function Counter({ data, updateStore }) {
  const [dailyReset, setDailyReset] = useState(false)
  const [counterType, setCounterType] = useState('increment')
  const [incrementValue, setIncrementValue] = useState(1)
  const [enableNotes, setEnableNotes] = useState(false)
  const [counterTitle, setCounterTitle] = useState('')

  useEffect(() => {
    if (data.counterSettings) {
      setDailyReset(data.counterSettings.dailyReset || false)
      setCounterType(data.counterSettings.counterType || 'increment')
      setIncrementValue(data.counterSettings.incrementValue || 1)
      setEnableNotes(data.counterSettings.enableNotes || false)
      setCounterTitle(data.counterSettings.title || '')
    }
  }, [data.counterSettings])

  const counterHistory = data.counterHistory || []

  const handleToggleDailyReset = () => {
    const newValue = !dailyReset
    setDailyReset(newValue)
    updateStore(current => ({
      ...current,
      counterSettings: {
        ...current.counterSettings,
        dailyReset: newValue
      }
    }))
  }

  const handleCounterTypeChange = (type) => {
    setCounterType(type)
    updateStore(current => ({
      ...current,
      counterSettings: {
        ...current.counterSettings,
        counterType: type
      }
    }))
  }

  const handleIncrementValueChange = (e) => {
    const value = parseInt(e.target.value) || 1
    setIncrementValue(value)
    updateStore(current => ({
      ...current,
      counterSettings: {
        ...current.counterSettings,
        incrementValue: value
      }
    }))
  }

  const handleToggleNotes = () => {
    const newValue = !enableNotes
    setEnableNotes(newValue)
    updateStore(current => ({
      ...current,
      counterSettings: {
        ...current.counterSettings,
        enableNotes: newValue
      }
    }))
  }

  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setCounterTitle(newTitle)
    updateStore(current => ({
      ...current,
      counterSettings: {
        ...current.counterSettings,
        title: newTitle
      }
    }))
  }

  const handleDelete = (id) => {
    if (confirm('Delete this entry?')) {
      updateStore(current => ({
        ...current,
        counterHistory: current.counterHistory.filter(h => h.id !== id)
      }))
    }
  }

  const groupedHistory = counterHistory.reduce((groups, entry) => {
    if (!groups[entry.date]) groups[entry.date] = []
    groups[entry.date].push(entry)
    return groups
  }, {})

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 24px 0' }}>Counter</h2>

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            Title
          </label>
          <input
            type="text"
            value={counterTitle}
            onChange={handleTitleChange}
            placeholder="Enter title"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
            Daily Reset
          </div>
          <button
            onClick={handleToggleDailyReset}
            style={{
              width: '52px',
              height: '32px',
              borderRadius: '16px',
              border: 'none',
              background: dailyReset ? '#4f46e5' : '#e5e5e3',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '2px',
              left: dailyReset ? '22px' : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        <div style={{
          fontSize: '13px',
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          Counter will reset to zero at midnight each day
        </div>

        <div style={{
          height: '1px',
          background: '#e5e5e3',
          marginBottom: '20px'
        }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
            Enable Notes
          </div>
          <button
            onClick={handleToggleNotes}
            style={{
              width: '52px',
              height: '32px',
              borderRadius: '16px',
              border: 'none',
              background: enableNotes ? '#4f46e5' : '#e5e5e3',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#fff',
              position: 'absolute',
              top: '2px',
              left: enableNotes ? '22px' : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        <div style={{
          fontSize: '13px',
          color: '#6b7280',
          marginBottom: '20px'
        }}>
          Add optional notes each time you update the counter
        </div>

        <div style={{
          height: '1px',
          background: '#e5e5e3',
          marginBottom: '20px'
        }} />

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: 600,
            color: '#1a1a1a',
            marginBottom: '12px'
          }}>
            Counter Type
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleCounterTypeChange('yesno')}
              style={{
                flex: 1,
                padding: '12px',
                background: counterType === 'yesno' ? '#4f46e5' : '#f9f9f7',
                color: counterType === 'yesno' ? '#fff' : '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              Yes / No
            </button>
            <button
              onClick={() => handleCounterTypeChange('increment')}
              style={{
                flex: 1,
                padding: '12px',
                background: counterType === 'increment' ? '#4f46e5' : '#f9f9f7',
                color: counterType === 'increment' ? '#fff' : '#1a1a1a',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              +1
            </button>
          </div>
        </div>

        {counterType === 'increment' && (
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#1a1a1a',
              marginBottom: '8px'
            }}>
              Increment Value
            </label>
            <input
              type="number"
              value={incrementValue}
              onChange={handleIncrementValueChange}
              min="1"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e5e3',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />
          </div>
        )}
      </div>

      {counterHistory.length > 0 && (
        <div>
          <h3 style={{ fontSize: '18px', margin: '0 0 16px 0', fontWeight: 600 }}>
            History
          </h3>
          {Object.entries(groupedHistory)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, entries]) => (
              <div key={date} style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  {formatDate(date)}
                </div>
                {entries
                  .sort((a, b) => new Date(b.datetime) - new Date(a.datetime))
                  .map(entry => (
                    <div
                      key={entry.id}
                      style={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                          {entry.action === 'yes' ? '✅ Yes' : 
                           entry.action === 'no' ? '❌ No' : 
                           `➕ +${entry.value}`}
                        </div>
                        {entry.note && (
                          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                            {entry.note}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                          Total: {entry.resultValue}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          padding: '4px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
