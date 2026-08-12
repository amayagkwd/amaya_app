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
