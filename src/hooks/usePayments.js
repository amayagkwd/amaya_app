import uuidv4 from '../utils/uuid'

/**
 * Hook for payment CRUD operations
 * 
 * Note: Financial calculations have been moved to src/services/financialCalculations.js
 * Use useFinancials hook or import from the service directly for calculations.
 */
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
