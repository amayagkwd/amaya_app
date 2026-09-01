# AMAYA - Personal Finance Tracker PWA

A minimalist progressive web app for tracking your personal finances.

## Features

- **Payments Tracking**: Log income and expenses with customizable categories
- **Dashboard**: Quick overview of current month finances with real-time balance
- **Budget Tracking**: Set monthly spending limits or savings goals with daily allowance calculations
- **Monthly/Yearly Views**: Toggle between monthly and yearly financial summaries
- **Insights**: Visual charts and analytics for spending patterns
- **Balance Management**: Automatic month-to-month balance carry-over or reset
- **Predictive Analytics**: Month-end projections and daily spend forecasts
- **Profile**: Manage personal preferences and country settings
- **Offline-First**: Works without internet connection
- **PWA Ready**: Install on any device (iOS, Android, Desktop)
- **Data Export/Import**: Backup and restore your complete financial data

## Tech Stack

- React + Vite
- React Router for navigation
- Recharts for visualizations
- localStorage for data persistence
- vite-plugin-pwa for PWA capabilities

## Getting Started

```bash
npm install
npm run dev
```

## Data Structure

All data is stored in localStorage under the key `amaya_data`:

- **Profile**: Personal info (name, DOB, country)
- **Payments**: Custom categories and transactions with timestamps
- **Settings**: Budget configuration, balance carry-over preferences, feature flags
- **Previous Categories**: Deleted categories archive for restoration

## Core Features

### Budget Modes
- **Spend X**: Fixed monthly spending cap with daily allowance
- **Keep Balance X**: Maintain minimum savings balance with flexible spending

### Balance Calculation
- Automatic balance carry-over between months (configurable)
- Manual balance adjustments with transaction history
- Initial balance setup for new users
- Month-end balance snapshots

### Category Management
- Customizable income and expense categories
- Need vs Want classification for expenses
- Category usage frequency tracking
- Category restoration from archive

### Analytics
- Month-end balance projections
- Daily spend forecasts based on historical data
- Income vs Expense breakdowns
- Monthly and yearly comparisons

## Export Data

Use the Profile panel to export your complete data as `amaya_backup.json`.
