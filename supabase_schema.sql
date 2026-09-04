-- ============================================================================
-- Supabase Schema for Amaya Finance Tracker
-- ============================================================================
-- This schema is designed to match the existing localStorage data structure
-- EXACTLY, preserving the finalized balance calculation architecture.
--
-- Key Design Principles:
-- 1. Match localStorage field names and types precisely
-- 2. Preserve month-balance transaction structure (categoryId, isBalanceUpdate, balanceChange)
-- 3. Support the audited calculation logic in financialCalculations.js
-- 4. No changes to calculation behavior - just storage migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- Matches: data.profile { name, dob, country }
-- ============================================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  dob DATE NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- CATEGORIES TABLE
-- Matches: data.payments.categories[]
-- Fields: { id, name, type, classification, isDefault }
-- ============================================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'balance')),
  classification TEXT CHECK (classification IN ('need', 'want') OR classification IS NULL),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_user_type ON categories(user_id, type);

-- ============================================================================
-- TRANSACTIONS TABLE
-- Matches: data.payments.transactions[]
-- Fields: { id, type, amount, categoryId, date, note, classification, 
--           timestamp, paymentMode, isBalanceUpdate, balanceChange, category }
--
-- IMPORTANT: Preserves month-balance transaction structure:
-- - categoryId: 'month-balance'
-- - isBalanceUpdate: true
-- - balanceChange: numeric value (can be negative)
-- - type: 'balance-update'
-- - category: "Month's Balance" (descriptive name)
-- ============================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core transaction fields
  type TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  category_id TEXT,  -- TEXT not UUID to support special IDs like 'month-balance'
  category TEXT,     -- Denormalized for display (e.g., "July's Balance")
  date DATE NOT NULL,
  note TEXT,
  classification TEXT CHECK (classification IN ('need', 'want') OR classification IS NULL),
  timestamp BIGINT NOT NULL,
  payment_mode TEXT NOT NULL DEFAULT 'bank' CHECK (payment_mode IN ('bank', 'cash', 'credit')),
  
  -- Balance transaction fields
  -- These are used for month-balance carry-forward transactions
  is_balance_update BOOLEAN DEFAULT FALSE,
  balance_change NUMERIC(12, 2), -- Can be negative for deficit carry-forward
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for query performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_user_payment_mode ON transactions(user_id, payment_mode);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_category ON transactions(user_id, category_id);
CREATE INDEX idx_transactions_timestamp ON transactions(user_id, timestamp DESC);

-- ============================================================================
-- SETTINGS TABLE
-- Matches: data.settings {}
-- All fields from localStorage settings object
-- ============================================================================
CREATE TABLE settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Balance carry settings
  carry_balance_to_next_month BOOLEAN DEFAULT FALSE,
  last_checked_month TEXT, -- Format: "YYYY-MM"
  reset_balance_each_month BOOLEAN DEFAULT FALSE,
  
  -- Budget settings (nested in localStorage as settings.budget{})
  budget_enabled BOOLEAN DEFAULT FALSE,
  budget_mode TEXT CHECK (budget_mode IN ('spend', 'keep') OR budget_mode IS NULL),
  budget_amount NUMERIC(12, 2) DEFAULT 0,
  
  -- Onboarding and UI state
  initial_balance_skipped BOOLEAN DEFAULT FALSE,
  add_transaction_tip_seen BOOLEAN DEFAULT FALSE,
  tutorial_completed BOOLEAN DEFAULT FALSE,
  
  -- Payment modes
  is_cash_enabled BOOLEAN DEFAULT FALSE,
  is_credit_enabled BOOLEAN DEFAULT FALSE,
  
  -- Migration flags (to track data migrations)
  balance_timestamps_fixed BOOLEAN DEFAULT FALSE,
  month_balance_double_count_fixed BOOLEAN DEFAULT FALSE,
  payment_mode_migration_done BOOLEAN DEFAULT FALSE,
  
  -- Forecast settings
  predict_month_end BOOLEAN DEFAULT TRUE,
  has_seen_forecast BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- MIGRATION_STATUS TABLE
-- Tracks localStorage → Supabase migration per user
-- ============================================================================
CREATE TABLE migration_status (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  migrated BOOLEAN DEFAULT FALSE,
  migration_date TIMESTAMP WITH TIME ZONE,
  transactions_count INTEGER DEFAULT 0,
  categories_count INTEGER DEFAULT 0,
  source TEXT DEFAULT 'localStorage',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensure users can only access their own data
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE migration_status ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Categories policies
CREATE POLICY "Users can view own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Settings policies
CREATE POLICY "Users can view own settings"
  ON settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Migration status policies
CREATE POLICY "Users can view own migration status"
  ON migration_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own migration status"
  ON migration_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own migration status"
  ON migration_status FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- NOTES ON SCHEMA DESIGN
-- ============================================================================
--
-- 1. TRANSACTION.CATEGORY_ID is TEXT not UUID:
--    - Supports special values like 'month-balance', 'initial-balance'
--    - Matches localStorage behavior exactly
--    - Does not use foreign key to categories table
--
-- 2. MONTH-BALANCE TRANSACTIONS:
--    Example structure from localStorage:
--    {
--      "id": "f8338f97-a76c-401d-bee0-0bd4ea09d4cb",
--      "type": "balance-update",
--      "amount": 16850,
--      "category": "July's Balance",
--      "categoryId": "month-balance",
--      "date": "2026-08-01",
--      "note": null,
--      "timestamp": 1785522600000,
--      "isBalanceUpdate": true,
--      "balanceChange": 16850,
--      "paymentMode": "bank"
--    }
--    
--    These transactions are created by useMonthlyBalanceCarry.js and:
--    - Are INCLUDED in balance calculations (calculateStats)
--    - Are EXCLUDED from end-of-month calculations (calculateEndOfMonthBalance)
--    - This prevents double-counting during carry-forward
--
-- 3. SETTINGS.BUDGET_* FIELDS:
--    In localStorage: settings.budget { enabled, mode, amount }
--    In Supabase: Flattened to budget_enabled, budget_mode, budget_amount
--    Repository layer handles transformation
--
-- 4. NO SEPARATE PAYMENT_BALANCES TABLE:
--    Cash/credit balances can be calculated from transactions
--    Matches how localStorage stores them (derived, not separate storage)
--
-- 5. MIGRATION FLAGS:
--    Preserved from localStorage to track data migrations:
--    - balance_timestamps_fixed
--    - month_balance_double_count_fixed  
--    - payment_mode_migration_done
--
-- 6. CALCULATION SERVICE COMPATIBILITY:
--    This schema allows financialCalculations.js to work unchanged:
--    - Transactions loaded from DB have same structure as localStorage
--    - All fields used by calculations are present
--    - Special transaction types (month-balance) preserved
--    - No calculation logic changes needed
--
-- ============================================================================
