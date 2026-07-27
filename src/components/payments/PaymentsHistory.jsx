import { useState, useMemo } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

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
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#6b7280', marginRight: '4px' }}>Filter:</span>
        {['all', 'income', 'expense'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              background: filter === f ? '#4f46e5' : '#f3f4f6',
              color: filter === f ? '#fff' : '#6b7280',
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'capitalize',
              fontWeight: filter === f ? 500 : 400
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
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div>No transactions this month</div>
        </div>
      ) : (
        Object.entries(groupedTransactions).map(([date, txns]) => (
          <div key={date} style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              {formatDate(date)}
            </div>
            {txns.map(t => {
              const category = categories.find(c => c.id === t.categoryId)
              return (
                <div
                  key={t.id}
                  style={{
                    background: '#fff',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{category?.name || 'Unknown'}</div>
                    {t.note && (
                      <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                        {t.note}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontWeight: 500,
                      color: t.type === 'income' ? '#10b981' : '#f43f5e'
                    }}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, country)}
                    </span>
                    <button
                      onClick={() => onEdit(t)}
                      className="btn-edit"
                    >
                      <img 
                        src="/edit-pencil-01-svgrepo-com.svg" 
                        alt="Edit"
                      />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="btn-delete"
                    >
                      <img 
                        src="/trash-blank-alt-svgrepo-com.svg" 
                        alt="Delete"
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
