-- ============================================================================
-- MIGRATION: Add Category Deletion Tracking
-- ============================================================================
-- This migration adds support for "soft delete" categories where:
-- 1. Categories are marked as deleted instead of being removed
-- 2. Users can choose to keep or delete transactions when deleting a category
-- 3. Deleted categories are shown in "Previous Categories" section
-- 4. Proper foreign key constraint between transactions and categories
-- ============================================================================

-- Step 1: Add new columns to categories table
ALTER TABLE categories
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN keep_transactions_on_delete BOOLEAN DEFAULT TRUE,
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Step 2: Create index for querying active/deleted categories
CREATE INDEX idx_categories_is_deleted ON categories(user_id, is_deleted);

-- Step 3: Modify transactions.category_id to be UUID (not TEXT)
-- This requires a multi-step process to avoid data loss

-- 3a. First, add a new column with UUID type
ALTER TABLE transactions ADD COLUMN category_id_uuid UUID;

-- 3b. Copy data from category_id to category_id_uuid (only valid UUIDs)
-- Special system categories like 'month-balance', 'initial-balance' will remain in old column
UPDATE transactions
SET category_id_uuid = category_id::UUID
WHERE category_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 3c. Drop the old TEXT column
ALTER TABLE transactions DROP COLUMN category_id;

-- 3d. Rename the new column to category_id
ALTER TABLE transactions RENAME COLUMN category_id_uuid TO category_id;

-- Step 4: Add foreign key constraint with NO CASCADE
-- This means transactions won't be auto-deleted when category is deleted
-- The application will handle deletion logic based on keep_transactions_on_delete flag
ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_category_id
FOREIGN KEY (category_id)
REFERENCES categories(id)
ON DELETE RESTRICT; -- Prevents accidental deletion from database

-- Step 5: Add index for category_id lookups
CREATE INDEX idx_transactions_category_id ON transactions(category_id);

-- Step 6: Comments for documentation
COMMENT ON COLUMN categories.is_deleted IS 'When TRUE, category is in "Previous Categories" section and hidden from active category lists';
COMMENT ON COLUMN categories.keep_transactions_on_delete IS 'User preference: if TRUE, transactions are kept when category is deleted; if FALSE, transactions are deleted too';
COMMENT ON COLUMN categories.deleted_at IS 'Timestamp when category was deleted (soft delete)';
COMMENT ON COLUMN transactions.category_id IS 'Foreign key to categories table. NULL for system transactions like month-balance, initial-balance';

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================
-- To rollback this migration:
-- ALTER TABLE transactions DROP CONSTRAINT fk_transactions_category_id;
-- ALTER TABLE categories DROP COLUMN is_deleted, DROP COLUMN keep_transactions_on_delete, DROP COLUMN deleted_at;
-- ALTER TABLE transactions ALTER COLUMN category_id TYPE TEXT USING category_id::TEXT;
