import { useState, useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import CategoriesPanel from '../components/CategoriesPanel'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate, getMonthYear } from '../utils/formatDate'
import { getMonthTransactions, calculateMonthStats } from '../hooks/usePayments'

const COLORS = ['#10b981', '#4f46e5', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16']

export default function Payments({ data, updateStore, onDelete }) {
  const location = useLocation()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [filter, setFilter] = useState('all')
  const [activeSection, setActiveSection] = useState('history')
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  
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
  
  const transactions = useMemo(() => {
    if (filter === 'all') return allTransactions
    return allTransactions.filter(t => t.type === filter)
  }, [allTransactions, filter])
  
  const stats = useMemo(() => calculateMonthStats(allTransactions), [allTransactions])
  
  const groupedTransactions = useMemo(() => {
    const groups = {}
    transactions
      .sort((a, b) => {
        // First sort by date (newest dates first)
        const dateCompare = new Date(b.date) - new Date(a.date)
        if (dateCompare !== 0) return dateCompare
        // Within same date, sort by timestamp (newest first)
        return (b.timestamp || 0) - (a.timestamp || 0)
      })
      .forEach(t => {
        if (!groups[t.date]) groups[t.date] = []
        groups[t.date].push(t)
      })
    return groups
  }, [transactions])
  
  const incomeBreakdown = useMemo(() => {
    const incomeTxns = allTransactions.filter(t => t.type === 'income')
    const total = incomeTxns.reduce((sum, t) => sum + t.amount, 0)
    
    const byCategory = {}
    incomeTxns.forEach(t => {
      const category = data.payments.categories.find(c => c.id === t.categoryId)
      const name = category?.name || 'Unknown'
      byCategory[name] = (byCategory[name] || 0) + t.amount
    })
    
    const result = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0
    }))
    
    return result.length > 0 ? { data: result, total } : null
  }, [allTransactions, data.payments.categories])
  
  const expenseBreakdown = useMemo(() => {
    const expenseTxns = allTransactions.filter(t => t.type === 'expense')
    const total = expenseTxns.reduce((sum, t) => sum + t.amount, 0)
    
    const byCategory = {}
    expenseTxns.forEach(t => {
      const category = data.payments.categories.find(c => c.id === t.categoryId)
      const name = category?.name || 'Unknown'
      byCategory[name] = (byCategory[name] || 0) + t.amount
    })
    
    const result = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0
    }))
    
    return result.length > 0 ? { data: result, total } : null
  }, [allTransactions, data.payments.categories])
  
  const needsVsWants = useMemo(() => {
    const expenseTxns = allTransactions.filter(t => t.type === 'expense')
    const total = expenseTxns.reduce((sum, t) => sum + t.amount, 0)
    
    const needs = expenseTxns.filter(t => t.classification === 'need').reduce((sum, t) => sum + t.amount, 0)
    const wants = expenseTxns.filter(t => t.classification === 'want').reduce((sum, t) => sum + t.amount, 0)
    
    if (needs === 0 && wants === 0) return null
    
    return {
      data: [
        { name: 'Needs', value: needs, percentage: total > 0 ? Math.round((needs / total) * 100) : 0 },
        { name: 'Wants', value: wants, percentage: total > 0 ? Math.round((wants / total) * 100) : 0 }
      ],
      total
    }
  }, [allTransactions])
  
  const last12Months = useMemo(() => {
    const months = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(date)
    }
    return months
  }, [])
  
  const handleDelete = (id) => {
    if (confirm('Delete this transaction?')) {
      onDelete(id)
    }
  }
  
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
          {['setup', 'history', 'charts'].map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
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
      
      {activeSection === 'setup' && (
        <CategoriesPanel 
          data={data} 
          updateStore={updateStore}
          autoOpenType={location.state?.categoryType}
        />
      )}
      
      {activeSection === 'history' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#6b7280', marginRight: '4px' }}>Filter:</span>
            {['all', 'income', 'expense'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px',
                  background: filter === f ? '#4f46e5' : '#f3f4f6',
                  color: filter === f ? '#fff' : '#6b7280',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textTransform: 'capitalize',
                  fontWeight: filter === f ? 500 : 400
                }}
              >
                {f}
              </button>
            ))}
          </div>
          
          {Object.keys(groupedTransactions).length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <div>No transactions this month</div>
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([date, txns]) => (
              <div key={date} style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#6b7280',
                  marginBottom: '8px'
                }}>
                  {formatDate(date)}
                </div>
                {txns.map(t => {
                  const category = data.payments.categories.find(c => c.id === t.categoryId)
                  return (
                    <div
                      key={t.id}
                      style={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{category?.name || 'Unknown'}</div>
                        {t.note && (
                          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                            {t.note}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontWeight: 500,
                          color: t.type === 'income' ? '#10b981' : '#f43f5e'
                        }}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, data.profile.country)}
                        </span>
                        <button
                          onClick={() => handleEdit(t)}
                          className="btn-edit"
                        >
                          <img 
                            src="/edit-pencil-01-svgrepo-com.svg" 
                            alt="Edit"
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="btn-delete"
                        >
                          <img 
                            src="/trash-blank-alt-svgrepo-com.svg" 
                            alt="Delete"
                          />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}
      
      {activeSection === 'charts' && (
        <div>
          <ChartCard
            title="Income Breakdown"
            chartData={incomeBreakdown ? { ...incomeBreakdown, country: data.profile.country } : null}
            colors={COLORS}
          />
          
          <ChartCard
            title="Expense Breakdown"
            chartData={expenseBreakdown ? { ...expenseBreakdown, country: data.profile.country } : null}
            colors={COLORS.slice().reverse()}
            style={{ marginTop: '32px' }}
          />
          
          <ChartCard
            title="Needs vs Wants"
            chartData={needsVsWants ? { ...needsVsWants, country: data.profile.country } : null}
            colors={['#4f46e5', '#f43f5e']}
            style={{ marginTop: '32px' }}
          />
        </div>
      )}
      
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          categories={data.payments.categories}
          onSave={handleSaveEdit}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
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

function ChartCard({ title, chartData, colors, style }) {
  if (!chartData) {
    return (
      <div style={{ 
        background: '#fff',
        padding: '16px',
        borderRadius: '12px',
        ...style
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px', margin: '0 0 16px 0' }}>{title}</h4>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: '#6b7280'
        }}>
          No data available
        </div>
      </div>
    )
  }
  
  return (
    <div style={{ 
      background: '#fff',
      padding: '16px',
      borderRadius: '12px',
      ...style
    }}>
      <h4 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px', margin: '0 0 16px 0' }}>{title}</h4>
      
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData.data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              dataKey="value"
            >
              {chartData.data.map((entry, index) => (
                <Cell key={index} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 500, color: '#1a1a1a' }}>
            {formatCurrency(chartData.total, chartData.country)}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '16px' }}>
        {chartData.data.map((entry, index) => (
          <div 
            key={entry.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0',
              fontSize: '13px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: colors[index % colors.length]
              }} />
              <span style={{ color: '#1a1a1a' }}>{entry.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{formatCurrency(entry.value, chartData.country)}</span>
              <span style={{ color: '#6b7280', minWidth: '35px', textAlign: 'right' }}>{entry.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


function EditTransactionModal({ transaction, categories, onSave, onClose }) {
  const [amount, setAmount] = useState(transaction.amount.toString())
  const [categoryId, setCategoryId] = useState(transaction.categoryId)
  const [date, setDate] = useState(transaction.date)
  const [note, setNote] = useState(transaction.note || '')
  
  const filteredCategories = categories.filter(c => c.type === transaction.type)
  const canSave = amount > 0 && categoryId
  
  const handleSave = () => {
    const category = categories.find(c => c.id === categoryId)
    onSave({
      ...transaction,
      amount: parseFloat(amount),
      categoryId,
      date,
      note: note.trim() || null,
      classification: category.classification
    })
  }
  
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 300
        }}
      />
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderRadius: '16px 16px 0 0',
        padding: '20px',
        zIndex: 301,
        maxWidth: '480px',
        margin: '0 auto',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{
          width: '40px',
          height: '4px',
          background: '#e5e5e3',
          borderRadius: '2px',
          margin: '0 auto 20px'
        }} />
        
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
          Edit Transaction
        </h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
            Amount
          </label>
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
            Category
          </label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box',
              background: '#fff'
            }}
          >
            {filteredCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#1a1a1a', fontWeight: 500 }}>
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g. California burrito"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '16px',
              background: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            style={{
              flex: 1,
              padding: '16px',
              background: canSave ? '#4f46e5' : '#e5e5e3',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: canSave ? 'pointer' : 'not-allowed'
            }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  )
}
