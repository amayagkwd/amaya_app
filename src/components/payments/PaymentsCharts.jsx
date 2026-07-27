import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

const COLORS = ['#10b981', '#4f46e5', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16']

export default function PaymentsCharts({ allTransactions, categories, country }) {
  const incomeBreakdown = useMemo(() => {
    const incomeTxns = allTransactions.filter(t => t.type === 'income')
    const total = incomeTxns.reduce((sum, t) => sum + t.amount, 0)
    
    const byCategory = {}
    incomeTxns.forEach(t => {
      const category = categories.find(c => c.id === t.categoryId)
      const name = category?.name || 'Unknown'
      byCategory[name] = (byCategory[name] || 0) + t.amount
    })
    
    const result = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0
    }))
    
    return result.length > 0 ? { data: result, total } : null
  }, [allTransactions, categories])
  
  const expenseBreakdown = useMemo(() => {
    const expenseTxns = allTransactions.filter(t => t.type === 'expense')
    const total = expenseTxns.reduce((sum, t) => sum + t.amount, 0)
    
    const byCategory = {}
    expenseTxns.forEach(t => {
      const category = categories.find(c => c.id === t.categoryId)
      const name = category?.name || 'Unknown'
      byCategory[name] = (byCategory[name] || 0) + t.amount
    })
    
    const result = Object.entries(byCategory).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0
    }))
    
    return result.length > 0 ? { data: result, total } : null
  }, [allTransactions, categories])
  
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
  
  return (
    <div>
      <ChartCard
        title="Income Breakdown"
        chartData={incomeBreakdown ? { ...incomeBreakdown, country } : null}
        colors={COLORS}
      />
      
      <ChartCard
        title="Expense Breakdown"
        chartData={expenseBreakdown ? { ...expenseBreakdown, country } : null}
        colors={COLORS.slice().reverse()}
        style={{ marginTop: '32px' }}
      />
      
      <ChartCard
        title="Needs vs Wants"
        chartData={needsVsWants ? { ...needsVsWants, country } : null}
        colors={['#4f46e5', '#f43f5e']}
        style={{ marginTop: '32px' }}
      />
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
