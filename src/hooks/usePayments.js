import { useMemo } from 'react'
import uuidv4 from '../utils/uuid'

export function usePayments(data, updateStore) {
  const addTransaction = (transaction) => {
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        transactions: [
          ...current.payments.transactions,
          { ...transaction, id: uuidv4(), timestamp: Date.now() }
        ]
      }
    }))
  }
  
  const deleteTransaction = (id) => {
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        transactions: current.payments.transactions.filter(t => t.id !== id)
      }
    }))
  }
  
  const addCategory = (category) => {
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: [
          ...current.payments.categories,
          { ...category, id: uuidv4(), isDefault: false }
        ]
      }
    }))
  }
  
  const updateCategory = (id, updates) => {
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: current.payments.categories.map(c =>
          c.id === id ? { ...c, ...updates } : c
        )
      }
    }))
  }
  
  const deleteCategory = (id) => {
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: current.payments.categories.filter(c => c.id !== id)
      }
    }))
  }
  
  return {
    addTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory
  }
}

export function getMonthTransactions(transactions, year, month) {
  return transactions.filter(t => {
    const date = new Date(t.date)
    return date.getFullYear() === year && date.getMonth() === month
  })
}

export function getYearTransactions(transactions, year) {
  return transactions.filter(t => {
    const date = new Date(t.date)
    return date.getFullYear() === year
  })
}

export function calculateMonthStats(transactions, paymentMode = null) {
  // If no payment mode specified, calculate total across all modes
  if (!paymentMode) {
    const bankStats = calculateBankStats(transactions)
    const cashStats = calculateCashStats(transactions)
    const creditStats = calculateCreditStats(transactions)
    
    return {
      income: bankStats.income + cashStats.income + creditStats.income,
      expenses: bankStats.expenses + cashStats.expenses + creditStats.expenses,
      balance: bankStats.balance + cashStats.balance + creditStats.balance
    }
  }
  
  // Otherwise, calculate for specific payment mode
  if (paymentMode === 'bank') return calculateBankStats(transactions)
  if (paymentMode === 'cash') return calculateCashStats(transactions)
  if (paymentMode === 'credit') return calculateCreditStats(transactions)
  
  return { income: 0, expenses: 0, balance: 0 }
}

export function calculateBankStats(transactions) {
  let income = 0
  let expenses = 0
  let balanceAdjustments = 0
  
  transactions.forEach(t => {
    const txnPaymentMode = t.paymentMode || 'bank' // Default to bank for old transactions
    
    // Only process bank transactions
    if (txnPaymentMode !== 'bank') return
    
    // Handle bank balance updates
    if (t.isBalanceUpdate || t.categoryId === 'month-balance' || 
        t.categoryId === 'balance-update' || t.categoryId === 'initial-balance') {
      balanceAdjustments += t.balanceChange || t.amount || 0
      return
    }
    
    // Handle regular bank transactions
    if (t.type === 'income') {
      income += t.amount
    } else if (t.type === 'expense') {
      expenses += t.amount
    }
  })
  
  return { income, expenses, balance: income - expenses + balanceAdjustments }
}

export function calculateCashStats(transactions) {
  let income = 0
  let expenses = 0
  let balanceAdjustments = 0
  
  transactions.forEach(t => {
    const txnPaymentMode = t.paymentMode
    
    // Only process cash transactions
    if (txnPaymentMode !== 'cash') return
    
    // Handle cash balance updates
    if (t.categoryId === 'cash-balance' || t.categoryId === 'cash-balance-update') {
      balanceAdjustments += t.balanceChange || t.amount || 0
      return
    }
    
    // Handle regular cash transactions
    if (t.type === 'income') {
      income += t.amount
    } else if (t.type === 'expense') {
      expenses += t.amount
    }
  })
  
  return { income, expenses, balance: income - expenses + balanceAdjustments }
}

export function calculateCreditStats(transactions) {
  let income = 0
  let expenses = 0
  let balanceAdjustments = 0
  
  transactions.forEach(t => {
    const txnPaymentMode = t.paymentMode
    
    // Only process credit transactions
    if (txnPaymentMode !== 'credit') return
    
    // Handle credit balance updates
    if (t.categoryId === 'credit-balance' || t.categoryId === 'credit-balance-update') {
      balanceAdjustments += t.balanceChange || t.amount || 0
      return
    }
    
    // Handle regular credit transactions
    if (t.type === 'income') {
      income += t.amount
    } else if (t.type === 'expense') {
      expenses += t.amount
    }
  })
  
  return { income, expenses, balance: income - expenses + balanceAdjustments }
}
