/**
 * Data Repository Layer
 * 
 * This is the single source of truth for ALL data access operations.
 * Uses Supabase for authenticated users with localStorage fallback.
 * 
 * Design principles:
 * - Abstract storage implementation from business logic
 * - Provide consistent async interface
 * - All CRUD operations go through this layer
 * - Never import Supabase or storage directly in components/hooks
 */

import { supabase } from '../config/supabase'

const STORAGE_KEY = 'amaya_data'

const initialState = {
  profile: {
    name: '',
    dob: '',
    country: ''
  },
  payments: {
    categories: [],
    transactions: [],
    previousCategories: [],
    cashBalance: 0,
    creditCardBalance: 0
  },
  settings: {
    carryBalanceToNextMonth: false,
    lastCheckedMonth: null,
    budget: {
      enabled: false,
      mode: 'spend',
      amount: 0
    },
    initialBalanceSkipped: false,
    addTransactionTipSeen: false,
    isCashEnabled: false,
    isCreditEnabled: false
  }
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>} User object or null
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const user = await getCurrentUser()
  return !!user
}

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Load all user data (Supabase or localStorage)
 * @returns {Promise<Object>} Complete user data
 */
export async function loadData() {
  const user = await getCurrentUser()
  
  if (user) {
    // Load from Supabase and update cache
    return await loadFromSupabase(user.id)
  } else {
    // Fallback to localStorage
    return loadFromLocalStorage()
  }
}

/**
 * Refresh localStorage cache with current Supabase data
 * Call this periodically or after important operations
 * @returns {Promise<void>}
 */
export async function refreshCache() {
  const user = await getCurrentUser()
  if (!user) return
  
  try {
    const freshData = await loadFromSupabase(user.id)
    // loadFromSupabase already updates cache, but we return the data
    // in case caller wants to use it
    return freshData
  } catch (error) {
    console.error('Failed to refresh cache:', error)
  }
}

/**
 * Load data from Supabase
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User data
 */
async function loadFromSupabase(userId) {
  try {
    // Load all data in parallel
    const [profile, categories, transactions, settings] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('categories').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('settings').select('*').eq('user_id', userId).single()
    ])

    // Transform Supabase data to app format
    const data = {
      profile: profile.data ? {
        name: profile.data.name,
        dob: profile.data.dob,
        country: profile.data.country
      } : initialState.profile,
      
      payments: {
        // Load ALL categories (including deleted ones)
        categories: categories.data ? categories.data.map(transformCategory) : [],
        transactions: transactions.data ? transactions.data.map(transformTransaction) : [],
        previousCategories: [], // Deprecated - now using isDeleted flag
        // Cash/credit balances are calculated from transactions, not stored separately
        cashBalance: 0,
        creditCardBalance: 0
      },
      
      settings: settings.data ? transformSettings(settings.data) : initialState.settings
    }

    // Update localStorage cache with fresh data for faster next load
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log('✅ Cache updated with fresh data from Supabase')
    } catch (cacheError) {
      console.warn('⚠️ Failed to update cache:', cacheError)
      // Continue anyway - cache is optional
    }

    return data
  } catch (error) {
    console.error('Error loading from Supabase:', error)
    // Fallback to localStorage cache on error
    console.log('⚠️ Using cached data due to network error')
    return loadFromLocalStorage()
  }
}

/**
 * Load data from localStorage
 * @returns {Object} User data
 */
function loadFromLocalStorage() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    return { ...initialState }
  }
  
  const parsed = JSON.parse(stored)
  
  return {
    ...initialState,
    ...parsed,
    profile: { ...initialState.profile, ...parsed.profile },
    payments: { ...initialState.payments, ...parsed.payments },
    settings: { ...initialState.settings, ...parsed.settings }
  }
}

// ============================================================================
// DATA SAVING
// ============================================================================

/**
 * Save complete user data
 * @param {Object} data - Complete user data object
 * @returns {Promise<void>}
 */
