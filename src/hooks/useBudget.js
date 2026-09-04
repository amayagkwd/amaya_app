import { useMemo } from 'react'
import * as FinancialCalcs from '../services/financialCalculations'

export function useBudget(data) {
  return useMemo(() => {
    const budget = data.settings?.budget
    
    // If budget is not enabled, return null
    if (!budget || !budget.enabled) {
      return null
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    
    // Get current month transactions
    const transactions = FinancialCalcs.getMonthTransactions(
      data.payments.transactions,
      year,
      month
    )
    
    // Calculate current balance
    const stats = FinancialCalcs.calculateStats(transactions, 'bank')
    const currentBalance = stats.balance
    
    // Use centralized budget calculation
    return FinancialCalcs.calculateBudgetStatus(
      transactions,
      currentBalance,
      budget,
      data.profile.country
    )
  }, [data.payments.transactions, data.settings?.budget, data.profile.country])
}
