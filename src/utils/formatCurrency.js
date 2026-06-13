import { getCurrencyByCountry } from './countries'

export function formatCurrency(amount, country) {
  const currency = country ? getCurrencyByCountry(country) : '₹'
  return `${currency}${Math.abs(amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}
