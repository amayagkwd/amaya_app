import { useState, useEffect } from 'react'
import theme from '../theme'

// Weather code mapping to emoji and description
const getWeatherInfo = (code) => {
  if (code === 0) return { emoji: '☀️', description: 'Clear' }
  if (code === 1 || code === 2) return { emoji: '🌤️', description: 'Partly Cloudy' }
  if (code === 3) return { emoji: '☁️', description: 'Cloudy' }
  if (code >= 45 && code <= 48) return { emoji: '🌫️', description: 'Foggy' }
  if (code >= 51 && code <= 57) return { emoji: '🌦️', description: 'Drizzle' }
  if (code >= 61 && code <= 67) return { emoji: '🌧️', description: 'Rainy' }
  if (code >= 71 && code <= 77) return { emoji: '🌨️', description: 'Snowy' }
  if (code >= 80 && code <= 82) return { emoji: '🌧️', description: 'Rain Showers' }
  if (code >= 85 && code <= 86) return { emoji: '🌨️', description: 'Snow Showers' }
  if (code >= 95 && code <= 99) return { emoji: '⛈️', description: 'Thunderstorm' }
  return { emoji: '🌤️', description: 'Unknown' }
}

export default function Weather({ data, updateStore }) {
  const [showTemperature, setShowTemperature] = useState(true)
  const [showWeather, setShowWeather] = useState(true)
  const [rainCheck, setRainCheck] = useState(false)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('18:00')
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load settings from store if they exist
    if (data.weatherSettings) {
      setShowTemperature(data.weatherSettings.showTemperature !== false)
      setShowWeather(data.weatherSettings.showWeather !== false)
      setRainCheck(data.weatherSettings.rainCheck || false)
      setStartTime(data.weatherSettings.startTime || '09:00')
      setEndTime(data.weatherSettings.endTime || '18:00')
    }
  }, [data.weatherSettings])

  useEffect(() => {
    // Fetch weather data
    const fetchWeather = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=18.52&longitude=73.85&current=temperature_2m,weathercode,windspeed_10m&hourly=precipitation_probability'
        )
        const result = await response.json()
        setWeatherData(result)
        setError(null)
      } catch (err) {
        setError('Failed to fetch weather data')
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleToggleTemperature = () => {
    const newValue = !showTemperature
    setShowTemperature(newValue)
    updateStore(current => ({
      ...current,
      weatherSettings: {
        ...current.weatherSettings,
        showTemperature: newValue
      }
    }))
  }

  const handleToggleWeather = () => {
    const newValue = !showWeather
    setShowWeather(newValue)
    updateStore(current => ({
      ...current,
      weatherSettings: {
        ...current.weatherSettings,
        showWeather: newValue
      }
    }))
  }

  const handleToggleRainCheck = () => {
    const newValue = !rainCheck
    setRainCheck(newValue)
    updateStore(current => ({
      ...current,
      weatherSettings: {
        ...current.weatherSettings,
        rainCheck: newValue
      }
    }))
  }

  const handleStartTimeChange = (e) => {
    const newValue = e.target.value
    setStartTime(newValue)
    updateStore(current => ({
      ...current,
      weatherSettings: {
        ...current.weatherSettings,
        startTime: newValue
      }
    }))
  }

  const handleEndTimeChange = (e) => {
    const newValue = e.target.value
    setEndTime(newValue)
    updateStore(current => ({
      ...current,
      weatherSettings: {
        ...current.weatherSettings,
        endTime: newValue
      }
    }))
  }

  const currentTemp = weatherData?.current?.temperature_2m
  const currentWeatherCode = weatherData?.current?.weathercode
  const weatherInfo = currentWeatherCode !== undefined ? getWeatherInfo(currentWeatherCode) : null

  return (
    <div style={{ padding: theme.spacing.xl }}>
      <h2 style={{ fontSize: theme.typography.h2, margin: `0 0 ${theme.spacing.xxl} 0`, color: theme.colors.textPrimary }}>Weather</h2>

      {loading && (
        <div style={{
          background: theme.colors.bgCard,
          backdropFilter: theme.backdropFilter,
          WebkitBackdropFilter: theme.backdropFilter,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.lg,
          textAlign: 'center',
          color: theme.colors.textSecondary,
          border: `1px solid ${theme.colors.borderSubtle}`,
          boxShadow: theme.shadows.card
        }}>
          Loading weather data...
        </div>
      )}

      {error && (
        <div style={{
          background: theme.colors.bgCard,
          backdropFilter: theme.backdropFilter,
          WebkitBackdropFilter: theme.backdropFilter,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.xl,
          marginBottom: theme.spacing.lg,
          textAlign: 'center',
          color: theme.colors.error,
          border: `1px solid ${theme.colors.borderSubtle}`,
          boxShadow: theme.shadows.card
        }}>
          {error}
        </div>
      )}

      {!loading && !error && weatherData && (
        <div style={{
          background: theme.colors.bgCard,
          backdropFilter: theme.backdropFilter,
          WebkitBackdropFilter: theme.backdropFilter,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.lg,
          textAlign: 'center',
          border: `1px solid ${theme.colors.borderSubtle}`,
          boxShadow: theme.shadows.card
        }}>
          <h3 style={{ margin: `0 0 ${theme.spacing.sm} 0`, fontSize: theme.typography.body, fontWeight: theme.typography.semiBold, color: theme.colors.textSecondary }}>
            Current Weather
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: theme.spacing.md }}>
            {showTemperature && currentTemp !== undefined && (
              <div style={{ fontSize: theme.typography.h2, fontWeight: theme.typography.semiBold, color: theme.colors.textPrimary }}>
                {Math.round(currentTemp)}°C
              </div>
            )}
            {showWeather && weatherInfo && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '28px' }}>{weatherInfo.emoji}</span>
                <span style={{ fontSize: theme.typography.caption, color: theme.colors.textSecondary }}>{weatherInfo.description}</span>
              </div>
            )}
          </div>
        </div>
      )}

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
              onClick={handleToggleTemperature}
              style={{
                width: '44px',
                height: '26px',
                borderRadius: '13px',
                border: 'none',
                background: showTemperature ? theme.colors.accentPurple : theme.colors.borderMedium,
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
                left: showTemperature ? '20px' : '2px',
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
              onClick={handleToggleWeather}
              style={{
                width: '44px',
                height: '26px',
                borderRadius: '13px',
                border: 'none',
                background: showWeather ? theme.colors.accentPurple : theme.colors.borderMedium,
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
                left: showWeather ? '20px' : '2px',
                transition: theme.transitions.fast,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{
        height: '1px',
        background: theme.colors.borderSubtle,
        marginBottom: theme.spacing.lg
      }} />

      <div style={{
        background: theme.colors.bgCard,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.md,
        border: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: theme.shadows.card
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
            onClick={handleToggleRainCheck}
            style={{
              width: '52px',
              height: '32px',
              borderRadius: '16px',
              border: 'none',
              background: rainCheck ? theme.colors.accentPurple : theme.colors.borderMedium,
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
              left: rainCheck ? '22px' : '2px',
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
              value={startTime}
              onChange={handleStartTimeChange}
              disabled={!rainCheck}
              style={{
                width: '100%',
                padding: '6px',
                border: `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: '6px',
                fontSize: theme.typography.caption,
                background: rainCheck ? theme.colors.bgCardDark : theme.colors.bgSecondary,
                color: rainCheck ? theme.colors.textPrimary : theme.colors.textMuted,
                cursor: rainCheck ? 'pointer' : 'not-allowed',
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
              value={endTime}
              onChange={handleEndTimeChange}
              disabled={!rainCheck}
              style={{
                width: '100%',
                padding: '6px',
                border: `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: '6px',
                fontSize: theme.typography.caption,
                background: rainCheck ? theme.colors.bgCardDark : theme.colors.bgSecondary,
                color: rainCheck ? theme.colors.textPrimary : theme.colors.textMuted,
                cursor: rainCheck ? 'pointer' : 'not-allowed',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
