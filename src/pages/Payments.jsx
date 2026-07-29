import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import PaymentsSetup from '../components/payments/PaymentsSetup'
import PaymentsHistory from '../components/payments/PaymentsHistory'
import PaymentsCharts from '../components/payments/PaymentsCharts'
import EditTransactionModal from '../components/payments/EditTransactionModal'
import { formatCurrency } from '../utils/formatCurrency'
import { getMonthYear } from '../utils/formatDate'
import { getMonthTransactions, calculateMonthStats } from '../hooks/usePayments'
import theme from '../theme'

const SECTIONS = ['setup', 'history', 'charts']

export default function Payments({ data, updateStore, onDelete, onOpenBottomSheet }) {
  const location = useLocation()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeSection, setActiveSection] = useState('history')
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const containerRef = useRef(null)
  
  useEffect(() => {
    if (location.state?.openSetup) {
      setActiveSection('setup')
    }
  }, [location.state])
  
  const allTransactions = useMemo(() => {
    return getMonthTransactions(
      data.payments.transactions,
      selectedDate.getFullYear(),
      selectedDate.getMonth()
    )
  }, [data.payments.transactions, selectedDate])
  
  const stats = useMemo(() => calculateMonthStats(allTransactions), [allTransactions])
  
  const last12Months = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date)
    }
    return months
  }, [])
  
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
  }
  
  const handleSaveEdit = (updatedTransaction) => {
    updateStore(current => ({
      ...current,
      payments: {
        ...current.payments,
        transactions: current.payments.transactions.map(t =>
          t.id === updatedTransaction.id 
            ? { ...updatedTransaction, timestamp: t.timestamp || Date.now() } 
            : t
        )
      }
    }))
    setEditingTransaction(null)
  }
  
  const handleMonthSelect = (date) => {
    setSelectedDate(date)
    setMonthDropdownOpen(false)
  }
  
  return (
    <>
      <div style={{ padding: `${theme.spacing.xl}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <h2 style={{ fontSize: theme.typography.h2, margin: 0, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamilyHeading, fontWeight: theme.typography.bold }}>Payments</h2>
          
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                background: theme.colors.bgCard,
                border: `1px solid ${theme.colors.borderSubtle}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: theme.typography.body,
                display: 'flex',
                alignItems: 'center',
                WebkitTapHighlightColor: 'transparent',
                gap: theme.spacing.sm,
                color: theme.colors.textPrimary,
                fontWeight: theme.typography.medium,
                outline: 'none'
              }}
            >
              {getMonthYear(selectedDate)}
              <span style={{ fontSize: theme.typography.caption }}>▼</span>
            </button>
            {monthDropdownOpen && (
              <>
                <div
                  onClick={() => setMonthDropdownOpen(false)}
                  style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 10
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: theme.colors.bgModal,
                  backdropFilter: theme.backdropFilter,
                  WebkitBackdropFilter: theme.backdropFilter,
                  border: `1px solid ${theme.colors.borderSubtle}`,
                  borderRadius: theme.borderRadius.sm,
                  boxShadow: theme.shadows.card,
                  zIndex: 11,
                  minWidth: '150px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {last12Months.map(month => (
                    <button
                      key={month.getTime()}
                      onClick={() => handleMonthSelect(month)}
                      style={{
                        width: '100%',
                        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                        background: selectedDate.getMonth() === month.getMonth() && 
                                   selectedDate.getFullYear() === month.getFullYear() 
                                   ? theme.colors.bgCardHover : 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: theme.typography.body,
                        color: theme.colors.textPrimary,
                        borderBottom: `1px solid ${theme.colors.borderSubtle}`,
                        outline: 'none'
                      }}
                    >
                      {getMonthYear(month)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      
      <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.xl }}>
        <StatCard label="Income" value={formatCurrency(stats.income, data.profile.country)} color={theme.colors.accentCyan} />
        <StatCard label="Expenses" value={formatCurrency(stats.expenses, data.profile.country)} color={theme.colors.accentPink} />
        <StatCard label="Balance" value={formatCurrency(stats.balance, data.profile.country)} color={stats.balance >= 0 ? theme.colors.textPrimary : theme.colors.accentPink} />
      </div>
      
      <div style={{ marginBottom: theme.spacing.xxl }}>
        <div style={{ display: 'flex', position: 'relative' }}>
          {SECTIONS.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              style={{
                flex: 1,
                padding: `${theme.spacing.md} 0`,
                background: 'none',
                border: 'none',
                color: activeSection === section ? theme.colors.textPrimary : theme.colors.textSecondary,
                fontWeight: activeSection === section ? theme.typography.medium : theme.typography.regular,
                fontSize: theme.typography.h6,
                cursor: 'pointer',
                textTransform: 'capitalize',
                position: 'relative',
                outline: 'none'
              }}
            >
              {section}
            </button>
          ))}
        </div>
        <div style={{ 
          height: '2px', 
          background: theme.colors.borderSubtle,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            height: '2px',
            background: theme.colors.accentPurple,
            width: '33.333%',
            left: activeSection === 'setup' ? '0%' : activeSection === 'history' ? '33.333%' : '66.666%',
            transition: 'left 0.3s ease',
            boxShadow: `0 0 8px ${theme.colors.accentPurple}`
          }} />
        </div>
      </div>
      
      <div 
        ref={containerRef}
        style={{
          overflow: 'hidden',
          position: 'relative',
          minHeight: '400px',
          width: '100%'
        }}
      >
        <div style={{
          display: 'flex',
          transform: `translateX(calc(-${SECTIONS.indexOf(activeSection) * (100/3)}%))`,
          transition: 'transform 0.3s ease-out',
          width: '300%',
          willChange: 'transform'
        }}>
          <div 
            style={{ width: 'calc(100% / 3)', flexShrink: 0, padding: '0', boxSizing: 'border-box' }}
          >
            <PaymentsSetup 
              data={data} 
              updateStore={updateStore}
              autoOpenType={location.state?.categoryType}
            />
          </div>
          
          <div 
            style={{ width: 'calc(100% / 3)', flexShrink: 0, padding: '0', boxSizing: 'border-box' }}
          >
            <PaymentsHistory
              allTransactions={allTransactions}
              categories={data.payments.categories}
              country={data.profile.country}
              onDelete={onDelete}
              onEdit={handleEdit}
            />
          </div>
          
          <div 
            style={{ width: 'calc(100% / 3)', flexShrink: 0, padding: '0', boxSizing: 'border-box' }}
          >
            <PaymentsCharts
              allTransactions={allTransactions}
              categories={data.payments.categories}
              country={data.profile.country}
            />
          </div>
        </div>
      </div>
      
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          categories={data.payments.categories}
          onSave={handleSaveEdit}
          onClose={() => setEditingTransaction(null)}
        />
      )}
      </div>
      
      <button
        onClick={onOpenBottomSheet}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c6fff 0%, #a78bff 100%)',
          border: 'none',
          color: '#fff',
          fontSize: '36px',
          cursor: 'pointer',
          boxShadow: theme.shadows.fab,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: theme.zIndex.fab,
          transition: theme.transitions.smooth,
          fontWeight: theme.typography.light,
          lineHeight: 1,
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08) translateY(-2px)'
          e.currentTarget.style.boxShadow = theme.shadows.fabHover
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)'
          e.currentTarget.style.boxShadow = theme.shadows.fab
        }}
      >
        +
      </button>
    </>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      flex: 1,
      background: theme.colors.bgCard,
      backdropFilter: theme.backdropFilter,
      WebkitBackdropFilter: theme.backdropFilter,
      padding: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      textAlign: 'center',
      border: `1px solid ${theme.colors.borderSubtle}`,
      boxShadow: theme.shadows.card
    }}>
      <div style={{ fontSize: theme.typography.caption, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontWeight: theme.typography.medium }}>{label}</div>
      <div style={{ fontSize: theme.typography.h3, fontWeight: theme.typography.semiBold, color }}>{value}</div>
    </div>
  )
}
