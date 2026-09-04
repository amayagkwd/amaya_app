/**
 * Financial Calculations Service
 * 
 * This is the single source of truth for ALL financial calculations in the app.
 * All balance, income, expense, forecast, and budget calculations should use these functions.
 * 
 * Design principles:
 * - Pure functions (no side effects)
 * - Accept transaction arrays as input
 * - Return consistent, predictable results
 * - Well-documented edge cases
 */

/**
 * Calculate statistics for transactions filtered by payment mode
 * 
 * @param {Array} transactions - Array of transaction objects
 * @param {string|null} paymentMode - 'bank', 'cash', 'credit', or null for all modes
 * @returns {Object} { income, expenses, balance }
 */
export function calculateStats(transactions, paymentMode = null) {
  if (!paymentMode) {
    // Calculate total across all payment modes
    const bankStats = calculateStatsForMode(transactions, 'bank')
    const cashStats = calculateStatsForMode(transactions, 'cash')
    const creditStats = calculateStatsForMode(transactions, 'credit')
    
    return {
      income: bankStats.income + cashStats.income + creditStats.income,
      expenses: bankStats.expenses + cashStats.expenses + creditStats.expenses,
      balance: bankStats.balance + cashStats.balance + creditStats.balance
    }
  }
  
  return calculateStatsForMode(transactions, paymentMode)
}

/**
 * Calculate statistics for a specific payment mode
 * 
 * IMPORTANT: This preserves the existing localStorage behavior where:
 * - month-balance transactions ARE included in balance calculations
 * - All balance updates (initial-balance, balance-update, month-balance) contribute to balance
 * - Regular income/expense transactions are counted separately
 * 
 * @param {Array} transactions - Array of transaction objects
 * @param {string} paymentMode - 'bank', 'cash', or 'credit'
 * @returns {Object} { income, expenses, balance }
 */
function calculateStatsForMode(transactions, paymentMode) {
  let income = 0
  let expenses = 0
  let balanceAdjustments = 0
  
  transactions.forEach(t => {
    const txnPaymentMode = t.paymentMode || 'bank' // Default to bank for old transactions
    
    // Only process transactions for the specified payment mode
    if (txnPaymentMode !== paymentMode) return
    
    // Handle balance updates based on payment mode
    if (paymentMode === 'bank') {
      if (t.isBalanceUpdate || t.categoryId === 'month-balance' || 
          t.categoryId === 'balance-update' || t.categoryId === 'initial-balance') {
        balanceAdjustments += t.balanceChange || t.amount || 0
        return
      }
    } else if (paymentMode === 'cash') {
      if (t.categoryId === 'cash-balance' || t.categoryId === 'cash-balance-update') {
        balanceAdjustments += t.balanceChange || t.amount || 0
        return
      }
    } else if (paymentMode === 'credit') {
      if (t.categoryId === 'credit-balance' || t.categoryId === 'credit-balance-update') {
        balanceAdjustments += t.balanceChange || t.amount || 0
        return
      }
    }
    
    // Handle regular transactions
    if (t.type === 'income') {
      income += t.amount
    } else if (t.type === 'expense') {
      expenses += t.amount
    }
  })
  
  return {
    income,
    expenses,
    balance: income - expenses + balanceAdjustments
  }
}

/**
 * Calculate end-of-month balance for a specific month
 * 
 * This is used for monthly balance carry-forward calculations.
 * 
 * CRITICAL: This implementation EXCLUDES month-balance transactions to avoid
 * double-counting when calculating what balance should be carried forward.
 * 
 * @param {Array} transactions - All transactions
 * @param {string} monthString - Format: "YYYY-MM"
 * @param {string} paymentMode - 'bank', 'cash', or 'credit'
 * @returns {number} Balance at end of specified month
 */
