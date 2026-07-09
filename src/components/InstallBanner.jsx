import { useState, useEffect } from 'react'

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showInstallBtn, setShowInstallBtn] = useState(false)
  const [showManualAndroidHint, setShowManualAndroidHint] = useState(false)
  const [showIOSInstallHint, setShowIOSInstallHint] = useState(false)
  const [androidPopup, setAndroidPopup] = useState(false)
  const [iosPopup, setIosPopup] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const checkMobile = window.innerWidth <= 768
    setIsMobile(checkMobile)

    console.log('🔍 InstallBanner Debug:', {
      isMobile: checkMobile,
      userAgent: window.navigator.userAgent,
      displayMode: window.matchMedia('(display-mode: standalone)').matches,
      standalone: window.navigator.standalone,
      isHTTPS: window.location.protocol === 'https:'
    })

    // Detect device type
    const ua = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(ua)
    const isAndroid = /android/.test(ua)

    // Check if already installed (standalone mode)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         window.navigator.standalone === true

    console.log('📱 Device Check:', {
      isIOS: isIOSDevice,
      isAndroid,
      isStandalone,
      shouldShowHint: checkMobile && !isStandalone
    })

    // Don't show anything if already installed
    if (isStandalone) {
      console.log('✅ App already installed')
      return
    }

    // Show iOS hint if on iOS mobile and not already installed
    if (isIOSDevice && checkMobile) {
      console.log('✅ Showing iOS install hint')
      setShowIOSInstallHint(true)
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e) => {
      console.log('🎉 beforeinstallprompt fired! Direct install available.')
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show native install button for Android when prompt is available
      if (!isIOSDevice && checkMobile) {
        console.log('✅ Showing Android native install button')
        setShowInstallBtn(true)
        setShowManualAndroidHint(false)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Fallback: Show manual instructions for Android if prompt doesn't fire
    // Chrome requires user engagement before firing the prompt
    if (isAndroid && checkMobile && !isStandalone) {
      setTimeout(() => {
        if (!deferredPrompt) {
          console.log('⚠️ No beforeinstallprompt after 5s - showing manual instructions')
          console.log('💡 This is normal on first visit. Chrome needs user engagement.')
          console.log('📋 Criteria for prompt: HTTPS ✓, manifest ✓, service worker ✓, icons ✓')
          console.log('⏰ User needs: multiple visits, time on site, or revisit after 30s')
          setShowManualAndroidHint(true)
        }
      }, 5000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [deferredPrompt])

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
    setShowManualAndroidHint(false)
    setShowIOSInstallHint(false)
    setAndroidPopup(false)
    setIosPopup(false)
  }

  const openAndroidPopup = (e) => {
    e.stopPropagation()
    setAndroidPopup(true)
  }

  const openIosPopup = (e) => {
    e.stopPropagation()
    setIosPopup(true)
  }

  const closeAndroidPopup = () => {
    setAndroidPopup(false)
  }

  const closeIosPopup = () => {
    setIosPopup(false)
  }

  // Don't render on desktop
  if (!isMobile) return null

  return (
    <>
      {/* Android - Native Install Button (when beforeinstallprompt fires) */}
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
            <div style={{ fontSize: '17px', fontWeight: 600, color: '#fff' }}>
              Install App
            </div>
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

      {/* Android - Manual Install Hint (when beforeinstallprompt doesn't fire) */}
      {showManualAndroidHint && (
        <div
          onClick={openAndroidPopup}
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
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
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>
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

      {/* Android - Manual Installation Popup */}
      {androidPopup && (
        <>
          <div
            onClick={closeAndroidPopup}
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
                onClick={closeAndroidPopup}
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
              Install this app on your device for the best experience. Chrome will enable automatic installation after you use the site a few times.
            </p>

            <div style={{
              marginBottom: '20px',
              padding: '16px',
              background: '#f0fdf4',
              borderRadius: '8px',
              border: '1px solid #86efac'
            }}>
              <div style={{ fontWeight: 600, color: '#166534', marginBottom: '8px', fontSize: '14px' }}>
                ✨ Best Method (if available):
              </div>
              <ol style={{
                margin: 0,
                padding: '0 0 0 20px',
                color: '#166534',
                fontSize: '14px',
                lineHeight: 1.6
              }}>
                <li style={{ marginBottom: '8px' }}>
                  Tap the <strong style={{ 
                    padding: '2px 6px',
                    background: '#dcfce7',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>three dots menu (⋮)</strong> in Chrome
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Look for <strong style={{ 
                    padding: '2px 6px',
                    background: '#dcfce7',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>Install app</strong> option
                </li>
                <li>
                  Tap it to download and install as a full app
                </li>
              </ol>
              <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#15803d', fontStyle: 'italic' }}>
                This option appears after you've visited the site a few times. It installs the app like a native Android app.
              </p>
            </div>

            <div style={{
              padding: '16px',
              background: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #fde047'
            }}>
              <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '8px', fontSize: '14px' }}>
                📱 Alternative Method:
              </div>
              <ol style={{
                margin: 0,
                padding: '0 0 0 20px',
                color: '#92400e',
                fontSize: '14px',
                lineHeight: 1.6
              }}>
                <li style={{ marginBottom: '8px' }}>
                  Tap the <strong style={{ 
                    padding: '2px 6px',
                    background: '#fef9c3',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>three dots menu (⋮)</strong> in Chrome
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Select <strong style={{ 
                    padding: '2px 6px',
                    background: '#fef9c3',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>Add to Home screen</strong>
                </li>
                <li>
                  Tap <strong style={{ 
                    padding: '2px 6px',
                    background: '#fef9c3',
                    borderRadius: '4px',
                    fontWeight: 600
                  }}>Add</strong>
                </li>
              </ol>
              <p style={{ margin: '12px 0 0 0', fontSize: '12px', color: '#78350f', fontStyle: 'italic' }}>
                This creates a shortcut. Use this if "Install app" isn't available yet.
              </p>
            </div>

            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: '#eff6ff',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#1e40af',
              lineHeight: 1.5,
              border: '1px solid #bfdbfe'
            }}>
              <strong>💡 Tip:</strong> Keep using the app and check the Chrome menu (⋮) periodically. The "Install app" option will appear after a few visits, giving you the full app experience!
            </div>
          </div>
        </>
      )}
    </>
  )
}
