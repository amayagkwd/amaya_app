import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function DashboardCard({ 
  children, 
  size = 'half', 
  onSizeChange,
  cardId,
  style = {} 
}) {
  const [isSelected, setIsSelected] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState(null)
  const longPressTimer = useRef(null)
  const longPressFired = useRef(false)
  const cardRef = useRef(null)
  const initialTouchPos = useRef({ x: 0, y: 0 })
  
  const handleTouchStart = (e) => {
    if (isSelected) return
    
    const touch = e.touches[0]
    initialTouchPos.current = { x: touch.clientX, y: touch.clientY }
    longPressFired.current = false
    
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      const rect = cardRef.current?.getBoundingClientRect()
      if (rect) {
        setToolbarPosition({
          left: rect.left + rect.width / 2,
          top: rect.bottom + 12
        })
      }
      setIsSelected(true)
    }, 500)
  }
  
  const handleTouchMove = (e) => {
    if (longPressFired.current) {
      e.preventDefault()
      return
    }
    
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - initialTouchPos.current.x)
    const deltaY = Math.abs(touch.clientY - initialTouchPos.current.y)
    
    // Only cancel if movement exceeds 10px
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }
  
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }
  
  const handleMouseDown = (e) => {
    if (isSelected) return
    
    // Prevent if clicking on buttons inside the card
    if (e.target.closest('button')) {
      return
    }
    
    longPressFired.current = false
    
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true
      const rect = cardRef.current?.getBoundingClientRect()
      if (rect) {
        setToolbarPosition({
          left: rect.left + rect.width / 2,
          top: rect.bottom + 12
        })
      }
      setIsSelected(true)
    }, 500)
  }
  
  const handleMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }
  
  const handleOverlayClick = () => {
    setIsSelected(false)
    setToolbarPosition(null)
  }
  
  const handleResize = (newSize) => {
    if (onSizeChange) {
      onSizeChange(newSize)
    }
    setIsSelected(false)
    setToolbarPosition(null)
  }
  
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])
  
  return (
    <>
      <div
        ref={cardRef}
        data-card-id={cardId}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        style={{
          gridColumn: size === 'full' ? 'span 2' : 'span 1',
          position: 'relative',
          transform: isSelected ? 'scale(1.03)' : 'scale(1)',
          transition: 'transform 200ms ease-out',
          zIndex: isSelected ? 200 : 1,
          touchAction: longPressFired.current ? 'none' : 'auto',
          ...style
        }}
      >
        <div style={{
          position: 'relative',
          boxShadow: isSelected 
            ? '0 0 0 3px #ffffff, 0 0 0 5px rgba(79,70,229,0.5)' 
            : 'none',
          transition: 'box-shadow 200ms ease-out',
          borderRadius: '12px'
        }}>
          {children}
          
          {isSelected && (
            <>
              {/* Corner handles */}
              <div style={{
                position: 'absolute',
                top: '-6px',
                left: '-6px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#fff',
                border: '2px solid #4f46e5',
                pointerEvents: 'none'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#fff',
                border: '2px solid #4f46e5',
                pointerEvents: 'none'
              }} />
              
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                left: '-6px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#fff',
                border: '2px solid #4f46e5',
                pointerEvents: 'none'
              }} />
              
              <div style={{
                position: 'absolute',
                bottom: '-6px',
                right: '-6px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#fff',
                border: '2px solid #4f46e5',
                pointerEvents: 'none'
              }} />
            </>
          )}
        </div>
      </div>
      
      {isSelected && createPortal(
        <>
          {/* Overlay */}
          <div
            onClick={handleOverlayClick}
            onTouchEnd={handleOverlayClick}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.3)',
              zIndex: 199,
              cursor: 'pointer'
            }}
          />
          
          {/* Resize toolbar */}
          {toolbarPosition && (
            <div style={{
              position: 'fixed',
              left: toolbarPosition.left,
              top: toolbarPosition.top,
              transform: 'translateX(-50%)',
              background: '#fff',
              borderRadius: '20px',
              padding: '8px',
              display: 'flex',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 201
            }}>
              <button
                onClick={() => handleResize('half')}
                style={{
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  borderRadius: '12px',
                  background: size === 'half' ? '#4f46e5' : '#e5e7eb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 200ms'
                }}
                title="Half width"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="8" height="12" rx="1" fill={size === 'half' ? '#fff' : '#6b7280'} />
                  <rect x="13" y="6" width="8" height="12" rx="1" fill={size === 'half' ? '#fff' : '#6b7280'} />
                </svg>
              </button>
              
              <button
                onClick={() => handleResize('full')}
                style={{
                  width: '40px',
                  height: '40px',
                  border: 'none',
                  borderRadius: '12px',
                  background: size === 'full' ? '#4f46e5' : '#e5e7eb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 200ms'
                }}
                title="Full width"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="9" width="18" height="6" rx="1" fill={size === 'full' ? '#fff' : '#6b7280'} />
                </svg>
              </button>
            </div>
          )}
        </>,
        document.body
      )}
    </>
  )
}
