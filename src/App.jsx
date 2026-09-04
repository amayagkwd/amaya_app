import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useStore } from './hooks/useStore'
import { usePayments } from './hooks/usePayments'
import { useMonthlyBalanceCarry } from './hooks/useMonthlyBalanceCarry'
import AuthScreen from './features/auth/AuthScreen'
import TopBar from './features/common/TopBar'
import BottomNav from './features/common/BottomNav'
import BottomSheet from './features/common/BottomSheet'
import Toast from './features/common/Toast'
import NavigationHandler from './features/common/NavigationHandler'
import OnboardingModal from './features/onboarding/OnboardingModal'
import InitialBalanceModal from './features/onboarding/InitialBalanceModal'
import AddTransactionTip from './features/onboarding/AddTransactionTip'
import MigrationModal from './features/onboarding/MigrationModal'
import InstallBanner from './features/standalone/InstallBanner'
import Dashboard from './features/dashboard/Dashboard'
import Payments from './features/payments/Payments'
import Insights from './features/insights/Insights'
import SettleUp from './features/settleup/SettleUp'
import Profile from './features/settings/Profile'
import Settings from './features/settings/Settings'
import Setup from './features/settings/Setup'
import BudgetSetup from './features/settings/BudgetSetup'
import Reminders from './features/settings/Reminders'
import theme from './theme'
import uuidv4 from './utils/uuid'
import * as DataRepository from './repositories/dataRepository'

