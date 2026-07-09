import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { getGreeting, getTodayDate } from '../utils/formatDate'
import { formatCurrency } from '../utils/formatCurrency'
import { getMonthTransactions, calculateMonthStats } from '../hooks/usePayments'

// Weather code mapping to emoji
const getWeatherEmoji = (code) => {
  if (code === 0) return '☀️'
  if (code === 1 || code === 2) return '🌤️'
  if (code === 3) return '☁️'
  if (code >= 45 && code <= 48) return '🌫️'
  if (code >= 51 && code <= 57) return '🌦️'
  if (code >= 61 && code <= 67) return '🌧️'
  if (code >= 71 && code <= 77) return '🌨️'
  if (code >= 80 && code <= 82) return '🌧️'
  if (code >= 85 && code <= 86) return '🌨️'
  if (code >= 95 && code <= 99) return '⛈️'
  return '🌤️'
}

export default function Dashboard({ data, onOpenBottomSheet, updateStore }) {
  const navigate = useNavigate()
  const [weatherData, setWeatherData] = useState(null)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [currentNote, setCurrentNote] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  
  const stats = useMemo(() => {
    const now = new Date()
    const transactions = getMonthTransactions(
      data.payments.transactions,
      now.getFullYear(),
      now.getMonth()
    )
    return calculateMonthStats(transactions)
  }, [data.payments.transactions])
  
  const hasPaymentsCard = data.cards.includes('payments')
  const hasMapsCard = data.cards.includes('maps')
  const hasWeatherCard = data.cards.includes('weather')
  const hasCounterCard = data.cards.includes('counter')

  useEffect(() => {
    if (hasWeatherCard) {
      const fetchWeather = async () => {
        try {
          const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=18.52&longitude=73.85&current=temperature_2m,weathercode,windspeed_10m&hourly=precipitation_probability&timezone=auto&forecast_days=1'
          )
          const result = await response.json()
          setWeatherData(result)
        } catch (err) {
          console.error('Weather fetch error:', err)
        }
      }
      
      fetchWeather()
      const interval = setInterval(fetchWeather, 30 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [hasWeatherCard])
  
  const handleMapCardClick = (mapCard) => {
    const travelmode = mapCard.transportMode === 'car' ? 'driving' : 'two-wheeler'
    
    if (mapCard.locationType === 'one') {
      // Try to get current GPS location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            const destination = encodeURIComponent(mapCard.location1)
            const url = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destination}&travelmode=${travelmode}`
            window.open(url, '_blank')
          },
          (error) => {
            // GPS failed or denied, fall back to destination only
            const destination = encodeURIComponent(mapCard.location1)
            const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${travelmode}`
            window.open(url, '_blank')
          }
        )
      } else {
        // Geolocation not supported, use destination only
        const destination = encodeURIComponent(mapCard.location1)
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=${travelmode}`
        window.open(url, '_blank')
      }
    } else {
      // Two location mode - encode both locations
      const origin = encodeURIComponent(mapCard.location1)
      const destination = encodeURIComponent(mapCard.location2)
      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${travelmode}`
      window.open(url, '_blank')
    }
  }

  const handleCounterAction = (action, value) => {
    const enableNotes = data.counterSettings?.enableNotes || false
    if (enableNotes) {
      setPendingAction({ action, value })
      setShowNoteModal(true)
    } else {
      executeCounterAction(action, value, '')
    }
  }

  const executeCounterAction = (action, value, note) => {
    const today = new Date().toISOString().split('T')[0]
    const counterValue = data.counterValue || 0
    const newValue = action === 'yes' ? counterValue + 1 : 
                     action === 'no' ? counterValue : 
                     counterValue + value

    const historyEntry = {
      id: uuidv4(),
      date: today,
      datetime: new Date().toISOString(),
      action,
      value: action === 'yes' ? 1 : action === 'no' ? 0 : value,
      note,
      resultValue: newValue
    }

    updateStore(current => ({
      ...current,
      counterValue: newValue,
      counterHistory: [historyEntry, ...(current.counterHistory || [])]
    }))

    setShowNoteModal(false)
    setCurrentNote('')
    setPendingAction(null)
  }

  const handleSubmitNote = () => {
    if (pendingAction) {
      executeCounterAction(pendingAction.action, pendingAction.value, currentNote)
    }
  }
  
  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', margin: '0 0 4px 0' }}>
          {getGreeting(data.profile.name)}
        </h2>
        <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
          {getTodayDate()}
        </p>
      </div>
      
      {hasPaymentsCard && (
        <div 
          onClick={() => navigate('/payments')}
          style={{
          padding: '16px',
          background: '#fff',
          borderRadius: '12px',
          marginBottom: '20px',
          cursor: 'pointer'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>
            Payments
          </h3>
          <div style={{
            fontSize: '24px',
            fontWeight: 500,
            color: stats.balance >= 0 ? '#10b981' : '#f43f5e',
            marginBottom: '6px'
          }}>
            {formatCurrency(stats.balance, data.profile.country)}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
            ↑ {formatCurrency(stats.income, data.profile.country)} income  ↓ {formatCurrency(stats.expenses, data.profile.country)} expenses
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onOpenBottomSheet()
              }}
              style={{
                padding: '4px 12px',
                background: 'transparent',
                color: '#4f46e5',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span style={{ fontSize: '14px' }}>+</span>
              <span>New payment</span>
            </button>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {hasMapsCard && (
          <div style={{ flex: 1, minWidth: 0 }}>
            {data.mapCards.length === 0 ? (
              <div style={{
                padding: '12px',
                background: '#fff',
                borderRadius: '12px',
                textAlign: 'center',
                height: '100%'
              }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                  Maps
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6b7280' }}>
                  No routes yet
                </p>
                <button
                  onClick={() => navigate('/maps')}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    color: '#4f46e5',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>+</span>
                  <span>Add route</span>
                </button>
              </div>
            ) : (
              data.mapCards.map((mapCard, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    background: '#fff',
                    borderRadius: '12px',
                    position: 'relative',
                    height: '100%'
                  }}
                >
                  <button
                    onClick={() => navigate('/maps')}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Edit"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <div 
                    onClick={() => handleMapCardClick(mapCard)}
                    style={{ cursor: 'pointer', paddingRight: '20px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600 }}>
                          {mapCard.name}
                        </h3>
                        {mapCard.locationType === 'one' ? (
                          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Current location → {mapCard.location1Label || 'Destination'}
                          </p>
                        ) : (
                          mapCard.location1Label && mapCard.location2Label && (
                            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {mapCard.location1Label} → {mapCard.location2Label}
                            </p>
                          )
                        )}
                      </div>
                      <span style={{ fontSize: '16px', opacity: 0.6, flexShrink: 0 }}>
                        {mapCard.transportMode === 'car' ? '🚗' : '🏍️'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {hasWeatherCard && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              onClick={() => navigate('/weather')}
              style={{
                padding: '12px',
                background: '#fff',
                borderRadius: '12px',
                cursor: 'pointer',
                height: '100%'
              }}
            >
              <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                Weather
              </h3>
              {weatherData ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {data.weatherSettings?.showTemperature && weatherData.current?.temperature_2m !== undefined && (
                    <div style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
                      {Math.round(weatherData.current.temperature_2m)}°C
                    </div>
                  )}
                  {data.weatherSettings?.showWeather && weatherData.current?.weathercode !== undefined && (
                    <div style={{ fontSize: '24px' }}>
                      {getWeatherEmoji(weatherData.current.weathercode)}
                    </div>
                  )}
                  {data.weatherSettings?.rainCheck && weatherData.hourly?.precipitation_probability && weatherData.hourly?.time && (() => {
                    const startTime = data.weatherSettings.startTime || '09:00'
                    const endTime = data.weatherSettings.endTime || '18:00'
                    const [startHour, startMin] = startTime.split(':').map(Number)
                    const [endHour, endMin] = endTime.split(':').map(Number)
                    
                    // Parse the time array and precipitation data
                    const times = weatherData.hourly.time
                    const precipProbs = weatherData.hourly.precipitation_probability
                    
                    let willRain = false
                    
                    // Check each hour in the time array
                    for (let i = 0; i < times.length && i < precipProbs.length; i++) {
                      const timeStr = times[i]
                      const hour = parseInt(timeStr.split('T')[1].split(':')[0])
                      
                      // Check if this hour is within our time range
                      let inRange = false
                      if (startHour < endHour) {
                        // Same day range (e.g., 9:00 to 18:00)
                        inRange = hour >= startHour && hour <= endHour
                      } else {
                        // Overnight range (e.g., 22:00 to 06:00)
                        inRange = hour >= startHour || hour <= endHour
                      }
                      
                      if (inRange && precipProbs[i] >= 40) {
                        willRain = true
                        break
                      }
                    }
                    
                    return (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        padding: '6px',
                        background: willRain ? '#fef2f2' : '#f0fdf4',
                        borderRadius: '6px',
                        minWidth: '60px'
                      }}>
                        <span style={{ fontSize: '20px' }}>
                          {willRain ? '☔' : '☀️'}
                        </span>
                        <span style={{ 
                          fontSize: '9px', 
                          fontWeight: 600,
                          color: willRain ? '#991b1b' : '#166534',
                          textAlign: 'center',
                          lineHeight: 1.2
                        }}>
                          {willRain ? 'Umbrella' : 'No Rain'}
                        </span>
                      </div>
                    )
                  })()}
                  {!data.weatherSettings?.showTemperature && !data.weatherSettings?.showWeather && !data.weatherSettings?.rainCheck && (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      Choose what to display
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Loading weather...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {hasCounterCard && (
        <div
          style={{
            padding: '16px',
            background: '#fff',
            borderRadius: '12px',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 600,
              color: data.counterSettings?.title ? '#1a1a1a' : '#9ca3af'
            }}>
              {data.counterSettings?.title || 'Title'}
            </h3>
            <button
              onClick={() => navigate('/counter')}
              style={{
                padding: '4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#9ca3af'
              }}
              title="Settings"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m0-18a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 18a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zM1 12h6m6 0h6M1 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm18 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"></path>
              </svg>
            </button>
          </div>
          
          {data.counterSettings?.counterType === 'yesno' ? (
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => handleCounterAction('yes', 1)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#fff',
                  color: '#1a1a1a',
                  border: '1px solid #e5e5e3',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Yes
              </button>
              <button
                onClick={() => handleCounterAction('no', 0)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#fff',
                  color: '#1a1a1a',
                  border: '1px solid #e5e5e3',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                No
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => handleCounterAction('increment', data.counterSettings?.incrementValue || 1)}
                style={{
                  padding: '10px 32px',
                  background: '#fff',
                  color: '#1a1a1a',
                  border: '1px solid #e5e5e3',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                +{data.counterSettings?.incrementValue || 1}
              </button>
            </div>
          )}
        </div>
      )}
      
      {data.cards.length === 0 && (
        <div style={{
          padding: '40px 20px',
          background: '#fff',
          borderRadius: '12px',
          border: '2px dashed #e5e5e3',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          Click the + button to add your first card
        </div>
      )}

      {showNoteModal && (
        <>
          <div
            onClick={() => {
              setShowNoteModal(false)
              setCurrentNote('')
              setPendingAction(null)
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 100
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            zIndex: 101
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
              Add Note (Optional)
            </h3>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Add a note..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e5e3',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '100px',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => {
                  setShowNoteModal(false)
                  setCurrentNote('')
                  setPendingAction(null)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f9f9f7',
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNote}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
