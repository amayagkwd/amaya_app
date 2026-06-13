import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useStore } from './hooks/useStore'
import { usePayments } from './hooks/usePayments'
import TopBar from './components/TopBar'
import SidePanel from './components/SidePanel'
import BottomSheet from './components/BottomSheet'
import Toast from './components/Toast'
import OnboardingModal from './components/OnboardingModal'
import CardSelectionModal from './components/CardSelectionModal'
import InstallBanner from './components/InstallBanner'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Profile from './pages/Profile'
import Maps from './pages/Maps'
import Weather from './pages/Weather'
import Counter from './pages/Counter'

function AppContent() {
  const [data, updateStore] = useStore()
  const { addTransaction, deleteTransaction } = usePayments(data, updateStore)
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false)
  const [cardSelectionOpen, setCardSelectionOpen] = useState(false)
  const location = useLocation()
  
  // Handle daily reset for counter
  useEffect(() => {
    if (data.counterSettings?.dailyReset) {
      const today = new Date().toISOString().split('T')[0]
      const lastResetDate = data.lastCounterResetDate
      
      if (lastResetDate !== today) {
        updateStore(current => ({
          ...current,
          counterValue: 0,
          lastCounterResetDate: today
        }))
      }
    }
  }, [data.counterSettings?.dailyReset, data.lastCounterResetDate, updateStore])
  
  const showFAB = location.pathname === '/'
  const needsOnboarding = !data.profile.name || !data.profile.dob || !data.profile.country
  const needsCardSetup = !needsOnboarding && !data.hasCompletedCardSetup
  
  const handleOnboardingComplete = (profileData) => {
    updateStore(current => ({
      ...current,
      profile: profileData
    }))
  }
  
  const handleUpdateCards = (cardIds) => {
    updateStore(current => ({
      ...current,
      cards: cardIds,
      hasCompletedCardSetup: true
    }))
  }
  
  const handleFABClick = () => {
    setCardSelectionOpen(true)
  }
  
  if (needsOnboarding) {
    return <OnboardingModal onComplete={handleOnboardingComplete} />
  }
  
  if (needsCardSetup) {
    return (
      <CardSelectionModal
        isOpen={true}
        onClose={() => {}}
        onUpdateCards={handleUpdateCards}
        activeCards={data.cards}
      />
    )
  }
  
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f9f9f7',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <TopBar onMenuClick={() => setSidePanelOpen(true)} appName={data.profile.name} />
      
      <main style={{
        maxWidth: '480px',
        margin: '0 auto',
        paddingTop: '60px',
        minHeight: 'calc(100vh - 60px)'
      }}>
        <Routes>
          <Route path="/" element={<Dashboard data={data} onOpenBottomSheet={() => setBottomSheetOpen(true)} updateStore={updateStore} />} />
          <Route path="/payments" element={<Payments data={data} updateStore={updateStore} onDelete={deleteTransaction} />} />
          <Route path="/profile" element={<Profile data={data} updateStore={updateStore} />} />
          <Route path="/maps" element={<Maps data={data} updateStore={updateStore} />} />
          <Route path="/weather" element={<Weather data={data} updateStore={updateStore} />} />
          <Route path="/counter" element={<Counter data={data} updateStore={updateStore} />} />
        </Routes>
      </main>
      
      <SidePanel
        isOpen={sidePanelOpen}
        onClose={() => setSidePanelOpen(false)}
        hasWeatherCard={data.cards.includes('weather')}
        hasCounterCard={data.cards.includes('counter')}
      />
      
      {showFAB && (
        <button
          onClick={handleFABClick}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#4f46e5',
            color: '#fff',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
            zIndex: 99
          }}
        >
          +
        </button>
      )}
      
      <CardSelectionModal
        isOpen={cardSelectionOpen}
        onClose={() => setCardSelectionOpen(false)}
        onUpdateCards={handleUpdateCards}
        activeCards={data.cards}
      />
      
      <BottomSheet
        isOpen={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        categories={data.payments.categories}
        onSave={addTransaction}
        data={data}
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
