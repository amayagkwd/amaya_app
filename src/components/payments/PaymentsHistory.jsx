import { useState, useMemo } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import theme from '../../theme'

export default function PaymentsHistory({ 
  allTransactions, 
  categories, 
  country, 
  onDelete, 
  onEdit 
}) {
  const [filter, setFilter] = useState('all')
  
  const transactions = useMemo(() => {
    if (filter === 'all') return allTransactions
    return allTransactions.filter(t => t.type === filter)
  }, [allTransactions, filter])
  
  const groupedTransactions = useMemo(() => {
    const groups = {}
    transactions
      .sort((a, b) => {
        // First sort by date (newest dates first)
        const dateCompare = new Date(b.date) - new Date(a.date)
        if (dateCompare !== 0) return dateCompare
        // Within same date, sort by timestamp (newest first)
        return (b.timestamp || 0) - (a.timestamp || 0)
      })
      .forEach(t => {
        if (!groups[t.date]) groups[t.date] = []
        groups[t.date].push(t)
      })
    return groups
  }, [transactions])
  
  const handleDelete = (id) => {
    if (confirm('Delete this transaction?')) {
      onDelete(id)
    }
  }
  
  return (
    <div>
      <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.xl, alignItems: 'center' }}>
        <span style={{ fontSize: theme.typography.bodySmall, color: theme.colors.textSecondary, marginRight: '4px', fontWeight: theme.typography.medium }}>Filter:</span>
        {['all', 'income', 'expense'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              background: filter === f ? theme.colors.accentPurple : theme.colors.bgCard,
              color: filter === f ? theme.colors.textPrimary : theme.colors.textSecondary,
              border: `1px solid ${filter === f ? 'transparent' : theme.colors.borderSubtle}`,
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: theme.typography.bodySmall,
              textTransform: 'capitalize',
              fontWeight: filter === f ? theme.typography.medium : theme.typography.regular,
              outline: 'none',
              transition: theme.transitions.fast
            }}
          >
            {f}
          </button>
        ))}
      </div>
      
      {Object.keys(groupedTransactions).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: theme.colors.textSecondary
        }}>
          <div style={{ fontSize: '48px', marginBottom: theme.spacing.lg }}>📊</div>
          <div style={{ fontSize: theme.typography.body }}>No transactions this month</div>
        </div>
      ) : (
        Object.entries(groupedTransactions).map(([date, txns]) => (
          <div key={date} style={{ marginBottom: theme.spacing.xxl }}>
            <div style={{
              fontSize: theme.typography.body,
              fontWeight: theme.typography.medium,
              color: theme.colors.textSecondary,
              marginBottom: theme.spacing.sm
            }}>
              {formatDate(date)}
            </div>
            {txns.map(t => {
              const category = categories.find(c => c.id === t.categoryId)
              return (
                <div
                  key={t.id}
                  style={{
                    background: theme.colors.bgCard,
                    backdropFilter: theme.backdropFilter,
                    WebkitBackdropFilter: theme.backdropFilter,
                    padding: theme.spacing.lg,
                    borderRadius: theme.borderRadius.lg,
                    marginBottom: theme.spacing.sm,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: `1px solid ${theme.colors.borderSubtle}`,
                    boxShadow: theme.shadows.card
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: theme.typography.medium, color: theme.colors.textPrimary, fontSize: theme.typography.h6 }}>{category?.name || 'Unknown'}</div>
                    {t.note && (
                      <div style={{ fontSize: theme.typography.body, color: theme.colors.textSecondary, marginTop: '4px' }}>
                        {t.note}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <span style={{
                      fontWeight: theme.typography.semiBold,
                      color: t.type === 'income' ? theme.colors.accentCyan : theme.colors.accentPink,
                      fontSize: theme.typography.h6
                    }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, country)}
                    </span>
                    <button
                      onClick={() => onEdit(t)}
                      className="btn-edit"
                      style={{ outline: 'none' }}
                    >
                      <img 
                        src="/edit-pencil-01-svgrepo-com.svg" 
                        alt="Edit"
                        style={{ filter: 'invert(60%) sepia(10%) saturate(500%) hue-rotate(194deg) brightness(95%) contrast(85%)' }}
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="btn-delete"
                      style={{ outline: 'none' }}
                    >
                      <img 
                        src="/trash-blank-alt-svgrepo-com.svg" 
                        alt="Delete"
                        style={{ filter: 'invert(50%) sepia(20%) saturate(1000%) hue-rotate(320deg) brightness(100%) contrast(90%)' }}
                      />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
