import { useState, useMemo } from 'react'
import AddTransactionButton from '../components/common/AddTransactionButton'
import PeriodSelector from '../components/common/PeriodSelector'
import PaymentsCharts from '../components/payments/PaymentsCharts'
import { getMonthTransactions, getYearTransactions } from '../hooks/usePayments'
import theme, { componentStyles } from '../theme'

export default function Insights({ data, onOpenBottomSheet }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [isYearly, setIsYearly] = useState(false)
  
  const allTransactions = useMemo(() => {
    if (isYearly) {
      return getYearTransactions(data.payments.transactions, selectedYear)
    }
    return getMonthTransactions(
      data.payments.transactions,
      selectedDate.getFullYear(),
      selectedDate.getMonth()
    )
  }, [data.payments.transactions, selectedDate, selectedYear, isYearly])
  
  return (
    <>
      <div style={componentStyles.pageContainer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xl }}>
          <h2 style={componentStyles.pageHeaderSimple}>Insights</h2>
          
          <PeriodSelector
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            isYearly={isYearly}
            onYearlyToggle={setIsYearly}
          />
        </div>
        
        <PaymentsCharts
          allTransactions={allTransactions}
          categories={data.payments.categories}
          country={data.profile.country}
          isYearly={isYearly}
          selectedYear={selectedYear}
        />
      </div>
      
      <AddTransactionButton onClick={onOpenBottomSheet} />
    </>
  )
}
