import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import PaymentsSetup from '../components/payments/PaymentsSetup'
import PaymentsHistory from '../components/payments/PaymentsHistory'
import PaymentsCharts from '../components/payments/PaymentsCharts'
import EditTransactionModal from '../components/payments/EditTransactionModal'
import { formatCurrency } from '../utils/formatCurrency'
import { getMonthYear } from '../utils/formatDate'
import { getMonthTransactions, calculateMonthStats } from '../hooks/usePayments'

const SECTIONS = ['setup', 'history', 'charts']

export default function Payments({ data, updateStore, onDelete, onOpenBottomSheet }) {
  const location = useLocation()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [activeSection, setActiveSection] = useState('history')
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [slideOffset, setSlideOffset] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef(null)
  
  const minSwipeDistance = 50
  
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
  
  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance
    
    const currentIndex = SECTIONS.indexOf(activeSection)
    
    if (isLeftSwipe && currentIndex < SECTIONS.length - 1) {
      setActiveSection(SECTIONS[currentIndex + 1])
      setSlideOffset(0)
    } else if (isRightSwipe && currentIndex > 0) {
      setActiveSection(SECTIONS[currentIndex - 1])
      setSlideOffset(0)
    } else {
      setSlideOffset(0)
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }
  
  return (
    <>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '24px', margin: 0 }}>Payments</h2>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setMonthDropdownOpen(!monthDropdownOpen)}
              style={{
                padding: '8px 16px',
                background: '#f9f9f7',
                border: '1px solid #e5e5e3',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {getMonthYear(selectedDate)}
              <span style={{ fontSize: '12px' }}>▼</span>
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
                  left: 0,
                  marginTop: '4px',
                  background: '#fff',
                  border: '1px solid #e5e5e3',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                        padding: '12px 16px',
                        background: selectedDate.getMonth() === month.getMonth() && 
                                   selectedDate.getFullYear() === month.getFullYear() 
                                   ? '#f9f9f7' : 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderBottom: '1px solid #f9f9f7'
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
      </div>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Income" value={formatCurrency(stats.income, data.profile.country)} color="#10b981" />
        <StatCard label="Expenses" value={formatCurrency(stats.expenses, data.profile.country)} color="#f43f5e" />
        <StatCard label="Balance" value={formatCurrency(stats.balance, data.profile.country)} color={stats.balance >= 0 ? '#1a1a1a' : '#f43f5e'} />
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', position: 'relative' }}>
          {SECTIONS.map(section => (
            <button
              key={section}
              onClick={() => {
                setIsTransitioning(true)
                setActiveSection(section)
                setTimeout(() => setIsTransitioning(false), 300)
              }}
              style={{
                flex: 1,
                padding: '12px 0',
                background: 'none',
                border: 'none',
                color: activeSection === section ? '#1a1a1a' : '#9ca3af',
                fontWeight: activeSection === section ? 500 : 400,
                fontSize: '15px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                position: 'relative'
              }}
            >
              {section}
            </button>
          ))}
        </div>
        <div style={{ 
          height: '2px', 
          background: '#e5e5e3',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            height: '2px',
            background: '#4f46e5',
            width: '33.333%',
            left: activeSection === 'setup' ? '0%' : activeSection === 'history' ? '33.333%' : '66.666%',
            transition: 'left 0.3s ease'
          }} />
        </div>
      </div>
      
      <div 
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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
          <div style={{ width: 'calc(100% / 3)', flexShrink: 0, padding: '0 20px 0 0', boxSizing: 'border-box' }}>
            <PaymentsSetup 
              data={data} 
              updateStore={updateStore}
              autoOpenType={location.state?.categoryType}
            />
          </div>
          
          <div style={{ width: 'calc(100% / 3)', flexShrink: 0, padding: '0 20px 0 0', boxSizing: 'border-box' }}>
            <PaymentsHistory
              allTransactions={allTransactions}
              categories={data.payments.categories}
              country={data.profile.country}
              onDelete={onDelete}
              onEdit={handleEdit}
            />
          </div>
          
          <div style={{ width: 'calc(100% / 3)', flexShrink: 0, padding: '0 20px 0 0', boxSizing: 'border-box' }}>
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
          bottom: '80px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#4f46e5',
          border: 'none',
          color: '#fff',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
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
      background: '#fff',
      padding: '16px',
      borderRadius: '12px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 500, color }}>{value}</div>
    </div>
  )
}
