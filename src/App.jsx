import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from './hooks/useStore'
import { usePayments } from './hooks/usePayments'
import { useMonthlyBalanceCarry } from './hooks/useMonthlyBalanceCarry'
import TopBar from './features/common/TopBar'
import BottomNav from './features/common/BottomNav'
import BottomSheet from './features/common/BottomSheet'
import Toast from './features/common/Toast'
import OnboardingModal from './features/onboarding/OnboardingModal'
import InitialBalanceModal from './features/onboarding/InitialBalanceModal'
import TutorialSpotlight from './features/onboarding/TutorialSpotlight'
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

function AppContent() {
  const [data, updateStore] = useStore()
  const { addTransaction, deleteTransaction } = usePayments(data, updateStore)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const [bottomSheetMode, setBottomSheetMode] = useState('transaction')
  const [bottomSheetInitialType, setBottomSheetInitialType] = useState(null)
  const [showInitialBalance, setShowInitialBalance] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  
  // Handle monthly balance carry-over
  useMonthlyBalanceCarry(data, updateStore)
  
  const needsOnboarding = !data.profile.name || !data.profile.dob || !data.profile.country
  const hasExistingData = data.payments.transactions.length > 0 || data.payments.categories.length > 0
  const hasInitialBalance = data.payments.transactions.some(t => t.categoryId === 'initial-balance')
  
  // Only show initial balance prompt and tutorial for brand new users (no existing data)
  const needsInitialBalancePrompt = !needsOnboarding && !hasExistingData && !hasInitialBalance && !data.settings.initialBalanceSkipped
  const showTutorial = !needsOnboarding && !hasExistingData && !needsInitialBalancePrompt && !data.settings.tutorialCompleted
  
  const tutorialSteps = [
    {
      targetId: 'tutorial-payments-card',
      message: 'Here you will be able to see your current balance, income, and expenses for the month.',
      shape: 'rectangle',
      messagePosition: 'below',
      route: '/'
    },
    {
      targetId: 'tutorial-add-button',
      message: 'Use this button to add new transactions',
      shape: 'circle',
      messagePosition: 'above',
      route: '/'
    },
    {
      targetId: 'tutorial-setup-option',
      message: 'In settings, you can manage your income and expense categories to organize your transactions',
      shape: 'rectangle',
      messagePosition: 'below',
      route: '/settings'
    },
    {
      targetId: 'tutorial-bar-chart',
      message: 'You can see your daily expenses here',
      shape: 'rectangle',
      messagePosition: 'below',
      route: '/insights'
    },
    {
      targetId: 'tutorial-pie-charts',
      message: 'You can see a monthly breakdown of your spending patterns here',
      shape: 'rectangle',
      messagePosition: 'above',
      route: '/insights',
      scrollToView: true
    },
    {
      targetId: null,
      message: 'You can view, edit and delete your transactions here',
      shape: 'none',
      messagePosition: 'center',
      route: '/payments'
    }
  ]
  
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
  }
  
  const handleTutorialNext = () => {
    const nextStep = tutorialStep + 1
    if (nextStep < tutorialSteps.length) {
      const nextStepData = tutorialSteps[nextStep]
      
      // Add sample data when moving to insights page
      if (nextStepData.route === '/insights' && tutorialStep === 2) {
        // Add diverse sample transactions across multiple days for the tutorial
        const today = new Date()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        
        const sampleCategories = [
          { id: 'tutorial-groceries', name: 'Groceries', type: 'expense', classification: 'need', isDefault: false },
          { id: 'tutorial-transport', name: 'Transport', type: 'expense', classification: 'need', isDefault: false },
          { id: 'tutorial-food', name: 'Dining Out', type: 'expense', classification: 'want', isDefault: false },
          { id: 'tutorial-entertainment', name: 'Entertainment', type: 'expense', classification: 'want', isDefault: false },
          { id: 'tutorial-shopping', name: 'Shopping', type: 'expense', classification: 'want', isDefault: false },
          { id: 'tutorial-utilities', name: 'Utilities', type: 'expense', classification: 'need', isDefault: false }
        ]
        
        const sampleTransactions = [
          // Past week
          { type: 'expense', amount: 85, categoryId: 'tutorial-groceries', date: new Date(currentYear, currentMonth, today.getDate() - 6).toISOString().split('T')[0], category: 'Groceries' },
          { type: 'expense', amount: 30, categoryId: 'tutorial-transport', date: new Date(currentYear, currentMonth, today.getDate() - 6).toISOString().split('T')[0], category: 'Transport' },
          { type: 'expense', amount: 45, categoryId: 'tutorial-food', date: new Date(currentYear, currentMonth, today.getDate() - 5).toISOString().split('T')[0], category: 'Dining Out' },
          { type: 'expense', amount: 20, categoryId: 'tutorial-transport', date: new Date(currentYear, currentMonth, today.getDate() - 5).toISOString().split('T')[0], category: 'Transport' },
          { type: 'expense', amount: 120, categoryId: 'tutorial-utilities', date: new Date(currentYear, currentMonth, today.getDate() - 4).toISOString().split('T')[0], category: 'Utilities' },
          { type: 'expense', amount: 60, categoryId: 'tutorial-entertainment', date: new Date(currentYear, currentMonth, today.getDate() - 4).toISOString().split('T')[0], category: 'Entertainment' },
          { type: 'expense', amount: 55, categoryId: 'tutorial-groceries', date: new Date(currentYear, currentMonth, today.getDate() - 3).toISOString().split('T')[0], category: 'Groceries' },
          { type: 'expense', amount: 95, categoryId: 'tutorial-shopping', date: new Date(currentYear, currentMonth, today.getDate() - 3).toISOString().split('T')[0], category: 'Shopping' },
          { type: 'expense', amount: 25, categoryId: 'tutorial-transport', date: new Date(currentYear, currentMonth, today.getDate() - 2).toISOString().split('T')[0], category: 'Transport' },
          { type: 'expense', amount: 38, categoryId: 'tutorial-food', date: new Date(currentYear, currentMonth, today.getDate() - 2).toISOString().split('T')[0], category: 'Dining Out' },
          { type: 'expense', amount: 15, categoryId: 'tutorial-transport', date: new Date(currentYear, currentMonth, today.getDate() - 1).toISOString().split('T')[0], category: 'Transport' },
          { type: 'expense', amount: 72, categoryId: 'tutorial-shopping', date: new Date(currentYear, currentMonth, today.getDate() - 1).toISOString().split('T')[0], category: 'Shopping' },
          // Today
          { type: 'expense', amount: 42, categoryId: 'tutorial-groceries', date: today.toISOString().split('T')[0], category: 'Groceries' },
          { type: 'expense', amount: 28, categoryId: 'tutorial-food', date: today.toISOString().split('T')[0], category: 'Dining Out' },
          // Future days (for demo purposes)
          { type: 'expense', amount: 18, categoryId: 'tutorial-transport', date: new Date(currentYear, currentMonth, today.getDate() + 1).toISOString().split('T')[0], category: 'Transport' },
          { type: 'expense', amount: 65, categoryId: 'tutorial-groceries', date: new Date(currentYear, currentMonth, today.getDate() + 2).toISOString().split('T')[0], category: 'Groceries' },
          { type: 'expense', amount: 50, categoryId: 'tutorial-entertainment', date: new Date(currentYear, currentMonth, today.getDate() + 3).toISOString().split('T')[0], category: 'Entertainment' },
          { type: 'expense', amount: 35, categoryId: 'tutorial-food', date: new Date(currentYear, currentMonth, today.getDate() + 4).toISOString().split('T')[0], category: 'Dining Out' }
        ].map(t => ({ ...t, id: uuidv4(), timestamp: Date.now(), note: null }))
        
        updateStore(current => ({
          ...current,
          payments: {
            ...current.payments,
            categories: [...current.payments.categories, ...sampleCategories],
            transactions: [...current.payments.transactions, ...sampleTransactions]
          }
        }))
      }
      
      // Navigate if route changes
      if (nextStepData.route !== location.pathname) {
        navigate(nextStepData.route)
      }
      
      // Scroll to element if needed
      if (nextStepData.scrollToView) {
        setTimeout(() => {
          const element = document.getElementById(nextStepData.targetId)
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 300)
      }
      
      setTutorialStep(nextStep)
    }
  }
  
  const handleTutorialComplete = () => {
    // Remove all tutorial transactions and categories, keep only initial balance
    updateStore(current => ({
      ...current,
      settings: {
        ...current.settings,
        tutorialCompleted: true
      },
      payments: {
        ...current.payments,
        // Remove tutorial categories
        categories: current.payments.categories.filter(c => !c.id.startsWith('tutorial-')),
        // Keep only initial balance transaction
        transactions: current.payments.transactions.filter(t => t.categoryId === 'initial-balance')
      }
    }))
    navigate('/')
  }
  
  // Navigate to initial tutorial step route
  useEffect(() => {
    if (showTutorial && tutorialSteps[tutorialStep]) {
      const currentStepRoute = tutorialSteps[tutorialStep].route
      if (currentStepRoute && location.pathname !== currentStepRoute) {
        navigate(currentStepRoute)
      }
    }
  }, [showTutorial])
  
  const handleOpenBottomSheet = (mode = 'transaction', initialType = null) => {
    setBottomSheetMode(mode)
    setBottomSheetInitialType(initialType)
    setBottomSheetOpen(true)
  }
  
  const handleSaveReminder = (reminderData) => {
    // TODO: Implement reminder save functionality
    console.log('Reminder saved:', reminderData)
  }
  
  if (needsOnboarding) {
    return <OnboardingModal onComplete={handleOnboardingComplete} />
  }
  
  if (showInitialBalance || (needsInitialBalancePrompt && data.profile.name)) {
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
      />
      
      <InstallBanner />
      
      <Toast />
      
      {/* Tutorial Spotlight */}
      {showTutorial && (
        <TutorialSpotlight
          steps={tutorialSteps}
          currentStep={tutorialStep}
          onNext={handleTutorialNext}
          onComplete={handleTutorialComplete}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
