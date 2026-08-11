import { useState, useMemo } from 'react'
import { getMonthYear } from '../../utils/formatDate'
import theme from '../../theme'

export default function PeriodSelector({ selectedDate, onDateChange, selectedYear, onYearChange, isYearly, onYearlyToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [customYear, setCustomYear] = useState(selectedYear?.toString() || new Date().getFullYear().toString())
  
  const last12Months = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date)
    }
    return months
  }, [])
  
  const handleYearlyClick = () => {
    onYearlyToggle(true)
    onYearChange(parseInt(customYear))
    setDropdownOpen(false)
  }
  
  const handleMonthSelect = (date) => {
    onYearlyToggle(false)
    onDateChange(date)
    setDropdownOpen(false)
  }
  
  const handleYearInputChange = (e) => {
    const value = e.target.value
    if (/^\d{0,4}$/.test(value)) {
      setCustomYear(value)
      if (value.length === 4) {
        onYearChange(parseInt(value))
      }
    }
  }
  
  const displayText = isYearly ? `Year ${selectedYear}` : getMonthYear(selectedDate)
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          background: theme.colors.bgCard,
          border: `1px solid ${theme.colors.borderSubtle}`,
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: theme.typography.body,
          display: 'flex',
          alignItems: 'center',
          WebkitTapHighlightColor: 'transparent',
          gap: theme.spacing.sm,
          color: theme.colors.textPrimary,
          fontWeight: theme.typography.medium,
          outline: 'none'
        }}
      >
        {displayText}
        <span style={{ fontSize: theme.typography.caption }}>▼</span>
      </button>
      
      {dropdownOpen && (
        <>
          <div
            onClick={() => setDropdownOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10
            }}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            background: theme.colors.bgModal,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            border: `1px solid ${theme.colors.borderSubtle}`,
            borderRadius: theme.borderRadius.sm,
            boxShadow: theme.shadows.card,
            zIndex: 11,
            minWidth: '180px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            {/* Yearly Option */}
            <div style={{
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              borderBottom: `1px solid ${theme.colors.borderSubtle}`,
              background: isYearly ? theme.colors.bgCardHover : 'transparent'
            }}>
              <button
                onClick={handleYearlyClick}
                style={{
                  width: '100%',
                  padding: 0,
                  background: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: theme.typography.body,
                  color: theme.colors.textPrimary,
                  outline: 'none',
                  marginBottom: isYearly ? theme.spacing.sm : 0
                }}
              >
                Yearly
              </button>
              
              {isYearly && (
                <input
                  type="text"
                  value={customYear}
                  onChange={handleYearInputChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="YYYY"
                  maxLength={4}
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    background: theme.colors.bgCardDark,
                    border: `1px solid ${theme.colors.borderSubtle}`,
                    borderRadius: theme.borderRadius.sm,
                    color: theme.colors.textPrimary,
                    fontSize: theme.typography.body,
                    outline: 'none',
                    marginTop: theme.spacing.sm
                  }}
                />
              )}
            </div>
            
            {/* Monthly Options */}
            {last12Months.map(month => (
              <button
                key={month.getTime()}
                onClick={() => handleMonthSelect(month)}
                style={{
                  width: '100%',
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  background: !isYearly && selectedDate.getMonth() === month.getMonth() && 
                             selectedDate.getFullYear() === month.getFullYear() 
                             ? theme.colors.bgCardHover : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: theme.typography.body,
                  color: theme.colors.textPrimary,
                  borderBottom: `1px solid ${theme.colors.borderSubtle}`,
                  outline: 'none'
                }}
              >
                {getMonthYear(month)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
