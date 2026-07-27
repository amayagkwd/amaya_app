import CategoriesPanel from './CategoriesPanel'

export default function PaymentsSetup({ data, updateStore, autoOpenType }) {
  return (
    <CategoriesPanel 
      data={data} 
      updateStore={updateStore}
      autoOpenType={autoOpenType}
    />
  )
}
