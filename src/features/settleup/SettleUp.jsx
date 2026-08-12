import AddTransactionButton from '../common/AddTransactionButton'
import theme, { componentStyles } from '../../theme'

export default function SettleUp({ onOpenBottomSheet }) {
  return (
    <>
      {/* Background gradient */}
      <div style={componentStyles.backgroundShine} />
      
      <div style={{ ...componentStyles.pageContainer, position: 'relative', zIndex: 1 }}>
        <h2 style={componentStyles.pageHeader}>
          Settle Up
        </h2>
      </div>
      
      <AddTransactionButton onClick={onOpenBottomSheet} />
    </>
  )
}
