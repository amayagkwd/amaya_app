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
import Cash from '../payments/Cash'

export default function Dashboard({ data, onOpenBottomSheet, updateStore }) {
  const navigate = useNavigate()
  const [currentForecastIndex, setCurrentForecastIndex] = useState(0)
  const forecastCarouselRef = useRef(null)
  const [currentPaymentsIndex, setCurrentPaymentsIndex] = useState(0)
  const paymentsCarouselRef = useRef(null)
  const [balanceEditOpen, setBalanceEditOpen] = useState(false)
  const [editedBalance, setEditedBalance] = useState('')
  const [balanceDate, setBalanceDate] = useState('')
  const [balanceNote, setBalanceNote] = useState('')
  const [isYearly, setIsYearly] = useState(false)
  const [cashModalOpen, setCashModalOpen] = useState(false)
  const [cashBalanceEditOpen, setCashBalanceEditOpen] = useState(false)
  const [editedCashBalance, setEditedCashBalance] = useState('')
  const [cashBalanceDate, setCashBalanceDate] = useState('')
  const [cashBalanceNote, setCashBalanceNote] = useState('')
  
  // Get budget data (always uses current month, not affected by yearly toggle)
  const budgetData = useBudget(data)

  // Get settings
  const isBudgetEnabled = data.settings?.budget?.enabled || false
  const isPredictMonthEndEnabled = data.settings?.predictMonthEnd || false

  // Calculate cash stats separately
  const cashStats = useMemo(() => {
    const now = new Date()
    let cashTransactions
    
    if (isYearly) {
      const currentYear = now.getFullYear()
      cashTransactions = data.payments.transactions.filter(t => {
        if (!t.date) return false
        const txnDate = new Date(t.date)
        return txnDate.getFullYear() === currentYear
      })
    } else {
      cashTransactions = getMonthTransactions(
        data.payments.transactions,
        now.getFullYear(),
        now.getMonth()
      )
    }

    return calculateMonthStats(cashTransactions, 'cash')
  }, [data.payments.transactions, isYearly])

  // Calculate credit stats separately
  const creditStats = useMemo(() => {
    const now = new Date()
    let creditTransactions
    
    if (isYearly) {
      const currentYear = now.getFullYear()
      creditTransactions = data.payments.transactions.filter(t => {
        if (!t.date) return false
        const txnDate = new Date(t.date)
        return txnDate.getFullYear() === currentYear
      })
    } else {
      creditTransactions = getMonthTransactions(
        data.payments.transactions,
        now.getFullYear(),
        now.getMonth()
      )
    }

    return calculateMonthStats(creditTransactions, 'credit')
  }, [data.payments.transactions, isYearly])

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

  const handlePaymentsScroll = () => {
    if (paymentsCarouselRef.current) {
      const scrollLeft = paymentsCarouselRef.current.scrollLeft
      const containerWidth = paymentsCarouselRef.current.offsetWidth
      const index = Math.round(scrollLeft / containerWidth)
      setCurrentPaymentsIndex(index)
    }
  }

  const scrollToPayments = (index) => {
    if (paymentsCarouselRef.current) {
      const containerWidth = paymentsCarouselRef.current.offsetWidth
      paymentsCarouselRef.current.scrollTo({
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

    // Calculate bank-only stats (default payment mode or explicitly 'bank')
    return calculateMonthStats(transactions, 'bank')
  }, [data.payments.transactions, isYearly])
  
  // Always calculate current real balance for budget and forecast (regardless of view) - BANK ONLY
  const currentBalance = useMemo(() => {
    const now = new Date()
    const currentMonthTransactions = getMonthTransactions(
      data.payments.transactions,
      now.getFullYear(),
      now.getMonth()
    )
    return calculateMonthStats(currentMonthTransactions, 'bank').balance
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
        // Sort by timestamp first (most recent first)
        const timestampA = a.timestamp || 0
        const timestampB = b.timestamp || 0
        
        if (timestampA !== timestampB) {
          return timestampB - timestampA
        }
        
        // If timestamps are the same, fall back to date
        const dateA = new Date(a.date || 0)
        const dateB = new Date(b.date || 0)
        return dateB - dateA
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

  const handleCashClick = () => {
    setCashModalOpen(true)
  }

  const handleCashSave = (amount) => {
    // Create initial cash balance transaction
    const transaction = {
      id: uuidv4(),
      type: 'cash-balance',
      amount: amount,
      category: 'Cash Balance',
      categoryId: 'cash-balance',
      date: new Date().toISOString().split('T')[0],
      note: 'Initial cash balance',
      timestamp: Date.now(),
      paymentMode: 'cash'
    }

    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        cashBalance: amount,
        transactions: [...current.payments.transactions, transaction]
      },
      settings: {
        ...current.settings,
        isCashEnabled: true
      }
    }))

    showToast(`Cash balance set to ${formatCurrency(amount, data.profile.country)}`)
    setCashModalOpen(false)
  }

  const handleCashClose = () => {
    setCashModalOpen(false)
  }

  const handleCashBalanceClick = (e) => {
    e.stopPropagation()
    setEditedCashBalance(String(cashStats.balance))
    setCashBalanceDate(new Date().toISOString().split('T')[0])
    setCashBalanceNote('')
    setCashBalanceEditOpen(true)
  }

  const handleCashBalanceSave = () => {
    const newBalance = parseFloat(editedCashBalance)
    if (isNaN(newBalance)) return

    const difference = newBalance - cashStats.balance
    if (difference !== 0) {
      // Create a balance adjustment transaction for cash
      const transaction = {
        id: uuidv4(),
        type: 'cash-balance-update',
        amount: Math.abs(difference),
        category: 'Cash Balance Updated',
        categoryId: 'cash-balance-update',
        date: cashBalanceDate,
        note: cashBalanceNote.trim() || null,
        timestamp: Date.now(),
        paymentMode: 'cash',
        balanceChange: difference
      }

      updateStore(current => ({
        ...current,
        payments: {
          ...current.payments,
          transactions: [...current.payments.transactions, transaction]
        }
      }))

      showToast(`Cash balance updated by ${formatCurrency(Math.abs(difference), data.profile.country)}`)
    }

    setCashBalanceEditOpen(false)
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

      {/* Payments - Now with carousel */}
      <div
        role="button"
        tabIndex={0}
        style={{
          ...componentStyles.dashboardCard,
          cursor: 'default',
          position: 'relative',
          overflow: 'hidden',
          padding: 0,
          transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div 
          ref={paymentsCarouselRef}
          onScroll={handlePaymentsScroll}
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
          
          {/* First card - Bank Account */}
          <div 
            className="payment-card-bank"
            style={{ 
            minWidth: '100%', 
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            padding: '18px 20px',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
            isolation: 'isolate',
            background: `
              radial-gradient(
                circle at 0% 0%,
                rgba(91, 158, 255, 0.32) 0%,
                rgba(91, 158, 255, 0.12) 45%,
                transparent 75%
              ),
              radial-gradient(
                ellipse at 0% 100%,
                rgba(0, 0, 0, 0.8) 0%,
                rgba(0, 0, 0, 0.6) 30%,
                transparent 60%
              ),
              linear-gradient(
                180deg,
                transparent 0%,
                transparent 70%,
                rgba(0, 0, 0, 0.5) 85%,
                rgba(0, 0, 0, 1) 100%
              ),
              linear-gradient(
                180deg,
                rgba(16, 32, 52, 0.98) 0%,
                rgba(10, 18, 28, 0.98) 50%,
                rgba(6, 10, 14, 0.98) 75%,
                rgba(0, 0, 0, 1) 100%
              )
            `
          }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: 'rgba(91,158,255,0.12)',
                }}>
                  <img 
                    src="/bank-svgrepo-com.svg" 
                    alt="Bank" 
                    width="20" 
                    height="20"
                    style={{ 
                      display: 'block',
                      filter: 'brightness(0) saturate(100%) invert(59%) sepia(46%) saturate(2138%) hue-rotate(192deg) brightness(103%) contrast(101%)'
                    }}
                  />
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: '#5B9EFF',
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Bank Account
                </h3>
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

          {/* Second card - Credit Card */}
          <div 
            className="payment-card-credit"
            style={{ 
            minWidth: '100%', 
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            padding: '18px 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            isolation: 'isolate',
            background: `
              radial-gradient(
                circle at 0% 0%,
                rgba(124, 111, 255, 0.32) 0%,
                rgba(124, 111, 255, 0.12) 45%,
                transparent 75%
              ),
              radial-gradient(
                ellipse at 0% 100%,
                rgba(0, 0, 0, 0.8) 0%,
                rgba(0, 0, 0, 0.6) 30%,
                transparent 60%
              ),
              linear-gradient(
                180deg,
                transparent 0%,
                transparent 70%,
                rgba(0, 0, 0, 0.5) 85%,
                rgba(0, 0, 0, 1) 100%
              ),
              linear-gradient(
                180deg,
                rgba(30, 24, 55, 0.98) 0%,
                rgba(13, 15, 28, 0.98) 50%,
                rgba(6, 8, 14, 0.98) 75%,
                rgba(0, 0, 0, 1) 100%
              )
            `
          }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: 'rgba(124,111,255,0.12)',
                }}>
                  <img 
                    src="/credit-card-svgrepo-com.svg" 
                    alt="Credit Card" 
                    width="20" 
                    height="20"
                    style={{ 
                      display: 'block',
                      filter: 'brightness(0) saturate(100%) invert(51%) sepia(67%) saturate(2792%) hue-rotate(229deg) brightness(101%) contrast(101%)'
                    }}
                  />
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: '#7C6FFF',
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Credit Card
                </h3>
              </div>
            </div>
            
            <div 
              style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              padding: '12px',
              opacity: 0.6,
              pointerEvents: 'none'
            }}>
              <div style={{
                border: `2px dashed rgba(124, 111, 255, 0.3)`,
                borderRadius: '12px',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%'
              }}>
                <div style={{
                  fontSize: '32px',
                  lineHeight: 1,
                  marginBottom: '4px'
                }}>🚧</div>
                <div style={{
                  color: theme.colors.accentPurple,
                  fontSize: 16,
                  fontWeight: 600,
                  textAlign: 'center'
                }}>
                  Coming Soon
                </div>
                <div style={{
                  color: theme.colors.textSecondary,
                  fontSize: 12,
                  textAlign: 'center'
                }}>
                  Credit card tracking
                </div>
              </div>
            </div>
          </div>

          {/* Third card - Cash */}
          <div 
            className="payment-card-cash"
            style={{ 
            minWidth: '100%', 
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
            padding: '18px 20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            isolation: 'isolate',
            background: `
              radial-gradient(
                circle at 0% 0%,
                rgba(0, 229, 204, 0.28) 0%,
                rgba(0, 229, 204, 0.10) 45%,
                transparent 75%
              ),
              radial-gradient(
                ellipse at 0% 100%,
                rgba(0, 0, 0, 0.8) 0%,
                rgba(0, 0, 0, 0.6) 30%,
                transparent 60%
              ),
              linear-gradient(
                180deg,
                transparent 0%,
                transparent 70%,
                rgba(0, 0, 0, 0.5) 85%,
                rgba(0, 0, 0, 1) 100%
              ),
              linear-gradient(
                180deg,
                rgba(12, 42, 44, 0.98) 0%,
                rgba(9, 20, 25, 0.98) 50%,
                rgba(5, 12, 15, 0.98) 75%,
                rgba(0, 0, 0, 1) 100%
              )
            `
          }}>
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 11,
                  background: 'rgba(0,229,204,0.12)',
                }}>
                  <img 
                    src="/cash-svgrepo-com.svg" 
                    alt="Cash" 
                    width="20" 
                    height="20"
                    style={{ 
                      display: 'block',
                      filter: 'brightness(0) saturate(100%) invert(73%) sepia(65%) saturate(2613%) hue-rotate(129deg) brightness(97%) contrast(101%)'
                    }}
                  />
                </div>

                <h3
                  style={{
                    margin: 0,
                    color: '#00E5CC',
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Cash
                </h3>
              </div>
            </div>
            
            <div 
              onClick={(e) => {
                e.stopPropagation()
                if (!data.settings?.isCashEnabled) {
                  handleCashClick()
                }
              }}
              style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              cursor: !data.settings?.isCashEnabled ? 'pointer' : 'default',
              padding: '12px'
            }}>
              {!data.settings?.isCashEnabled ? (
                <div style={{
                  border: `2px dashed ${theme.colors.accentPurple}`,
                  borderRadius: '12px',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(185, 178, 255, 0.05)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}>
                  <div style={{
                    fontSize: '28px',
                    color: theme.colors.accentPurple,
                    lineHeight: 1
                  }}>+</div>
                  <div style={{
                    color: theme.colors.accentPurple,
                    fontSize: 14,
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    Click to add Cash
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%' }}>
                  <div
                    onClick={handleCashBalanceClick}
                    style={{
                      marginTop: 16,
                      marginBottom: 14,
                      color: cashStats.balance >= 0 ? theme.dashboardColors.cyan : theme.dashboardColors.pink,
                      fontSize: 'clamp(38px, 10vw, 50px)',
                      lineHeight: 0.95,
                      fontWeight: 850,
                      letterSpacing: '-0.055em',
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
                    {formatCurrency(cashStats.balance, data.profile.country)}
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
                        onOpenBottomSheet('transaction', 'income', 'cash')
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
                        {formatCurrency(cashStats.income, data.profile.country)}
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
                        onOpenBottomSheet('transaction', 'expense', 'cash')
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
                        {formatCurrency(cashStats.expenses, data.profile.country)}
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
              )}
            </div>
          </div>
        </div>

        {/* Dot navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          padding: '12px 0 16px',
          position: 'relative',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 1)'
        }}>
          {[0, 1, 2].map(index => {
            const dotColor = index === 0 
              ? '#5B9EFF'
              : index === 1
              ? '#7C6FFF'
              : '#00E5CC'
            
            return (
              <div
                key={index}
                onClick={() => scrollToPayments(index)}
                style={{
                  width: currentPaymentsIndex === index ? '7px' : '6px',
                  height: currentPaymentsIndex === index ? '7px' : '6px',
                  borderRadius: '50%',
                  background: currentPaymentsIndex === index ? dotColor : 'rgba(255, 255, 255, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: currentPaymentsIndex === index ? 1 : 0.6
                }}
              />
            )
          })}
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
                    <>
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
                      <p style={{
                        marginTop: 8,
                        marginBottom: 0,
                        fontFamily: theme.typography.fontFamily,
                        fontSize: 12,
                        fontWeight: 500,
                        color: theme.dashboardColors.muted,
                        letterSpacing: '-0.01em',
                      }}>
                        Total Spendable: {formatCurrency(budgetData.spendableRemaining, data.profile.country)}
                      </p>
                    </>
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
                    gap: '6px',
                    padding: '12px 0 16px',
                    position: 'relative',
                    zIndex: 10
                  }}>
                    {[0, 1].map(index => (
                      <div
                        key={index}
                        onClick={() => scrollToForecast(index)}
                        style={{
                          width: currentForecastIndex === index ? '7px' : '6px',
                          height: currentForecastIndex === index ? '7px' : '6px',
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
              const isCashBalance = transaction.categoryId === 'cash-balance'
              const isManualBalanceUpdate = isBalanceUpdate && transaction.categoryId === 'balance-update'
              
              const isIncome = transaction.type === 'income'
              
              // Get category name from categories array
              const category = data.payments.categories.find(c => c.id === transaction.categoryId)
              
              // Determine payment mode (default to 'bank' for old transactions)
              const paymentMode = transaction.paymentMode || 'bank'
              
              // Get mode color for category name
              const getModeColor = (mode) => {
                switch(mode) {
                  case 'cash': return '#00E5CC'
                  case 'credit': return '#7C6FFF'
                  case 'bank':
                  default: return '#5B9EFF'
                }
              }
              
              const categoryColor = getModeColor(paymentMode)
              
              // Determine display name
              let displayName
              if (isInitialBalance) {
                displayName = 'Initial Balance'
              } else if (isMonthBalance) {
                displayName = transaction.category || 'Balance'
              } else if (isCashBalance) {
                displayName = 'Cash Balance'
              } else if (isManualBalanceUpdate) {
                displayName = 'Balance Updated'
              } else {
                displayName = category?.name || transaction.category || 'Unknown'
              }
              
              // Color logic: balance transactions and cash balance are cyan, income is cyan, expense is pink
              const amountColor = (isBalanceUpdate || isMonthBalance || isInitialBalance || isCashBalance)
                ? theme.dashboardColors.cyan
                : (isIncome ? theme.dashboardColors.cyan : theme.dashboardColors.pink)
              
              // Prefix logic: initial/month/cash balance = +, manual balance = +/-, income/expense = +/-
              const amountPrefix = (isMonthBalance || isInitialBalance || isCashBalance)
                ? '+'
                : isManualBalanceUpdate
                ? ((transaction.balanceChange >= 0) ? '+' : '-')
                : (isIncome ? '+' : '-')
              
              const amountToShow = (isBalanceUpdate || isMonthBalance || isInitialBalance || isCashBalance)
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
                    borderLeft: `4px solid ${categoryColor}`,
                    borderRadius: 14,
                    boxShadow: theme.dashboardShadows.card,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        color: theme.dashboardColors.muted,
                        fontSize: 13,
                        fontWeight: 600,
                        minWidth: 40,
                      }}
                    >
                      {String(transactionDate.getDate()).padStart(2, '0')}/{String(transactionDate.getMonth() + 1).padStart(2, '0')}
                    </div>
                    <div
                      style={{
                        color: theme.dashboardColors.white,
                        fontSize: 15,
                        fontWeight: 600,
                      }}
                    >
                      {displayName}
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

      {/* Cash Modal */}
      <Cash
        isOpen={cashModalOpen}
        onClose={handleCashClose}
        onSave={handleCashSave}
        country={data.profile.country}
      />

      {/* Cash Balance Edit Modal */}
      {cashBalanceEditOpen && (
        <>
          <div
            onClick={() => setCashBalanceEditOpen(false)}
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
              Edit Cash Balance
            </h3>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ 
                display: 'block', 
                marginBottom: theme.spacing.sm, 
                fontSize: theme.typography.body, 
                color: theme.colors.textPrimary, 
                fontWeight: theme.typography.medium 
              }}>
                New Cash Balance
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={editedCashBalance}
                onChange={e => setEditedCashBalance(e.target.value)}
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
                value={cashBalanceDate}
                onChange={e => setCashBalanceDate(e.target.value)}
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
                value={cashBalanceNote}
                onChange={e => setCashBalanceNote(e.target.value)}
                placeholder="e.g. Cash withdrawal"
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
                onClick={() => setCashBalanceEditOpen(false)}
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
                onClick={handleCashBalanceSave}
                disabled={editedCashBalance === '' || isNaN(parseFloat(editedCashBalance))}
                style={{
                  flex: 1,
                  padding: theme.spacing.lg,
                  background: (editedCashBalance !== '' && !isNaN(parseFloat(editedCashBalance))) ? theme.colors.accentPurple : theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  border: 'none',
                  borderRadius: theme.borderRadius.sm,
                  fontSize: theme.typography.h5,
                  fontWeight: theme.typography.medium,
                  cursor: (editedCashBalance !== '' && !isNaN(parseFloat(editedCashBalance))) ? 'pointer' : 'not-allowed',
                  opacity: (editedCashBalance !== '' && !isNaN(parseFloat(editedCashBalance))) ? 1 : 0.5
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
        /* Payment card glow effects */
        .payment-card-bank::before,
        .payment-card-credit::before,
        .payment-card-cash::before {
          content: '';
          position: absolute;
          width: 200px;
          height: 200px;
          top: -100px;
          left: -70px;
          background: radial-gradient(
            circle,
            var(--card-glow) 0%,
            rgba(0, 0, 0, 0) 70%
          );
          filter: blur(30px);
          opacity: 0.4;
          pointer-events: none;
          z-index: -1;
        }
        
        .payment-card-bank {
          --card-glow: rgba(91, 158, 255, 0.5);
        }
        
        .payment-card-credit {
          --card-glow: rgba(124, 111, 255, 0.5);
        }
        
        .payment-card-cash {
          --card-glow: rgba(0, 229, 204, 0.5);
        }
      
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