export function calculateEndOfMonthBalance(transactions, monthString, paymentMode = 'bank') {
  const [year, month] = monthString.split('-').map(Number)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59) // Last day of the month
  
  let balance = 0
  
  transactions.forEach(transaction => {
    if (!transaction.date) return
    const tDate = new Date(transaction.date)
    
    if (isNaN(tDate.getTime())) return
    
    // Include all transactions up to and including the last day of the specified month
    if (tDate <= endOfMonth) {
      // Get transaction payment mode (default to 'bank' for old transactions)
      const txnPaymentMode = transaction.paymentMode || 'bank'
      
      // Only process transactions for the specified payment mode
      if (txnPaymentMode !== paymentMode) return
      
      // Skip month-balance carry-forward transactions to avoid double-counting
      // These are balance transactions from PREVIOUS months carried forward
      // We only want: initial balance (once), manual balance updates, and regular income/expenses
      if (transaction.categoryId === 'month-balance') {
        return
      }
      
      if (transaction.isBalanceUpdate || transaction.categoryId === 'initial-balance' || 
          transaction.categoryId === 'balance-update') {
        balance += transaction.balanceChange || transaction.amount
      } else if (transaction.type === 'income') {
        balance += transaction.amount
      } else if (transaction.type === 'expense') {
        balance -= transaction.amount
      }
    }
  })
  
  return balance
}

/**
 * Filter transactions for a specific month
 * 
 * @param {Array} transactions - All transactions
 * @param {number} year - Year
 * @param {number} month - Month (0-11, JavaScript convention)
 * @returns {Array} Filtered transactions
 */
export function getMonthTransactions(transactions, year, month) {
  return transactions.filter(t => {
    if (!t.date) return false
    const date = new Date(t.date)
    return date.getFullYear() === year && date.getMonth() === month
  })
}

/**
 * Filter transactions for a specific year
 * 
 * @param {Array} transactions - All transactions
 * @param {number} year - Year
 * @returns {Array} Filtered transactions
 */
export function getYearTransactions(transactions, year) {
  return transactions.filter(t => {
    if (!t.date) return false
    const date = new Date(t.date)
    return date.getFullYear() === year
  })
}

/**
 * Calculate median daily spend for a specific month
 * 
 * @param {Array} transactions - All transactions
 * @param {number} year - Year
 * @param {number} month - Month (0-11)
 * @param {number} daysElapsed - Number of days elapsed in month
 * @param {string} paymentMode - Payment mode to filter by
 * @returns {number} Median daily spend
 */
export function calculateMedianDailySpend(transactions, year, month, daysElapsed, paymentMode = 'bank') {
  // Get expense transactions for specified month and payment mode
  const monthExpenses = transactions.filter(t => {
    if (!t.date) return false
    const date = new Date(t.date)
    const txnPaymentMode = t.paymentMode || 'bank'
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      t.type === 'expense' &&
      txnPaymentMode === paymentMode
    )
  })

  // Build an array of daily expense totals from day 1 to daysElapsed
  const dailyTotals = Array.from({ length: daysElapsed }, (_, i) => {
    const day = i + 1
    return monthExpenses
      .filter(t => new Date(t.date).getDate() === day)
      .reduce((sum, t) => sum + t.amount, 0)
  })

  // Calculate median
  const sorted = [...dailyTotals].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const medianDailySpend =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2

  return medianDailySpend
}

/**
 * Calculate historical median daily spend across all time
 * 
 * @param {Array} transactions - All transactions
 * @param {string} paymentMode - Payment mode to filter by
 * @returns {number} Historical median daily spend
 */
