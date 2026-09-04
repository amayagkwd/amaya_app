import uuidv4 from '../utils/uuid'
import * as DataRepository from '../repositories/dataRepository'

/**
 * Hook for payment CRUD operations
 * 
 * Note: Financial calculations have been moved to src/services/financialCalculations.js
 * Use useFinancials hook or import from the service directly for calculations.
 */
export function usePayments(data, updateStore) {
  const addTransaction = async (transaction) => {
    const newTransaction = { ...transaction, id: uuidv4(), timestamp: Date.now() }
    
    // Add to Supabase
    try {
      await DataRepository.addTransaction(newTransaction)
    } catch (error) {
      console.error('Error adding transaction to Supabase:', error)
    }
    
    // Update local state
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        transactions: [
          ...current.payments.transactions,
          newTransaction
        ]
      }
    }))
  }
  
  const deleteTransaction = async (id) => {
    // Delete from Supabase
    try {
      await DataRepository.deleteTransaction(id)
    } catch (error) {
      console.error('Error deleting transaction from Supabase:', error)
    }
    
    // Update local state
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        transactions: current.payments.transactions.filter(t => t.id !== id)
      }
    }))
  }
  
  const addCategory = async (category) => {
    const newCategory = { ...category, id: uuidv4(), isDefault: false }
    
    // Add to Supabase
    try {
      await DataRepository.addCategory(newCategory)
    } catch (error) {
      console.error('Error adding category to Supabase:', error)
    }
    
    // Update local state
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: [
          ...current.payments.categories,
          newCategory
        ]
      }
    }))
  }
  
  const updateCategory = async (id, updates) => {
    // Update in Supabase
    try {
      await DataRepository.updateCategory(id, updates)
    } catch (error) {
      console.error('Error updating category in Supabase:', error)
    }
    
    // Update local state
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
  
  const deleteCategory = async (id) => {
    // Delete from Supabase
    try {
      await DataRepository.deleteCategory(id)
    } catch (error) {
      console.error('Error deleting category from Supabase:', error)
    }
    
    // Update local state
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
