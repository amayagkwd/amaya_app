import { useState } from 'react'
import { createPortal } from 'react-dom'
import theme from '../../theme'

export default function EditTransactionModal({ transaction, categories, onSave, onClose }) {
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [categoryId, setCategoryId] = useState(transaction.categoryId || '')
  const [date, setDate] = useState(transaction.date)
  const [note, setNote] = useState(transaction.note || '')
  
  const filteredCategories = categories.filter(c => c.type === transaction.type)
  const isBalanceTransaction = transaction.note?.startsWith('Balance of ')
  const canSave = amount > 0 && (isBalanceTransaction || categoryId)
  
  const handleSave = () => {
    const category = categoryId ? categories.find(c => c.id === categoryId) : null
    onSave({
      ...transaction,
      amount: parseFloat(amount),
      categoryId: categoryId || null,
      date,
      note: note.trim() || null,
      classification: category?.classification || null
    })
  }
  
  return createPortal(
    <>
      <div
        onClick={onClose}
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
        maxHeight: '80vh',
        overflowY: 'auto',
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
        
        <h3 style={{ margin: `0 0 ${theme.spacing.lg} 0`, fontSize: theme.typography.h4, fontWeight: theme.typography.semiBold, color: theme.colors.textPrimary }}>
          Edit Transaction
        </h3>
        
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, color: theme.colors.textPrimary, fontWeight: theme.typography.medium }}>
            Amount
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
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
          <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, color: theme.colors.textPrimary, fontWeight: theme.typography.medium }}>
            Category {isBalanceTransaction && '(optional for balance transactions)'}
          </label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
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
          >
            {isBalanceTransaction && <option value="">No category</option>}
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, color: theme.colors.textPrimary, fontWeight: theme.typography.medium }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
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
          <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, color: theme.colors.textPrimary, fontWeight: theme.typography.medium }}>
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. California burrito"
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
            onClick={onClose}
            style={{
              flex: 1,
              padding: theme.spacing.lg,
              background: theme.colors.bgCardDark,
              color: theme.colors.textSecondary,
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
            onClick={handleSave}
            disabled={!canSave}
            style={{
              flex: 1,
              padding: theme.spacing.lg,
              background: canSave ? theme.colors.accentPurple : theme.colors.bgCardDark,
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: theme.borderRadius.sm,
              fontSize: theme.typography.h5,
              fontWeight: theme.typography.medium,
              cursor: canSave ? 'pointer' : 'not-allowed',
              opacity: canSave ? 1 : 0.5
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>,
    document.body
  )
}
