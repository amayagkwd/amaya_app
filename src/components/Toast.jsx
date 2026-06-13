import { useState, useEffect } from 'react'

let showToastFn = null

export function showToast(message) {
  if (showToastFn) showToastFn(message)
}

export default function Toast() {
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    showToastFn = (msg) => {
      setMessage(msg)
      setVisible(true)
      setTimeout(() => setVisible(false), 2000)
    }
    return () => { showToastFn = null }
  }, [])
  
  if (!visible) return null
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1a1a1a',
      color: '#fff',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '14px',
      zIndex: 10000
    }}>
      {message}
    </div>
  )
}
