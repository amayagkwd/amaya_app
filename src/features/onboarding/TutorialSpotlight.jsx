import { useState, useEffect, useRef } from 'react'
import theme from '../../theme'

export default function TutorialSpotlight({ steps, currentStep, onNext, onComplete }) {
  const [spotlightRect, setSpotlightRect] = useState(null)
  const step = steps[currentStep]

  useEffect(() => {
    if (step && step.targetId) {
      const updateSpotlight = () => {
        const element = document.getElementById(step.targetId)
        if (element) {
          const rect = element.getBoundingClientRect()
          setSpotlightRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
          })
        }
      }

      // Initial update
      updateSpotlight()

      // Update on resize
      window.addEventListener('resize', updateSpotlight)
      window.addEventListener('scroll', updateSpotlight)

      return () => {
        window.removeEventListener('resize', updateSpotlight)
        window.removeEventListener('scroll', updateSpotlight)
      }
    }
  }, [step])

  if (!step) return null

  // Special handling for final step with no spotlight box
  if (step.shape === 'none') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {/* Dark overlay - no spotlight cutout */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 2,
            pointerEvents: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Centered message with Got it button */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '340px',
            width: 'calc(100% - 32px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            zIndex: 4,
            pointerEvents: 'auto'
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: theme.typography.h4,
              fontWeight: theme.typography.semiBold,
              color: theme.colors.textPrimary,
              lineHeight: '1.5',
              textAlign: 'center'
            }}
          >
            {step.message}
          </p>

          <button
            onClick={onComplete}
            style={{
              padding: '16px 32px',
              background: theme.colors.accentPurple,
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.h5,
              fontWeight: theme.typography.semiBold,
              cursor: 'pointer',
              boxShadow: theme.shadows.glow.purple,
              transition: theme.transitions.fast,
              alignSelf: 'flex-end'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    )
  }

  if (!spotlightRect) return null

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      onNext()
    } else {
      onComplete()
    }
  }

  // Check if this is a circular spotlight (for buttons)
  const isCircular = step.shape === 'circle'
  const radius = isCircular ? Math.max(spotlightRect.width, spotlightRect.height) / 2 + 8 : 20
  const centerX = spotlightRect.left + spotlightRect.width / 2
  const centerY = spotlightRect.top + spotlightRect.height / 2

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      {/* Click blocker - prevents interaction with rest of page */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'auto',
          zIndex: 1
        }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Overlay with spotlight cutout */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2
        }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {isCircular ? (
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="black"
              />
            ) : (
              <rect
                x={spotlightRect.left - 8}
                y={spotlightRect.top - 8}
                width={spotlightRect.width + 16}
                height={spotlightRect.height + 16}
                rx="20"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.85)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border */}
      {isCircular ? (
        <div
          style={{
            position: 'absolute',
            top: centerY - radius,
            left: centerX - radius,
            width: radius * 2,
            height: radius * 2,
            border: `3px solid ${theme.colors.accentPurple}`,
            borderRadius: '50%',
            boxShadow: `0 0 0 4px rgba(124, 111, 255, 0.2), 0 0 40px rgba(124, 111, 255, 0.4)`,
            pointerEvents: 'none',
            animation: 'pulse 2s ease-in-out infinite',
            zIndex: 3
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            top: spotlightRect.top - 8,
            left: spotlightRect.left - 8,
            width: spotlightRect.width + 16,
            height: spotlightRect.height + 16,
            border: `3px solid ${theme.colors.accentPurple}`,
            borderRadius: '20px',
            boxShadow: `0 0 0 4px rgba(124, 111, 255, 0.2), 0 0 40px rgba(124, 111, 255, 0.4)`,
            pointerEvents: 'none',
            animation: 'pulse 2s ease-in-out infinite',
            zIndex: 3
          }}
        />
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              box-shadow: 0 0 0 4px rgba(124, 111, 255, 0.2), 0 0 40px rgba(124, 111, 255, 0.4);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(124, 111, 255, 0.3), 0 0 50px rgba(124, 111, 255, 0.6);
            }
          }
        `}
      </style>

      {/* Tutorial message box */}
      <div
        style={{
          position: 'absolute',
          top: step.messagePosition === 'above' 
            ? (isCircular ? spotlightRect.top - 180 : spotlightRect.top - 200)
            : spotlightRect.top + spotlightRect.height + 24,
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: '340px',
          width: 'calc(100% - 32px)',
          background: theme.colors.bgModal,
          backdropFilter: theme.backdropFilter,
          WebkitBackdropFilter: theme.backdropFilter,
          borderRadius: theme.borderRadius.xl,
          padding: '24px',
          boxShadow: theme.shadows.strong,
          border: `1px solid ${theme.colors.borderMedium}`,
          pointerEvents: 'auto',
          zIndex: 4
        }}
      >
        <p
          style={{
            margin: '0 0 20px 0',
            fontSize: theme.typography.h5,
            fontWeight: theme.typography.medium,
            color: theme.colors.textPrimary,
            lineHeight: '1.5'
          }}
        >
          {step.message}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Step indicator */}
          <div
            style={{
              fontSize: theme.typography.body,
              color: theme.colors.textSecondary,
              fontWeight: theme.typography.medium
            }}
          >
            {currentStep + 1} / {steps.length}
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            style={{
              padding: '12px 24px',
              background: theme.colors.accentPurple,
              color: theme.colors.textPrimary,
              border: 'none',
              borderRadius: theme.borderRadius.lg,
              fontSize: theme.typography.h5,
              fontWeight: theme.typography.semiBold,
              cursor: 'pointer',
              boxShadow: theme.shadows.glow.purple,
              transition: theme.transitions.fast
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'scale(0.95)'
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {currentStep < steps.length - 1 ? 'Next' : 'Got it!'}
          </button>
        </div>
      </div>
    </div>
  )
}
