import { useEffect, useRef } from 'react'
import uuidv4 from '../utils/uuid'

export function useMonthlyBalanceCarry(data, updateStore) {
  const hasRunRef = useRef(false)
  
  useEffect(() => {
    // Prevent multiple runs in the same render cycle
    if (hasRunRef.current) return
    
    const settings = data.settings || {}
    const carryBalanceEnabled = settings.carryBalanceToNextMonth || false
    const lastCheckedMonth = settings.lastCheckedMonth
    const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"
    
    // Only proceed if toggle is on and we have a lastCheckedMonth to compare
    if (!carryBalanceEnabled || !lastCheckedMonth) {
      return
    }
    
    // Check if month has changed
    if (lastCheckedMonth !== currentMonth) {
      hasRunRef.current = true
      
      // Get previous month's ending balance
      const previousMonthBalance = calculateEndOfMonthBalance(data, lastCheckedMonth)
      
      // Check if balance transaction already exists for current month
      const balanceTransactionExists = data.payments.transactions.some(t => {
        if (!t.date) return false
        const tDate = new Date(t.date)
        if (isNaN(tDate.getTime())) return false
        const tMonth = tDate.toISOString().slice(0, 7)
        return tMonth === currentMonth && t.note?.startsWith('Balance of ')
      })
      
      // Only create if it doesn't exist and balance is not zero
      if (!balanceTransactionExists && previousMonthBalance !== 0) {
        const previousMonthName = new Date(lastCheckedMonth + '-01').toLocaleDateString('en-US', { month: 'long' })
        const firstDayOfMonth = currentMonth + '-01'
        
        updateStore(current => ({
          ...current,
          payments: {
            ...current.payments,
            transactions: [
              ...current.payments.transactions,
              {
                id: uuidv4(),
                type: previousMonthBalance > 0 ? 'income' : 'expense',
                amount: Math.abs(previousMonthBalance),
                categoryId: null,
                date: firstDayOfMonth,
                note: `Balance of ${previousMonthName}`,
                classification: null
              }
            ]
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

function calculateEndOfMonthBalance(data, monthString) {
  // Calculate cumulative balance up to the end of the specified month
  const [year, month] = monthString.split('-').map(Number)
  const endOfMonth = new Date(year, month, 0, 23, 59, 59) // Last day of the month
  
  let balance = 0
  
  data.payments.transactions.forEach(transaction => {
    if (!transaction.date) return
    const tDate = new Date(transaction.date)
    
    if (isNaN(tDate.getTime())) return
    
    // Include all transactions up to and including the last day of the specified month
    if (tDate <= endOfMonth) {
      if (transaction.type === 'income') {
        balance += transaction.amount
      } else {
        balance -= transaction.amount
      }
    }
  })
  
  return balance
}
