import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { showToast } from './Toast'
import { getCurrencyByCountry } from '../../utils/countries'
import uuidv4 from '../../utils/uuid'
import theme from '../../theme'

export default function BottomSheet({ isOpen, onClose, categories, onSave, data, updateStore, mode = 'transaction' }) {
  const navigate = useNavigate()
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  
  // Reminder-specific fields
  const [reminderName, setReminderName] = useState('')
  const [reminderCategory, setReminderCategory] = useState('')
  const [reminderCategoryDropdownOpen, setReminderCategoryDropdownOpen] = useState(false)
  const [remindDaysBefore, setRemindDaysBefore] = useState(1)
  const [recurMonthly, setRecurMonthly] = useState(false)
  
  useEffect(() => {
    if (isOpen) {
      setType(mode === 'settleup' ? 'owed' : 'expense')
      setAmount('')
      setCategoryId('')
      setDate(new Date().toISOString().split('T')[0])
      setNote('')
      setCategoryDropdownOpen(false)
      
      // Reset reminder fields
      setReminderName('')
      setReminderCategory('')
      setReminderCategoryDropdownOpen(false)
      setRemindDaysBefore(1)
      setRecurMonthly(false)
    }
  }, [isOpen, mode])
  
  // Get current month's date range
  const currentDate = new Date(date)
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Count category usage in the selected month
  const categoryUsageCount = {}
  data.payments.transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date)
    if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
      categoryUsageCount[transaction.categoryId] = (categoryUsageCount[transaction.categoryId] || 0) + 1
    }
  })
  
  // Filter and sort categories by usage count
  const filteredCategories = categories
    .filter(c => c.type === type)
    .sort((a, b) => {
      const countA = categoryUsageCount[a.id] || 0
      const countB = categoryUsageCount[b.id] || 0
      return countB - countA // Descending order (most used first)
    })
  
  const canSave = mode === 'reminder' 
    ? reminderName.trim() && reminderCategory && date
    : amount > 0 && (mode === 'settleup' || categoryId)
  
  // Get expense categories for reminders
  const expenseCategories = categories.filter(c => c.type === 'expense')
  
  const handleSave = () => {
    if (mode === 'reminder') {
      const category = categories.find(c => c.id === reminderCategory)
      onSave({
        name: reminderName.trim(),
        category: category?.name || '',
        categoryId: reminderCategory,
        date,
        remindDaysBefore: parseInt(remindDaysBefore),
        recurMonthly,
        note: note.trim() || null
      })
      showToast(`Reminder set for ${reminderName}`)
    } else {
      const category = categories.find(c => c.id === categoryId)
      const currencySymbol = getCurrencyByCountry(data.profile.country)
      onSave({
        type,
        amount: parseFloat(amount),
        categoryId,
        date,
        note: note.trim() || null,
        classification: category?.classification || null
      })
      showToast(`Logged ${currencySymbol}${amount} · ${category?.name || 'Transaction'}`)
    }
    onClose()
  }
  
  const handleAddCategory = () => {
    onClose()
    navigate('/payments', { state: { openSetup: true, categoryType: type } })
  }
  
  if (!isOpen) return null
  
  return (
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
        
        {mode === 'reminder' ? (
          <>
            {/* Reminder Form */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, color: theme.colors.textPrimary, fontWeight: theme.typography.medium }}>
                Name
              </label>
              <input
                type="text"
                value={reminderName}
                onChange={e => setReminderName(e.target.value)}
                autoFocus
                placeholder="e.g. Pay electricity bill"
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
                Category
              </label>
              <CustomDropdown
                value={reminderCategory}
                onChange={setReminderCategory}
                options={expenseCategories}
                placeholder="Select category"
                isOpen={reminderCategoryDropdownOpen}
                onToggle={() => setReminderCategoryDropdownOpen(!reminderCategoryDropdownOpen)}
                onClose={() => setReminderCategoryDropdownOpen(false)}
                onAddCategory={handleAddCategory}
                type="expense"
                updateStore={updateStore}
              />
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
                Remind me
              </label>
              <div style={{
                display: 'flex',
                overflowX: 'auto',
                gap: theme.spacing.sm,
                padding: '4px 0'
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(days => (
                  <button
                    key={days}
                    onClick={() => setRemindDaysBefore(days)}
                    type="button"
                    style={{
                      minWidth: '80px',
                      padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                      background: remindDaysBefore === days ? theme.colors.accentPurple : theme.colors.bgCardDark,
                      color: theme.colors.textPrimary,
                      border: `1px solid ${remindDaysBefore === days ? theme.colors.accentPurple : theme.colors.borderSubtle}`,
                      borderRadius: theme.borderRadius.sm,
                      cursor: 'pointer',
                      fontSize: theme.typography.body,
                      fontWeight: theme.typography.medium,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {days} {days === 1 ? 'day' : 'days'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: theme.borderRadius.sm,
                background: theme.colors.bgCardDark
              }}>
                <label style={{ fontSize: theme.typography.body, color: theme.colors.textPrimary, fontWeight: theme.typography.medium, cursor: 'pointer' }}>
                  Repeat monthly
                </label>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={recurMonthly}
                    onChange={(e) => setRecurMonthly(e.target.checked)}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '48px',
                    height: '28px',
                    borderRadius: '14px',
                    background: recurMonthly ? theme.colors.accentPurple : theme.colors.bgCard,
                    position: 'relative',
                    transition: theme.transitions.normal,
                    border: `1px solid ${recurMonthly ? theme.colors.accentPurple : theme.colors.borderSubtle}`
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: theme.colors.textPrimary,
                      position: 'absolute',
                      top: '3px',
                      left: recurMonthly ? '24px' : '3px',
                      transition: theme.transitions.normal,
                      boxShadow: theme.shadows.card
                    }} />
                  </div>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, color: theme.colors.textPrimary, fontWeight: theme.typography.medium }}>
                Notes (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add any additional details"
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
          </>
        ) : (
          <>
            {/* Transaction/SettleUp Form */}
            <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
              <button
                onClick={() => setType(mode === 'settleup' ? 'owed' : 'income')}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: type === (mode === 'settleup' ? 'owed' : 'income') ? theme.colors.accentPurple : theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  border: type === (mode === 'settleup' ? 'owed' : 'income') ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  cursor: 'pointer',
                  fontSize: theme.typography.body,
                  fontWeight: theme.typography.medium
                }}
              >
                {mode === 'settleup' ? 'Owed' : 'Income'}
              </button>
              <button
                onClick={() => setType(mode === 'settleup' ? 'debt' : 'expense')}
                style={{
                  flex: 1,
                  padding: theme.spacing.md,
                  background: type === (mode === 'settleup' ? 'debt' : 'expense') ? theme.colors.accentPurple : theme.colors.bgCardDark,
                  color: theme.colors.textPrimary,
                  border: type === (mode === 'settleup' ? 'debt' : 'expense') ? 'none' : `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  cursor: 'pointer',
                  fontSize: theme.typography.body,
                  fontWeight: theme.typography.medium
                }}
              >
                {mode === 'settleup' ? 'Debt' : 'Expense'}
              </button>
            </div>
            
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, color: theme.colors.textPrimary, fontWeight: theme.typography.medium }}>
                Amount
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
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
            
            {mode !== 'settleup' && (
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: 'block', marginBottom: theme.spacing.sm, fontSize: theme.typography.body, color: theme.colors.textPrimary, fontWeight: theme.typography.medium }}>
                  Category
                </label>
                <CustomDropdown
                  value={categoryId}
                  onChange={setCategoryId}
                  options={filteredCategories}
                  placeholder="Select category"
                  isOpen={categoryDropdownOpen}
                  onToggle={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  onClose={() => setCategoryDropdownOpen(false)}
                  onAddCategory={handleAddCategory}
                  type={type}
                  updateStore={updateStore}
                />
              </div>
            )}
            
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
          </>
        )}
        
        <button
          onClick={handleSave}
          disabled={!canSave}
          style={{
            width: '100%',
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
          Save
        </button>
      </div>
    </>
  )
}

function CustomDropdown({ value, onChange, options, placeholder, isOpen, onToggle, onClose, onAddCategory, type, updateStore }) {
  const dropdownRef = useRef(null)
  const selectedOption = options.find(opt => opt.id === value)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
        setIsAddingCategory(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])
  
  const handleSelect = (optionId) => {
    onChange(optionId)
    onClose()
    setIsAddingCategory(false)
  }
  
  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        type="button"
        style={{
          width: '100%',
          padding: theme.spacing.md,
          border: `1px solid ${theme.colors.borderSubtle}`,
          borderRadius: theme.borderRadius.sm,
          fontSize: theme.typography.h5,
          boxSizing: 'border-box',
          background: theme.colors.bgCardDark,
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: selectedOption ? theme.colors.textPrimary : theme.colors.textMuted,
          outline: 'none'
        }}
      >
        <span>{selectedOption ? selectedOption.name : placeholder}</span>
        <span style={{ 
          fontSize: theme.typography.caption,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: theme.transitions.fast
        }}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: theme.colors.bgModal,
          backdropFilter: theme.backdropFilter,
          WebkitBackdropFilter: theme.backdropFilter,
          border: `1px solid ${theme.colors.borderSubtle}`,
          borderRadius: theme.borderRadius.sm,
          boxShadow: theme.shadows.card,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            maxHeight: '240px',
            overflowY: 'auto'
          }}>
            {options.length === 0 ? (
              <div style={{
                padding: `${theme.spacing.xxxl} ${theme.spacing.lg}`,
                color: theme.colors.textMuted,
                fontSize: theme.typography.body,
                textAlign: 'center'
              }}>
                No categories yet
              </div>
            ) : (
              options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  type="button"
                  style={{
                    width: '100%',
                    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                    border: 'none',
                    background: value === option.id ? theme.colors.bgCardHover : 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: theme.typography.h6,
                    color: theme.colors.textPrimary,
                    borderBottom: `1px solid ${theme.colors.borderSubtle}`,
                    outline: 'none'
                  }}
                >
                  {option.name}
                </button>
              ))
            )}
          </div>
          
          {!isAddingCategory ? (
            <button
              onClick={() => setIsAddingCategory(true)}
              type="button"
              style={{
                width: '100%',
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                border: 'none',
                borderTop: `1px dashed ${theme.colors.borderDashed}`,
                background: 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: theme.typography.h6,
                color: theme.colors.accentPurple,
                fontWeight: theme.typography.medium,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                outline: 'none'
              }}
            >
              <span style={{ fontSize: theme.typography.h4 }}>+</span>
              <span>Add Category</span>
            </button>
          ) : (
            <AddCategoryForm 
              onClose={() => setIsAddingCategory(false)}
              onSelect={handleSelect}
              type={type}
              updateStore={updateStore}
            />
          )}
        </div>
      )}
    </div>
  )
}

function AddCategoryForm({ onClose, onSelect, type, updateStore }) {
  const [newName, setNewName] = useState('')
  const [classification, setClassification] = useState('need')
  const inputRef = useRef(null)
  
  useEffect(() => {
    inputRef.current?.focus()
  }, [])
  
  const handleAdd = () => {
    if (!newName.trim()) return
    
    const newCategory = {
      id: uuidv4(),
      name: newName.trim(),
      type,
      classification: type === 'expense' ? classification : null,
      isDefault: false
    }
    
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: [...current.payments.categories, newCategory]
      }
    }))
    
    onSelect(newCategory.id)
    onClose()
  }
  
  return (
    <div style={{
      borderTop: `1px dashed ${theme.colors.borderDashed}`,
      padding: theme.spacing.lg,
      background: theme.colors.bgCardDark
    }}>
      <input
        ref={inputRef}
        type="text"
        value={newName}
        onChange={e => setNewName(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleAdd()
          if (e.key === 'Escape') onClose()
        }}
        placeholder="Category name"
        style={{
          width: '100%',
          padding: `${theme.spacing.md} ${theme.spacing.md}`,
          border: `1px solid ${theme.colors.borderSubtle}`,
          borderRadius: '6px',
          fontSize: theme.typography.body,
          marginBottom: theme.spacing.md,
          boxSizing: 'border-box',
          background: theme.colors.bgCard,
          color: theme.colors.textPrimary,
          outline: 'none'
        }}
      />
      
      {type === 'expense' && (
        <div style={{ 
          display: 'flex', 
          gap: theme.spacing.sm, 
          marginBottom: theme.spacing.md
        }}>
          <button
            onClick={() => setClassification('need')}
            type="button"
            style={{
              flex: 1,
              padding: theme.spacing.sm,
              background: classification === 'need' ? theme.colors.accentPurple : theme.colors.bgCard,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: theme.typography.bodySmall,
              fontWeight: theme.typography.medium
            }}
          >
            Need
          </button>
          <button
            onClick={() => setClassification('want')}
            type="button"
            style={{
              flex: 1,
              padding: theme.spacing.sm,
              background: classification === 'want' ? theme.colors.accentPurple : theme.colors.bgCard,
              color: theme.colors.textPrimary,
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: theme.typography.bodySmall,
              fontWeight: theme.typography.medium
            }}
          >
            Want
          </button>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: theme.spacing.sm }}>
        <button
          onClick={handleAdd}
          type="button"
          disabled={!newName.trim()}
          style={{
            flex: 1,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            background: newName.trim() ? theme.colors.accentPurple : theme.colors.bgCard,
            color: theme.colors.textPrimary,
            border: 'none',
            borderRadius: '6px',
            cursor: newName.trim() ? 'pointer' : 'not-allowed',
            fontSize: theme.typography.body,
            fontWeight: theme.typography.medium,
            opacity: newName.trim() ? 1 : 0.5
          }}
        >
          Add
        </button>
        <button
          onClick={onClose}
          type="button"
          style={{
            flex: 1,
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            background: theme.colors.bgCard,
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.borderSubtle}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: theme.typography.body,
            fontWeight: theme.typography.medium
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
