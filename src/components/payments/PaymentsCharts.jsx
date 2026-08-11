import { useMemo, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'
import theme from '../../theme'

const COLORS = ['#10b981', '#4f46e5', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16']

export default function PaymentsCharts({ allTransactions, categories, country, isYearly, selectedYear }) {
  const [selectedDay, setSelectedDay] = useState(null)
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [currentChartIndex, setCurrentChartIndex] = useState(0)
  const [currentWeek, setCurrentWeek] = useState(0)
  const [currentHalfYear, setCurrentHalfYear] = useState(0)
  const [legendOpen, setLegendOpen] = useState({})
  const carouselRef = useRef(null)
  const weekCarouselRef = useRef(null)
  const monthCarouselRef = useRef(null)
  
  // Disable scroll when modal is open
  useEffect(() => {
    if (selectedDay || selectedMonth) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedDay, selectedMonth])
  
  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft
      const containerWidth = carouselRef.current.offsetWidth
      const index = Math.round(scrollLeft / containerWidth)
      setCurrentChartIndex(index)
      setLegendOpen({}) // Close all legends on scroll
    }
  }
  
  const handleWeekScroll = () => {
    if (weekCarouselRef.current) {
      const scrollLeft = weekCarouselRef.current.scrollLeft
      const containerWidth = weekCarouselRef.current.offsetWidth
      const index = Math.round(scrollLeft / containerWidth)
      setCurrentWeek(index)
    }
  }
  
  const handleMonthScroll = () => {
    if (monthCarouselRef.current) {
      const scrollLeft = monthCarouselRef.current.scrollLeft
      const containerWidth = monthCarouselRef.current.offsetWidth
      const index = Math.round(scrollLeft / containerWidth)
      setCurrentHalfYear(index)
    }
  }
  
  const scrollToChart = (index) => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth
      carouselRef.current.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth'
      })
    }
  }
  
  const weeklyData = useMemo(() => {
    const expenseTxns = allTransactions.filter(t => t.type === 'expense')
    
    // Group by date
    const byDate = {}
    const transactionsByDate = {}
    expenseTxns.forEach(t => {
      const dateStr = t.date
      byDate[dateStr] = (byDate[dateStr] || 0) + t.amount
      if (!transactionsByDate[dateStr]) transactionsByDate[dateStr] = []
      transactionsByDate[dateStr].push(t)
    })
    
    // Get all dates in the month and organize by weeks
    const dates = Object.keys(byDate).sort()
    
    // Determine the year and month from selected date or first transaction
    let year, month
    if (dates.length === 0) {
      // No transactions, use current selected date
      const now = new Date()
      year = now.getFullYear()
      month = now.getMonth()
    } else {
      const firstDate = new Date(dates[0] + 'T00:00:00')
      year = firstDate.getFullYear()
      month = firstDate.getMonth()
    }
    
    // Get first and last day of month
    const firstDayOfMonth = new Date(year, month, 1)
    const lastDayOfMonth = new Date(year, month + 1, 0)
    
    // Create weeks with padding from previous/next months
    const weeks = []
    let currentWeekData = []
    let currentWeekIndex = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Start from the first day of the month
    const currentDate = new Date(firstDayOfMonth)
    
    // Pad the beginning with previous month dates if first day is not Sunday
    const firstDayOfWeek = firstDayOfMonth.getDay() // 0 = Sunday
    if (firstDayOfWeek !== 0) {
      // Add previous month dates
      const prevMonthDate = new Date(year, month, 0) // Last day of previous month
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const padDate = new Date(prevMonthDate)
        padDate.setDate(prevMonthDate.getDate() - i)
        const year = padDate.getFullYear()
        const month = String(padDate.getMonth() + 1).padStart(2, '0')
        const day = String(padDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        currentWeekData.push({
          date: padDate.getDate(),
          amount: byDate[dateStr] || 0,
          dateStr: dateStr,
          isOutsideMonth: true
        })
      }
    }
    
    // Add current month dates
    while (currentDate <= lastDayOfMonth) {
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      const dayOfWeek = currentDate.getDay() // 0 = Sunday
      
      currentWeekData.push({
        date: currentDate.getDate(),
        amount: byDate[dateStr] || 0,
        dateStr: dateStr,
        isOutsideMonth: false
      })
      
      // Check if current date falls in this week
      const checkDate = new Date(currentDate)
      checkDate.setHours(0, 0, 0, 0)
      if (checkDate.getTime() === today.getTime()) {
        currentWeekIndex = weeks.length
      }
      
      // End of week (Saturday)
      if (dayOfWeek === 6) {
        weeks.push([...currentWeekData])
        currentWeekData = []
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Pad the last week with next month dates if needed
    if (currentWeekData.length > 0) {
      const nextMonthDate = new Date(year, month + 1, 1) // First day of next month
      const daysToAdd = 7 - currentWeekData.length
      for (let i = 0; i < daysToAdd; i++) {
        const padDate = new Date(nextMonthDate)
        padDate.setDate(nextMonthDate.getDate() + i)
        const year = padDate.getFullYear()
        const month = String(padDate.getMonth() + 1).padStart(2, '0')
        const day = String(padDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        currentWeekData.push({
          date: padDate.getDate(),
          amount: byDate[dateStr] || 0,
          dateStr: dateStr,
          isOutsideMonth: true
        })
      }
      weeks.push([...currentWeekData])
    }
    
    return { weeks, currentWeekIndex, transactionsByDate }
  }, [allTransactions])
  
  const monthlyData = useMemo(() => {
    if (!isYearly) return { halfYears: [], currentHalfYearIndex: 0, categoryByMonth: {} }
    
    const expenseTxns = allTransactions.filter(t => t.type === 'expense')
    
    // Group by month
    const byMonth = {}
    const categoryByMonth = {}
    
    expenseTxns.forEach(t => {
      const date = new Date(t.date)
      const monthIndex = date.getMonth() // 0-11
      
      byMonth[monthIndex] = (byMonth[monthIndex] || 0) + t.amount
      
      if (!categoryByMonth[monthIndex]) categoryByMonth[monthIndex] = {}
      const category = categories.find(c => c.id === t.categoryId)
      const categoryName = category?.name || 'Unknown'
      categoryByMonth[monthIndex][categoryName] = (categoryByMonth[monthIndex][categoryName] || 0) + t.amount
    })
    
    // Create two half-year arrays
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const firstHalf = []
    const secondHalf = []
    
    for (let i = 0; i < 6; i++) {
      firstHalf.push({
        month: i,
        monthName: monthNames[i],
        amount: byMonth[i] || 0
      })
    }
    
    for (let i = 6; i < 12; i++) {
      secondHalf.push({
        month: i,
        monthName: monthNames[i],
        amount: byMonth[i] || 0
      })
    }
    
    // Determine current half year
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const currentHalfYearIndex = (selectedYear === currentYear && currentMonth >= 6) ? 1 : 0
    
    return { 
      halfYears: [firstHalf, secondHalf], 
      currentHalfYearIndex,
      categoryByMonth
    }
  }, [allTransactions, isYearly, selectedYear, categories])
  
  // Scroll to current week/half-year on mount
  useEffect(() => {
    if (isYearly && monthCarouselRef.current && monthlyData.halfYears.length > 0) {
      const containerWidth = monthCarouselRef.current.offsetWidth
      monthCarouselRef.current.scrollTo({
        left: monthlyData.currentHalfYearIndex * containerWidth,
        behavior: 'auto'
      })
      setCurrentHalfYear(monthlyData.currentHalfYearIndex)
    } else if (!isYearly && weekCarouselRef.current && weeklyData.weeks.length > 0) {
      const containerWidth = weekCarouselRef.current.offsetWidth
      weekCarouselRef.current.scrollTo({
        left: weeklyData.currentWeekIndex * containerWidth,
        behavior: 'auto'
      })
      setCurrentWeek(weeklyData.currentWeekIndex)
    }
  }, [isYearly, weeklyData.currentWeekIndex, weeklyData.weeks.length, monthlyData.currentHalfYearIndex, monthlyData.halfYears.length])
  
  const maxAmount = useMemo(() => {
    if (isYearly) {
      let max = 0
      monthlyData.halfYears.forEach(halfYear => {
        halfYear.forEach(month => {
          if (month.amount > max) max = month.amount
        })
      })
      return max || 100
    } else {
      let max = 0
      weeklyData.weeks.forEach(week => {
        week.forEach(day => {
          if (day.amount > max) max = day.amount
        })
      })
      return max || 100
    }
  }, [isYearly, weeklyData.weeks, monthlyData.halfYears])
  
  const incomeBreakdown = useMemo(() => {
    const incomeTxns = allTransactions.filter(t => t.type === 'income')
    const total = incomeTxns.reduce((sum, t) => sum + t.amount, 0)
    
    const byCategory = {}
    incomeTxns.forEach(t => {
      const category = categories.find(c => c.id === t.categoryId)
      const name = category?.name || 'Unknown'
      byCategory[name] = (byCategory[name] || 0) + t.amount
    })
    
    const result = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0
    }))
    
    return result.length > 0 ? { data: result, total } : null
  }, [allTransactions, categories])
  
  const expenseBreakdown = useMemo(() => {
    const expenseTxns = allTransactions.filter(t => t.type === 'expense')
    const total = expenseTxns.reduce((sum, t) => sum + t.amount, 0)
    
    const byCategory = {}
    expenseTxns.forEach(t => {
      const category = categories.find(c => c.id === t.categoryId)
      const name = category?.name || 'Unknown'
      byCategory[name] = (byCategory[name] || 0) + t.amount
    })
    
    const result = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0
    }))
    
    return result.length > 0 ? { data: result, total } : null
  }, [allTransactions, categories])
  
  const needsVsWants = useMemo(() => {
    const expenseTxns = allTransactions.filter(t => t.type === 'expense')
    const total = expenseTxns.reduce((sum, t) => sum + t.amount, 0)
    
    const needs = expenseTxns.filter(t => t.classification === 'need').reduce((sum, t) => sum + t.amount, 0)
    const wants = expenseTxns.filter(t => t.classification === 'want').reduce((sum, t) => sum + t.amount, 0)
    
    if (needs === 0 && wants === 0) return null
    
    return {
      data: [
        { name: 'Needs', value: needs, percentage: total > 0 ? Math.round((needs / total) * 100) : 0 },
        { name: 'Wants', value: wants, percentage: total > 0 ? Math.round((wants / total) * 100) : 0 }
      ],
      total
    }
  }, [allTransactions])
  
  return (
    <div>
      {isYearly ? (
        // Monthly view for yearly selection
        monthlyData.halfYears.length > 0 && monthlyData.halfYears.some(half => half.some(m => m.amount > 0)) && (
          <div style={{ 
            background: theme.colors.bgCard,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            padding: theme.spacing.lg,
            borderRadius: theme.borderRadius.lg,
            marginBottom: theme.spacing.xxxl,
            position: 'relative',
            border: `1px solid ${theme.colors.borderSubtle}`,
            boxShadow: theme.shadows.card
          }}>
            <h4 style={{ 
              fontSize: theme.typography.h5, 
              fontWeight: theme.typography.medium, 
              margin: `0 0 ${theme.spacing.lg} 0`, 
              textAlign: 'center',
              color: theme.colors.textPrimary 
            }}>
              {currentHalfYear === 0 ? 'Jan - Jun' : 'Jul - Dec'}
            </h4>
            
            <div 
              ref={monthCarouselRef}
              onScroll={handleMonthScroll}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                overflowX: 'scroll',
                scrollSnapType: 'x mandatory',
                gap: '0px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'auto'
              }}
            >
              {monthlyData.halfYears.map((halfYear, halfYearIndex) => (
                <div 
                  key={halfYearIndex}
                  style={{ 
                    minWidth: '100%', 
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                    padding: '0 2px'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    justifyContent: 'space-around',
                    height: '200px',
                    gap: '8px',
                    paddingBottom: '8px'
                  }}>
                    {halfYear.map((month, index) => {
                      const heightPixels = month.amount > 0 ? Math.max((month.amount / maxAmount) * 200, 10) : 0
                      return (
                        <div 
                          key={index} 
                          style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            flex: 1,
                            height: '100%',
                            justifyContent: 'flex-end'
                          }}
                        >
                          <div 
                            onClick={() => {
                              if (month.amount > 0) {
                                setSelectedMonth(month)
                              }
                            }}
                            style={{
                              width: '100%',
                              maxWidth: '40px',
                              height: `${heightPixels}px`,
                              background: theme.colors.accentPurple,
                              borderRadius: '4px 4px 0 0',
                              cursor: month.amount > 0 ? 'pointer' : 'default',
                              transition: theme.transitions.fast
                            }}
                            onMouseEnter={(e) => month.amount > 0 && (e.currentTarget.style.opacity = '0.8')}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          />
                          <div style={{ 
                            fontSize: theme.typography.caption, 
                            color: theme.colors.textSecondary,
                            marginTop: theme.spacing.sm
                          }}>
                            {month.monthName}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: theme.spacing.sm,
              marginTop: theme.spacing.lg
            }}>
              {monthlyData.halfYears.map((_, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (monthCarouselRef.current) {
                      const containerWidth = monthCarouselRef.current.offsetWidth
                      monthCarouselRef.current.scrollTo({
                        left: index * containerWidth,
                        behavior: 'smooth'
                      })
                    }
                  }}
                  style={{
                    width: currentHalfYear === index ? '10px' : '8px',
                    height: currentHalfYear === index ? '10px' : '8px',
                    borderRadius: '50%',
                    background: currentHalfYear === index ? theme.colors.accentPurple : theme.colors.borderMedium,
                    cursor: 'pointer',
                    transition: theme.transitions.normal,
                    opacity: currentHalfYear === index ? 1 : 0.6
                  }}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        // Weekly view for monthly selection
        weeklyData.weeks.length > 0 && (
          <div style={{ 
          background: theme.colors.bgCard,
          backdropFilter: theme.backdropFilter,
          WebkitBackdropFilter: theme.backdropFilter,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
          marginBottom: theme.spacing.xxxl,
          position: 'relative',
          border: `1px solid ${theme.colors.borderSubtle}`,
          boxShadow: theme.shadows.card
        }}>
          <h4 style={{ 
            fontSize: theme.typography.h5, 
            fontWeight: theme.typography.medium, 
            margin: `0 0 ${theme.spacing.lg} 0`, 
            textAlign: 'center',
            color: theme.colors.textPrimary 
          }}>
            Week {currentWeek + 1}
          </h4>
          
          <div 
            ref={weekCarouselRef}
            onScroll={handleWeekScroll}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              overflowX: 'scroll',
              scrollSnapType: 'x mandatory',
              gap: '0px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'auto'
            }}
          >
            {weeklyData.weeks.map((week, weekIndex) => (
              <div 
                key={weekIndex}
                style={{ 
                  minWidth: '100%', 
                  scrollSnapAlign: 'start',
                  scrollSnapStop: 'always',
                  padding: '0 2px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-end', 
                  justifyContent: 'space-around',
                  height: '200px',
                  gap: '8px',
                  paddingBottom: '8px'
                }}>
                  {week.map((day, index) => {
                    const heightPixels = day.amount > 0 ? Math.max((day.amount / maxAmount) * 200, 10) : 0
                    const barColor = day.isOutsideMonth ? 'rgba(139, 92, 246, 0.3)' : theme.colors.accentPurple
                    const textColor = day.isOutsideMonth ? theme.colors.textMuted : theme.colors.textSecondary
                    
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          flex: 1,
                          height: '100%',
                          justifyContent: 'flex-end'
                        }}
                      >
                        <div 
                          onClick={() => {
                            if (day.amount > 0) {
                              setSelectedDay(day)
                            }
                          }}
                          style={{
                            width: '100%',
                            maxWidth: '40px',
                            height: `${heightPixels}px`,
                            background: barColor,
                            borderRadius: '4px 4px 0 0',
                            cursor: day.amount > 0 ? 'pointer' : 'default',
                            transition: theme.transitions.fast
                          }}
                          onMouseEnter={(e) => day.amount > 0 && (e.currentTarget.style.opacity = '0.8')}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        />
                        <div style={{ 
                          fontSize: theme.typography.caption, 
                          color: textColor,
                          marginTop: theme.spacing.sm
                        }}>
                          {day.date}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginTop: theme.spacing.lg
          }}>
            {weeklyData.weeks.map((_, index) => (
              <div
                key={index}
                onClick={() => {
                  if (weekCarouselRef.current) {
                    const containerWidth = weekCarouselRef.current.offsetWidth
                    weekCarouselRef.current.scrollTo({
                      left: index * containerWidth,
                      behavior: 'smooth'
                    })
                  }
                }}
                style={{
                  width: currentWeek === index ? '10px' : '8px',
                  height: currentWeek === index ? '10px' : '8px',
                  borderRadius: '50%',
                  background: currentWeek === index ? theme.colors.accentPurple : theme.colors.borderMedium,
                  cursor: 'pointer',
                  transition: theme.transitions.normal,
                  opacity: currentWeek === index ? 1 : 0.6
                }}
              />
            ))}
          </div>
        </div>
        )
      )}
      
      {selectedDay && selectedDay.amount > 0 && createPortal(
        <>
          <div
            onClick={() => setSelectedDay(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: theme.colors.bgModal,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.xl,
            zIndex: 301,
            maxWidth: '400px',
            width: '90%',
            maxHeight: '70vh',
            overflowY: 'auto',
            boxShadow: theme.shadows.strong,
            border: `1px solid ${theme.colors.borderSubtle}`
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: theme.spacing.lg
            }}>
              <div>
                <div style={{ 
                  fontSize: theme.typography.h4, 
                  fontWeight: theme.typography.semiBold, 
                  color: theme.colors.textPrimary 
                }}>
                  {formatCurrency(selectedDay.amount, country)}
                </div>
                <div style={{ 
                  fontSize: theme.typography.body, 
                  color: theme.colors.textSecondary, 
                  marginTop: '4px' 
                }}>
                  {new Date(selectedDay.dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedDay(null)
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: theme.colors.bgCardDark,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: theme.colors.textSecondary,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              {weeklyData.transactionsByDate[selectedDay.dateStr]?.map(txn => {
                const category = categories.find(c => c.id === txn.categoryId)
                return (
                  <div 
                    key={txn.id}
                    style={{
                      background: theme.colors.bgCard,
                      padding: theme.spacing.md,
                      borderRadius: theme.borderRadius.sm,
                      border: `1px solid ${theme.colors.borderSubtle}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: theme.typography.medium, 
                        fontSize: theme.typography.body,
                        color: theme.colors.textPrimary
                      }}>
                        {category?.name || 'Unknown'}
                      </div>
                      {txn.note && (
                        <div style={{ 
                          fontSize: theme.typography.bodySmall, 
                          color: theme.colors.textSecondary, 
                          marginTop: '4px' 
                        }}>
                          {txn.note}
                        </div>
                      )}
                    </div>
                    <span style={{ 
                      fontWeight: theme.typography.medium, 
                      color: theme.colors.accentPink, 
                      fontSize: theme.typography.body 
                    }}>
                      -{formatCurrency(txn.amount, country)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </>,
        document.body
      )}
      
      {selectedMonth && selectedMonth.amount > 0 && createPortal(
        <>
          <div
            onClick={() => setSelectedMonth(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: theme.colors.bgModal,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            borderRadius: theme.borderRadius.xl,
            padding: theme.spacing.xl,
            zIndex: 301,
            maxWidth: '400px',
            width: '90%',
            maxHeight: '70vh',
            overflowY: 'auto',
            boxShadow: theme.shadows.strong,
            border: `1px solid ${theme.colors.borderSubtle}`
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: theme.spacing.lg
            }}>
              <div>
                <div style={{ 
                  fontSize: theme.typography.h4, 
                  fontWeight: theme.typography.semiBold, 
                  color: theme.colors.textPrimary 
                }}>
                  {formatCurrency(selectedMonth.amount, country)}
                </div>
                <div style={{ 
                  fontSize: theme.typography.body, 
                  color: theme.colors.textSecondary, 
                  marginTop: '4px' 
                }}>
                  {selectedMonth.monthName} {selectedYear}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedMonth(null)
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: theme.colors.bgCardDark,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: theme.colors.textSecondary,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              {monthlyData.categoryByMonth[selectedMonth.month] && 
                Object.entries(monthlyData.categoryByMonth[selectedMonth.month])
                  .sort((a, b) => b[1] - a[1])
                  .map(([categoryName, amount]) => (
                    <div 
                      key={categoryName}
                      style={{
                        background: theme.colors.bgCard,
                        padding: theme.spacing.md,
                        borderRadius: theme.borderRadius.sm,
                        border: `1px solid ${theme.colors.borderSubtle}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ 
                        fontWeight: theme.typography.medium, 
                        fontSize: theme.typography.body,
                        color: theme.colors.textPrimary
                      }}>
                        {categoryName}
                      </div>
                      <span style={{ 
                        fontWeight: theme.typography.medium, 
                        color: theme.colors.accentPink, 
                        fontSize: theme.typography.body 
                      }}>
                        {formatCurrency(amount, country)}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>
        </>,
        document.body
      )}
      
      <div>
        <div 
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          style={{
            display: 'flex',
            overflowX: 'scroll',
            scrollSnapType: 'x mandatory',
            gap: '0px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'auto'
          }}
        >
          <style>
            {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          <div style={{ 
            minWidth: '100%', 
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            padding: '0 2px'
          }}>
            <ChartCard
              title="Expense Breakdown"
              chartData={expenseBreakdown ? { ...expenseBreakdown, country } : null}
              colors={COLORS.slice().reverse()}
              legendOpen={legendOpen['expense'] || false}
              onToggleLegend={() => setLegendOpen(prev => ({ ...prev, expense: !prev['expense'] }))}
            />
          </div>
          
          <div style={{ 
            minWidth: '100%', 
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            padding: '0 2px'
          }}>
            <ChartCard
              title="Income Breakdown"
              chartData={incomeBreakdown ? { ...incomeBreakdown, country } : null}
              colors={COLORS}
              legendOpen={legendOpen['income'] || false}
              onToggleLegend={() => setLegendOpen(prev => ({ ...prev, income: !prev['income'] }))}
            />
          </div>
          
          <div style={{ 
            minWidth: '100%', 
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            padding: '0 2px'
          }}>
            <ChartCard
              title="Needs vs Wants"
              chartData={needsVsWants ? { ...needsVsWants, country } : null}
              colors={['#4f46e5', '#f43f5e']}
              legendOpen={legendOpen['needs'] || false}
              onToggleLegend={() => setLegendOpen(prev => ({ ...prev, needs: !prev['needs'] }))}
            />
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: theme.spacing.sm,
          marginTop: theme.spacing.lg
        }}>
          {[0, 1, 2].map(index => (
            <div
              key={index}
              onClick={() => scrollToChart(index)}
              style={{
                width: currentChartIndex === index ? '10px' : '8px',
                height: currentChartIndex === index ? '10px' : '8px',
                borderRadius: '50%',
                background: currentChartIndex === index ? theme.colors.accentPurple : theme.colors.borderMedium,
                cursor: 'pointer',
                transition: theme.transitions.normal,
                opacity: currentChartIndex === index ? 1 : 0.6
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, chartData, colors, style, legendOpen, onToggleLegend }) {
  if (!chartData) {
    return (
      <div style={{ 
        background: theme.colors.bgCard,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        border: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: theme.shadows.card,
        ...style
      }}>
        <h4 style={{ 
          fontSize: theme.typography.h5, 
          fontWeight: theme.typography.medium, 
          marginBottom: theme.spacing.lg, 
          margin: `0 0 ${theme.spacing.lg} 0`,
          color: theme.colors.textPrimary
        }}>
          {title}
        </h4>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: theme.colors.textSecondary
        }}>
          No data available
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ 
      background: theme.colors.bgCard,
      backdropFilter: theme.backdropFilter,
      WebkitBackdropFilter: theme.backdropFilter,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      border: `1px solid ${theme.colors.borderSubtle}`,
      boxShadow: theme.shadows.card,
      ...style
    }}>
      <h4 style={{ 
        fontSize: theme.typography.h5, 
        fontWeight: theme.typography.medium, 
        marginBottom: theme.spacing.lg, 
        margin: `0 0 ${theme.spacing.lg} 0`,
        color: theme.colors.textPrimary
      }}>
        {title}
      </h4>
      
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData.data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              dataKey="value"
              animationDuration={0}
              isAnimationActive={false}
              stroke="none"
            >
              {chartData.data.map((entry, index) => (
                <Cell key={index} fill={colors[index % colors.length]} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ 
            fontSize: theme.typography.h3, 
            fontWeight: theme.typography.medium, 
            color: theme.colors.textPrimary 
          }}>
            {formatCurrency(chartData.total, chartData.country)}
          </div>
        </div>
      </div>
      
      <button
        onClick={onToggleLegend}
        style={{
          marginTop: theme.spacing.lg,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: theme.typography.body,
          color: theme.colors.textPrimary,
          fontWeight: theme.typography.medium,
          padding: '0'
        }}
      >
        Legend <span style={{ fontSize: theme.typography.h5, transform: legendOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>⌵</span>
      </button>
      
      {legendOpen && (
        <div style={{ marginTop: theme.spacing.md }}>
          {chartData.data.map((entry, index) => (
            <div 
              key={entry.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `${theme.spacing.sm} 0`,
                fontSize: theme.typography.bodySmall
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: colors[index % colors.length]
                }} />
                <span style={{ color: theme.colors.textPrimary }}>{entry.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <span style={{ color: theme.colors.textPrimary, fontWeight: theme.typography.medium }}>
                  {formatCurrency(entry.value, chartData.country)}
                </span>
                <span style={{ color: theme.colors.textSecondary, minWidth: '35px', textAlign: 'right' }}>
                  {entry.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
