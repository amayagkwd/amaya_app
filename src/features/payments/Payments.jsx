import { useState, useMemo } from 'react'
import PaymentsHistory from './PaymentsHistory'
import EditTransactionModal from './EditTransactionModal'
import AddTransactionButton from '../common/AddTransactionButton'
import PeriodSelector from './PeriodSelector'
import { formatLargeNumber } from '../../utils/formatLargeNumber'
import { getMonthTransactions, getYearTransactions, calculateMonthStats } from '../../hooks/usePayments'
import theme, { componentStyles } from '../../theme'

export default function Payments({ data, updateStore, onDelete, onOpenBottomSheet }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isYearly, setIsYearly] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  
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
  
  const stats = useMemo(() => calculateMonthStats(allTransactions), [allTransactions])
  
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
  }
  
  const handleSaveEdit = (updatedTransaction) => {
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
  
  return (
    <>
      <div style={{ padding: `${theme.spacing.xl}` }}>
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
      
      <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.xl }}>
        <StatCard label="Income" value={formatLargeNumber(stats.income, data.profile.country)} color={theme.colors.accentCyan} />
        <StatCard label="Expenses" value={formatLargeNumber(stats.expenses, data.profile.country)} color={theme.colors.accentPink} />
        <StatCard label="Balance" value={formatLargeNumber(stats.balance, data.profile.country)} color={stats.balance >= 0 ? theme.colors.textPrimary : theme.colors.accentPink} />
      </div>
      
      <PaymentsHistory
        allTransactions={allTransactions}
        categories={data.payments.categories}
        country={data.profile.country}
        onDelete={onDelete}
        onEdit={handleEdit}
      />
      
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          categories={data.payments.categories}
          onSave={handleSaveEdit}
          onClose={() => setEditingTransaction(null)}
        />
      )}
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
