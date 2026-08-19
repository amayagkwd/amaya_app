import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './hooks/useStore'
import { usePayments } from './hooks/usePayments'
import { useMonthlyBalanceCarry } from './hooks/useMonthlyBalanceCarry'
import TopBar from './features/common/TopBar'
import BottomNav from './features/common/BottomNav'
import BottomSheet from './features/common/BottomSheet'
import Toast from './features/common/Toast'
import OnboardingModal from './features/onboarding/OnboardingModal'
import InstallBanner from './features/standalone/InstallBanner'
import Dashboard from './features/dashboard/Dashboard'
import Payments from './features/payments/Payments'
import Insights from './features/insights/Insights'
import SettleUp from './features/settleup/SettleUp'
import Profile from './features/settings/Profile'
import Settings from './features/settings/Settings'
import Setup from './features/settings/Setup'
import theme from './theme'

function AppContent() {
  const [data, updateStore] = useStore()
  const { addTransaction, deleteTransaction } = usePayments(data, updateStore)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  
  // Handle monthly balance carry-over
  useMonthlyBalanceCarry(data, updateStore)
  
  const needsOnboarding = !data.profile.name || !data.profile.dob || !data.profile.country
  
  const handleOnboardingComplete = (profileData) => {
    updateStore(current => ({
      ...current,
      profile: profileData
    }))
  }
  
  if (needsOnboarding) {
    return <OnboardingModal onComplete={handleOnboardingComplete} />
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
          <Route path="/" element={<Dashboard data={data} onOpenBottomSheet={() => setBottomSheetOpen(true)} updateStore={updateStore} />} />
          <Route path="/payments" element={<Payments data={data} updateStore={updateStore} onDelete={deleteTransaction} onOpenBottomSheet={() => setBottomSheetOpen(true)} />} />
          <Route path="/insights" element={<Insights data={data} updateStore={updateStore} onOpenBottomSheet={() => setBottomSheetOpen(true)} />} />
          <Route path="/settleup" element={<SettleUp data={data} updateStore={updateStore} onOpenBottomSheet={() => setBottomSheetOpen(true)} />} />
          <Route path="/profile" element={<Profile data={data} updateStore={updateStore} />} />
          <Route path="/settings" element={<Settings data={data} updateStore={updateStore} />} />
          <Route path="/setup" element={<Setup data={data} updateStore={updateStore} />} />
        </Routes>
      </main>
      
      <BottomNav />
      
      <BottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        categories={data.payments.categories}
        onSave={addTransaction}
        data={data}
        updateStore={updateStore}
      />
      
      <InstallBanner />
      
      <Toast />
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
