import PaymentsSetup from './PaymentsSetup'
import theme, { componentStyles } from '../../theme'

export default function Setup({ data, updateStore }) {
  return (
    <div style={componentStyles.pageContainer}>
      <h2 style={componentStyles.pageHeader}>Setup</h2>
      
      <PaymentsSetup 
        data={data} 
        updateStore={updateStore}
      />
    </div>
  )
}
