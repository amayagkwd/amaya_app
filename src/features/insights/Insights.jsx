import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AddTransactionButton from '../common/AddTransactionButton'
import PeriodSelector from '../payments/PeriodSelector'
import PaymentsCharts from './PaymentsCharts'
import { useFinancials } from '../../hooks/useFinancials'
import { formatLargeNumber } from '../../utils/formatLargeNumber'
import theme, { componentStyles } from '../../theme'

export default function Insights({ data, onOpenBottomSheet }) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isYearly, setIsYearly] = useState(false)
  
  // Use centralized financial calculations
  const financials = useFinancials(data.payments.transactions, {
    year: isYearly ? selectedYear : selectedDate.getFullYear(),
    month: isYearly ? undefined : selectedDate.getMonth(),
    isYearly: isYearly,
    paymentMode: 'bank',
    categories: data.payments.categories
  })

  // For yearly view, exclude month-balance from the filtered transactions
  const allTransactions = useMemo(() => {
    const filtered = financials.filteredTransactions
    if (isYearly) {
      return filtered.filter(t => t.categoryId !== 'month-balance')
    }
    return filtered
  }, [financials.filteredTransactions, isYearly])

  const stats = financials.stats
  
  return (
    <>
      {/* Background gradient */}
      <div style={componentStyles.backgroundShine} />
      
      <div style={{ ...componentStyles.pageContainer, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <h2 style={componentStyles.pageHeaderSimple}>Insights</h2>
          
          <PeriodSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            isYearly={isYearly}
            onYearlyToggle={setIsYearly}
          />
        </div>
        
        <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
          <StatCard label="Income" value={formatLargeNumber(stats.income, data.profile.country)} color={theme.colors.accentCyan} />
          <StatCard label="Expenses" value={formatLargeNumber(stats.expenses, data.profile.country)} color={theme.colors.accentPink} />
          <StatCard label="Balance" value={formatLargeNumber(stats.balance, data.profile.country)} color={stats.balance >= 0 ? theme.colors.textPrimary : theme.colors.accentPink} />
        </div>
        
        <PaymentsCharts
          allTransactions={allTransactions}
          categories={data.payments.categories}
          country={data.profile.country}
          isYearly={isYearly}
          selectedYear={selectedYear}
          selectedDate={selectedDate}
          navigate={navigate}
        />
      </div>
      
      <AddTransactionButton onClick={onOpenBottomSheet} />
    </>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      background: theme.colors.bgCard,
      backdropFilter: theme.backdropFilter,
      WebkitBackdropFilter: theme.backdropFilter,
      padding: `${theme.spacing.md} ${theme.spacing.sm}`,
      borderRadius: theme.borderRadius.lg,
      textAlign: 'center',
      border: `1px solid ${theme.colors.borderSubtle}`,
      boxShadow: theme.shadows.card,
      overflow: 'hidden'
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
