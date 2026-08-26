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

export function calculateMonthStats(transactions) {
  let income = 0
  let expenses = 0
  let balanceAdjustments = 0
  
  transactions.forEach(t => {
    if (t.isBalanceUpdate || t.categoryId === 'month-balance' || t.categoryId === 'balance-update') {
      // Balance updates don't count as income or expense, they're adjustments
      balanceAdjustments += t.balanceChange || 0
    } else if (t.type === 'income') {
      income += t.amount
    } else if (t.type === 'expense') {
      expenses += t.amount
    }
  })
  
  return { income, expenses, balance: income - expenses + balanceAdjustments }
}
