import { useState, useMemo, useEffect } from 'react'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import theme from '../../theme'

export default function PaymentsHistory({ 
  allTransactions, 
  categories, 
  country, 
  onDelete, 
  onEdit,
  quickFilter,
  appliedCategoryFilter,
  appliedClassificationFilter,
  appliedTypeFilter
}) {
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [classificationFilter, setClassificationFilter] = useState('all')
  const [amountOperator, setAmountOperator] = useState('more')
  const [amountValue, setAmountValue] = useState('')
  
  // Update filters when navigation props change
  useEffect(() => {
    if (appliedTypeFilter || appliedCategoryFilter || appliedClassificationFilter) {
      setShowFilters(true)
      setTypeFilter(appliedTypeFilter || 'all')
      setCategoryFilter(appliedCategoryFilter || 'all')
      setClassificationFilter(appliedClassificationFilter || 'all')
    }
  }, [appliedTypeFilter, appliedCategoryFilter, appliedClassificationFilter])
  
  // Dropdown open states
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [classificationDropdownOpen, setClassificationDropdownOpen] = useState(false)
  const [amountDropdownOpen, setAmountDropdownOpen] = useState(false)
  
  const transactions = useMemo(() => {
    let filtered = [...allTransactions]
    
    // Quick filter from stat cards or navigation (applies first)
    if (quickFilter) {
      if (quickFilter === 'income') {
        filtered = filtered.filter(t => t.type === 'income' && !t.isBalanceUpdate && t.categoryId !== 'month-balance' && t.categoryId !== 'initial-balance' && t.categoryId !== 'cash-balance')
      } else if (quickFilter === 'expense') {
        filtered = filtered.filter(t => t.type === 'expense' && !t.isBalanceUpdate && t.categoryId !== 'month-balance' && t.categoryId !== 'initial-balance' && t.categoryId !== 'cash-balance')
      } else if (quickFilter === 'balance') {
        filtered = filtered.filter(t => t.isBalanceUpdate || t.categoryId === 'month-balance' || t.categoryId === 'initial-balance' || t.categoryId === 'balance-update' || t.categoryId === 'cash-balance')
      }
      // Don't return early - apply additional filters below
    }
    
    // Type filter (only if no quickFilter)
    if (!quickFilter && typeFilter !== 'all') {
      if (typeFilter === 'balance') {
        filtered = filtered.filter(t => t.isBalanceUpdate || t.categoryId === 'month-balance' || t.categoryId === 'initial-balance' || t.categoryId === 'balance-update' || t.categoryId === 'cash-balance')
      } else {
        filtered = filtered.filter(t => t.type === typeFilter && !t.isBalanceUpdate && t.categoryId !== 'month-balance' && t.categoryId !== 'initial-balance' && t.categoryId !== 'cash-balance')
      }
    }
    
    // Category filter (applies after quick filter or type filter)
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.categoryId === categoryFilter)
    }
    
    // Classification filter (needs/wants) (applies after other filters)
    if (classificationFilter !== 'all') {
      filtered = filtered.filter(t => t.classification === classificationFilter)
    }
    
    // Amount filter
    if (amountValue && !isNaN(parseFloat(amountValue))) {
      const amount = parseFloat(amountValue)
      filtered = filtered.filter(t => {
        if (amountOperator === 'more') return t.amount > amount
        if (amountOperator === 'less') return t.amount < amount
        if (amountOperator === 'equal') return t.amount === amount
        return true
      })
    }
    
    return filtered
  }, [allTransactions, typeFilter, categoryFilter, classificationFilter, amountOperator, amountValue, quickFilter])

  // Calculate filtered total (only for specific filters, not amount filters)
  const filteredTotal = useMemo(() => {
    const hasRelevantFilter = quickFilter || typeFilter !== 'all' || categoryFilter !== 'all' || classificationFilter !== 'all'
    if (!hasRelevantFilter) return null
    
    return transactions.reduce((sum, t) => {
      if (t.type === 'income' && !t.isBalanceUpdate && t.categoryId !== 'month-balance' && t.categoryId !== 'initial-balance' && t.categoryId !== 'cash-balance') {
        return sum + t.amount
      } else if (t.type === 'expense' && !t.isBalanceUpdate && t.categoryId !== 'month-balance' && t.categoryId !== 'initial-balance' && t.categoryId !== 'cash-balance') {
        return sum - t.amount
      } else if (t.isBalanceUpdate || t.categoryId === 'month-balance' || t.categoryId === 'initial-balance' || t.categoryId === 'balance-update' || t.categoryId === 'cash-balance') {
        return sum + (t.balanceChange || t.amount)
      }
      return sum
    }, 0)
  }, [transactions, quickFilter, typeFilter, categoryFilter, classificationFilter])

  // Determine the prefix for the total
  const getTotalDisplay = () => {
    if (filteredTotal === null) return null
    
    // For income filters
    if (quickFilter === 'income' || (typeFilter === 'income' && !quickFilter)) {
      return { prefix: '+', color: theme.colors.accentCyan }
    }
    // For expense filters
    if (quickFilter === 'expense' || (typeFilter === 'expense' && !quickFilter)) {
      return { prefix: '-', color: theme.colors.accentPink }
    }
    // For balance or mixed
    return { prefix: '', color: theme.colors.textPrimary }
  }

  const clearFilters = () => {
    setTypeFilter('all')
    setCategoryFilter('all')
    setClassificationFilter('all')
    setAmountValue('')
  }
  
  // Get available categories based on type filter
  const availableCategories = useMemo(() => {
    if (typeFilter === 'all') return categories
    return categories.filter(c => c.type === typeFilter)
  }, [categories, typeFilter])
  
  // Check if classification filter should be enabled
  const isClassificationEnabled = typeFilter === 'expense' || typeFilter === 'all'
  
  // Reset dependent filters when type changes
  const handleTypeFilterChange = (newType) => {
    setTypeFilter(newType)
    setCategoryFilter('all')
    if (newType === 'income' || newType === 'balance') {
      setClassificationFilter('all')
    }
    setTypeDropdownOpen(false)
  }
  
  const handleCategoryFilterChange = (newCategory) => {
    setCategoryFilter(newCategory)
    setCategoryDropdownOpen(false)
  }
  
  const handleClassificationFilterChange = (newClassification) => {
    if (isClassificationEnabled) {
      setClassificationFilter(newClassification)
      setClassificationDropdownOpen(false)
    }
  }
  
  const handleAmountOperatorChange = (newOperator) => {
    setAmountOperator(newOperator)
    setAmountDropdownOpen(false)
  }
  
  const getTypeLabel = () => {
    if (typeFilter === 'all') return 'All'
    if (typeFilter === 'income') return 'Income'
    if (typeFilter === 'expense') return 'Expense'
    if (typeFilter === 'balance') return 'Balance'
  }
  
  const getCategoryLabel = () => {
    if (categoryFilter === 'all') return 'All'
    const cat = availableCategories.find(c => c.id === categoryFilter)
    return cat ? cat.name : 'All'
  }
  
  const getClassificationLabel = () => {
    if (classificationFilter === 'all') return 'All'
    if (classificationFilter === 'need') return 'Needs'
    if (classificationFilter === 'want') return 'Wants'
  }
  
  const getAmountOperatorLabel = () => {
    if (amountOperator === 'more') return '>'
    if (amountOperator === 'less') return '<'
    if (amountOperator === 'equal') return '='
  }
  
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
    <div style={{ position: 'relative', paddingBottom: filteredTotal !== null ? '60px' : '0' }}>
      {/* Filter Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: theme.spacing.lg, paddingRight: theme.spacing.sm }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '8px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <img 
            src="/filter-svgrepo-com.svg" 
            alt="Filter"
            style={{ 
              width: '20px', 
              height: '20px',
              filter: 'brightness(0) saturate(100%) invert(100%)',
              pointerEvents: 'none'
            }}
          />
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{
          background: 'rgba(28, 33, 40, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.xl,
          marginBottom: theme.spacing.xl,
          border: `1px solid ${theme.colors.borderMedium}`,
          boxShadow: theme.shadows.card,
          position: 'relative',
          zIndex: 50
        }}>
          {/* Filter Grid - Fixed 2x2 Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
            {/* Type Filter */}
            <div style={{ position: 'relative', minWidth: 0 }}>
              <label style={{ 
                display: 'block',
                fontSize: theme.typography.caption, 
                color: theme.colors.textSecondary, 
                marginBottom: '4px',
                fontWeight: theme.typography.medium
              }}>
                Type
              </label>
              <button
                onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
                style={{
                  width: '100%',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  background: theme.colors.bgCard,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: theme.typography.bodySmall,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: theme.colors.textPrimary,
                  fontWeight: theme.typography.medium,
                  outline: 'none',
                  textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {getTypeLabel()}
                <span style={{ fontSize: theme.typography.caption }}>▼</span>
              </button>
              {typeDropdownOpen && (
                <>
                  <div
                    onClick={() => setTypeDropdownOpen(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 100
                    }}
                  />
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
                    zIndex: 101,
                    overflow: 'hidden'
                  }}>
                    {['all', 'income', 'expense', 'balance'].map(type => (
                      <button
                        key={type}
                        onClick={() => handleTypeFilterChange(type)}
                        style={{
                          width: '100%',
                          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                          background: typeFilter === type ? theme.colors.bgCardHover : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: theme.typography.body,
                          color: theme.colors.textPrimary,
                          borderBottom: `1px solid ${theme.colors.borderSubtle}`,
                          outline: 'none',
                          textTransform: 'capitalize'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Category Filter */}
            <div style={{ position: 'relative', minWidth: 0 }}>
              <label style={{ 
                display: 'block',
                fontSize: theme.typography.caption, 
                color: theme.colors.textSecondary, 
                marginBottom: '4px',
                fontWeight: theme.typography.medium
              }}>
                Category
              </label>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                style={{
                  width: '100%',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  background: theme.colors.bgCard,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: theme.typography.bodySmall,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: theme.colors.textPrimary,
                  fontWeight: theme.typography.medium,
                  outline: 'none',
                  textAlign: 'left',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{getCategoryLabel()}</span>
                <span style={{ fontSize: theme.typography.caption, flexShrink: 0, marginLeft: '4px' }}>▼</span>
              </button>
              {categoryDropdownOpen && (
                <>
                  <div
                    onClick={() => setCategoryDropdownOpen(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 100
                    }}
                  />
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
                    zIndex: 101,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    <button
                      onClick={() => handleCategoryFilterChange('all')}
                      style={{
                        width: '100%',
                        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                        background: categoryFilter === 'all' ? theme.colors.bgCardHover : 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: theme.typography.body,
                        color: theme.colors.textPrimary,
                        borderBottom: `1px solid ${theme.colors.borderSubtle}`,
                        outline: 'none'
                      }}
                    >
                      All
                    </button>
                    {availableCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryFilterChange(cat.id)}
                        style={{
                          width: '100%',
                          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                          background: categoryFilter === cat.id ? theme.colors.bgCardHover : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: theme.typography.body,
                          color: theme.colors.textPrimary,
                          borderBottom: `1px solid ${theme.colors.borderSubtle}`,
                          outline: 'none'
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Classification Filter (Needs/Wants) */}
            <div style={{ position: 'relative', minWidth: 0 }}>
              <label style={{ 
                display: 'block',
                fontSize: theme.typography.caption, 
                color: isClassificationEnabled ? theme.colors.textSecondary : theme.colors.textMuted, 
                marginBottom: '4px',
                fontWeight: theme.typography.medium
              }}>
                Classification
              </label>
              <button
                onClick={() => isClassificationEnabled && setClassificationDropdownOpen(!classificationDropdownOpen)}
                disabled={!isClassificationEnabled}
                style={{
                  width: '100%',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  background: theme.colors.bgCard,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: '20px',
                  cursor: isClassificationEnabled ? 'pointer' : 'not-allowed',
                  fontSize: theme.typography.bodySmall,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: isClassificationEnabled ? theme.colors.textPrimary : theme.colors.textMuted,
                  fontWeight: theme.typography.medium,
                  outline: 'none',
                  textAlign: 'left',
                  opacity: isClassificationEnabled ? 1 : 0.5,
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                {getClassificationLabel()}
                <span style={{ fontSize: theme.typography.caption }}>▼</span>
              </button>
              {classificationDropdownOpen && isClassificationEnabled && (
                <>
                  <div
                    onClick={() => setClassificationDropdownOpen(false)}
                    style={{
                      position: 'fixed',
                      inset: 0,
                      zIndex: 100
                    }}
                  />
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
                    zIndex: 101,
                    overflow: 'hidden'
                  }}>
                    {['all', 'need', 'want'].map(classification => (
                      <button
                        key={classification}
                        onClick={() => handleClassificationFilterChange(classification)}
                        style={{
                          width: '100%',
                          padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                          background: classificationFilter === classification ? theme.colors.bgCardHover : 'transparent',
                          border: 'none',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: theme.typography.body,
                          color: theme.colors.textPrimary,
                          borderBottom: `1px solid ${theme.colors.borderSubtle}`,
                          outline: 'none'
                        }}
                      >
                        {classification === 'all' ? 'All' : classification === 'need' ? 'Needs' : 'Wants'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Amount Filter */}
            <div style={{ position: 'relative', minWidth: 0, gridColumn: 'span 1' }}>
              <label style={{ 
                display: 'block',
                fontSize: theme.typography.caption, 
                color: theme.colors.textSecondary, 
                marginBottom: '4px',
                fontWeight: theme.typography.medium
              }}>
                Amount
              </label>
              <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                <button
                  onClick={() => setAmountDropdownOpen(!amountDropdownOpen)}
                  style={{
                    flex: '0 0 auto',
                    width: '50px',
                    padding: `${theme.spacing.sm} 8px`,
                    background: theme.colors.bgCard,
                    border: `1px solid ${theme.colors.borderSubtle}`,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: theme.typography.body,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: theme.colors.textPrimary,
                    fontWeight: theme.typography.medium,
                    outline: 'none'
                  }}
                >
                  {getAmountOperatorLabel()}
                </button>
                {amountDropdownOpen && (
                  <>
                    <div
                      onClick={() => setAmountDropdownOpen(false)}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 100
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '4px',
                      background: theme.colors.bgModal,
                      backdropFilter: theme.backdropFilter,
                      WebkitBackdropFilter: theme.backdropFilter,
                      border: `1px solid ${theme.colors.borderSubtle}`,
                      borderRadius: theme.borderRadius.sm,
                      boxShadow: theme.shadows.card,
                      zIndex: 101,
                      overflow: 'hidden',
                      minWidth: '80px'
                    }}>
                      {['more', 'less', 'equal'].map(op => (
                        <button
                          key={op}
                          onClick={() => handleAmountOperatorChange(op)}
                          style={{
                            width: '100%',
                            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                            background: amountOperator === op ? theme.colors.bgCardHover : 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: theme.typography.body,
                            color: theme.colors.textPrimary,
                            borderBottom: `1px solid ${theme.colors.borderSubtle}`,
                            outline: 'none'
                          }}
                        >
                          {op === 'more' ? '>' : op === 'less' ? '<' : '='}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <input
                  type="number"
                  placeholder="0"
                  value={amountValue}
                  onChange={(e) => setAmountValue(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    background: theme.colors.bgCard,
                    color: theme.colors.textPrimary,
                    border: `1px solid ${theme.colors.borderSubtle}`,
                    borderRadius: '20px',
                    fontSize: theme.typography.bodySmall,
                    fontWeight: theme.typography.medium,
                    outline: 'none',
                    fontFamily: theme.typography.fontFamily
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            style={{
              width: '100%',
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              background: 'transparent',
              border: `1px solid ${theme.colors.borderSubtle}`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: theme.typography.body,
              color: theme.colors.textSecondary,
              fontWeight: theme.typography.medium,
              outline: 'none',
              transition: 'all 0.2s ease',
              WebkitTapHighlightColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.bgCardHover
              e.currentTarget.style.color = theme.colors.textPrimary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = theme.colors.textSecondary
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
      
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
              const isBalanceTransaction = t.note?.startsWith('Balance of ')
              const isBalanceUpdate = t.isBalanceUpdate || false
              const isMonthBalance = t.categoryId === 'month-balance'
              const isInitialBalance = t.categoryId === 'initial-balance'
              const isCashBalance = t.categoryId === 'cash-balance'
              
              // Determine payment mode (default to 'bank' for old transactions)
              const paymentMode = t.paymentMode || 'bank'
              
              // Get mode colors and icon
              const getModeColor = (mode) => {
                switch(mode) {
                  case 'cash': return '#00E5CC'
                  case 'credit': return '#7C6FFF'
                  case 'bank':
                  default: return '#5B9EFF'
                }
              }
              
              const getModeIcon = (mode) => {
                switch(mode) {
                  case 'cash': return '/cash-svgrepo-com.svg'
                  case 'credit': return '/credit-card-svgrepo-com.svg'
                  case 'bank':
                  default: return '/bank-svgrepo-com.svg'
                }
              }
              
              const getModeFilter = (mode) => {
                switch(mode) {
                  case 'cash': return 'brightness(0) saturate(100%) invert(73%) sepia(65%) saturate(2613%) hue-rotate(129deg) brightness(97%) contrast(101%)'
                  case 'credit': return 'brightness(0) saturate(100%) invert(51%) sepia(67%) saturate(2792%) hue-rotate(229deg) brightness(101%) contrast(101%)'
                  case 'bank':
                  default: return 'brightness(0) saturate(100%) invert(59%) sepia(46%) saturate(2138%) hue-rotate(192deg) brightness(103%) contrast(101%)'
                }
              }
              
              const modeColor = getModeColor(paymentMode)
              const categoryColor = modeColor // Use payment mode color for category name
              
              // Determine display name
              let displayName
              if (isInitialBalance) {
                displayName = 'Initial Balance'
              } else if (isMonthBalance) {
                displayName = t.category || 'Balance'
              } else if (isCashBalance) {
                displayName = 'Cash Balance'
              } else if (isBalanceTransaction) {
                displayName = 'Balance Transaction'
              } else if (isBalanceUpdate) {
                displayName = 'Balance Updated'
              } else {
                displayName = category?.name || 'Unknown'
              }
              
              // For balance updates, month balance, and initial balance, use cyan color
              // Initial balance and month balance: NO +/- prefix (just the amount)
              // Manual balance updates: SHOW +/- prefix based on change
              const isManualBalanceUpdate = isBalanceUpdate && t.categoryId === 'balance-update'
              
              const amountColor = (isBalanceUpdate || isMonthBalance || isInitialBalance || isCashBalance)
                ? theme.colors.accentCyan 
                : (t.type === 'income' ? theme.colors.accentCyan : theme.colors.accentPink)
              
              const amountPrefix = (isMonthBalance || isInitialBalance || isCashBalance)
                ? '+' // Show + for initial balances
                : isManualBalanceUpdate
                ? ((t.balanceChange >= 0) ? '+' : '-')
                : (t.type === 'income' ? '+' : '-')
              
              const amountToShow = (isBalanceUpdate || isMonthBalance || isInitialBalance || isCashBalance) 
                ? Math.abs(t.balanceChange || t.amount) 
                : t.amount
              
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
                    borderLeft: `4px solid ${modeColor}`,
                    boxShadow: theme.shadows.card,
                    gap: theme.spacing.md
                  }}
                >
                  {/* Payment Mode Icon */}
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    background: `${modeColor}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <img 
                      src={getModeIcon(paymentMode)} 
                      alt={paymentMode} 
                      width="16" 
                      height="16"
                      style={{ 
                        display: 'block',
                        filter: getModeFilter(paymentMode)
                      }}
                    />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: theme.typography.medium, color: theme.colors.textPrimary, fontSize: theme.typography.h6 }}>{displayName}</div>
                    {t.note && (
                      <div style={{ fontSize: theme.typography.body, color: theme.colors.textSecondary, marginTop: '4px' }}>
                        {t.note}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                    <span style={{
                      fontWeight: theme.typography.semiBold,
                      color: amountColor,
                      fontSize: theme.typography.h6
                    }}>
                      {amountPrefix}{formatCurrency(amountToShow, country)}
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
      
      {/* Filtered Total Display */}
      {filteredTotal !== null && getTotalDisplay() && (
        <div style={{
          position: 'fixed',
          bottom: `calc(${theme.layout.bottomNavHeight} + 8px)`,
          left: theme.spacing.lg,
          background: theme.colors.bgModal,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
          borderRadius: theme.borderRadius.xl,
          border: `1px solid ${theme.colors.borderMedium}`,
          boxShadow: theme.shadows.card,
          zIndex: 99,
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing.sm
        }}>
          <span style={{
            fontSize: theme.typography.body,
            color: theme.colors.textSecondary,
            fontWeight: theme.typography.medium
          }}>
            Total:
          </span>
          <span style={{
            fontSize: theme.typography.h5,
            fontWeight: theme.typography.semiBold,
            color: getTotalDisplay().color
          }}>
            {getTotalDisplay().prefix}{formatCurrency(Math.abs(filteredTotal), country)}
          </span>
        </div>
      )}
    </div>
  )
}
