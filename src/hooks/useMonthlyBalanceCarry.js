import { useEffect, useRef } from 'react'
import uuidv4 from '../utils/uuid'
import * as FinancialCalcs from '../services/financialCalculations'
import * as DataRepository from '../repositories/dataRepository'

export function useMonthlyBalanceCarry(data, updateStore) {
  const hasRunRef = useRef(false)
  const migrationDoneRef = useRef(false)
  const timestampFixDoneRef = useRef(false)
  const doubleCountFixDoneRef = useRef(false)
  const paymentModeMigrationDoneRef = useRef(false)
  const lastTransactionsHashRef = useRef('')
  
  useEffect(() => {
    // Don't run if data is not loaded yet
    if (!data || !data.payments || !data.settings) return
    
    // Prevent multiple runs in the same render cycle
    if (hasRunRef.current) return
    
    const settings = data.settings || {}
    
    // Migration 0: Add paymentMode to all old transactions
    if (!paymentModeMigrationDoneRef.current && !settings.paymentModeMigrationDone) {
      paymentModeMigrationDoneRef.current = true
      
      const fixedTransactions = data.payments.transactions.map(t => {
        // Skip if already has paymentMode
        if (t.paymentMode) return t
        
        // Cash balance transactions should have paymentMode='cash'
        if (t.categoryId === 'cash-balance' || t.categoryId === 'cash-balance-update' || t.isCashTransaction) {
          return { ...t, paymentMode: 'cash' }
        }
        
        // Credit balance transactions should have paymentMode='credit'
        if (t.categoryId === 'credit-balance' || t.categoryId === 'credit-balance-update') {
          return { ...t, paymentMode: 'credit' }
        }
        
        // All other transactions default to 'bank'
        return { ...t, paymentMode: 'bank' }
      })
      
      // Check if any transactions were actually modified
      const hasChanges = fixedTransactions.some((t, i) => t.paymentMode !== data.payments.transactions[i].paymentMode)
      
      if (hasChanges) {
        updateStore(current => ({
          ...current,
          payments: {
            ...current.payments,
            transactions: fixedTransactions
          },
          settings: {
            ...current.settings,
            paymentModeMigrationDone: true
          }
        }))
        return
      } else {
        // No changes needed, just mark as done
        updateStore(current => ({
          ...current,
          settings: {
            ...current.settings,
            paymentModeMigrationDone: true
          }
        }))
        return
      }
    }
    
    const resetBalanceEnabled = settings.resetBalanceEachMonth || false
    const lastCheckedMonth = settings.lastCheckedMonth
    const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"
    
    // Create a hash of non-month-balance transactions to detect changes
    const regularTransactions = data.payments.transactions.filter(t => 
      t.categoryId !== 'month-balance'
    )
    const transactionsHash = JSON.stringify(
      regularTransactions.map(t => ({ id: t.id, amount: t.amount, date: t.date, type: t.type }))
    )
    
    const isFirstLoad = lastTransactionsHashRef.current === ''
    const transactionsChanged = lastTransactionsHashRef.current !== transactionsHash
    lastTransactionsHashRef.current = transactionsHash
    
    // If non-month-balance transactions changed or first load, recalculate all month-balance transactions
    // On first load, always verify the balance transactions are correct
    // BUT: Skip recalculation if migration was just done (to avoid overwriting correct values)
    if ((transactionsChanged || isFirstLoad) && settings.monthBalanceDoubleCountFixed && settings.paymentModeMigrationDone) {
      hasRunRef.current = true
      
      const monthBalanceTransactions = data.payments.transactions.filter(t => 
        t.categoryId === 'month-balance' && t.isBalanceUpdate && t.date
      )
      
      if (monthBalanceTransactions.length > 0) {
        const fixedTransactions = [...data.payments.transactions]
        let hasChanges = false
        
        monthBalanceTransactions.forEach(monthBalanceTxn => {
          const txnDate = new Date(monthBalanceTxn.date)
          if (isNaN(txnDate.getTime())) return
          
          const month = txnDate.getMonth()
          const year = txnDate.getFullYear()
          const prevMonth = month === 0 ? 11 : month - 1
          const prevYear = month === 0 ? year - 1 : year
          const prevMonthString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`
          
          const correctBalance = FinancialCalcs.calculateEndOfMonthBalance(data.payments.transactions, prevMonthString, 'bank')
          
          if (correctBalance !== monthBalanceTxn.balanceChange) {
            hasChanges = true
            const txnIndex = fixedTransactions.findIndex(t => t.id === monthBalanceTxn.id)
            if (txnIndex !== -1) {
              fixedTransactions[txnIndex] = {
                ...fixedTransactions[txnIndex],
                balanceChange: correctBalance,
                amount: Math.abs(correctBalance)
              }
            }
          }
        })
        
        if (hasChanges) {
          updateStore(current => ({
            ...current,
            payments: {
              ...current.payments,
              transactions: fixedTransactions
            }
          }))
          
          setTimeout(() => {
            hasRunRef.current = false
          }, 1000)
          return
        }
      }
      
      setTimeout(() => {
        hasRunRef.current = false
      }, 1000)
    }
    
    // Migration 3: Fix double-counting in month-balance transactions
    if (!doubleCountFixDoneRef.current && !settings.monthBalanceDoubleCountFixed) {
      doubleCountFixDoneRef.current = true
      
      // Find all month-balance transactions
      const monthBalanceTransactions = data.payments.transactions.filter(t => 
        t.categoryId === 'month-balance' && t.isBalanceUpdate && t.date
      )
      
      if (monthBalanceTransactions.length > 0) {
        const fixedTransactions = [...data.payments.transactions]
        let hasChanges = false
        
        // For each month-balance transaction, recalculate the correct balance
        monthBalanceTransactions.forEach(monthBalanceTxn => {
          const txnDate = new Date(monthBalanceTxn.date)
          if (isNaN(txnDate.getTime())) return
          
          // Get the previous month
          const month = txnDate.getMonth()
          const year = txnDate.getFullYear()
          const prevMonth = month === 0 ? 11 : month - 1
          const prevYear = month === 0 ? year - 1 : year
          const prevMonthString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}`
          
          // Calculate what the balance SHOULD be
          const correctBalance = FinancialCalcs.calculateEndOfMonthBalance(data.payments.transactions, prevMonthString, 'bank')
          
          // If it's different, update it
          if (correctBalance !== monthBalanceTxn.balanceChange) {
            hasChanges = true
            const txnIndex = fixedTransactions.findIndex(t => t.id === monthBalanceTxn.id)
            if (txnIndex !== -1) {
              fixedTransactions[txnIndex] = {
                ...fixedTransactions[txnIndex],
                balanceChange: correctBalance,
                amount: Math.abs(correctBalance)
              }
            }
          }
        })
        
        if (hasChanges) {
          updateStore(current => ({
            ...current,
            payments: {
              ...current.payments,
              transactions: fixedTransactions
            },
            settings: {
              ...current.settings,
              monthBalanceDoubleCountFixed: true
            }
          }))
          return
        } else {
          // No changes needed, just mark as done
          updateStore(current => ({
            ...current,
            settings: {
              ...current.settings,
              monthBalanceDoubleCountFixed: true
            }
          }))
          return
        }
      } else {
        // No month-balance transactions to fix
        updateStore(current => ({
          ...current,
          settings: {
            ...current.settings,
            monthBalanceDoubleCountFixed: true
          }
        }))
        return
      }
    }
    
    // Migration 2: Fix timestamps for existing balance transactions
    if (!timestampFixDoneRef.current && !settings.balanceTimestampsFixed) {
      timestampFixDoneRef.current = true
      
      const fixedTransactions = data.payments.transactions.map(t => {
        // Check if this is a balance transaction that needs fixing
        if ((t.isBalanceUpdate || t.categoryId === 'month-balance' || t.note?.startsWith('Balance of ')) && t.date) {
          const firstDayDate = new Date(t.date + 'T00:00:00')
          const midnightTimestamp = firstDayDate.getTime()
          
          // Only update if timestamp is different
          if (t.timestamp !== midnightTimestamp) {
            return {
              ...t,
              timestamp: midnightTimestamp
            }
          }
        }
        return t
      })
      
      // Check if any transactions were actually modified
      const hasChanges = fixedTransactions.some((t, i) => t.timestamp !== data.payments.transactions[i].timestamp)
      
      if (hasChanges) {
        updateStore(current => ({
          ...current,
          payments: {
            ...current.payments,
            transactions: fixedTransactions
          },
          settings: {
            ...current.settings,
            balanceTimestampsFixed: true
          }
        }))
        return
      } else {
        // No changes needed, just mark as done
        updateStore(current => ({
          ...current,
          settings: {
            ...current.settings,
            balanceTimestampsFixed: true
          }
        }))
        return
      }
    }
    
    // Migration: For existing users, if they don't have the new setting, migrate them
    if (!migrationDoneRef.current && settings.resetBalanceEachMonth === undefined) {
      migrationDoneRef.current = true
      
      // Migrate existing data: create balance transactions for all previous months
      const balanceTransactions = generateHistoricalBalanceTransactions(data)
      
      if (balanceTransactions.length > 0) {
        hasRunRef.current = true
        
        updateStore(current => ({
          ...current,
          payments: {
            ...current.payments,
            transactions: [...current.payments.transactions, ...balanceTransactions]
          },
          settings: {
            ...current.settings,
            resetBalanceEachMonth: false, // Default to OFF (carry balance)
            lastCheckedMonth: currentMonth
          }
        }))
        
        setTimeout(() => {
          hasRunRef.current = false
        }, 1000)
        
        return
      } else {
        // No transactions to migrate, just set the default
        updateStore(current => ({
          ...current,
          settings: {
            ...current.settings,
            resetBalanceEachMonth: false, // Default to OFF (carry balance)
            lastCheckedMonth: currentMonth
          }
        }))
        return
      }
    }
    
    // Only carry balance forward if resetBalanceEnabled is FALSE
    if (resetBalanceEnabled || !lastCheckedMonth) {
      return
    }
    
    // Check if month has changed
    if (lastCheckedMonth !== currentMonth) {
      hasRunRef.current = true
      
      // Get previous month's ending balance using centralized calculation
      const previousMonthBalance = FinancialCalcs.calculateEndOfMonthBalance(data.payments.transactions, lastCheckedMonth, 'bank')
      
      // Check if balance transaction already exists for current month
      const balanceTransactionExists = data.payments.transactions.some(t => {
        if (!t.date) return false
        const tDate = new Date(t.date)
        if (isNaN(tDate.getTime())) return false
        const tMonth = tDate.toISOString().slice(0, 7)
        return tMonth === currentMonth && (t.note?.startsWith('Balance of ') || t.isBalanceUpdate)
      })
      
      // Only create if it doesn't exist and balance is not zero
      if (!balanceTransactionExists && previousMonthBalance !== 0) {
        const previousMonthName = new Date(lastCheckedMonth + '-01').toLocaleDateString('en-US', { month: 'long' })
        const firstDayOfMonth = currentMonth + '-01'
        
        // Create timestamp at the very start of the day (midnight) so it appears below other transactions on the 1st
        const firstDayDate = new Date(firstDayOfMonth + 'T00:00:00')
        const midnightTimestamp = firstDayDate.getTime()
        
        const balanceTransaction = {
          id: uuidv4(),
          type: 'balance-update',
          amount: Math.abs(previousMonthBalance),
          category: `${previousMonthName}'s Balance`,
          categoryId: 'month-balance',
          date: firstDayOfMonth,
          note: null,
          timestamp: midnightTimestamp,
          isBalanceUpdate: true,
          balanceChange: previousMonthBalance
        }
        
        // Save to Supabase
        DataRepository.addTransaction(balanceTransaction).catch(error => {
          console.error('Error saving month-balance transaction to Supabase:', error)
        })
        
        updateStore(current => ({
          ...current,
          payments: {
            ...current.payments,
            transactions: [...current.payments.transactions, balanceTransaction]
          },
          settings: {
            ...current.settings,
            lastCheckedMonth: currentMonth
          }
        }))
      } else {
        // Just update the lastCheckedMonth
        updateStore(current => ({
          ...current,
          settings: {
            ...current.settings,
            lastCheckedMonth: currentMonth
          }
        }))
      }
      
      // Reset the ref after a short delay
      setTimeout(() => {
        hasRunRef.current = false
      }, 1000)
    }
  }, [data, updateStore])
}

