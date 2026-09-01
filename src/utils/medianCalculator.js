export function calculateMedianDailySpend(transactions, year, month, daysElapsed) {
  // Get expense transactions for specified month
  const monthExpenses = transactions.filter(t => {
    const date = new Date(t.date)
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      t.type === 'expense'
    )
  })

  // Build an array of daily expense totals from day 1 to daysElapsed
  // (days with no spend still count as 0 — median needs every day represented)
  const dailyTotals = Array.from({ length: daysElapsed }, (_, i) => {
    const day = i + 1
    return monthExpenses
      .filter(t => new Date(t.date).getDate() === day)
      .reduce((sum, t) => sum + t.amount, 0)
  })

  // Calculate median — resistant to one-off big expenses like rent
  const sorted = [...dailyTotals].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const medianDailySpend =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2

  return medianDailySpend
}

export function calculateHistoricalMedianDailySpend(transactions) {
  // Get ALL expense transactions with valid dates
  const allExpenses = transactions.filter(t => 
    t.type === 'expense' && t.date && t.date !== ''
  )
  
  if (allExpenses.length === 0) return 0
  
  // Group expenses by date
  const expensesByDate = {}
  allExpenses.forEach(t => {
    const date = t.date
    if (!expensesByDate[date]) {
      expensesByDate[date] = 0
    }
    expensesByDate[date] += t.amount
  })
  
  // Get the first and last transaction dates to know the full date range
  const dates = Object.keys(expensesByDate).sort()
  if (dates.length === 0) return 0
  
  const firstDate = new Date(dates[0])
  const lastDate = new Date(dates[dates.length - 1])
  
  // Build array of daily totals for every day in the range (including 0-spend days)
  const dailyTotals = []
  const currentDate = new Date(firstDate)
  
  while (currentDate <= lastDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    dailyTotals.push(expensesByDate[dateStr] || 0)
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Calculate median
  const sorted = [...dailyTotals].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
  
  return median
}

