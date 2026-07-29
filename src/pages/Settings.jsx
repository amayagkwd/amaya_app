import { useState, useRef } from 'react'
import { exportData, importData } from '../store'
import theme from '../theme'

export default function Settings({ data, updateStore }) {
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.type === 'application/json') {
      setSelectedFile(file)
      setShowImportModal(true)
    }
  }

  const handleImportConfirm = () => {
    if (selectedFile) {
      importData(selectedFile, (success, importedData) => {
        if (success) {
          updateStore(importedData)
          setShowImportModal(false)
          setSelectedFile(null)
          window.location.reload()
        }
      })
    }
  }

  const handleImportCancel = () => {
    setShowImportModal(false)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  return (
    <div style={{ padding: theme.spacing.xl }}>
      <h2 style={{ fontSize: theme.typography.h2, margin: `0 0 ${theme.spacing.xxl} 0`, color: theme.colors.textPrimary }}>Settings</h2>
      
      <div style={{
        background: theme.colors.bgCard,
        backdropFilter: theme.backdropFilter,
        WebkitBackdropFilter: theme.backdropFilter,
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing.lg,
        border: `1px solid ${theme.colors.borderSubtle}`,
        boxShadow: theme.shadows.card
      }}>
        <h3 style={{ 
          fontSize: theme.typography.h4, 
          margin: `0 0 ${theme.spacing.sm} 0`, 
          color: theme.colors.textPrimary,
          fontWeight: theme.typography.semiBold
        }}>
          Data Management
        </h3>
        <p style={{ 
          fontSize: theme.typography.body, 
          color: theme.colors.textSecondary, 
          margin: `0 0 ${theme.spacing.lg} 0`,
          lineHeight: 1.5
        }}>
          Export or import your application data for backup or transfer.
        </p>
        
        <button
          onClick={exportData}
          style={{
            width: '100%',
            padding: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            background: theme.colors.accentPurple,
            color: theme.colors.textPrimary,
            border: 'none',
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.h5,
            fontWeight: theme.typography.medium,
            cursor: 'pointer',
            transition: theme.transitions.normal
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1'
          }}
        >
          Export Data
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: theme.spacing.lg,
            background: 'rgba(124, 111, 255, 0.2)',
            color: theme.colors.accentPurple,
            border: `1px solid rgba(124, 111, 255, 0.35)`,
            borderRadius: theme.borderRadius.sm,
            fontSize: theme.typography.h5,
            fontWeight: theme.typography.medium,
            cursor: 'pointer',
            transition: theme.transitions.normal
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(124, 111, 255, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(124, 111, 255, 0.2)'
          }}
        >
          Import Data
        </button>
      </div>

      {showImportModal && (
        <>
          <div
            onClick={handleImportCancel}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: theme.zIndex.modal
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(28, 33, 40, 0.98)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: theme.borderRadius.xxxl,
            padding: theme.spacing.xxxl,
            width: '90%',
            maxWidth: '420px',
            zIndex: theme.zIndex.modal + 1,
            border: `1px solid ${theme.colors.borderMedium}`,
            boxShadow: theme.shadows.strong
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: theme.borderRadius.xl,
              background: 'rgba(255, 107, 157, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid rgba(255, 107, 157, 0.3)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b9d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>

            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: theme.typography.h3, 
              fontWeight: theme.typography.bold, 
              color: theme.colors.textPrimary,
              textAlign: 'center',
              letterSpacing: '-0.01em'
            }}>
              Replace All Data?
            </h3>

            <p style={{ 
              margin: '0 0 28px 0', 
              fontSize: theme.typography.body, 
              color: theme.colors.textSecondary,
              textAlign: 'center',
              lineHeight: 1.6
            }}>
              All your current data will be permanently replaced with the imported data. This action cannot be undone.
            </p>

            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <button
                onClick={handleImportCancel}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: theme.borderRadius.xl,
                  cursor: 'pointer',
                  fontSize: theme.typography.h6,
                  fontWeight: theme.typography.semiBold,
                  transition: theme.transitions.normal
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImportConfirm}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: 'linear-gradient(135deg, #ff6b9d, #ff8bb3)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: theme.borderRadius.xl,
                  cursor: 'pointer',
                  fontSize: theme.typography.h6,
                  fontWeight: theme.typography.semiBold,
                  boxShadow: theme.shadows.glow.pink,
                  transition: theme.transitions.normal
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 157, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = theme.shadows.glow.pink
                }}
              >
                Replace Data
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
