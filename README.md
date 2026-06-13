# AMAYA - Personal Life Tracker PWA

A minimalist progressive web app for tracking your finances and daily life.

## Features

- **Payments Tracking**: Log income and expenses with categories
- **Dashboard**: Quick overview of current month finances
- **Charts**: Visual insights into spending patterns
- **Profile**: Store personal preferences and locations
- **Offline-First**: Works without internet connection
- **PWA Ready**: Install on any device

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

- Profile: personal info, locations, schedules
- Payments: categories and transactions
- Cards: (coming in Phase 2)

## Default Categories

On first launch, the app seeds 14 default categories:
- Income: Salary, Hisaab, Previous Month
- Needs: Rent, Food, Groceries, Travel, Cash
- Wants: Alcohol, Vape, Snacks, Movies, Stupid Stuff, Experiences

## Export Data

Use the Profile panel to export your complete data as `amaya_backup.json`.

## PWA Icons

Replace `/public/icon-192.png` and `/public/icon-512.png` with actual PNG icons before deploying.
