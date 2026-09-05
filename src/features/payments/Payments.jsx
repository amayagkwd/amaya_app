import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import PaymentsHistory from './PaymentsHistory'
import EditTransactionModal from './EditTransactionModal'
import AddTransactionButton from '../common/AddTransactionButton'
import PeriodSelector from './PeriodSelector'
import { formatLargeNumber } from '../../utils/formatLargeNumber'
import { useFinancials } from '../../hooks/useFinancials'
import { calculateStats } from '../../services/financialCalculations'
import theme, { componentStyles } from '../../theme'
import * as DataRepository from '../../repositories/dataRepository'

export default function Payments({ data, updateStore, onDelete, onOpenBottomSheet }) {
  const location = useLocation()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isYearly, setIsYearly] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null)
  const [appliedCategoryFilter, setAppliedCategoryFilter] = useState(null)
  const [appliedClassificationFilter, setAppliedClassificationFilter] = useState(null)
  const [appliedTypeFilter, setAppliedTypeFilter] = useState(null)
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0)
  const paymentCarouselRef = useRef(null)
  
  // Handle navigation state from Insights page
  useEffect(() => {
    if (location.state) {
      const { filterType, filterValue, categoryId, isYearly: navIsYearly, selectedDate: navDate, selectedYear: navYear } = location.state
      
      // Reset all filters first
      setAppliedTypeFilter(null)
      setAppliedCategoryFilter(null)
      setAppliedClassificationFilter(null)
      
      // Set period
      if (navIsYearly !== undefined) {
        setIsYearly(navIsYearly)
      }
      if (navDate) {
        setSelectedDate(new Date(navDate))
      }
      if (navYear) {
        setSelectedYear(navYear)
      }
      
      // Apply filters based on chart type - set category/classification filters only
      if (filterType === 'expense') {
        setAppliedTypeFilter('expense')
        if (categoryId) {
          setAppliedCategoryFilter(categoryId)
        }
      } else if (filterType === 'income') {
        setAppliedTypeFilter('income')
        if (categoryId) {
          setAppliedCategoryFilter(categoryId)
        }
      } else if (filterType === 'needs-wants') {
        setAppliedTypeFilter('expense') // Needs/wants are expense classifications
        if (filterValue === 'Needs') {
          setAppliedClassificationFilter('need')
        } else if (filterValue === 'Wants') {
          setAppliedClassificationFilter('want')
        }
      }
      
      // Clear navigation state after processing
      window.history.replaceState({}, document.title)
    }
  }, [location.state, location.key]) // Add location.key to trigger on every navigation
  
  // Use centralized financial calculations
  const bankFinancials = useFinancials(data.payments.transactions, {
    year: isYearly ? selectedYear : selectedDate.getFullYear(),
    month: isYearly ? undefined : selectedDate.getMonth(),
    isYearly: isYearly,
    paymentMode: 'bank',
    categories: data.payments.categories
  })

  const cashFinancials = useFinancials(data.payments.transactions, {
    year: isYearly ? selectedYear : selectedDate.getFullYear(),
    month: isYearly ? undefined : selectedDate.getMonth(),
    isYearly: isYearly,
    paymentMode: 'cash',
    categories: data.payments.categories
  })

  const creditFinancials = useFinancials(data.payments.transactions, {
    year: isYearly ? selectedYear : selectedDate.getFullYear(),
    month: isYearly ? undefined : selectedDate.getMonth(),
    isYearly: isYearly,
    paymentMode: 'credit',
    categories: data.payments.categories
  })

  // For yearly view, keep all transactions for display but exclude month-balance from stats
  const allTransactions = bankFinancials.filteredTransactions

  // Recalculate stats for yearly view without month-balance
  const stats = useMemo(() => {
    if (isYearly) {
      const filtered = allTransactions.filter(t => t.categoryId !== 'month-balance')
      return calculateStats(filtered, 'bank')
    }
    return bankFinancials.stats
  }, [isYearly, allTransactions, bankFinancials.stats])
  
  const cashStats = useMemo(() => {
    if (isYearly) {
      const filteredCash = cashFinancials.filteredTransactions.filter(t => t.categoryId !== 'month-balance')
      return calculateStats(filteredCash, 'cash')
    }
    return cashFinancials.stats
  }, [isYearly, cashFinancials.filteredTransactions, cashFinancials.stats])
  
  const creditStats = useMemo(() => {
    if (isYearly) {
      const filteredCredit = creditFinancials.filteredTransactions.filter(t => t.categoryId !== 'month-balance')
      return calculateStats(filteredCredit, 'credit')
    }
    return creditFinancials.stats
  }, [isYearly, creditFinancials.filteredTransactions, creditFinancials.stats])

  // Determine which payment methods to show
  const paymentMethods = useMemo(() => {
    const methods = [{ type: 'bank', label: 'Bank Account' }]
    if (data.settings?.isCreditEnabled) {
      methods.push({ type: 'credit', label: 'Credit Card' })
    }
    if (data.settings?.isCashEnabled) {
      methods.push({ type: 'cash', label: 'Cash' })
    }
    return methods
  }, [data.settings?.isCashEnabled, data.settings?.isCreditEnabled])

  const handlePaymentScroll = () => {
    if (paymentCarouselRef.current) {
      const scrollLeft = paymentCarouselRef.current.scrollLeft
      const containerWidth = paymentCarouselRef.current.offsetWidth
      const index = Math.round(scrollLeft / containerWidth)
      setCurrentPaymentIndex(index)
    }
  }

  const scrollToPayment = (index) => {
    if (paymentCarouselRef.current) {
      const containerWidth = paymentCarouselRef.current.offsetWidth
      paymentCarouselRef.current.scrollTo({
        left: index * containerWidth,
        behavior: 'smooth'
      })
    }
  }
  
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
  }
  
  const handleSaveEdit = async (updatedTransaction) => {
    // Save to Supabase
    try {
      await DataRepository.updateTransaction(updatedTransaction.id, updatedTransaction)
    } catch (error) {
      console.error('Error updating transaction in Supabase:', error)
    }
    
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        transactions: current.payments.transactions.map(t =>
          t.id === updatedTransaction.id 
            ? { ...updatedTransaction, timestamp: t.timestamp || Date.now() } 
            : t
        )
      }
    }))
    setEditingTransaction(null)
  }
  
  const handleStatCardClick = (filterType) => {
    setActiveFilter(activeFilter === filterType ? null : filterType)
  }
  
  return (
    <div style={{ 
      position: 'fixed',
      top: theme.layout.topBarHeight,
      left: 0,
      right: 0,
      bottom: theme.layout.bottomNavHeight,
      maxWidth: theme.layout.maxWidth,
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Background gradient */}
      <div style={componentStyles.backgroundShine} />
      
      {/* Fixed header section - no scroll */}
      <div style={{
        flexShrink: 0,
        zIndex: 99,
        background: theme.colors.bgSecondary,
        padding: `${theme.spacing.xl}`,
        paddingBottom: theme.spacing.lg,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        borderBottom: `1px solid ${theme.colors.borderSubtle}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <h2 style={componentStyles.pageHeaderSimple}>Payments</h2>
          
          <PeriodSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            isYearly={isYearly}
            onYearlyToggle={setIsYearly}
          />
        </div>
      
        {/* Scrollable payment method cards */}
        <div style={{ position: 'relative' }}>
          <div 
            ref={paymentCarouselRef}
            onScroll={handlePaymentScroll}
            style={{
              display: 'flex',
              overflowX: 'scroll',
              scrollSnapType: 'x mandatory',
              gap: '0px',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'auto',
              marginBottom: theme.spacing.md
            }}
          >
            <style>
              {`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}
            </style>

            {paymentMethods.map((method, index) => {
              let currentStats
              if (method.type === 'cash') {
                currentStats = cashStats
              } else if (method.type === 'credit') {
                currentStats = creditStats
              } else {
                currentStats = stats // bank
              }
              
              return (
                <div 
                  key={method.type}
                  style={{ 
                    minWidth: '100%', 
                    scrollSnapAlign: 'start',
                    scrollSnapStop: 'always',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: theme.spacing.sm
                  }}
                >
                  <div style={{
                    textAlign: 'center',
                    fontSize: theme.typography.body,
                    fontWeight: theme.typography.semiBold,
                    color: theme.colors.accentPurple,
                    marginBottom: theme.spacing.xs
                  }}>
                    {method.label}
                  </div>
                  
                  <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                    <StatCard 
                      label="Income" 
                      value={formatLargeNumber(currentStats.income, data.profile.country)} 
                      color={theme.colors.accentCyan} 
                      onClick={() => handleStatCardClick('income')}
                      isActive={activeFilter === 'income'}
                    />
                    <StatCard 
                      label="Expenses" 
                      value={formatLargeNumber(currentStats.expenses, data.profile.country)} 
                      color={theme.colors.accentPink} 
                      onClick={() => handleStatCardClick('expense')}
                      isActive={activeFilter === 'expense'}
                    />
                    <StatCard 
                      label="Balance" 
                      value={formatLargeNumber(currentStats.balance, data.profile.country)} 
                      color={currentStats.balance >= 0 ? theme.colors.textPrimary : theme.colors.accentPink}
                      onClick={() => handleStatCardClick('balance')}
                      isActive={activeFilter === 'balance'}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dot navigation - only show if more than one payment method */}
          {paymentMethods.length > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              paddingTop: theme.spacing.sm
            }}>
              {paymentMethods.map((_, index) => (
                <div
                  key={index}
                  onClick={() => scrollToPayment(index)}
                  style={{
                    width: currentPaymentIndex === index ? '7px' : '6px',
                    height: currentPaymentIndex === index ? '7px' : '6px',
                    borderRadius: '50%',
                    background: currentPaymentIndex === index ? theme.colors.accentPurple : theme.colors.borderMedium,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: currentPaymentIndex === index ? 1 : 0.6
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Scrollable content only */}
      <div style={{ 
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: `${theme.spacing.xl}`,
        paddingTop: theme.spacing.lg,
        position: 'relative',
        zIndex: 1
      }}>
        <PaymentsHistory
          allTransactions={allTransactions}
          categories={data.payments.categories}
          country={data.profile.country}
          onDelete={onDelete}
          onEdit={handleEdit}
          quickFilter={activeFilter}
          appliedCategoryFilter={appliedCategoryFilter}
          appliedClassificationFilter={appliedClassificationFilter}
          appliedTypeFilter={appliedTypeFilter}
        />
      </div>
      
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          categories={data.payments.categories}
          onSave={handleSaveEdit}
          onClose={() => setEditingTransaction(null)}
        />
      )}
      
      <AddTransactionButton onClick={onOpenBottomSheet} />
    </div>
  )
}

function StatCard({ label, value, color, onClick, isActive }) {
  return (
    <div 
      onClick={onClick}
      style={{
        flex: 1,
        minWidth: 0,
        background: isActive ? theme.colors.bgCardHover : theme.colors.bgCard,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        padding: `${theme.spacing.md} ${theme.spacing.sm}`,
        borderRadius: theme.borderRadius.lg,
        textAlign: 'center',
        border: isActive ? `2px solid ${color}` : `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: theme.shadows.card,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        WebkitTapHighlightColor: 'transparent'
      }}>
      <div style={{ fontSize: theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs, fontWeight: theme.typography.medium }}>{label}</div>
      <div style={{ 
        fontSize: theme.typography.h4, 
        fontWeight: theme.typography.semiBold, 
        color,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>{value}</div>
    </div>
  )
}
