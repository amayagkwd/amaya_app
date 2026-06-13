export const countries = [
  { name: 'India', code: 'IN', currency: '₹', currencyName: 'Rupees' },
  { name: 'United States', code: 'US', currency: '$', currencyName: 'Dollars' },
  { name: 'United Kingdom', code: 'GB', currency: '£', currencyName: 'Pounds' },
  { name: 'European Union', code: 'EU', currency: '€', currencyName: 'Euros' },
  { name: 'Canada', code: 'CA', currency: 'C$', currencyName: 'Canadian Dollars' },
  { name: 'Australia', code: 'AU', currency: 'A$', currencyName: 'Australian Dollars' }
]

export function getCurrencyByCountry(countryName) {
  const country = countries.find(c => c.name === countryName)
  return country ? country.currency : '₹'
}

export function getCurrencyInfo(countryName) {
  const country = countries.find(c => c.name === countryName)
  return country ? { symbol: country.currency, name: country.currencyName } : { symbol: '₹', name: 'Rupees' }
}
