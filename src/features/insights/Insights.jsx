import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AddTransactionButton from '../common/AddTransactionButton'
import PeriodSelector from '../payments/PeriodSelector'
import PaymentsCharts from './PaymentsCharts'
import { getMonthTransactions, getYearTransactions, calculateMonthStats } from '../../hooks/usePayments'
import { formatLargeNumber } from '../../utils/formatLargeNumber'
import theme, { componentStyles } from '../../theme'

export default function Insights({ data, onOpenBottomSheet }) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isYearly, setIsYearly] = useState(false)
  
  const allTransactions = useMemo(() => {
    if (isYearly) {
      return getYearTransactions(data.payments.transactions, selectedYear)
    }
    return getMonthTransactions(
      data.payments.transactions,
      selectedDate.getFullYear(),
      selectedDate.getMonth()
    )
  }, [data.payments.transactions, selectedDate, selectedYear, isYearly])
  
  const stats = useMemo(() => {
    // For yearly view, exclude month-balance from stats calculation to avoid double-counting
    const txnsForStats = isYearly 
      ? allTransactions.filter(t => t.categoryId !== 'month-balance')
      : allTransactions
    return calculateMonthStats(txnsForStats)
  }, [allTransactions, isYearly])
  
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
