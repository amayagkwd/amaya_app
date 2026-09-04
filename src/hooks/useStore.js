import { useState, useCallback, useEffect } from 'react'
import { loadStore, saveStore } from '../store'
import * as DataRepository from '../repositories/dataRepository'

export function useStore() {
  const [data, setData] = useState(loadStore)
  const [loading, setLoading] = useState(true)
  
  // Load data on mount (from Supabase if authenticated, otherwise localStorage)
  useEffect(() => {
    async function loadData() {
      try {
        const loadedData = await DataRepository.loadData()
        setData(loadedData)
      } catch (error) {
        console.error('Error loading data:', error)
        // Fallback to localStorage
        setData(loadStore())
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  const updateStore = useCallback((updater) => {
    setData(current => {
      const updated = typeof updater === 'function' ? updater(current) : updater
      // Save to both Supabase (if authenticated) and localStorage (backup)
      DataRepository.saveData(updated).catch(error => {
        console.error('Error saving to Supabase:', error)
        // Fallback to localStorage only
        saveStore(updated)
      })
      return updated
    })
  }, [])
  
  return [data, updateStore, loading]
}
