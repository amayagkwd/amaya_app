import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { getGreeting, getTodayDate } from '../utils/formatDate'
import { formatCurrency } from '../utils/formatCurrency'
import { getMonthTransactions, calculateMonthStats } from '../hooks/usePayments'
import DashboardCard from '../components/dashboard/DashboardCard'
import FAB from '../components/common/FAB'
import theme, { componentStyles } from '../theme'

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

export default function Dashboard({ data, onOpenBottomSheet, updateStore, onAddCard }) {
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
    <>
      <div style={{ padding: `${theme.spacing.xxl} ${theme.spacing.xl}`, paddingBottom: theme.spacing.huge }}>
        <div style={{ marginBottom: theme.spacing.sm, textAlign: 'left' }}>
          <h2 style={{ 
            fontSize: theme.typography.h2, 
            margin: '0',
            fontFamily: theme.typography.fontFamilyHeading,
            fontWeight: theme.typography.bold,
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            color: theme.colors.textPrimary
          }}>
            {getGreeting(data.profile.name)}
          </h2>
        </div>
        <p style={{ 
          color: theme.colors.textSecondary, 
          margin: `0 0 ${theme.spacing.xxl} 0`, 
          fontSize: theme.typography.bodySmall,
          fontWeight: theme.typography.medium
        }}>
          {getTodayDate()}
        </p>
      
      {hasPaymentsCard && (
        <DashboardCard
          cardId="payments"
          size="full"
          style={{ marginBottom: '20px' }}
        >
          <div 
            onClick={() => navigate('/payments')}
            style={{
            ...componentStyles.card,
            cursor: 'pointer',
            position: 'relative',
            padding: '16px'
          }}
          onMouseEnter={(e) => {
            Object.assign(e.currentTarget.style, componentStyles.cardHover)
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.bgCard
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = theme.shadows.card
          }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
              <h3 style={{ margin: 0, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textOnDark, letterSpacing: '0.01em' }}>
                Payments
              </h3>
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 800,
              color: stats.balance >= 0 ? theme.colors.accentCyan : theme.colors.accentPink,
              marginBottom: theme.spacing.md,
              fontFamily: theme.typography.fontFamily,
              letterSpacing: '-0.04em',
              lineHeight: 1
            }}>
              {formatCurrency(stats.balance, data.profile.country)}
            </div>
            <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                background: 'rgba(0, 229, 204, 0.15)',
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.caption,
                fontWeight: theme.typography.semiBold,
                color: theme.colors.accentCyan
              }}>
                <span style={{ fontSize: '12px' }}>↑</span>
                {formatCurrency(stats.income, data.profile.country)}
              </div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                background: 'rgba(255, 107, 157, 0.15)',
                borderRadius: theme.borderRadius.md,
                fontSize: theme.typography.caption,
                fontWeight: theme.typography.semiBold,
                color: theme.colors.accentPink
              }}>
                <span style={{ fontSize: '12px' }}>↓</span>
                {formatCurrency(stats.expenses, data.profile.country)}
              </div>
            </div>
          </div>
        </DashboardCard>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {hasMapsCard && (
          <DashboardCard
            cardId="maps"
            size="half"
          >
            {data.mapCards.length === 0 ? (
              <div style={{
                padding: '20px',
                background: 'rgba(28, 33, 40, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                textAlign: 'center',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                border: '1px solid rgba(139, 146, 176, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(124, 111, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                  Maps
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  No routes yet
                </p>
                <button
                  onClick={() => navigate('/maps')}
                  style={{
                    padding: '8px 18px',
                    background: 'rgba(124, 111, 255, 0.2)',
                    color: '#7c6fff',
                    border: '1px solid rgba(124, 111, 255, 0.3)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    margin: '0 auto'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 400 }}>+</span>
                  <span>Add route</span>
                </button>
              </div>
            ) : (
              data.mapCards.map((mapCard, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (!mapCard.location1 || !mapCard.location2) {
                      // Navigate with index for setup
                      navigate(`/maps?edit=${index}`)
                    } else {
                      handleMapCardClick(mapCard)
                    }
                  }}
                  style={{
                    padding: '0',
                    background: 'rgba(28, 33, 40, 0.6)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    position: 'relative',
                    border: `1px solid ${!mapCard.location1 || !mapCard.location2 ? 'rgba(255, 184, 77, 0.3)' : 'rgba(139, 146, 176, 0.15)'}`,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    height: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(28, 33, 40, 0.8)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(28, 33, 40, 0.6)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  {(!mapCard.location1 || !mapCard.location2) && (
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      padding: '6px 12px',
                      background: 'rgba(255, 184, 77, 0.2)',
                      border: '1px solid rgba(255, 184, 77, 0.3)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#ffb84d',
                      zIndex: 2
                    }}>
                      Setup Required
                    </div>
                  )}
                  {mapCard.location1 && mapCard.location2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/maps?edit=${index}`)
                      }}
                      style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        padding: '8px',
                        background: 'rgba(10, 14, 39, 0.7)',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                        opacity: 0.9
                      }}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                  )}
                  
                  <div style={{ padding: '18px 18px 12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '12px',
                      background: 'rgba(124, 111, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c6fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ffffff', flex: 1 }}>
                      {mapCard.name}
                    </h3>
                  </div>
                  
                  <div style={{ 
                    width: '100%', 
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(10, 14, 39, 0.4)',
                    padding: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {!mapCard.location1 || !mapCard.location2 ? (
                      <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>
                        Click to setup locations
                      </div>
                    ) : (
                      <img 
                        src="/map_image.png" 
                        alt="Map preview"
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          opacity: 0.8
                        }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </DashboardCard>
        )}
        
        {hasWeatherCard && (
          <DashboardCard
            cardId="weather"
            size="half"
          >
            {data.weatherCards.length === 0 ? (
              <div style={{
                padding: '20px',
                background: 'rgba(28, 33, 40, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '24px',
                textAlign: 'center',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                border: '1px solid rgba(139, 146, 176, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(255, 184, 77, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffb84d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                  </svg>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                  Weather
                </h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  No weather cards yet
                </p>
                <button
                  onClick={() => navigate('/weather')}
                  style={{
                    padding: '8px 18px',
                    background: 'rgba(255, 184, 77, 0.2)',
                    color: '#ffb84d',
                    border: '1px solid rgba(255, 184, 77, 0.3)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    margin: '0 auto'
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: 400 }}>+</span>
                  <span>Add weather</span>
                </button>
              </div>
            ) : (
              data.weatherCards.map((weatherCard, index) => (
                <div
                  key={index}
                  onClick={() => navigate(`/weather?edit=${index}`)}
                  style={{
                    padding: '20px',
                    background: 'rgba(28, 33, 40, 0.6)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid rgba(139, 146, 176, 0.15)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(28, 33, 40, 0.8)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.5)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(28, 33, 40, 0.6)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '12px',
                      background: 'rgba(255, 184, 77, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffb84d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                      </svg>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#ffffff' }}>
                      {weatherCard.name}
                    </h3>
                  </div>
                  {weatherData ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                      {/* Temperature and Weather Icon - Side by Side */}
                      {(weatherCard.showTemperature || weatherCard.showWeather) && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                          {weatherCard.showTemperature && weatherData.current?.temperature_2m !== undefined && (
                            <div style={{ fontSize: '48px', fontWeight: 700, color: '#ffffff', lineHeight: 1, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.02em' }}>
                              {Math.round(weatherData.current.temperature_2m)}°
                            </div>
                          )}
                          {weatherCard.showWeather && weatherData.current?.weathercode !== undefined && (
                            <div style={{ fontSize: '42px', filter: 'drop-shadow(0 4px 16px rgba(255, 184, 77, 0.3))' }}>
                              {getWeatherEmoji(weatherData.current.weathercode)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Rain Check - Below */}
                      {weatherCard.rainCheck && weatherData.hourly?.precipitation_probability && weatherData.hourly?.time && (() => {
                        const startTime = weatherCard.startTime || '09:00'
                        const endTime = weatherCard.endTime || '18:00'
                        const [startHour, startMin] = startTime.split(':').map(Number)
                        const [endHour, endMin] = endTime.split(':').map(Number)
                        
                        const times = weatherData.hourly.time
                        const precipProbs = weatherData.hourly.precipitation_probability
                        
                        let willRain = false
                        
                        for (let i = 0; i < times.length && i < precipProbs.length; i++) {
                          const timeStr = times[i]
                          const hour = parseInt(timeStr.split('T')[1].split(':')[0])
                          
                          let inRange = false
                          if (startHour < endHour) {
                            inRange = hour >= startHour && hour <= endHour
                          } else {
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
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: willRain ? 'rgba(255, 107, 157, 0.15)' : 'rgba(0, 229, 204, 0.15)',
                            borderRadius: '12px',
                            border: willRain ? '1px solid rgba(255, 107, 157, 0.3)' : '1px solid rgba(0, 229, 204, 0.3)',
                            alignSelf: 'center'
                          }}>
                            <span style={{ fontSize: '24px' }}>
                              {willRain ? '☔' : '☀️'}
                            </span>
                            <span style={{ 
                              fontSize: '11px', 
                              fontWeight: 600,
                              color: willRain ? '#ff6b9d' : '#00e5cc',
                              letterSpacing: '0.01em'
                            }}>
                              {willRain ? 'Umbrella' : 'No Rain'}
                            </span>
                          </div>
                        )
                      })()}
                      {!weatherCard.showTemperature && !weatherCard.showWeather && !weatherCard.rainCheck && (
                        <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                          Choose what to display
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      Loading weather...
                    </div>
                  )}
                </div>
              ))
            )}
          </DashboardCard>
        )}
        
        {hasCounterCard && (
          <DashboardCard
            cardId="counter"
            size="half"
          >
          <div
            style={{
              padding: '24px',
              background: 'rgba(45, 55, 80, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(139, 146, 176, 0.2)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              height: '200px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ 
              margin: 0, 
              fontSize: '16px', 
              fontWeight: 600,
              color: data.counterSettings?.title ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'
            }}>
              {data.counterSettings?.title || 'Title'}
            </h3>
            <button
              onClick={() => navigate('/counter')}
              style={{
                padding: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '10px'
              }}
              title="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m0-18a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 18a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zM1 12h6m6 0h6M1 12a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2H3a2 2 0 0 1-2-2zm18 0a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z"></path>
              </svg>
            </button>
          </div>
          
          {data.counterSettings?.counterType === 'yesno' ? (
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => handleCounterAction('yes', 1)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(0, 229, 204, 0.2)',
                  color: '#00e5cc',
                  border: '1px solid rgba(0, 229, 204, 0.3)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 229, 204, 0.3)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 229, 204, 0.2)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Yes
              </button>
              <button
                onClick={() => handleCounterAction('no', 0)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 107, 157, 0.2)',
                  color: '#ff6b9d',
                  border: '1px solid rgba(255, 107, 157, 0.3)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 157, 0.3)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 107, 157, 0.2)'
                  e.currentTarget.style.transform = 'scale(1)'
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
                  padding: '14px 48px',
                  background: 'rgba(124, 111, 255, 0.25)',
                  color: '#7c6fff',
                  border: '1px solid rgba(124, 111, 255, 0.4)',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(124, 111, 255, 0.35)'
                  e.currentTarget.style.transform = 'scale(1.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(124, 111, 255, 0.25)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                +{data.counterSettings?.incrementValue || 1}
              </button>
            </div>
          )}
          </div>
        </DashboardCard>
        )}
        
        <div
          onClick={onAddCard}
          style={{
            padding: '20px',
            background: 'rgba(20, 25, 32, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            cursor: 'pointer',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed rgba(124, 111, 255, 0.3)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(124, 111, 255, 0.12)'
            e.currentTarget.style.borderColor = 'rgba(124, 111, 255, 0.5)'
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.5)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(20, 25, 32, 0.4)'
            e.currentTarget.style.borderColor = 'rgba(124, 111, 255, 0.3)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: '56px', 
              color: '#7c6fff', 
              marginBottom: '8px',
              fontWeight: 300,
              lineHeight: 1
            }}>
              +
            </div>
            <div style={{ fontSize: '14px', color: '#7c6fff', fontWeight: 600, letterSpacing: '0.01em' }}>
              Add Card
            </div>
          </div>
        </div>
      </div>
      
      {data.cards.length === 0 && (
        <div style={{
          padding: '48px 20px',
          background: 'rgba(20, 25, 32, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '2px dashed rgba(139, 146, 176, 0.25)',
          textAlign: 'center',
          color: '#8b92b0',
          fontSize: '14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
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
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 100
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(28, 33, 40, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '28px',
            width: '90%',
            maxWidth: '400px',
            zIndex: 101,
            border: '1px solid rgba(139, 146, 176, 0.15)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 600, color: '#ffffff' }}>
              Add Note (Optional)
            </h3>
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Add a note..."
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '14px',
                fontSize: '14px',
                minHeight: '120px',
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'vertical',
                background: 'rgba(13, 17, 23, 0.6)',
                color: '#ffffff',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setShowNoteModal(false)
                  setCurrentNote('')
                  setPendingAction(null)
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNote}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'linear-gradient(135deg, #7c6fff, #a78bff)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 600,
                  boxShadow: '0 4px 16px rgba(124, 111, 255, 0.4)'
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </>
      )}
      </div>
      
      {hasPaymentsCard && (
        <FAB onClick={onOpenBottomSheet} />
      )}
    </>
  )
}