export async function saveData(data) {
  const user = await getCurrentUser()
  
  if (user) {
    // Save to Supabase only
    // DO NOT update localStorage here - it can corrupt the cache
    // Cache is only updated during loadFromSupabase()
    await saveToSupabase(user.id, data)
  } else {
    // For unauthenticated users, use localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
}

/**
 * Save data to Supabase
 * @param {string} userId - User ID
 * @param {Object} data - User data
 * @returns {Promise<void>}
 */
async function saveToSupabase(userId, data) {
  try {
    // This is a full save - used by existing store pattern
    // For better performance, use specific update functions below
    
    // Save profile
    await supabase.from('profiles').upsert({
      id: userId,
      name: data.profile.name,
      dob: data.profile.dob,
      country: data.profile.country
    })

    // Save settings
    await supabase.from('settings').upsert({
      user_id: userId,
      carry_balance_to_next_month: data.settings.carryBalanceToNextMonth,
      last_checked_month: data.settings.lastCheckedMonth,
      budget_enabled: data.settings.budget?.enabled || false,
      budget_mode: data.settings.budget?.mode || null,
      budget_amount: data.settings.budget?.amount || 0,
      initial_balance_skipped: data.settings.initialBalanceSkipped,
      add_transaction_tip_seen: data.settings.addTransactionTipSeen,
      is_cash_enabled: data.settings.isCashEnabled,
      is_credit_enabled: data.settings.isCreditEnabled,
      tutorial_completed: data.settings.tutorialCompleted || false,
      balance_timestamps_fixed: data.settings.balanceTimestampsFixed || false,
      reset_balance_each_month: data.settings.resetBalanceEachMonth || false,
      predict_month_end: data.settings.predictMonthEnd !== undefined ? data.settings.predictMonthEnd : true,
      has_seen_forecast: data.settings.hasSeenForecast || false,
      month_balance_double_count_fixed: data.settings.monthBalanceDoubleCountFix || false
    })

    console.log('Data saved to Supabase')
  } catch (error) {
    console.error('Error saving to Supabase:', error)
    throw error
  }
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

/**
 * Add a transaction
 * @param {Object} transaction - Transaction object
 * @returns {Promise<Object>} Created transaction
 */
export async function addTransaction(transaction) {
  const user = await getCurrentUser()
  
  if (user) {
    const { data, error } = await supabase.from('transactions').insert([{
      user_id: user.id,
      id: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      category_id: transaction.categoryId,
      category: transaction.category,
      date: transaction.date,
      note: transaction.note,
      classification: transaction.classification,
      payment_mode: transaction.paymentMode || 'bank',
      is_balance_update: transaction.isBalanceUpdate || false,
      balance_change: transaction.balanceChange || null,
      timestamp: transaction.timestamp
    }]).select().single()
    
    if (error) throw error
    return transformTransaction(data)
  }
  
  return transaction
}

/**
 * Update a transaction
 * @param {string} id - Transaction ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated transaction
 */
export async function updateTransaction(id, updates) {
  const user = await getCurrentUser()
  
  if (user) {
    const { data, error } = await supabase.from('transactions')
      .update({
        amount: updates.amount,
        category_id: updates.categoryId,
        category: updates.category,
        date: updates.date,
        note: updates.note,
        classification: updates.classification,
        payment_mode: updates.paymentMode
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return transformTransaction(data)
  }
  
  return updates
}

/**
 * Delete a transaction
 * @param {string} id - Transaction ID
 * @returns {Promise<void>}
 */
export async function deleteTransaction(id) {
  const user = await getCurrentUser()
  
  if (user) {
    const { error } = await supabase.from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }
}

// ============================================================================
// CATEGORY OPERATIONS
// ============================================================================

/**
 * Add a category
 * @param {Object} category - Category object
 * @returns {Promise<Object>} Created category
 */
export async function addCategory(category) {
  const user = await getCurrentUser()
  
  if (user) {
    const { data, error } = await supabase.from('categories').insert([{
      user_id: user.id,
      id: category.id,
      name: category.name,
      type: category.type,
      classification: category.classification,
      is_default: category.isDefault || false
    }]).select().single()
    
    if (error) throw error
    return transformCategory(data)
  }
  
  return category
}

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated category
 */
export async function updateCategory(id, updates) {
  const user = await getCurrentUser()
  
  if (user) {
    const { data, error } = await supabase.from('categories')
      .update({
        name: updates.name,
        type: updates.type,
        classification: updates.classification
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) throw error
    return transformCategory(data)
  }
  
  return updates
}

/**
 * Delete a category (actual deletion, not soft delete)
 * @param {string} id - Category ID
 * @returns {Promise<void>}
 */
export async function deleteCategory(id) {
  const user = await getCurrentUser()
  
  if (user) {
    const { error } = await supabase.from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    
    if (error) throw error
  }
}

/**
 * Update category name for all transactions with a specific categoryId
 * @param {string} categoryId - Category ID
 * @param {string} categoryName - Category name to set
 * @returns {Promise<number>} Number of transactions updated
 */
export async function updateTransactionsCategoryName(categoryId, categoryName) {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }
  
  // Update all transactions with this categoryId in one query
  const { data, error } = await supabase
    .from('transactions')
    .update({ category: categoryName })
    .eq('user_id', user.id)
    .eq('category_id', categoryId)
    .select()
  
  if (error) throw error
  
  return data?.length || 0
}

// ============================================================================
// TRANSFORMATION HELPERS
// ============================================================================

/**
 * Transform Supabase category to app format
 */
function transformCategory(dbCategory) {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    type: dbCategory.type,
    classification: dbCategory.classification,
    isDefault: dbCategory.is_default
  }
}

/**
 * Transform Supabase transaction to app format
 */
function transformTransaction(dbTransaction) {
  return {
    id: dbTransaction.id,
    type: dbTransaction.type,
    amount: parseFloat(dbTransaction.amount),
    categoryId: dbTransaction.category_id,
    category: dbTransaction.category,
    date: dbTransaction.date,
    note: dbTransaction.note,
    classification: dbTransaction.classification,
    paymentMode: dbTransaction.payment_mode,
    isBalanceUpdate: dbTransaction.is_balance_update,
    balanceChange: dbTransaction.balance_change ? parseFloat(dbTransaction.balance_change) : null,
    timestamp: dbTransaction.timestamp
  }
}

/**
 * Transform Supabase settings to app format
 */
function transformSettings(dbSettings) {
  return {
    carryBalanceToNextMonth: dbSettings.carry_balance_to_next_month,
    lastCheckedMonth: dbSettings.last_checked_month,
    budget: {
      enabled: dbSettings.budget_enabled,
      mode: dbSettings.budget_mode,
      amount: parseFloat(dbSettings.budget_amount)
    },
    initialBalanceSkipped: dbSettings.initial_balance_skipped,
    addTransactionTipSeen: dbSettings.add_transaction_tip_seen,
    isCashEnabled: dbSettings.is_cash_enabled,
    isCreditEnabled: dbSettings.is_credit_enabled,
    tutorialCompleted: dbSettings.tutorial_completed,
    balanceTimestampsFixed: dbSettings.balance_timestamps_fixed,
    resetBalanceEachMonth: dbSettings.reset_balance_each_month,
    predictMonthEnd: dbSettings.predict_month_end,
    hasSeenForecast: dbSettings.has_seen_forecast,
    monthBalanceDoubleCountFix: dbSettings.month_balance_double_count_fixed
  }
}

// ============================================================================
// LEGACY OPERATIONS (for backward compatibility)
// ============================================================================

/**
 * Export data to JSON file
 * @returns {void}
 */
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

/**
 * Import data from JSON file
 * @param {File} file - JSON file containing backup data
 * @param {Function} callback - Callback(success, data)
 * @returns {void}
 */
export function importData(file, callback) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importedData))
      callback(true, importedData)
    } catch {
      callback(false, null)
    }
  }
  reader.readAsText(file)
}


