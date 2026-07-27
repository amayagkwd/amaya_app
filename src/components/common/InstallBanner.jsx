import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBtn, setShowInstallBtn] = useState(false)
  const [showIOSInstallHint, setShowIOSInstallHint] = useState(false)
  const [iosPopup, setIosPopup] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(ua)
    setIsIOS(isIOSDevice)

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true

    console.log('📱 PWA Install Check:', {
      isIOS: isIOSDevice,
      isStandalone,
      userAgent: ua
    })

    // Don't show anything if already installed
    if (isStandalone) {
      console.log('✅ App already installed')
      return
    }

    // Show iOS hint if on iOS and not already installed
    if (isIOSDevice) {
      console.log('✅ Showing iOS install hint')
      setShowIOSInstallHint(true)
      return
    }

    // Android/Desktop - Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('🎉 beforeinstallprompt fired! Showing install button.')
      e.preventDefault() // Prevent the mini-infobar from appearing
      setDeferredPrompt(e) // Save the event to trigger later
      setShowInstallBtn(true) // Show our custom install button
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) {
      console.log('❌ No deferred prompt available')
      return
    }

    console.log('📲 Triggering install prompt...')
    deferredPrompt.prompt() // Show the install prompt
    
    const choiceResult = await deferredPrompt.userChoice
    console.log('User choice:', choiceResult.outcome)
    
    if (choiceResult.outcome === 'accepted') {
      console.log('✅ User accepted the install')
    } else {
      console.log('❌ User dismissed the install')
    }
    
    setDeferredPrompt(null)
    setShowInstallBtn(false)
  }

  const closeInstallBanner = () => {
    setShowInstallBtn(false)
    setShowIOSInstallHint(false)
    setIosPopup(false)
  }

  const openIosPopup = (e) => {
    e.stopPropagation()
    setIosPopup(true)
  }

  const closeIosPopup = () => {
    setIosPopup(false)
  }

  return (
    <>
      {/* Android/Desktop - Install Button (only shows when beforeinstallprompt fires) */}
      {showInstallBtn && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#4f46e5',
          padding: '20px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          boxShadow: '0 -2px 16px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
              Install App
            </div>
          </div>
          <button
            onClick={installPWA}
            style={{
              padding: '12px 24px',
              background: '#fff',
              color: '#4f46e5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Install
          </button>
          <button
            onClick={closeInstallBanner}
            style={{
              padding: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.8)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* iOS - Bottom Hint Banner */}
      {showIOSInstallHint && (
        <div
          onClick={openIosPopup}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#4f46e5',
            padding: '20px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            boxShadow: '0 -2px 16px rgba(0,0,0,0.15)',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="7.5 4.21 12 6.81 16.5 4.21"></polyline>
                <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>
              Install App
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeInstallBanner()
            }}
            style={{
              padding: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.8)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}

      {/* iOS - Instruction Popup */}
      {iosPopup && (
        <>
          <div
            onClick={closeIosPopup}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1001
            }}
          />
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            borderRadius: '16px 16px 0 0',
            padding: '24px',
            zIndex: 1002,
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e5e3',
              marginBottom: '20px'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                Install App
              </h3>
              <button
                onClick={closeIosPopup}
                style={{
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <p style={{ margin: '0 0 20px 0', color: '#6b7280', fontSize: '15px', lineHeight: 1.5 }}>
              Install this app on your device to access it easily anytime.
            </p>

            <ol style={{
              margin: 0,
              padding: '0 0 0 20px',
              color: '#1a1a1a',
              fontSize: '15px',
              lineHeight: 1.8
            }}>
              <li style={{ marginBottom: '12px' }}>
                Tap the <strong style={{ 
                  padding: '2px 6px',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>Share</strong> button in Safari
              </li>
              <li>
                Select <strong style={{ 
                  padding: '2px 6px',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                  fontWeight: 600
                }}>Add to Home Screen</strong>
              </li>
            </ol>
          </div>
        </>
      )}
    </>
  )
}