export function calculateHistoricalMedianDailySpend(transactions, paymentMode = 'bank') {
  // Get ALL expense transactions with valid dates
  const allExpenses = transactions.filter(t => {
    const txnPaymentMode = t.paymentMode || 'bank'
    return t.type === 'expense' && t.date && t.date !== '' && txnPaymentMode === paymentMode
  })
  
  if (allExpenses.length === 0) return 0
  
  // Group expenses by date
  const expensesByDate = {}
  allExpenses.forEach(t => {
    const date = t.date
    if (!expensesByDate[date]) {
      expensesByDate[date] = 0
    }
    expensesByDate[date] += t.amount
  })
  
  // Get the first and last transaction dates to know the full date range
  const dates = Object.keys(expensesByDate).sort()
  if (dates.length === 0) return 0
  
  const firstDate = new Date(dates[0])
  const lastDate = new Date(dates[dates.length - 1])
  
  // Build array of daily totals for every day in the range (including 0-spend days)
  const dailyTotals = []
  const currentDate = new Date(firstDate)
  
  while (currentDate <= lastDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    dailyTotals.push(expensesByDate[dateStr] || 0)
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Calculate median
  const sorted = [...dailyTotals].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
  
  return median
}

/**
 * Calculate month-end projection based on historical spending patterns
 * 
 * @param {Array} transactions - All transactions
 * @param {number} currentBalance - Current balance
 * @param {Object} settings - User settings
 * @returns {Object} { dailySpendForecast, monthEndProjection, isEarlyMonth }
 */
export function calculateMonthEndProjection(transactions, currentBalance, settings = {}) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const currentDay = now.getDate()
  const daysElapsed = currentDay
  
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
  const daysRemaining = totalDaysInMonth - daysElapsed

  // Calculate median daily spend using ALL historical transactions
  const medianDailySpend = calculateHistoricalMedianDailySpend(transactions, 'bank')

  const projectedRemainingSpend = medianDailySpend * daysRemaining
  const projectedMonthEndBalance = currentBalance - projectedRemainingSpend

  return {
    dailySpendForecast: medianDailySpend,
    monthEndProjection: projectedMonthEndBalance,
    isEarlyMonth: daysElapsed < 5
  }
}

/**
 * Calculate budget status and daily allowance
 * 
 * @param {Array} transactions - Current month transactions
 * @param {number} currentBalance - Current balance
 * @param {Object} budgetSettings - Budget configuration
 * @param {string} country - Country for currency formatting in messages
 * @returns {Object} Budget status and allowances
 */
export function calculateBudgetStatus(transactions, currentBalance, budgetSettings, country = 'India') {
  if (!budgetSettings || !budgetSettings.enabled) {
    return null
  }

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const currentDay = now.getDate()
  
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
  const daysRemaining = totalDaysInMonth - currentDay + 1 // Including today
  
  // Calculate bank-only stats for budget
  const stats = calculateStats(transactions, 'bank')
  
  // Get today's transactions (bank only)
  const todayTransactions = transactions.filter(t => {
    if (!t.date) return false
    const txnDate = new Date(t.date)
    const paymentMode = t.paymentMode || 'bank'
    return txnDate.getDate() === currentDay && 
           txnDate.getMonth() === month && 
           txnDate.getFullYear() === year &&
           paymentMode === 'bank'
  })
  
  // Calculate today's spending (expenses only, not balance updates)
  const todaySpending = todayTransactions.reduce((sum, t) => {
    if (t.type === 'expense') {
      return sum + t.amount
    }
    return sum
  }, 0)
  
  let spendableRemaining
  let todayStartSpendable
  let dashboardCondition = null
  let isPossible = true
  
  if (budgetSettings.mode === 'spend') {
    // Mode A: Spend X (fixed monthly cap)
    const totalSpentThisMonth = stats.expenses
    spendableRemaining = budgetSettings.amount - totalSpentThisMonth
    
    // Add back today's spending to get what was spendable at start of day
    todayStartSpendable = spendableRemaining + todaySpending
    
    // Check if already spent more than budget
    if (totalSpentThisMonth > budgetSettings.amount) {
      const overBudget = totalSpentThisMonth - budgetSettings.amount
      isPossible = false
      dashboardCondition = {
        type: 'overBudget',
        amount: overBudget,
        message: `Spent ${country === 'India' ? '₹' : '$'}${Math.round(overBudget)} more than budget`
      }
    }
  } else {
    // Mode B: Keep Balance X (savings floor)
    spendableRemaining = currentBalance - budgetSettings.amount
    
    // Add back today's spending to get what was spendable at start of day
    todayStartSpendable = spendableRemaining + todaySpending
    
    // Check if savings goal is more than current balance
    if (budgetSettings.amount > currentBalance) {
      const incomeNeeded = budgetSettings.amount - currentBalance
      isPossible = false
      dashboardCondition = {
        type: 'incomeNeeded',
        amount: incomeNeeded,
        message: `Require ${country === 'India' ? '₹' : '$'}${Math.round(incomeNeeded)} income to match savings goal`
      }
    }
  }
  
  // Calculate today's fixed daily budget based on what was spendable at START of today
  const todayFixedBudget = daysRemaining > 0 ? todayStartSpendable / daysRemaining : 0
  
  // Today's remaining budget = today's fixed budget - today's spending
  const todayRemainingBudget = todayFixedBudget - todaySpending
  
  return {
    dailyAllowance: todayRemainingBudget,
    fixedDailyBudget: todayFixedBudget,
    todaySpending,
    spendableRemaining,
    daysRemaining,
    mode: budgetSettings.mode,
    budgetAmount: budgetSettings.amount,
    dashboardCondition,
    isPossible
  }
}

