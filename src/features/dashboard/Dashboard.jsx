import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGreeting, getTodayDate } from '../../utils/formatDate'
import { formatCurrency } from '../../utils/formatCurrency'
import { getMonthTransactions, calculateMonthStats } from '../../hooks/usePayments'
import { calculateForecast } from './forecastCalculations'
import AddTransactionButton from '../common/AddTransactionButton'
import theme, { componentStyles } from '../../theme'

export default function Dashboard({ data, onOpenBottomSheet }) {
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const now = new Date()

    const transactions = getMonthTransactions(
      data.payments.transactions,
      now.getFullYear(),
      now.getMonth()
    )

    return calculateMonthStats(transactions)
  }, [data.payments.transactions])

  const forecast = useMemo(() => {
    return calculateForecast(data.payments.transactions, stats.balance)
  }, [data.payments.transactions, stats.balance])

  const showForecast = forecast !== null

  const balanceColor = stats.balance >= 0 ? theme.dashboardColors.cyan : theme.dashboardColors.pink

  return (
    <div
      style={{
        minHeight: '100%',
        boxSizing: 'border-box',
        padding: '20px 16px 128px',
        background: theme.dashboardColors.page,
        color: theme.dashboardColors.white,
        fontFamily: theme.typography.fontFamily,
        position: 'relative',
      }}
    >
      {/* Background shine effect */}
      <div style={componentStyles.backgroundShine} />
      {/* Greeting */}
      <section style={{ marginBottom: 18, position: 'relative', zIndex: 1 }}>
        <h2
          style={{
            ...componentStyles.greeting,
            margin: 0,
            color: theme.dashboardColors.white,
            fontSize: 'clamp(32px, 7vw, 42px)',
            lineHeight: 1.2,
            fontWeight: 800,
            letterSpacing: '-0.045em',
          }}
        >
          {getGreeting(data.profile.name).greeting},
          <br />
          {getGreeting(data.profile.name).name}.
        </h2>

        <p
          style={{
            ...componentStyles.greetingDate,
            margin: '8px 0 0',
            color: '#9BA9C2',
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          {getTodayDate()}
        </p>
      </section>

      {/* Payments */}
      <div
        onClick={() => navigate('/payments')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') navigate('/payments')
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.borderColor = 'rgba(0,229,204,0.28)'
          e.currentTarget.style.boxShadow = `${theme.dashboardShadows.card}, ${theme.dashboardShadows.cyan}`
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.borderColor = theme.dashboardColors.border
          e.currentTarget.style.boxShadow = theme.dashboardShadows.card
        }}
        style={{
          ...componentStyles.dashboardCard,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          padding: '18px 20px 18px',
          transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              ...componentStyles.dashboardIconBox('#B9B2FF', 'rgba(100,87,190,0.12)'),
              width: 36,
              height: 36,
              borderRadius: 11,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M3 8.5h18" stroke="currentColor" strokeWidth="1.8" />
                <path d="M15.5 13.5h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>

            <h3
              style={{
                margin: 0,
                color: theme.dashboardColors.muted,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '-0.02em',
              }}
            >
              Payments
            </h3>
          </div>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.dashboardColors.cyan,
              background: 'rgba(0,229,204,0.10)',
              border: '1px solid rgba(0,229,204,0.28)',
              boxShadow: '0 0 22px rgba(0,229,204,0.12)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 18V5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M4 18h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M7 14l3-3 2.5 2 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 7h1.5v1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            marginBottom: 14,
            color: balanceColor,
            fontSize: 'clamp(38px, 10vw, 50px)',
            lineHeight: 0.95,
            fontWeight: 850,
            letterSpacing: '-0.055em',
            position: 'relative',
          }}
        >
          {formatCurrency(stats.balance, data.profile.country)}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 999,
                background: theme.dashboardColors.cyanSoft,
                color: theme.dashboardColors.cyan,
                fontSize: 14,
                fontWeight: 750,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>↑</span>
              {formatCurrency(stats.income, data.profile.country)}
            </div>
            <div
              style={{
                marginTop: 5,
                paddingLeft: 5,
                color: theme.dashboardColors.cyan,
                fontSize: 12,
                fontWeight: 650,
              }}
            >
              Income
            </div>
          </div>

          <div
            style={{
              width: 1,
              minHeight: 32,
              background: 'rgba(157,174,196,0.24)',
              alignSelf: 'center',
            }}
          />

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 999,
                background: theme.dashboardColors.pinkSoft,
                color: theme.dashboardColors.pink,
                fontSize: 14,
                fontWeight: 750,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>↓</span>
              {formatCurrency(stats.expenses, data.profile.country)}
            </div>
            <div
              style={{
                marginTop: 5,
                paddingLeft: 5,
                color: theme.dashboardColors.pink,
                fontSize: 12,
                fontWeight: 650,
              }}
            >
              Expense
            </div>
          </div>
        </div>
      </div>

      {/* Forecast cards */}
      {showForecast && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 12,
            marginTop: 16,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Daily spend */}
          <div
            style={{
              ...componentStyles.forecastCard,
            }}
          >
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h3
                style={{
                  margin: 0,
                  color: theme.dashboardColors.muted,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                Daily Spend Forecast
              </h3>
              <p style={{
                marginTop: 14,
                fontFamily: theme.typography.fontFamily,
                fontSize: 26,
                fontWeight: 600,
                color: 'white',
                letterSpacing: '-0.02em',
              }}>
               ~{formatCurrency(forecast.dailySpendForecast, data.profile.country)}
              </p>
            </div>
          </div>

          {/* Month end */}
          <div
            style={{
              ...componentStyles.forecastCard,
            }}
          >
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h3
                style={{
                  margin: 0,
                  color: theme.dashboardColors.muted,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                Month End Projection
              </h3>
              <p style={{
                marginTop: 14,
                fontFamily: theme.typography.fontFamily,
                fontSize: 26,
                fontWeight: 600,
                color: 'white',
                letterSpacing: '-0.02em',
              }}>
                ~{formatCurrency(forecast.monthEndProjection, data.profile.country)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating add button is intentionally kept outside the cards. */}
      <AddTransactionButton onClick={onOpenBottomSheet} />

      {/* Small responsive correction for narrow screens. */}
      <style>{`
        @media (max-width: 560px) {
          .dashboard-forecast-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 430px) {
          .dashboard-forecast-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}