function generateHistoricalBalanceTransactions(data) {
  const transactions = data.payments.transactions || []
  
  if (transactions.length === 0) {
    return []
  }
  
  // Get all unique months from transactions
  const monthsSet = new Set()
  transactions.forEach(t => {
    if (!t.date) return
    const tDate = new Date(t.date)
    if (isNaN(tDate.getTime())) return
    const monthKey = tDate.toISOString().slice(0, 7)
    monthsSet.add(monthKey)
  })
  
  const months = Array.from(monthsSet).sort()
  
  if (months.length <= 1) {
    return []
  }
  
  const balanceTransactions = []
  
  // For each month (starting from the second month), create a balance transaction
  for (let i = 1; i < months.length; i++) {
    const currentMonth = months[i]
    const previousMonth = months[i - 1]
    
    // Check if a balance transaction already exists for this month
    const alreadyExists = transactions.some(t => {
      if (!t.date) return false
      const tDate = new Date(t.date)
      if (isNaN(tDate.getTime())) return false
      const tMonth = tDate.toISOString().slice(0, 7)
      return tMonth === currentMonth && (t.note?.startsWith('Balance of ') || t.isBalanceUpdate)
    })
    
    if (alreadyExists) continue
    
    // Calculate balance at end of previous month using centralized calculation
    const balance = FinancialCalcs.calculateEndOfMonthBalance(data.payments.transactions, previousMonth, 'bank')
    
    if (balance === 0) continue
    
    const previousMonthName = new Date(previousMonth + '-01').toLocaleDateString('en-US', { month: 'long' })
    const firstDayOfMonth = currentMonth + '-01'
    
    // Create timestamp at the very start of the day (midnight)
    const firstDayDate = new Date(firstDayOfMonth + 'T00:00:00')
    const midnightTimestamp = firstDayDate.getTime()
    
    balanceTransactions.push({
      id: uuidv4(),
      type: 'balance-update',
      amount: Math.abs(balance),
      category: `${previousMonthName}'s Balance`,
      categoryId: 'month-balance',
      date: firstDayOfMonth,
      note: null,
      timestamp: midnightTimestamp,
      isBalanceUpdate: true,
      balanceChange: balance
    })
  }
  
  return balanceTransactions
}
