import { useState, useCallback } from 'react'
import { loadStore, saveStore } from '../store'

export function useStore() {
  const [data, setData] = useState(loadStore)
  
  const updateStore = useCallback((updater) => {
    setData(current => {
      const updated = typeof updater === 'function' ? updater(current) : updater
      saveStore(updated)
      return updated
    })
  }, [])
  
  return [data, updateStore]
}
