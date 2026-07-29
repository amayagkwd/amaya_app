export default function DashboardCard({ 
  children, 
  size = 'half', 
  cardId,
  style = {} 
}) {
  return (
    <div
      data-card-id={cardId}
      style={{
        gridColumn: size === 'full' ? 'span 2' : 'span 1',
        position: 'relative',
        minWidth: 0,
        ...style
      }}
    >
      {children}
    </div>
  )
}
