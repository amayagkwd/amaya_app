import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBtn, setShowInstallBtn] = useState(false)
  const [showIOSInstallHint, setShowIOSInstallHint] = useState(false)
  const [iosPopup, setIosPopup] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = window.innerWidth <= 768
    setIsMobile(checkMobile)

    // Detect iOS devices
    const ua = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(ua)
    setIsIOS(isIOSDevice)

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true

    // Show iOS hint if on iOS mobile and not already installed
    if (isIOSDevice && checkMobile && !isStandalone) {
      setShowIOSInstallHint(true)
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt fired')
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Only show install button for non-iOS devices on mobile
      if (!isIOSDevice && checkMobile && !isStandalone) {
        setShowInstallBtn(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const choiceResult = await deferredPrompt.userChoice
    
    console.log('User choice:', choiceResult.outcome)
    
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

  // Don't render on desktop
  if (!isMobile) return null

  return (
    <>
      {/* Android/Desktop - Install Button Banner */}
      {showInstallBtn && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#4f46e5',
          padding: '24px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          boxShadow: '0 -2px 16px rgba(0,0,0,0.15)',
          border: '2px solid #fff'
        }}>
          <div style={{ fontSize: '17px', fontWeight: 600, color: '#fff' }}>
            Install App
          </div>
          <button
            onClick={installPWA}
            style={{
              padding: '16px 28px',
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
            padding: '24px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000,
            boxShadow: '0 -2px 16px rgba(0,0,0,0.15)',
            border: '2px solid #fff',
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
            Install App
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
                }}>Share</strong> button in your browser
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
