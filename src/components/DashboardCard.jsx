import { useState, useRef, useEffect } from 'react'

export default function DashboardCard({ 
  children, 
  size = 'half', 
  onSizeChange,
  cardId,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragging,
  isDragOver,
  style = {} 
}) {
  const [isSelected, setIsSelected] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const [dragPosition, setDragPosition] = useState(null)
  const longPressTimer = useRef(null)
  const hasMoved = useRef(false)
  const cardRef = useRef(null)
  const initialMousePos = useRef({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  
  const handleTouchStart = (e) => {
    if (isSelected) return
    
    hasMoved.current = false
    const touch = e.touches[0]
    initialMousePos.current = { x: touch.clientX, y: touch.clientY }
    
    longPressTimer.current = setTimeout(() => {
      setIsSelected(true)
      isDraggingRef.current = false
      if (onDragStart) {
        onDragStart(cardId)
      }
    }, 500)
  }
  
  const handleTouchMove = (e) => {
    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - initialMousePos.current.x)
    const deltaY = Math.abs(touch.clientY - initialMousePos.current.y)
    
    if (deltaX > 5 || deltaY > 5) {
      hasMoved.current = true
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
    
    if (isSelected && !isDismissing) {
      e.preventDefault()
      isDraggingRef.current = true
      setDragPosition({ x: touch.clientX, y: touch.clientY })
    }
  }
  
  const handleTouchEnd = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    
    if (isSelected && isDraggingRef.current) {
      const touch = e.changedTouches[0]
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      const dropTarget = element?.closest('[data-card-id]')
      
      if (dropTarget && onDrop) {
        const targetId = dropTarget.getAttribute('data-card-id')
        onDrop(cardId, targetId)
      }
      
      setIsSelected(false)
      setDragPosition(null)
      isDraggingRef.current = false
      
      if (onDragEnd) {
        onDragEnd()
      }
    }
  }
  
  const handleMouseDown = (e) => {
    if (isSelected) return
    
    // Prevent if clicking on buttons inside the card
    if (e.target.closest('button') && !isSelected) {
      return
    }
    
    hasMoved.current = false
    initialMousePos.current = { x: e.clientX, y: e.clientY }
    
    longPressTimer.current = setTimeout(() => {
      setIsSelected(true)
      isDraggingRef.current = false
      if (onDragStart) {
        onDragStart(cardId)
      }
    }, 500)
  }
  
  const handleMouseMove = (e) => {
    const deltaX = Math.abs(e.clientX - initialMousePos.current.x)
    const deltaY = Math.abs(e.clientY - initialMousePos.current.y)
    
    if (deltaX > 5 || deltaY > 5) {
      hasMoved.current = true
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
    
    if (isSelected && !isDismissing && e.buttons === 1) {
      e.preventDefault()
      isDraggingRef.current = true
      setDragPosition({ x: e.clientX, y: e.clientY })
    }
  }
  
  const handleMouseUp = (e) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    
    if (isSelected && isDraggingRef.current) {
      const element = document.elementFromPoint(e.clientX, e.clientY)
      const dropTarget = element?.closest('[data-card-id]')
      
      if (dropTarget && onDrop) {
        const targetId = dropTarget.getAttribute('data-card-id')
        onDrop(cardId, targetId)
      }
      
      setIsSelected(false)
      setDragPosition(null)
      isDraggingRef.current = false
      
      if (onDragEnd) {
        onDragEnd()
      }
    }
  }
  
  const handleOverlayClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSelected(false)
    setDragPosition(null)
    isDraggingRef.current = false
    if (onDragEnd) {
      onDragEnd()
    }
  }
  
  const handleResize = (newSize) => {
    if (onSizeChange) {
      onSizeChange(newSize)
    }
    setIsDismissing(true)
    setTimeout(() => {
      setIsSelected(false)
      setIsDismissing(false)
      setDragPosition(null)
      if (onDragEnd) {
        onDragEnd()
      }
    }, 400)
  }
  
  useEffect(() => {
    if (isSelected) {
      const handleGlobalMouseMove = (e) => {
        if (e.buttons === 1) {
          handleMouseMove(e)
        }
      }
      const handleGlobalMouseUp = (e) => handleMouseUp(e)
      const handleGlobalTouchMove = (e) => handleTouchMove(e)
      const handleGlobalTouchEnd = (e) => handleTouchEnd(e)
      
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      document.addEventListener('touchend', handleGlobalTouchEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
        document.removeEventListener('touchmove', handleGlobalTouchMove)
        document.removeEventListener('touchend', handleGlobalTouchEnd)
      }
    }
  }, [isSelected, isDismissing])
  
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])
  
  const cardStyle = dragPosition && isDraggingRef.current ? {
    position: 'fixed',
    left: dragPosition.x - 100,
    top: dragPosition.y - 50,
    width: cardRef.current?.offsetWidth || 'auto',
    zIndex: 300,
    pointerEvents: 'none',
    opacity: 0.9,
    transform: 'scale(1.05)',
    transition: 'none'
  } : {
    gridColumn: size === 'full' ? 'span 2' : 'span 1',
    position: 'relative',
    transform: isSelected && !isDraggingRef.current ? 'scale(1.03)' : 'scale(1)',
    transition: 'transform 200ms ease-out',
    zIndex: isSelected ? 200 : 1,
    opacity: isDragging ? 0.3 : 1,
    ...style
  }
  
  return (
    <>
      <div
        ref={cardRef}
        data-card-id={cardId}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={cardStyle}
      >
        <div style={{
          position: 'relative',
          boxShadow: isSelected && !isDraggingRef.current
            ? '0 0 0 3px #ffffff, 0 0 0 5px rgba(79,70,229,0.5)' 
            : isDragOver ? '0 0 0 3px rgba(79,70,229,0.3)' : 'none',
          transition: 'box-shadow 200ms ease-out',
          borderRadius: '12px'
        }}>
          {children}
          
          {isSelected && !isDraggingRef.current && (
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
                opacity: isDismissing ? 0 : 1,
                transform: isDismissing ? 'scale(0.5)' : 'scale(1)',
                transition: 'opacity 150ms ease-out, transform 150ms ease-out',
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
                opacity: isDismissing ? 0 : 1,
                transform: isDismissing ? 'scale(0.5)' : 'scale(1)',
                transition: 'opacity 150ms ease-out, transform 150ms ease-out',
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
                opacity: isDismissing ? 0 : 1,
                transform: isDismissing ? 'scale(0.5)' : 'scale(1)',
                transition: 'opacity 150ms ease-out, transform 150ms ease-out',
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
                opacity: isDismissing ? 0 : 1,
                transform: isDismissing ? 'scale(0.5)' : 'scale(1)',
                transition: 'opacity 150ms ease-out, transform 150ms ease-out',
                pointerEvents: 'none'
              }} />
            </>
          )}
        </div>
        
        {isSelected && !isDraggingRef.current && (
          <div 
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '12px',
            background: '#fff',
            borderRadius: '20px',
            padding: '8px',
            display: 'flex',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            opacity: isDismissing ? 0 : 1,
            transition: 'opacity 150ms ease-out',
            zIndex: 201
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleResize('half')
              }}
              onMouseDown={(e) => e.stopPropagation()}
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
              onClick={(e) => {
                e.stopPropagation()
                handleResize('full')
              }}
              onMouseDown={(e) => e.stopPropagation()}
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
      </div>
      
      {isSelected && (
        <div
          onClick={handleOverlayClick}
          onMouseDown={handleOverlayClick}
          onTouchEnd={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsSelected(false)
            setDragPosition(null)
            isDraggingRef.current = false
            if (onDragEnd) {
              onDragEnd()
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 199,
            opacity: isDismissing ? 0 : 1,
            transition: 'opacity 200ms ease-out',
            cursor: 'pointer'
          }}
        />
      )}
    </>
  )
}
