import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * Handles back button/gesture navigation for mobile devices
 * All pages except settings sub-pages redirect to dashboard (/)
 * Settings sub-pages redirect to /settings
 * Dashboard back button exits the app
 */
export default function NavigationHandler() {
  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    let isHandlingBack = false
    
    const handlePopState = () => {
      // Prevent recursive calls
      if (isHandlingBack) {
        return
      }
      
      isHandlingBack = true
      
      // Get current path after the back navigation
      const currentPath = window.location.pathname
      
      // If we're on dashboard, try to exit the app
      if (currentPath === '/') {
        // For PWAs and mobile browsers
        if (window.history.length <= 1 || !document.referrer) {
          window.close()
        }
        isHandlingBack = false
        return
      }
      
      // Determine where to redirect
      let targetPath = '/'
      
      // Settings sub-pages should go to settings page
      if (['/profile', '/setup', '/budget-setup', '/reminders'].includes(currentPath)) {
        targetPath = '/settings'
      }
      
      // Navigate to target with replace
      setTimeout(() => {
        navigate(targetPath, { replace: true })
        isHandlingBack = false
      }, 10)
    }
    
    window.addEventListener('popstate', handlePopState)
    
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [navigate])
  
  return null
}
