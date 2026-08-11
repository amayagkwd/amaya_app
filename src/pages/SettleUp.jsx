import AddTransactionButton from '../components/common/AddTransactionButton'
import theme, { componentStyles } from '../theme'

export default function SettleUp({ onOpenBottomSheet }) {
  return (
    <>
      <div style={componentStyles.pageContainer}>
        <h2 style={componentStyles.pageHeader}>
          Settle Up
        </h2>
      </div>
      
      <AddTransactionButton onClick={onOpenBottomSheet} />
    </>
  )
}
