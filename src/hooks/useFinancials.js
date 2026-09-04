import { useMemo } from 'react'
import * as FinancialCalcs from '../services/financialCalculations'

/**
 * React hook for accessing financial calculations with automatic memoization
 * 
 * This hook provides a convenient interface to the financialCalculations service
 * and ensures calculations are only recomputed when dependencies change.
 * 
 * @param {Array} transactions - Array of transaction objects
 * @param {Object} options - Configuration options
 * @param {number} options.year - Year for filtering (optional)
 * @param {number} options.month - Month for filtering (0-11, optional)
 * @param {string} options.paymentMode - 'bank', 'cash', 'credit', or null
 * @param {Object} options.budgetSettings - Budget configuration (optional)
 * @param {Array} options.categories - Category definitions (optional)
 * @param {string} options.country - Country for currency formatting (optional)
 * @param {boolean} options.isYearly - Whether to filter for year instead of month
 * @returns {Object} Financial calculations and statistics
 */
export function useFinancials(transactions, options = {}) {
  const {
    year,
    month,
    paymentMode = 'bank',
    budgetSettings,
    categories = [],
    country = 'India',
    isYearly = false
  } = options

  // Filter transactions by period
  const filteredTransactions = useMemo(() => {
    if (year !== undefined && month !== undefined && !isYearly) {
      return FinancialCalcs.getMonthTransactions(transactions, year, month)
    } else if (year !== undefined && isYearly) {
      return FinancialCalcs.getYearTransactions(transactions, year)
    }
    return transactions
  }, [transactions, year, month, isYearly])

  // Calculate statistics for the filtered period
  const stats = useMemo(() => 
    FinancialCalcs.calculateStats(filteredTransactions, paymentMode),
    [filteredTransactions, paymentMode]
  )

  // Calculate balance for current month (always for budget/forecast)
  const currentBalance = useMemo(() => {
    const now = new Date()
    const currentMonthTxns = FinancialCalcs.getMonthTransactions(
      transactions,
      now.getFullYear(),
      now.getMonth()
    )
    return FinancialCalcs.calculateStats(currentMonthTxns, paymentMode).balance
  }, [transactions, paymentMode])

  // Calculate month-end projection
  const forecast = useMemo(() => {
    if (!budgetSettings?.predictMonthEnd) return null
    return FinancialCalcs.calculateMonthEndProjection(transactions, currentBalance)
  }, [transactions, currentBalance, budgetSettings?.predictMonthEnd])

  // Calculate budget status
  const budget = useMemo(() => {
    if (!budgetSettings?.budget?.enabled) return null
    const now = new Date()
    const currentMonthTxns = FinancialCalcs.getMonthTransactions(
      transactions,
      now.getFullYear(),
      now.getMonth()
    )
    return FinancialCalcs.calculateBudgetStatus(
      currentMonthTxns,
      currentBalance,
      budgetSettings.budget,
      country
    )
  }, [transactions, currentBalance, budgetSettings, country])

  // Calculate category breakdowns
  const incomeBreakdown = useMemo(() => 
    FinancialCalcs.calculateCategoryBreakdown(filteredTransactions, categories, 'income'),
    [filteredTransactions, categories]
  )

  const expenseBreakdown = useMemo(() => 
    FinancialCalcs.calculateCategoryBreakdown(filteredTransactions, categories, 'expense'),
    [filteredTransactions, categories]
  )

  const needsVsWants = useMemo(() =>
    FinancialCalcs.calculateNeedsVsWants(filteredTransactions),
    [filteredTransactions]
  )

  return {
    // Core statistics
    stats,
    income: stats.income,
    expenses: stats.expenses,
    balance: stats.balance,
    
    // Current balance (for budget/forecast)
    currentBalance,
    
    // Forecasting
    forecast,
    
    // Budget
    budget,
    
    // Breakdowns
    incomeBreakdown,
    expenseBreakdown,
    needsVsWants,
    
    // Filtered transactions
    filteredTransactions
  }
}
