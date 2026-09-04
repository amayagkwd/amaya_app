/**
 * Store Module
 * 
 * Thin wrapper around the data repository layer.
 * Maintains backward compatibility with existing code while delegating
 * all data access to the repository layer.
 * 
 * This layer will remain unchanged during Supabase migration.
 */

import * as DataRepository from '../repositories/dataRepository'

/**
 * Load store data (synchronous for backward compatibility)
 * @returns {Object} User data
 */
export function loadStore() {
  // Note: This is currently synchronous for backward compatibility
  // During Supabase migration, we'll need to update useStore to handle async loading
  const stored = localStorage.getItem('amaya_data')
  if (!stored) {
    const state = DataRepository.loadData()
    return state
  }
  return JSON.parse(stored)
}

/**
 * Save store data (synchronous for backward compatibility)
 * @param {Object} data - Complete user data
 */
export function saveStore(data) {
  DataRepository.saveData(data)
}

/**
 * Export data to JSON file
 */
export function exportData() {
  DataRepository.exportData()
}

/**
 * Import data from JSON file
 * @param {File} file - JSON file
 * @param {Function} callback - Callback(success, data)
 */
export function importData(file, callback) {
  DataRepository.importData(file, callback)
}
