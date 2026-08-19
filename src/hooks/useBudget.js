import { useMemo } from 'react'
import { getMonthTransactions, calculateMonthStats } from './usePayments'

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
    const currentDay = now.getDate()
    
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
    const daysRemaining = totalDaysInMonth - currentDay + 1 // Including today

    // Get current month transactions
    const transactions = getMonthTransactions(
      data.payments.transactions,
      year,
      month
    )
    
    const stats = calculateMonthStats(transactions)
    
    let spendableRemaining
    
    if (budget.mode === 'spend') {
      // Mode A: Spend X (fixed monthly cap)
      const totalSpentThisMonth = stats.expenses
      spendableRemaining = budget.amount - totalSpentThisMonth
    } else {
      // Mode B: Keep Balance X (savings floor)
      const currentBalance = stats.balance
      spendableRemaining = currentBalance - budget.amount
    }
    
    // Calculate daily allowance
    const dailyAllowance = daysRemaining > 0 ? spendableRemaining / daysRemaining : 0
    
    return {
      dailyAllowance,
      spendableRemaining,
      daysRemaining,
      mode: budget.mode,
      budgetAmount: budget.amount
    }
  }, [data.payments.transactions, data.settings?.budget])
}
