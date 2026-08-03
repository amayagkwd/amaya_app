// Format large numbers in Indian numbering system
// 1,00,000 -> 1L
// 1,23,400 -> 1.23L
// 1,00,00,000 -> 1Cr
// 1,23,45,678 -> 1.23Cr

export function formatLargeNumber(amount, country) {
  const absAmount = Math.abs(amount)
  const isNegative = amount < 0
  
  // Get currency symbol based on country
  const getCurrencySymbol = () => {
    switch (country) {
      case 'India': return '₹'
      case 'United States': return '$'
      case 'United Kingdom': return '£'
      case 'European Union': return '€'
      case 'Japan': return '¥'
      case 'Australia': return 'A$'
      case 'Canada': return 'C$'
      default: return '₹'
    }
  }

  const symbol = getCurrencySymbol()
  const sign = isNegative ? '-' : ''

  // If amount is less than 1 lakh, return normal format
  if (absAmount < 100000) {
    return `${sign}${symbol}${absAmount.toLocaleString('en-IN')}`
  }
  
  // If amount is in lakhs (less than 1 crore)
  if (absAmount < 10000000) {
    const lakhs = absAmount / 100000
    return `${sign}${symbol}${lakhs.toFixed(2)}L`
  }
  
  // If amount is in crores
  const crores = absAmount / 10000000
  return `${sign}${symbol}${crores.toFixed(2)}Cr`
}
