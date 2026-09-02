import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import theme, { componentStyles } from '../../theme'
import AddTransactionButton from '../common/AddTransactionButton'

export default function Reminders({ data, updateStore, onOpenBottomSheet }) {
  const navigate = useNavigate()

  return (
    <>
      <div style={componentStyles.backgroundShine} />
      
      <div style={{ ...componentStyles.pageContainer, position: 'relative', zIndex: 1 }}>
        <h2 style={componentStyles.pageHeader}>Reminders</h2>

        {/* Empty State */}
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 0
        }}>
          <p style={{
            color: theme.colors.textSecondary,
            fontSize: theme.typography.h4,
            margin: '0 0 8px 0',
            fontWeight: theme.typography.medium
          }}>
            No reminders set yet
          </p>
          <p style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.body,
            margin: 0
          }}>
            Add Reminders
          </p>
          
          {/* Curved Arrow SVG pointing to + button */}
          <svg 
            width="200" 
            height="280" 
            viewBox="0 0 200 280" 
            style={{
              position: 'absolute',
              top: '60px',
              right: '-120px',
              opacity: 0.6
            }}
          >
            {/* Curved path with loop */}
            <path
              d="M 20 20 Q 80 40, 100 80 Q 120 120, 100 160 Q 80 200, 100 220 L 160 240"
              stroke={theme.colors.accentPurple}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="5,5"
            />
            {/* Arrow head */}
            <polygon
              points="160,240 155,232 165,232"
              fill={theme.colors.accentPurple}
            />
          </svg>
        </div>
      </div>

      <AddTransactionButton onClick={onOpenBottomSheet} mode="reminder" />
    </>
  )
}
