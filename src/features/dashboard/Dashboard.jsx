import { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGreeting, getTodayDate } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'
import { getMonthTransactions, calculateMonthStats } from '../../hooks/usePayments'
import { calculateMedianDailySpend, calculateHistoricalMedianDailySpend } from '../../utils/medianCalculator'
import { useBudget } from '../../hooks/useBudget'
import AddTransactionButton from '../common/AddTransactionButton'
import { showToast } from '../common/Toast'
import uuidv4 from '../../utils/uuid'
import theme, { componentStyles } from '../../theme'

export default function Dashboard({ data, onOpenBottomSheet, updateStore }) {
  const navigate = useNavigate()
  const [currentForecastIndex, setCurrentForecastIndex] = useState(0)
  const forecastCarouselRef = useRef(null)
  const [balanceEditOpen, setBalanceEditOpen] = useState(false)
  const [editedBalance, setEditedBalance] = useState('')
  const [balanceDate, setBalanceDate] = useState('')
  const [balanceNote, setBalanceNote] = useState('')
  const [isYearly, setIsYearly] = useState(false)
  
  // Get budget data (always uses current month, not affected by yearly toggle)
  const budgetData = useBudget(data)

  // Get settings
  const isBudgetEnabled = data.settings?.budget?.enabled || false
  const isPredictMonthEndEnabled = data.settings?.predictMonthEnd || false

  const handleForecastScroll = () => {
    if (forecastCarouselRef.current) {
      const scrollLeft = forecastCarouselRef.current.scrollLeft
      const containerWidth = forecastCarouselRef.current.offsetWidth
      const index = Math.round(scrollLeft / containerWidth)
      setCurrentForecastIndex(index)
    }
  }

  const scrollToForecast = (index) => {
    if (forecastCarouselRef.current) {
      const containerWidth = forecastCarouselRef.current.offsetWidth
      forecastCarouselRef.current.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth'
      })
    }
  }

  const stats = useMemo(() => {
    const now = new Date()
    const currentYear = now.getFullYear()

    let transactions
    if (isYearly) {
      transactions = data.payments.transactions.filter(t => {
        if (!t.date) return false
        const txnDate = new Date(t.date)
        return txnDate.getFullYear() === currentYear && t.categoryId !== 'month-balance'
      })
    } else {
      transactions = getMonthTransactions(
        data.payments.transactions,
        now.getFullYear(),
        now.getMonth()
      )
    }

    return calculateMonthStats(transactions)
  }, [data.payments.transactions, isYearly])
  
  // Always calculate current real balance for budget and forecast (regardless of view)
  const currentBalance = useMemo(() => {
    const now = new Date()
    const currentMonthTransactions = getMonthTransactions(
      data.payments.transactions,
      now.getFullYear(),
      now.getMonth()
    )
    return calculateMonthStats(currentMonthTransactions).balance
  }, [data.payments.transactions])

  const forecast = useMemo(() => {
    const now = new Date()
    const currentDay = now.getDate()
    const daysElapsed = currentDay

    // Check if we should show countdown (only once at app start)
    let hasSeenForecast = data.settings?.hasSeenForecast || false
    
    // Auto-set hasSeenForecast to true if user has transactions from previous months
    if (!hasSeenForecast) {
      const currentMonth = now.toISOString().slice(0, 7) // "YYYY-MM"
      const hasPreviousMonthData = data.payments.transactions.some(t => {
        if (!t.date) return false
        return t.date < currentMonth + '-01'
      })
      
      if (hasPreviousMonthData) {
        hasSeenForecast = true
        updateStore(current => ({
          ...current,
          settings: {
            ...current.settings,
            hasSeenForecast: true
          }
        }))
      }
    }
    
    // Show countdown only if: haven't seen it before AND less than 10 days
    if (!hasSeenForecast && daysElapsed < 10) {
      return {
        isCountdown: true,
        daysRemaining: 10 - daysElapsed
      }
    }
    
    // Mark as seen once we're past day 10
    if (!hasSeenForecast && daysElapsed >= 10) {
      updateStore(current => ({
        ...current,
        settings: {
          ...current.settings,
          hasSeenForecast: true
        }
      }))
    }

    const year = now.getFullYear()
    const month = now.getMonth()
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
    const daysRemaining = totalDaysInMonth - daysElapsed

    // Calculate median daily spend using ALL historical transactions
    const medianDailySpend = calculateHistoricalMedianDailySpend(data.payments.transactions)

    const projectedRemainingSpend = medianDailySpend * daysRemaining
    
    // Use the current real balance (not the view-filtered balance)
    const projectedMonthEndBalance = currentBalance - projectedRemainingSpend

    return {
      isCountdown: false,
      dailySpendForecast: medianDailySpend,
      monthEndProjection: projectedMonthEndBalance,
      // Flag if we have very limited data (first few days)
      isEarlyMonth: daysElapsed < 5
    }
  }, [data.payments.transactions, data.settings?.hasSeenForecast, currentBalance, updateStore])

  const showForecast = forecast !== null

  // Determine if we should show the forecast grid
  // Show grid if: budget is enabled OR (forecast exists AND prediction is enabled)
  const showForecastGrid = isBudgetEnabled || (showForecast && isPredictMonthEndEnabled)

  const balanceColor = stats.balance >= 0 ? theme.dashboardColors.cyan : theme.dashboardColors.pink

  // Get last 4 transactions
  const recentTransactions = useMemo(() => {
    return [...data.payments.transactions]
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA
        }
        return (b.timestamp || 0) - (a.timestamp || 0)
      })
      .slice(0, 4)
  }, [data.payments.transactions])

  const handleBalanceClick = (e) => {
    e.stopPropagation()
    setEditedBalance(String(stats.balance))
    setBalanceDate(new Date().toISOString().split('T')[0])
    setBalanceNote('')
    setBalanceEditOpen(true)
  }

  const handleBalanceSave = () => {
    const newBalance = parseFloat(editedBalance)
    if (isNaN(newBalance)) return

    const difference = newBalance - stats.balance
    if (difference !== 0) {
      // Create a balance adjustment transaction
      const transaction = {
        id: uuidv4(),
        type: 'balance-update',
        amount: Math.abs(difference),
        category: 'Balance Updated',
        categoryId: 'balance-update',
        date: balanceDate,
        note: balanceNote.trim() || null,
        timestamp: Date.now(),
        isBalanceUpdate: true,
        balanceChange: difference
      }

      updateStore(current => ({
        ...current,
        payments: {
          ...current.payments,
          transactions: [...current.payments.transactions, transaction]
        }
      }))

      showToast(`Balance updated by ${formatCurrency(Math.abs(difference), data.profile.country)}`)
    }

    setBalanceEditOpen(false)
  }

  return (
    <div
      style={{
        minHeight: '100%',
        boxSizing: 'border-box',
        padding: '20px 16px 128px',
        background: theme.dashboardColors.page,
        color: theme.dashboardColors.white,
        fontFamily: theme.typography.fontFamily,
        position: 'relative',
      }}
    >
      {/* Background shine effect */}
      <div style={componentStyles.backgroundShine} />
      {/* Greeting */}
      <section style={{ marginBottom: 18, position: 'relative', zIndex: 1 }}>
        <h2
          style={{
            ...componentStyles.greeting,
            margin: 0,
            color: theme.dashboardColors.white,
            fontSize: 'clamp(32px, 7vw, 42px)',
            lineHeight: 1.2,
            fontWeight: 800,
            letterSpacing: '-0.045em',
          }}
        >
          {getGreeting(data.profile.name).greeting},
          <br />
          {getGreeting(data.profile.name).name}.
        </h2>

        <p
          style={{
            ...componentStyles.greetingDate,
            margin: '8px 0 0',
            color: '#9BA9C2',
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          {getTodayDate()}
        </p>
      </section>

      {/* Payments */}
      <div
        id="tutorial-payments-card"
        role="button"
        tabIndex={0}
        style={{
          ...componentStyles.dashboardCard,
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
          padding: '18px 20px 18px',
          transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              ...componentStyles.dashboardIconBox('#B9B2FF', 'rgba(100,87,190,0.12)'),
              width: 36,
              height: 36,
              borderRadius: 11,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M3 8.5h18" stroke="currentColor" strokeWidth="1.8" />
                <path d="M15.5 13.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            <h3
              style={{
                margin: 0,
                color: theme.colors.accentPurple,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Payments
            </h3>
          </div>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.dashboardColors.cyan,
              background: 'rgba(0,229,204,0.10)',
              border: '1px solid rgba(0,229,204,0.28)',
              boxShadow: '0 0 22px rgba(0,229,204,0.12)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 18V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M7 14l3-3 2.5 2 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 7h1.5v1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div
          onClick={handleBalanceClick}
          style={{
            marginTop: 16,
            marginBottom: 14,
            color: balanceColor,
            fontSize: 'clamp(38px, 10vw, 50px)',
            lineHeight: 0.95,
            fontWeight: 850,
            letterSpacing: '-0.055em',
            position: 'relative',
            cursor: 'pointer',
            display: 'inline-block',
            padding: '8px 12px',
            marginLeft: '-12px',
            borderRadius: '12px',
            transition: 'background 180ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          {formatCurrency(stats.balance, data.profile.country)}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation()
              onOpenBottomSheet('transaction', 'income')
            }}
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 999,
                background: theme.dashboardColors.cyanSoft,
                color: theme.dashboardColors.cyan,
                fontSize: 14,
                fontWeight: 750,
                transition: 'transform 180ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>↑</span>
              {formatCurrency(stats.income, data.profile.country)}
            </div>
            <div
              style={{
                marginTop: 5,
                paddingLeft: 5,
                color: theme.dashboardColors.cyan,
                fontSize: 12,
                fontWeight: 650,
              }}
            >
              Income
            </div>
          </div>

          <div
            style={{
              width: 1,
              minHeight: 32,
              background: 'rgba(157,174,196,0.24)',
              alignSelf: 'center',
            }}
          />

          <div
            onClick={(e) => {
              e.stopPropagation()
              onOpenBottomSheet('transaction', 'expense')
            }}
            style={{ cursor: 'pointer' }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 999,
                background: theme.dashboardColors.pinkSoft,
                color: theme.dashboardColors.pink,
                fontSize: 14,
                fontWeight: 750,
                transition: 'transform 180ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>↓</span>
              {formatCurrency(stats.expenses, data.profile.country)}
            </div>
            <div
              style={{
                marginTop: 5,
                paddingLeft: 5,
                color: theme.dashboardColors.pink,
                fontSize: 12,
                fontWeight: 650,
              }}
            >
              Expense
            </div>
          </div>
        </div>
      </div>

      {/* Monthly/Yearly Toggle */}
      <div style={{
        marginTop: 16,
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{
          display: 'inline-flex',
          background: theme.colors.bgCard,
          borderRadius: '20px',
          padding: '4px',
          border: `1px solid ${theme.colors.borderSubtle}`,
          boxShadow: theme.shadows.card
        }}>
          <button
            onClick={() => setIsYearly(false)}
            style={{
              padding: '6px 20px',
              background: !isYearly ? theme.colors.accentPurple : 'transparent',
              color: !isYearly ? theme.colors.textPrimary : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: theme.typography.fontFamily
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            style={{
              padding: '6px 20px',
              background: isYearly ? theme.colors.accentPurple : 'transparent',
              color: isYearly ? theme.colors.textPrimary : theme.colors.textSecondary,
              border: 'none',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: theme.typography.fontFamily
            }}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Forecast cards */}
      {showForecastGrid && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 12,
            marginTop: 16,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Today's Budget box */}
          {isBudgetEnabled && (
            <div
              style={{
                ...componentStyles.forecastCard,
                display: budgetData && !budgetData.isPossible ? 'flex' : 'block',
                alignItems: budgetData && !budgetData.isPossible ? 'center' : 'initial',
                justifyContent: budgetData && !budgetData.isPossible ? 'center' : 'initial'
              }}
            >
              <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
                {budgetData && budgetData.isPossible && (
                  <h3
                    style={{
                      margin: 0,
                      color: theme.colors.accentPurple,
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Today's budget
                  </h3>
                )}
                {budgetData ? (
                  budgetData.dashboardCondition ? (
                    <p style={{
                      marginTop: 0,
                      marginBottom: 0,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: 13,
                      fontWeight: 500,
                      color: theme.dashboardColors.muted,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent: 'center'
                    }}>
                      <span style={{ color: theme.colors.accentPink, fontSize: 16, fontWeight: 700 }}>!</span>
                      {budgetData.dashboardCondition.message}
                    </p>
                  ) : (
                    <p style={{
                      marginTop: 14,
                      marginBottom: 0,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: 26,
                      fontWeight: 600,
                      color: budgetData.dailyAllowance >= 0 ? 'white' : theme.dashboardColors.pink,
                      letterSpacing: '-0.02em',
                    }}>
                      {formatCurrency(budgetData.dailyAllowance, data.profile.country)}
                    </p>
                  )
                ) : (
                  <>
                    <h3
                      style={{
                        margin: 0,
                        color: theme.colors.accentPurple,
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      Today's budget
                    </h3>
                    <p style={{
                      marginTop: 14,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: 26,
                      fontWeight: 600,
                      color: theme.dashboardColors.muted,
                      letterSpacing: '-0.02em',
                    }}>
                      Coming Soon
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Carousel box with monthly and daily forecast */}
          {isPredictMonthEndEnabled && (
            <div
              style={{
                ...componentStyles.forecastCard,
                overflow: 'hidden',
                padding: 0,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {forecast && forecast.isCountdown ? (
                // Countdown message before day 10
                <div style={{ 
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '100px'
                }}>
                  <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
                    <h3
                      style={{
                        margin: 0,
                        color: theme.colors.accentPurple,
                        fontSize: 14,
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        marginBottom: '8px'
                      }}
                    >
                      Projections
                    </h3>
                    <p style={{
                      margin: 0,
                      fontFamily: theme.typography.fontFamily,
                      fontSize: 14,
                      fontWeight: 500,
                      color: theme.dashboardColors.muted,
                      letterSpacing: '-0.01em',
                      lineHeight: 1.4
                    }}>
                      Available in {forecast.daysRemaining} day{forecast.daysRemaining !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    ref={forecastCarouselRef}
                    onScroll={handleForecastScroll}
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
                      WebkitOverflowScrolling: 'auto',
                      flex: 1
                    }}
                  >
                    <style>
                      {`
                        div::-webkit-scrollbar {
                          display: none;
                        }
                      `}
                    </style>
                    
                    {/* Month end projection */}
                    <div style={{ 
                      minWidth: '100%', 
                      scrollSnapAlign: 'start',
                      scrollSnapStop: 'always',
                      padding: '18px 20px 0px',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ position: 'relative', zIndex: 10 }}>
                        <h3
                          style={{
                            margin: 0,
                            color: theme.colors.accentPurple,
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          Month End Projection
                        </h3>
                        <p style={{
                          marginTop: 14,
                          marginBottom: 0,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: 26,
                          fontWeight: 600,
                          color: 'white',
                          letterSpacing: '-0.02em',
                        }}>
                          {formatCurrency(forecast.monthEndProjection, data.profile.country)}
                        </p>
                      </div>
                    </div>

                    {/* Daily spend forecast */}
                    <div style={{ 
                      minWidth: '100%', 
                      scrollSnapAlign: 'start',
                      scrollSnapStop: 'always',
                      padding: '18px 20px 0px',
                      boxSizing: 'border-box'
                    }}>
                      <div style={{ position: 'relative', zIndex: 10 }}>
                        <h3
                          style={{
                            margin: 0,
                            color: theme.colors.accentPurple,
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          Daily Spend Forecast
                        </h3>
                        <p style={{
                          marginTop: 14,
                          marginBottom: 0,
                          fontFamily: theme.typography.fontFamily,
                          fontSize: 26,
                          fontWeight: 600,
                          color: 'white',
                          letterSpacing: '-0.02em',
                        }}>
                          {formatCurrency(forecast.dailySpendForecast, data.profile.country)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dot navigation inside the second box */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 0 16px',
                    position: 'relative',
                    zIndex: 10
                  }}>
                    {[0, 1].map(index => (
                      <div
                        key={index}
                        onClick={() => scrollToForecast(index)}
                        style={{
                          width: currentForecastIndex === index ? '10px' : '8px',
                          height: currentForecastIndex === index ? '10px' : '8px',
                          borderRadius: '50%',
                          background: currentForecastIndex === index ? theme.dashboardColors.cyan : theme.dashboardColors.border,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: currentForecastIndex === index ? 1 : 0.6
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div style={{ marginTop: 28, position: 'relative', zIndex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              margin: 0,
              color: theme.colors.accentPurple,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.15em',
            }}
          >
            Recent Transactions
          </h3>
          <button
            onClick={() => navigate('/payments')}
            style={{
              background: 'none',
              border: 'none',
              color: theme.dashboardColors.cyan,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: 0,
            }}
          >
            See all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => {
              const transactionDate = new Date(transaction.date)
              
              // Check if this is a balance transaction
              const isBalanceUpdate = transaction.isBalanceUpdate || false
              const isMonthBalance = transaction.categoryId === 'month-balance'
              const isInitialBalance = transaction.categoryId === 'initial-balance'
              const isManualBalanceUpdate = isBalanceUpdate && transaction.categoryId === 'balance-update'
              
              const isIncome = transaction.type === 'income'
              
              // Determine display name
              let displayName
              if (isInitialBalance) {
                displayName = 'Initial Balance'
              } else if (isMonthBalance) {
                displayName = transaction.category || 'Balance'
              } else if (isManualBalanceUpdate) {
                displayName = 'Balance Updated'
              } else {
                displayName = transaction.category
              }
              
              // Color logic: balance transactions are white, income is cyan, expense is pink
              const amountColor = (isBalanceUpdate || isMonthBalance || isInitialBalance)
                ? theme.dashboardColors.white
                : (isIncome ? theme.dashboardColors.cyan : theme.dashboardColors.pink)
              
              // Prefix logic: initial/month balance = no prefix, manual balance = +/-, income/expense = +/-
              const amountPrefix = (isMonthBalance || isInitialBalance)
                ? ''
                : isManualBalanceUpdate
                ? ((transaction.balanceChange >= 0) ? '+' : '')
                : (isIncome ? '+' : '-')
              
              const amountToShow = (isBalanceUpdate || isMonthBalance || isInitialBalance)
                ? Math.abs(transaction.balanceChange || transaction.amount)
                : transaction.amount
              
              return (
                <div
                  key={transaction.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: theme.dashboardColors.card,
                    border: `1px solid ${theme.dashboardColors.border}`,
                    borderRadius: 14,
                    boxShadow: theme.dashboardShadows.card,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div
                      style={{
                        color: theme.dashboardColors.white,
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {displayName}
                    </div>
                    <div
                      style={{
                        color: theme.dashboardColors.muted,
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                    >
                      {transactionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div
                    style={{
                      color: amountColor,
                      fontSize: 17,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {amountPrefix}{formatCurrency(amountToShow, data.profile.country)}
                  </div>
                </div>
              )
            })
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: theme.dashboardColors.muted,
                fontSize: 14,
              }}
            >
              No transactions yet
            </div>
          )}
        </div>
      </div>

      {/* Floating add button is intentionally kept outside the cards. */}
      <AddTransactionButton onClick={onOpenBottomSheet} />

      {/* Balance Edit Modal */}
      {balanceEditOpen && (
        <>
          <div
            onClick={() => setBalanceEditOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 300
            }}
          />
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: theme.colors.bgModal,
            backdropFilter: theme.backdropFilter,
            WebkitBackdropFilter: theme.backdropFilter,
            borderRadius: `${theme.borderRadius.xl} ${theme.borderRadius.xl} 0 0`,
            padding: theme.spacing.xl,
            zIndex: 301,
            maxWidth: theme.layout.maxWidth,
            margin: '0 auto',
            border: `1px solid ${theme.colors.borderSubtle}`,
            borderBottom: 'none'
          }}>
            <div style={{
              width: '40px',
              height: '4px',
              background: theme.colors.borderMedium,
              borderRadius: '2px',
              margin: `0 auto ${theme.spacing.xl}`
            }} />
            
            <h3 style={{
              fontSize: theme.typography.h3,
              fontWeight: theme.typography.bold,
              color: theme.colors.textPrimary,
              margin: `0 0 ${theme.spacing.xl} 0`,
              textAlign: 'center'
            }}>
              Edit Balance
            </h3>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ 
                display: 'block', 
                marginBottom: theme.spacing.sm, 
                fontSize: theme.typography.body, 
                color: theme.colors.textPrimary, 
                fontWeight: theme.typography.medium 
              }}>
                New Balance
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={editedBalance}
                onChange={e => setEditedBalance(e.target.value)}
                autoFocus
                placeholder="0"
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  paddingLeft: '32px',
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.h5,
                  boxSizing: 'border-box',
                  background: theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
              <span style={{
                position: 'relative',
                top: '-38px',
                left: '12px',
                color: theme.colors.textSecondary
              }}>₹</span>
            </div>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ 
                display: 'block', 
                marginBottom: theme.spacing.sm, 
                fontSize: theme.typography.body, 
                color: theme.colors.textPrimary, 
                fontWeight: theme.typography.medium 
              }}>
                Date
              </label>
              <input
                type="date"
                value={balanceDate}
                onChange={e => setBalanceDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.h5,
                  boxSizing: 'border-box',
                  background: theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ 
                display: 'block', 
                marginBottom: theme.spacing.sm, 
                fontSize: theme.typography.body, 
                color: theme.colors.textPrimary, 
                fontWeight: theme.typography.medium 
              }}>
                Note (optional)
              </label>
              <input
                type="text"
                value={balanceNote}
                onChange={e => setBalanceNote(e.target.value)}
                placeholder="e.g. Cash deposit"
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.h5,
                  boxSizing: 'border-box',
                  background: theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: theme.spacing.sm }}>
              <button
                onClick={() => setBalanceEditOpen(false)}
                style={{
                  flex: 1,
                  padding: theme.spacing.lg,
                  background: theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.h5,
                  fontWeight: theme.typography.medium,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBalanceSave}
                disabled={editedBalance === '' || isNaN(parseFloat(editedBalance))}
                style={{
                  flex: 1,
                  padding: theme.spacing.lg,
                  background: (editedBalance !== '' && !isNaN(parseFloat(editedBalance))) ? theme.colors.accentPurple : theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  border: 'none',
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.h5,
                  fontWeight: theme.typography.medium,
                  cursor: (editedBalance !== '' && !isNaN(parseFloat(editedBalance))) ? 'pointer' : 'not-allowed',
                  opacity: (editedBalance !== '' && !isNaN(parseFloat(editedBalance))) ? 1 : 0.5
                }}
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}

      {/* Small responsive correction for narrow screens. */}
      <style>{`
        @media (max-width: 560px) {
          .dashboard-forecast-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 430px) {
          .dashboard-forecast-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}