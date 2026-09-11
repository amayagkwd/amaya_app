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
  
  // Refresh cache every 30 seconds to keep it in sync
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await DataRepository.refreshCache()
        console.log('Cache refreshed in background')
      } catch (error) {
        console.error('Background cache refresh failed:', error)
      }
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [])
  
  const updateStore = useCallback((updater) => {
    setData(current => {
      const updated = typeof updater === 'function' ? updater(current) : updater
      // Save to Supabase (cache will be refreshed by background interval)
      DataRepository.saveData(updated).catch(error => {
        console.error('Error saving to Supabase:', error)
      })
      return updated
    })
  }, [])
  
  return [data, updateStore, loading]
}
