export function calculateForecast(transactions, currentBalance) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const currentDay = now.getDate()

  const totalDaysInMonth = new Date(year, month + 1, 0).getDate()
  const daysElapsed = currentDay

  // Don't show forecast if less than 10 days have passed
  if (daysElapsed < 10) {
    return null
  }

  // Get expense transactions for current month
  const monthExpenses = transactions.filter(t => {
    const date = new Date(t.date)
    return (
      date.getFullYear() === year &&
      date.getMonth() === month &&
      t.type === 'expense'
    )
  })

  // Build an array of daily expense totals, one entry per day so far
  // (days with no spend still count as 0 — median needs every day represented)
  const dailyTotals = Array.from({ length: daysElapsed }, (_, i) => {
    const day = i + 1
    return monthExpenses
      .filter(t => new Date(t.date).getDate() === day)
      .reduce((sum, t) => sum + t.amount, 0)
  })

  // Median, not mean — resistant to one-off big expenses like rent
  const sorted = [...dailyTotals].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const medianDailySpend =
    sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2

  const totalExpensesSoFar = dailyTotals.reduce((sum, v) => sum + v, 0)
  const daysRemaining = totalDaysInMonth - daysElapsed
  const projectedRemainingSpend = medianDailySpend * daysRemaining
  const projectedMonthEndBalance = currentBalance - projectedRemainingSpend

  return {
    dailySpendForecast: medianDailySpend,
    monthEndProjection: projectedMonthEndBalance
  }
}