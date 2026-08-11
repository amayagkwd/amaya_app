import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGreeting, getTodayDate } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'
import { getMonthTransactions, calculateMonthStats } from '../../hooks/usePayments'
import AddTransactionButton from '../common/AddTransactionButton'
import theme, { componentStyles } from '../../theme'

export default function Dashboard({ data, onOpenBottomSheet }) {
  const navigate = useNavigate()
  
  const stats = useMemo(() => {
    const now = new Date()
    const transactions = getMonthTransactions(
      data.payments.transactions,
      now.getFullYear(),
      now.getMonth()
    )
    return calculateMonthStats(transactions)
  }, [data.payments.transactions])
  
  return (
    <div style={{ padding: `${theme.spacing.xxl} ${theme.spacing.xl}`, paddingBottom: theme.spacing.huge }}>
      <div style={{ marginBottom: theme.spacing.sm, textAlign: 'left' }}>
        <h2 style={componentStyles.greeting}>
          {getGreeting(data.profile.name)}
        </h2>
      </div>
      <p style={componentStyles.greetingDate}>
        {getTodayDate()}
      </p>
    
      <div 
        onClick={() => navigate('/payments')}
        style={{
        ...componentStyles.card,
        cursor: 'pointer',
        position: 'relative',
        padding: '16px'
      }}
      onMouseEnter={(e) => {
        Object.assign(e.currentTarget.style, componentStyles.cardHover)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = theme.colors.bgCard
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = theme.shadows.card
      }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
          <h3 style={{ margin: 0, fontSize: theme.typography.body, fontWeight: theme.typography.medium, color: theme.colors.textOnDark, letterSpacing: '0.01em' }}>
            Payments
          </h3>
        </div>
        <div style={{
          fontSize: '32px',
          fontWeight: 800,
          color: stats.balance >= 0 ? theme.colors.accentCyan : theme.colors.accentPink,
          marginBottom: theme.spacing.md,
          fontFamily: theme.typography.fontFamily,
          letterSpacing: '-0.04em',
          lineHeight: 1
        }}>
          {formatCurrency(stats.balance, data.profile.country)}
        </div>
        <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            background: 'rgba(0, 229, 204, 0.15)',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.caption,
            fontWeight: theme.typography.semiBold,
            color: theme.colors.accentCyan
          }}>
            <span style={{ fontSize: '12px' }}>↑</span>
            {formatCurrency(stats.income, data.profile.country)}
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            background: 'rgba(255, 107, 157, 0.15)',
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.caption,
            fontWeight: theme.typography.semiBold,
            color: theme.colors.accentPink
          }}>
            <span style={{ fontSize: '12px' }}>↓</span>
            {formatCurrency(stats.expenses, data.profile.country)}
          </div>
        </div>
      </div>
      
      <AddTransactionButton onClick={onOpenBottomSheet} />
    </div>
  )
}
