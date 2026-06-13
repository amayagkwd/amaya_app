import { useState, useRef, useEffect } from 'react'
import { countries } from '../utils/countries'

export default function OnboardingModal({ onComplete }) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [country, setCountry] = useState('')
  const [focusedField, setFocusedField] = useState(null)
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [dobPickerOpen, setDobPickerOpen] = useState(false)
  
  const canSubmit = name.trim() && dob.trim() && country.trim()
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (canSubmit) {
      onComplete({ name: name.trim(), dob: dob.trim(), country: country.trim() })
    }
  }
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '24px',
        padding: '40px 32px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            👋
          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: '0 0 8px 0'
          }}>
            Welcome!
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#6b7280',
            margin: 0
          }}>
            Let's get to know you better
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <FloatingLabelInput
            label="Your Name"
            value={name}
            onChange={setName}
            focused={focusedField === 'name'}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            autoFocus
          />
          
          <DateOfBirthPicker
            value={dob}
            onChange={setDob}
            isOpen={dobPickerOpen}
            onToggle={() => setDobPickerOpen(!dobPickerOpen)}
            onClose={() => setDobPickerOpen(false)}
            focused={focusedField === 'dob'}
            onFocus={() => setFocusedField('dob')}
            onBlur={() => setFocusedField(null)}
          />
          
          <CountryDropdown
            value={country}
            onChange={setCountry}
            isOpen={countryDropdownOpen}
            onToggle={() => setCountryDropdownOpen(!countryDropdownOpen)}
            onClose={() => setCountryDropdownOpen(false)}
            focused={focusedField === 'country'}
            onFocus={() => setFocusedField('country')}
            onBlur={() => setFocusedField(null)}
          />
          
          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              width: '100%',
              padding: '16px',
              marginTop: '24px',
              background: canSubmit ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e5e5e3',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: canSubmit ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
            }}
            onMouseDown={(e) => {
              if (canSubmit) {
                e.currentTarget.style.transform = 'scale(0.98)'
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Get Started
          </button>
        </form>
      </div>
    </div>
  )
}

function FloatingLabelInput({ label, value, onChange, focused, onFocus, onBlur, type = 'text', inputMode = 'text', autoFocus = false }) {
  const hasValue = value.length > 0
  const isActive = focused || hasValue
  
  return (
    <div style={{
      position: 'relative',
      marginBottom: '24px'
    }}>
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        autoFocus={autoFocus}
        style={{
          width: '100%',
          padding: '20px 16px 8px 16px',
          border: `2px solid ${focused ? '#667eea' : '#e5e5e3'}`,
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 500,
          color: '#1a1a1a',
          boxSizing: 'border-box',
          transition: 'all 0.2s',
          background: focused ? '#f9fafb' : '#fff',
          outline: 'none'
        }}
      />
      <label style={{
        position: 'absolute',
        left: '16px',
        top: isActive ? '8px' : '50%',
        transform: isActive ? 'translateY(0)' : 'translateY(-50%)',
        fontSize: isActive ? '12px' : '16px',
        fontWeight: isActive ? 600 : 500,
        color: focused ? '#667eea' : '#9ca3af',
        transition: 'all 0.2s',
        pointerEvents: 'none',
        background: '#fff',
        padding: '0 4px'
      }}>
        {label}
      </label>
    </div>
  )
}

function DateOfBirthPicker({ value, onChange, isOpen, onToggle, onClose, focused, onFocus, onBlur }) {
  const dropdownRef = useRef(null)
  const hasValue = value.length > 0
  const isActive = focused || hasValue || isOpen
  
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear - 25)
  const [selectedMonth, setSelectedMonth] = useState(0)
  const [selectedDay, setSelectedDay] = useState(1)
  
  useEffect(() => {
    if (isOpen && value) {
      const date = new Date(value)
      setSelectedYear(date.getFullYear())
      setSelectedMonth(date.getMonth())
      setSelectedDay(date.getDate())
    } else if (isOpen && !value) {
      setSelectedYear(currentYear - 25)
      setSelectedMonth(0)
      setSelectedDay(1)
    }
  }, [isOpen])
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])
  
  const handleDateSelect = () => {
    const year = selectedYear
    const month = String(selectedMonth + 1).padStart(2, '0')
    const day = String(selectedDay).padStart(2, '0')
    onChange(`${year}-${month}-${day}`)
    onClose()
  }
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }
  
  return (
    <div ref={dropdownRef} style={{ position: 'relative', marginBottom: '24px' }}>
      <button
        type="button"
        onClick={onToggle}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: '100%',
          padding: '20px 16px 8px 16px',
          border: `2px solid ${focused || isOpen ? '#667eea' : '#e5e5e3'}`,
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 500,
          color: value ? '#1a1a1a' : '#9ca3af',
          boxSizing: 'border-box',
          transition: 'all 0.2s',
          background: focused || isOpen ? '#f9fafb' : '#fff',
          outline: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>{value ? formatDate(value) : ''}</span>
        <span style={{ fontSize: '20px' }}>📅</span>
      </button>
      <label style={{
        position: 'absolute',
        left: '16px',
        top: isActive ? '8px' : '50%',
        transform: isActive ? 'translateY(0)' : 'translateY(-50%)',
        fontSize: isActive ? '12px' : '16px',
        fontWeight: isActive ? 600 : 500,
        color: focused || isOpen ? '#667eea' : '#9ca3af',
        transition: 'all 0.2s',
        pointerEvents: 'none',
        background: '#fff',
        padding: '0 4px'
      }}>
        Date of Birth
      </label>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#fff',
          border: '1px solid #e5e5e3',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 10,
          padding: '16px'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              style={{
                flex: 2,
                padding: '10px 8px',
                border: '1px solid #e5e5e3',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
                minWidth: 0
              }}
            >
              {months.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
            
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(parseInt(e.target.value))}
              style={{
                flex: 1,
                padding: '10px 8px',
                border: '1px solid #e5e5e3',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
                minWidth: 0
              }}
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                flex: 1.2,
                padding: '10px 8px',
                border: '1px solid #e5e5e3',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
                boxSizing: 'border-box',
                minWidth: 0
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            onClick={handleDateSelect}
            style={{
              width: '100%',
              padding: '12px',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  )
}

function CountryDropdown({ value, onChange, isOpen, onToggle, onClose, focused, onFocus, onBlur }) {
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)
  const hasValue = value.length > 0
  const isActive = focused || hasValue || isOpen
  
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
        setSearchQuery('')
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])
  
  const handleSelect = (countryName) => {
    onChange(countryName)
    onClose()
    setSearchQuery('')
  }
  
  return (
    <div ref={dropdownRef} style={{ position: 'relative', marginBottom: '24px' }}>
      <button
        type="button"
        onClick={onToggle}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: '100%',
          padding: '20px 16px 8px 16px',
          border: `2px solid ${focused || isOpen ? '#667eea' : '#e5e5e3'}`,
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: 500,
          color: value ? '#1a1a1a' : '#9ca3af',
          boxSizing: 'border-box',
          transition: 'all 0.2s',
          background: focused || isOpen ? '#f9fafb' : '#fff',
          outline: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>{value || ''}</span>
        <span style={{ 
          fontSize: '12px',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }}>
          ▼
        </span>
      </button>
      <label style={{
        position: 'absolute',
        left: '16px',
        top: isActive ? '8px' : '50%',
        transform: isActive ? 'translateY(0)' : 'translateY(-50%)',
        fontSize: isActive ? '12px' : '16px',
        fontWeight: isActive ? 600 : 500,
        color: focused || isOpen ? '#667eea' : '#9ca3af',
        transition: 'all 0.2s',
        pointerEvents: 'none',
        background: '#fff',
        padding: '0 4px'
      }}>
        Country
      </label>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: '#fff',
          border: '1px solid #e5e5e3',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '200px'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #f3f4f6' }}>
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e5e3',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredCountries.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No countries found
              </div>
            ) : (
              filteredCountries.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country.name)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: value === country.name ? '#f9f9f7' : 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '15px',
                    color: '#1a1a1a',
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{country.name}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {country.currency} {country.currencyName}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
