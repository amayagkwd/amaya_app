export function formatDate(dateStr) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function getMonthYear(date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function getGreeting(name) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return `${greeting}, ${name}`
}

export function getTodayDate() {
  return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