// ============================================================================
// MIGRATION OPERATIONS (kept for backward compatibility, will be expanded later)
// ============================================================================
/**
 * Migrate localStorage data to Supabase
 * @returns {Promise<Object>} Migration result
 */
export async function migrateLocalStorageToSupabase() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('User must be authenticated to migrate data')
  }

  // Check if already migrated
  const alreadyMigrated = await hasMigrated()
  if (alreadyMigrated) {
    return { success: false, message: 'Data already migrated', alreadyMigrated: true }
  }

  const localData = loadFromLocalStorage()
  
  if (!localData.payments?.transactions?.length && !localData.payments?.categories?.length) {
    return { success: false, message: 'No data to migrate' }
  }

  try {
    // Track what was actually migrated
    let migratedCategoriesCount = 0
    let migratedTransactionsCount = 0
    
    // 1. Migrate profile
    await supabase.from('profiles').upsert({
      id: user.id,
      name: localData.profile.name || 'User',
      dob: localData.profile.dob || '2000-01-01',
      country: localData.profile.country || 'India'
    })

    // 2. Migrate categories (preserving IDs)
    if (localData.payments.categories.length > 0) {
      // Filter out system categories - they should never be in the categories table
      const SYSTEM_CATEGORY_IDS = ['initial-balance', 'month-balance', 'cash-balance', 'balance-update', 'cash-balance-update']
      
      console.log('ðŸ“‹ Total categories in localStorage:', localData.payments.categories.length)
      console.log('ðŸ“‹ Categories before filtering:', localData.payments.categories.map(c => ({ id: c.id, name: c.name })))
      
      const categories = localData.payments.categories
        .filter(cat => !SYSTEM_CATEGORY_IDS.includes(cat.id))
        .map(cat => ({
          id: cat.id,
          user_id: user.id,
          name: cat.name,
          type: cat.type,
          classification: cat.classification,
          is_default: cat.isDefault || false
        }))
      
      console.log(`ðŸ“‹ After filtering: ${categories.length} categories to migrate`)
      console.log('ðŸ“‹ Migrating categories:', categories)
      
      // Only attempt upsert if we have categories to migrate
      if (categories.length > 0) {
        const { data: insertedCategories, error: categoriesError } = await supabase
          .from('categories')
          .upsert(categories)
          .select()
        
        if (categoriesError) {
          console.error('âŒ Category migration failed:', categoriesError)
          throw categoriesError
        }
        
        migratedCategoriesCount = insertedCategories?.length || 0
        console.log(`âœ… ${migratedCategoriesCount} categories migrated successfully`)
      } else {
        console.log('âš ï¸ No user categories to migrate (only system categories found)')
      }
      
      // Verify that all categories have names
      const { data: verifyCategories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('user_id', user.id)
        .is('name', null)
      
      if (verifyCategories && verifyCategories.length > 0) {
        console.warn('âš ï¸ Found categories with NULL names after migration, fixing...')
        // Build category map from original data (skip system categories)
        const categoryMap = {}
        localData.payments.categories.forEach(cat => {
          // Skip system category IDs (they're not UUIDs)
          if (cat.id && cat.name && 
              cat.id !== 'initial-balance' && 
              cat.id !== 'month-balance' && 
              cat.id !== 'cash-balance' &&
              cat.id !== 'balance-update' &&
              cat.id !== 'cash-balance-update') {
            categoryMap[cat.id] = cat.name
          }
        })
        
        // Fix NULL categories
        for (const cat of verifyCategories) {
          const correctName = categoryMap[cat.id]
          if (correctName) {
            await supabase
              .from('categories')
              .update({ name: correctName })
              .eq('id', cat.id)
              .eq('user_id', user.id)
          }
        }
        console.log('âœ… Fixed NULL category names')
      }
    }

    // 3. Migrate transactions (preserving IDs and timestamps)
    if (localData.payments.transactions.length > 0) {
      // Build category map for lookup
      const categoryMap = {}
      localData.payments.categories.forEach(cat => {
        categoryMap[cat.id] = cat.name
      })
      
      const transactions = localData.payments.transactions.map(txn => {
        // Get category name from categoryId
        const categoryName = txn.category || categoryMap[txn.categoryId] || null
        
        return {
          id: txn.id,
          user_id: user.id,
          type: txn.type,
          amount: txn.amount,
          category_id: txn.categoryId,
          category: categoryName,
          date: txn.date || new Date().toISOString().split('T')[0],
          note: txn.note,
          classification: txn.classification,
          payment_mode: txn.paymentMode || 'bank',
          is_balance_update: txn.isBalanceUpdate || false,
          balance_change: txn.balanceChange || null,
          timestamp: txn.timestamp || Date.now()
        }
      })
      
      // Insert in batches of 100 to avoid payload limits
      for (let i = 0; i < transactions.length; i += 100) {
        const batch = transactions.slice(i, i + 100)
        const { error: txnError } = await supabase.from('transactions').upsert(batch)
        
        if (txnError) {
          console.error(`âŒ Transaction migration failed for batch ${i}-${i+100}:`, txnError)
          throw txnError
        }
        migratedTransactionsCount += batch.length
        console.log(`âœ… Migrated transactions ${i}-${Math.min(i+100, transactions.length)}`)
      }
      
      // Verify and fix transaction category names
      console.log('ðŸ” Verifying transaction category names...')
      const { data: nullTxns } = await supabase
        .from('transactions')
        .select('id, category_id')
        .eq('user_id', user.id)
        .is('category', null)
        .not('category_id', 'is', null)
      
      if (nullTxns && nullTxns.length > 0) {
        console.warn(`âš ï¸ Found ${nullTxns.length} transactions with NULL category names, fixing...`)
        
        // Get all categories to build map
        const { data: allCategories } = await supabase
          .from('categories')
          .select('id, name')
          .eq('user_id', user.id)
        
        const catMap = {}
        allCategories.forEach(cat => {
          catMap[cat.id] = cat.name
        })
        
        // Fix each transaction
        for (const txn of nullTxns) {
          const categoryName = catMap[txn.category_id]
          if (categoryName) {
            await supabase
              .from('transactions')
              .update({ category: categoryName })
              .eq('id', txn.id)
              .eq('user_id', user.id)
          }
        }
        console.log('âœ… Fixed transaction category names')
      }
    }

    // 4. Migrate settings
    await supabase.from('settings').upsert({
      user_id: user.id,
      carry_balance_to_next_month: localData.settings.carryBalanceToNextMonth || false,
      last_checked_month: localData.settings.lastCheckedMonth,
      budget_enabled: localData.settings.budget?.enabled || false,
      budget_mode: localData.settings.budget?.mode || null,
      budget_amount: localData.settings.budget?.amount || 0,
      initial_balance_skipped: localData.settings.initialBalanceSkipped || false,
      add_transaction_tip_seen: localData.settings.addTransactionTipSeen || false,
      is_cash_enabled: localData.settings.isCashEnabled || false,
      is_credit_enabled: localData.settings.isCreditEnabled || false,
      tutorial_completed: localData.settings.tutorialCompleted || false,
      balance_timestamps_fixed: localData.settings.balanceTimestampsFixed || false,
      reset_balance_each_month: localData.settings.resetBalanceEachMonth || false,
      predict_month_end: localData.settings.predictMonthEnd !== undefined ? localData.settings.predictMonthEnd : true,
      has_seen_forecast: localData.settings.hasSeenForecast || false,
      month_balance_double_count_fixed: localData.settings.monthBalanceDoubleCountFix || false
    })

    // 5. Mark migration as complete
    await supabase.from('migration_status').upsert({
      user_id: user.id,
      migrated: true,
      migration_date: new Date().toISOString(),
      transactions_count: migratedTransactionsCount,
      categories_count: migratedCategoriesCount,
      source: 'localStorage'
    })

    console.log('ðŸŽ‰ Migration complete!')
    console.log(`ðŸ“Š Summary: ${migratedCategoriesCount} categories, ${migratedTransactionsCount} transactions`)

    return {
      success: true,
      message: 'Migration completed successfully',
      categoriesCount: migratedCategoriesCount,
      transactionsCount: migratedTransactionsCount,
      originalCategoriesCount: localData.payments.categories.length,
      originalTransactionsCount: localData.payments.transactions.length
    }
  } catch (error) {
    console.error('Migration error:', error)
    return {
      success: false,
      message: `Migration failed: ${error.message}`,
      error
    }
  }
}


// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

/**
 * Update user profile
 * @param {Object} profile - Profile data
 * @returns {Promise<Object>}
 */
export async function updateProfile(profile) {
  const user = await getCurrentUser()
  
  if (user) {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        name: profile.name,
        dob: profile.dob,
        country: profile.country
      })
    
    if (error) throw error
  }
  
  return profile
}

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

/**
 * Update user settings
 * @param {Object} settings - Settings object
 * @returns {Promise<Object>}
 */
export async function updateSettings(settings) {
  const user = await getCurrentUser()
  
  if (user) {
    const { error } = await supabase
      .from('settings')
      .upsert({
        user_id: user.id,
        carry_balance_to_next_month: settings.carryBalanceToNextMonth,
        last_checked_month: settings.lastCheckedMonth,
        reset_balance_each_month: settings.resetBalanceEachMonth || false,
        budget_enabled: settings.budget?.enabled || false,
        budget_mode: settings.budget?.mode || null,
        budget_amount: settings.budget?.amount || 0,
        initial_balance_skipped: settings.initialBalanceSkipped,
        add_transaction_tip_seen: settings.addTransactionTipSeen,
        is_cash_enabled: settings.isCashEnabled,
        is_credit_enabled: settings.isCreditEnabled,
        tutorial_completed: settings.tutorialCompleted || false,
        balance_timestamps_fixed: settings.balanceTimestampsFixed || false,
        predict_month_end: settings.predictMonthEnd !== undefined ? settings.predictMonthEnd : true,
        has_seen_forecast: settings.hasSeenForecast || false,
        month_balance_double_count_fixed: settings.monthBalanceDoubleCountFix || false,
        payment_mode_migration_done: settings.paymentModeMigrationDone || false
      })
    
    if (error) throw error
  }
  
  return settings
}

// ============================================================================
// MIGRATION CHECKING (Implementation in separate step)
// ============================================================================

/**
 * Check if user has localStorage data to migrate
 * @returns {boolean}
 */
export function hasLocalStorageData() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return false
  
  try {
    const data = JSON.parse(stored)
    return data.payments?.transactions?.length > 0 || data.payments?.categories?.length > 0
  } catch {
    return false
  }
}

/**
 * Check if user has already migrated
 * @returns {Promise<boolean>}
 */
export async function hasMigrated() {
  const user = await getCurrentUser()
  if (!user) return false
  
  try {
    const { data } = await supabase
      .from('migration_status')
      .select('migrated')
      .eq('user_id', user.id)
      .maybeSingle()
    
    return data?.migrated || false
  } catch {
    return false
  }
}

