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
          { ...transaction, id: uuidv4() }
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

export function calculateMonthStats(transactions) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  
  return { income, expenses, balance: income - expenses }
}
