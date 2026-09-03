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
    
    // Get today's transactions (bank only) - we need this first
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
    let todayStartSpendable // What was spendable at the START of today
    let dashboardCondition = null // Will hold the message if conditions are met
    let isPossible = true // Whether it's possible to show today's budget
    
    if (budget.mode === 'spend') {
      // Mode A: Spend X (fixed monthly cap)
      const totalSpentThisMonth = stats.expenses
      spendableRemaining = budget.amount - totalSpentThisMonth
      
      // Add back today's spending to get what was spendable at start of day
      todayStartSpendable = spendableRemaining + todaySpending
      
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
      
      // Add back today's spending to get what was spendable at start of day
      todayStartSpendable = spendableRemaining + todaySpending
      
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
    
    // Calculate today's fixed daily budget based on what was spendable at START of today
    // This represents what the budget was at the START of today
    const todayFixedBudget = daysRemaining > 0 ? todayStartSpendable / daysRemaining : 0
    
    // Today's remaining budget = today's fixed budget - today's spending
    // This can go negative if overspent
    const todayRemainingBudget = todayFixedBudget - todaySpending
    
    return {
      dailyAllowance: todayRemainingBudget, // Show remaining budget for today
      fixedDailyBudget: todayFixedBudget, // The fixed budget for today
      todaySpending, // How much was spent today
      spendableRemaining,
      daysRemaining,
      mode: budget.mode,
      budgetAmount: budget.amount,
      dashboardCondition,
      isPossible
    }
  }, [data.payments.transactions, data.settings?.budget])
}