function AppContent() {
  const { user, loading: authLoading } = useAuth()
  const [data, updateStore, dataLoading] = useStore()
  const { addTransaction, deleteTransaction } = usePayments(data, updateStore)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const [bottomSheetMode, setBottomSheetMode] = useState('transaction')
  const [bottomSheetInitialType, setBottomSheetInitialType] = useState(null)
  const [bottomSheetInitialPaymentMode, setBottomSheetInitialPaymentMode] = useState(null)
  const [showInitialBalance, setShowInitialBalance] = useState(false)
  const [showAddTransactionTip, setShowAddTransactionTip] = useState(false)
  const [showMigration, setShowMigration] = useState(false)
  const [needsMigrationCheck, setNeedsMigrationCheck] = useState(true)
  
  // Handle monthly balance carry-over (only when data is loaded)
  useMonthlyBalanceCarry(data, updateStore)
  
  // Show loading screen while auth or data is loading
  if (authLoading || dataLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.colors.bgPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: theme.colors.textSecondary }}>Loading...</div>
      </div>
    )
  }
  
  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen />
  }
  
  // Wait for data to be loaded before checking profile
  if (!data || !data.profile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: theme.colors.bgPrimary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: theme.colors.textSecondary }}>Loading data...</div>
      </div>
    )
  }
  
  const needsOnboarding = !data.profile.name || !data.profile.dob || !data.profile.country
  const hasExistingData = data.payments.transactions.length > 0 || data.payments.categories.length > 0
  const hasInitialBalance = data.payments.transactions.some(t => t.categoryId === 'initial-balance')
  
  // Check if user has localStorage data to migrate
  const hasLocalStorageData = needsMigrationCheck && DataRepository.hasLocalStorageData()
  
  // Skip onboarding entirely - profile is created during signup/login
  // Only show initial balance prompt for brand new users (no existing data)
  const needsInitialBalancePrompt = !hasExistingData && !hasInitialBalance && !data.settings.initialBalanceSkipped
  
  // Show tip after initial balance is handled and user hasn't seen it yet
  const needsAddTransactionTip = !needsInitialBalancePrompt && !data.settings.addTransactionTipSeen && !hasExistingData
  
  const handleMigration = async () => {
    try {
      console.log('Starting migration...')
      const result = await DataRepository.migrateLocalStorageToSupabase()
      console.log('Migration result:', result)
      
      if (result.success) {
        console.log('Migration successful, reloading data...')
        // Reload data after migration
        const migratedData = await DataRepository.loadData()
        console.log('Migrated data loaded:', migratedData)
        updateStore(migratedData)
        setShowMigration(false)
        setNeedsMigrationCheck(false)
      } else {
        console.error('Migration failed:', result.message)
        alert('Migration failed: ' + result.message)
        setShowMigration(false)
        setNeedsMigrationCheck(false)
      }
    } catch (error) {
      console.error('Migration error:', error)
      alert('Migration failed: ' + error.message)
      setShowMigration(false)
      setNeedsMigrationCheck(false)
    }
  }
  
  const handleSkipMigration = () => {
    // Mark that we've checked for migration (don't ask again)
    setShowMigration(false)
    setNeedsMigrationCheck(false)
    // Update settings to mark initial balance as skipped so we don't ask again
    updateStore(current => ({
      ...current,
      settings: {
        ...current.settings,
        initialBalanceSkipped: true
      }
    }))
    // Note: Not actually deleting localStorage data, just skipping migration
  }
  
  const handleOnboardingComplete = (profileData) => {
    updateStore(current => ({
      ...current,
      profile: profileData
    }))
    // Only show initial balance modal for brand new users after onboarding
    if (!hasExistingData) {
      setShowInitialBalance(true)
    }
  }
  
  const handleInitialBalanceComplete = (amount) => {
    // Create special "Initial Balance" category if it doesn't exist
    const initialBalanceCategory = {
      id: 'initial-balance',
      name: 'Initial Balance',
      type: 'balance',
      classification: null,
      isDefault: true
    }
    
    // Add the initial balance transaction as a balance adjustment
    const initialTransaction = {
      id: uuidv4(),
      type: 'balance-update',
      amount: amount,
      categoryId: 'initial-balance',
      category: 'Initial Balance',
      date: new Date().toISOString().split('T')[0],
      note: null,
      classification: null,
      timestamp: Date.now(),
      isBalanceUpdate: true,
      balanceChange: amount
    }
    
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        categories: [...current.payments.categories, initialBalanceCategory],
        transactions: [...current.payments.transactions, initialTransaction]
      }
    }))
    
    setShowInitialBalance(false)
    setShowAddTransactionTip(true)
  }
  
  const handleInitialBalanceSkip = () => {
    updateStore(current => ({
      ...current,
      settings: {
        ...current.settings,
        initialBalanceSkipped: true
      }
    }))
    setShowInitialBalance(false)
    setShowAddTransactionTip(true)
  }
  
  const handleDismissAddTransactionTip = () => {
    updateStore(current => ({
      ...current,
      settings: {
        ...current.settings,
        addTransactionTipSeen: true
      }
    }))
    setShowAddTransactionTip(false)
  }
  
  const handleOpenBottomSheet = (mode = 'transaction', initialType = null, initialPaymentMode = null) => {
    setBottomSheetMode(mode)
    setBottomSheetInitialType(initialType)
    setBottomSheetInitialPaymentMode(initialPaymentMode)
    setBottomSheetOpen(true)
  }
  
  const handleSaveReminder = (reminderData) => {
    // Reminder functionality coming soon
  }
  
  // Onboarding is no longer needed - profile created during signup
  // if (needsOnboarding) {
  //   return <OnboardingModal onComplete={handleOnboardingComplete} />
  // }
  
  // Check for localStorage data migration
  if (hasLocalStorageData && !showMigration && needsMigrationCheck) {
    setShowMigration(true)
  }
  
  if (showMigration) {
    return (
      <MigrationModal
        onMigrate={handleMigration}
        onSkip={handleSkipMigration}
      />
    )
  }
  
  if (showInitialBalance || needsInitialBalancePrompt) {
    return (
      <InitialBalanceModal 
        onComplete={handleInitialBalanceComplete}
        onSkip={handleInitialBalanceSkip}
        country={data.profile.country}
      />
    )
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: theme.colors.bgPrimary,
      fontFamily: theme.typography.fontFamily
    }}>
      <NavigationHandler />
      <TopBar />
      
      <main style={{
        maxWidth: theme.layout.maxWidth,
        margin: '0 auto',
        paddingTop: theme.layout.topBarHeight,
        paddingBottom: theme.layout.bottomNavHeight,
        minHeight: `calc(100vh - ${theme.layout.topBarHeight})`
      }}>
        <Routes>
          <Route path="/" element={<Dashboard data={data} onOpenBottomSheet={handleOpenBottomSheet} updateStore={updateStore} />} />
          <Route path="/payments" element={<Payments data={data} updateStore={updateStore} onDelete={deleteTransaction} onOpenBottomSheet={() => handleOpenBottomSheet('transaction')} />} />
          <Route path="/insights" element={<Insights data={data} updateStore={updateStore} onOpenBottomSheet={() => handleOpenBottomSheet('transaction')} />} />
          <Route path="/settleup" element={<SettleUp data={data} updateStore={updateStore} onOpenBottomSheet={() => handleOpenBottomSheet('settleup')} />} />
          <Route path="/profile" element={<Profile data={data} updateStore={updateStore} />} />
          <Route path="/settings" element={<Settings data={data} updateStore={updateStore} />} />
          <Route path="/setup" element={<Setup data={data} updateStore={updateStore} />} />
          <Route path="/budget-setup" element={<BudgetSetup data={data} updateStore={updateStore} />} />
          <Route path="/reminders" element={<Reminders data={data} updateStore={updateStore} onOpenBottomSheet={() => handleOpenBottomSheet('reminder')} />} />
        </Routes>
      </main>
      
      <BottomNav />
      
      <BottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        categories={data.payments.categories}
        onSave={bottomSheetMode === 'reminder' ? handleSaveReminder : addTransaction}
        data={data}
        updateStore={updateStore}
        mode={bottomSheetMode}
        initialType={bottomSheetInitialType}
        initialPaymentMode={bottomSheetInitialPaymentMode}
      />
      
      <InstallBanner />
      
      <Toast />
      
      {/* Add Transaction Tip */}
      {(showAddTransactionTip || needsAddTransactionTip) && (
        <AddTransactionTip onDismiss={handleDismissAddTransactionTip} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}
