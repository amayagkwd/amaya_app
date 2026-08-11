import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStore } from './hooks/useStore'
import { usePayments } from './hooks/usePayments'
import TopBar from './components/common/TopBar'
import BottomNav from './components/common/BottomNav'
import BottomSheet from './components/common/BottomSheet'
import Toast from './components/common/Toast'
import OnboardingModal from './components/common/OnboardingModal'
import InstallBanner from './components/common/InstallBanner'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Insights from './pages/Insights'
import SettleUp from './pages/SettleUp'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Setup from './pages/Setup'
import theme from './theme'

function AppContent() {
  const [data, updateStore] = useStore()
  const { addTransaction, deleteTransaction } = usePayments(data, updateStore)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  
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
