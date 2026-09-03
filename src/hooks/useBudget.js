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
    
    // Calculate bank-only stats for budget
    const stats = calculateMonthStats(transactions, 'bank')
    
    let spendableRemaining
    let dashboardCondition = null // Will hold the message if conditions are met
    let isPossible = true // Whether it's possible to show today's budget
    
    if (budget.mode === 'spend') {
      // Mode A: Spend X (fixed monthly cap)
      const totalSpentThisMonth = stats.expenses
      spendableRemaining = budget.amount - totalSpentThisMonth
      
      // Check if already spent more than budget
      if (totalSpentThisMonth > budget.amount) {
        const overBudget = totalSpentThisMonth - budget.amount
        isPossible = false
        dashboardCondition = {
          type: 'overBudget',
          amount: overBudget,
          message: `Spent ${data.profile.country === 'India' ? '₹' : '$'}${Math.round(overBudget)} more than budget`
        }
      }
    } else {
      // Mode B: Keep Balance X (savings floor)
      const currentBalance = stats.balance
      spendableRemaining = currentBalance - budget.amount
      
      // Check if savings goal is more than current balance
      if (budget.amount > currentBalance) {
        const incomeNeeded = budget.amount - currentBalance
        isPossible = false
        dashboardCondition = {
          type: 'incomeNeeded',
          amount: incomeNeeded,
          message: `Require ${data.profile.country === 'India' ? '₹' : '$'}${Math.round(incomeNeeded)} income to match savings goal`
        }
      }
    }
    
    // Calculate daily allowance
    const dailyAllowance = daysRemaining > 0 ? spendableRemaining / daysRemaining : 0
    
    return {
      dailyAllowance,
      spendableRemaining,
      daysRemaining,
      mode: budget.mode,
      budgetAmount: budget.amount,
      dashboardCondition,
      isPossible
    }
  }, [data.payments.transactions, data.settings?.budget])
}
