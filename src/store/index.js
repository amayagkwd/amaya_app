import { v4 as uuidv4 } from 'uuid'

const STORAGE_KEY = 'amaya_data'

const initialState = {
  profile: {
    name: '',
    dob: '',
    country: ''
  },
  payments: {
    categories: [],
    transactions: []
  },
  cards: [],
  mapCards: [],
  weatherSettings: {
    showTemperature: true,
    showWeather: true,
    rainCheck: false,
    startTime: '09:00',
    endTime: '18:00'
  },
  counterSettings: {
    dailyReset: false,
    counterType: 'increment',
    incrementValue: 1,
    enableNotes: false,
    title: 'My Counter'
  },
  counterValue: 0,
  counterHistory: [],
  lastCounterResetDate: null,
  hasCompletedCardSetup: false
}

export function loadStore() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const state = { ...initialState }
    saveStore(state)
    return state
  }
  
  const parsed = JSON.parse(stored)
  
  // Merge with initialState to ensure all new fields exist
  return {
    ...initialState,
    ...parsed,
    profile: { ...initialState.profile, ...parsed.profile },
    payments: { ...initialState.payments, ...parsed.payments },
    mapCards: parsed.mapCards || [],
    hasCompletedCardSetup: parsed.hasCompletedCardSetup !== undefined ? parsed.hasCompletedCardSetup : (parsed.cards && parsed.cards.length > 0)
  }
}

export function saveStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function exportData() {
  const data = localStorage.getItem(STORAGE_KEY)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'amaya_backup.json'
  a.click()
  URL.revokeObjectURL(url)
}
