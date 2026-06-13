import { getMonthYear } from '../utils/formatDate'

export default function MonthSelector({ date, onPrev, onNext, disableNext }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0'
    }}>
      <button
        onClick={onPrev}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '8px'
        }}
      >
        ←
      </button>
      <span style={{ fontSize: '18px', fontWeight: 500 }}>
        {getMonthYear(date)}
      </span>
      <button
        onClick={onNext}
        disabled={disableNext}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: disableNext ? 'not-allowed' : 'pointer',
          padding: '8px',
          opacity: disableNext ? 0.3 : 1
        }}
      >
        →
      </button>
    </div>
  )
}
