import { useState, useEffect } from 'react'

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
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', margin: '0 0 24px 0' }}>Weather</h2>

      {loading && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          Loading weather data...
        </div>
      )}

      {error && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          textAlign: 'center',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      {!loading && !error && weatherData && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>
            Current Weather
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            {showTemperature && currentTemp !== undefined && (
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#1a1a1a' }}>
                {Math.round(currentTemp)}°C
              </div>
            )}
            {showWeather && weatherInfo && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <span style={{ fontSize: '28px' }}>{weatherInfo.emoji}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{weatherInfo.description}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
              Show Temperature
            </div>
            <button
              onClick={handleToggleTemperature}
              style={{
                width: '44px',
                height: '26px',
                borderRadius: '13px',
                border: 'none',
                background: showTemperature ? '#4f46e5' : '#e5e5e3',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '2px',
                left: showTemperature ? '20px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          <div style={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px',
            background: '#f9fafb',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
              Show Weather
            </div>
            <button
              onClick={handleToggleWeather}
              style={{
                width: '44px',
                height: '26px',
                borderRadius: '13px',
                border: 'none',
                background: showWeather ? '#4f46e5' : '#e5e5e3',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#fff',
                position: 'absolute',
                top: '2px',
                left: showWeather ? '20px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>
        </div>
      </div>

      <div style={{
        height: '1px',
        background: '#e5e5e3',
        marginBottom: '16px'
      }} />

      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '12px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>
            Rain Check
          </div>
          <button
            onClick={handleToggleRainCheck}
            style={{
              width: '52px',
              height: '32px',
              borderRadius: '16px',
              border: 'none',
              background: rainCheck ? '#4f46e5' : '#e5e5e3',
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
              left: rainCheck ? '22px' : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px', 
              color: '#6b7280', 
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
                border: '1px solid #e5e5e3',
                borderRadius: '6px',
                fontSize: '12px',
                background: rainCheck ? '#fff' : '#f9fafb',
                color: rainCheck ? '#1a1a1a' : '#9ca3af',
                cursor: rainCheck ? 'pointer' : 'not-allowed',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            marginTop: '16px' 
          }}>
            →
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '11px', 
              color: '#6b7280', 
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
                border: '1px solid #e5e5e3',
                borderRadius: '6px',
                fontSize: '12px',
                background: rainCheck ? '#fff' : '#f9fafb',
                color: rainCheck ? '#1a1a1a' : '#9ca3af',
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