/**
 * Calculate category breakdown for income or expenses
 * 
 * @param {Array} transactions - Transactions to analyze
 * @param {Array} categories - Category definitions
 * @param {string} type - 'income' or 'expense'
 * @returns {Object|null} { data: Array, total: number } or null if no data
 */
export function calculateCategoryBreakdown(transactions, categories, type) {
  const typeTxns = transactions.filter(t => t.type === type)
  const total = typeTxns.reduce((sum, t) => sum + t.amount, 0)
  
  if (total === 0) return null
  
  const byCategory = {}
  typeTxns.forEach(t => {
    const category = categories.find(c => c.id === t.categoryId)
    const isBalanceTransaction = t.note?.startsWith('Balance of ')
    const isBalanceUpdate = t.isBalanceUpdate || false
    const isMonthBalance = t.categoryId === 'month-balance'
    
    let name
    if (isMonthBalance) {
      name = t.category || 'Balance'
    } else if (isBalanceTransaction) {
      name = 'Balance Transaction'
    } else if (isBalanceUpdate) {
      name = 'Balance Updated'
    } else {
      name = category?.name || 'Unknown'
    }
    
    byCategory[name] = (byCategory[name] || 0) + t.amount
  })
  
  const result = Object.entries(byCategory).map(([name, value]) => ({
    name,
    value,
    percentage: total > 0 ? Math.round((value / total) * 100) : 0
  }))
  
  return { data: result, total }
}

/**
 * Calculate needs vs wants breakdown
 * 
 * @param {Array} transactions - Transactions to analyze
 * @returns {Object|null} { data: Array, total: number } or null if no data
 */
export function calculateNeedsVsWants(transactions) {
  const expenseTxns = transactions.filter(t => t.type === 'expense')
  const total = expenseTxns.reduce((sum, t) => sum + t.amount, 0)
  
  const needs = expenseTxns.filter(t => t.classification === 'need').reduce((sum, t) => sum + t.amount, 0)
  const wants = expenseTxns.filter(t => t.classification === 'want').reduce((sum, t) => sum + t.amount, 0)
  
  if (needs === 0 && wants === 0) return null
  
  return {
    data: [
      { name: 'Needs', value: needs, percentage: total > 0 ? Math.round((needs / total) * 100) : 0 },
      { name: 'Wants', value: wants, percentage: total > 0 ? Math.round((wants / total) * 100) : 0 }
    ],
    total
  }
}
