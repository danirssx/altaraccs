-- Database Migration Script for Ecommerce Features
-- Execute this script in your Supabase SQL Editor
-- This script is idempotent - safe to run multiple times

-- ============================================================================
-- 1. Add featured flag to product_variants table
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants'
    AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE product_variants
    ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

    RAISE NOTICE 'Added is_featured column to product_variants';
  ELSE
    RAISE NOTICE 'Column is_featured already exists in product_variants';
  END IF;
END $$;

-- Create index for faster featured product queries
CREATE INDEX IF NOT EXISTS idx_product_variants_featured
ON product_variants(is_featured)
WHERE is_featured = TRUE;

-- ============================================================================
-- 2. Ensure order statuses exist
-- ============================================================================
INSERT INTO order_statuses (code, name, description, sort_order, is_terminal) VALUES
('pending', 'Pending', 'Order received via WhatsApp, awaiting confirmation', 10, FALSE),
('confirmed', 'Confirmed', 'Order confirmed by customer', 20, FALSE),
('processing', 'Processing', 'Order being prepared', 30, FALSE),
('pickup_ready', 'Ready for Pickup', 'Order ready for store pickup', 35, FALSE),
('shipped', 'Shipped', 'Order shipped/out for delivery', 40, FALSE),
('delivered', 'Delivered', 'Order delivered to customer', 50, TRUE),
('cancelled', 'Cancelled', 'Order cancelled', 60, TRUE)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_terminal = EXCLUDED.is_terminal;

-- ============================================================================
-- 3. Create admin_users table for authentication
-- ============================================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own record" ON admin_users;
DROP POLICY IF EXISTS "Service role can insert admin users" ON admin_users;

-- Policy: Users can view their own record
CREATE POLICY "Users can view own record"
ON admin_users FOR SELECT
USING (auth.uid() = id);

-- Policy: Service role can insert admin users (for initial setup)
CREATE POLICY "Service role can insert admin users"
ON admin_users FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 4. Create your first admin user (REPLACE WITH YOUR CREDENTIALS)
-- ============================================================================
-- IMPORTANT: First, create a user via Supabase Auth UI or use this SQL:
-- Note: You need to create the auth user first, then add them to admin_users

-- Example (after creating auth user in Supabase Auth UI):
-- INSERT INTO admin_users (id, email, full_name)
-- VALUES (
--   'YOUR-USER-UUID-FROM-AUTH-USERS',
--   'admin@altara.com',
--   'Admin User'
-- );

-- To find your user UUID, run this query after creating the auth user:
-- SELECT id, email FROM auth.users WHERE email = 'admin@altara.com';

-- ============================================================================
-- 5. Optional: Add customer_preferences table for newsletter
-- ============================================================================
CREATE TABLE IF NOT EXISTS customer_preferences (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_newsletter BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can subscribe (public access)
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON customer_preferences;
CREATE POLICY "Anyone can subscribe to newsletter"
ON customer_preferences FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- 6. Add indexes for performance
-- ============================================================================
-- Index for orders by status
CREATE INDEX IF NOT EXISTS idx_orders_status_id ON orders(status_id);

-- Index for orders by customer email
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Index for orders by date
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Index for order items by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ============================================================================
-- 7. Update existing product_variants to mark some as featured (optional)
-- ============================================================================
-- Uncomment and customize this query to mark specific products as featured:
-- UPDATE product_variants
-- SET is_featured = TRUE
-- WHERE id IN (1, 2, 3, 4, 5, 6);  -- Replace with your actual product IDs

-- Or mark products with the most inventory as featured:
-- UPDATE product_variants pv
-- SET is_featured = TRUE
-- FROM inventory_current ic
-- WHERE pv.id = ic.product_id
-- AND ic.quantity > 0
-- ORDER BY ic.quantity DESC
-- LIMIT 6;

-- ============================================================================
-- SETUP INSTRUCTIONS
-- ============================================================================
-- After running this migration:
--
-- 1. Create your first admin user via Supabase Auth UI:
--    - Go to Authentication > Users > Add User
--    - Enter email and password
--    - Copy the User ID (UUID)
--
-- 2. Add the user to admin_users table:
--    INSERT INTO admin_users (id, email, full_name)
--    VALUES ('paste-user-uuid-here', 'admin@altara.com', 'Admin Name');
--
-- 3. Set your WhatsApp Business number in .env.local:
--    NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER=573001234567
--
-- 4. Test the admin login at: http://localhost:3000/admin/login
--
-- 5. Mark some products as featured:
--    UPDATE product_variants SET is_featured = TRUE WHERE id IN (1, 2, 3);
--
-- ============================================================================

-- Verify migration
SELECT
  'Migration completed successfully!' AS status,
  (SELECT COUNT(*) FROM order_statuses WHERE code IN ('pending', 'confirmed', 'processing')) AS order_statuses_count,
  (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_users')) AS admin_users_table_exists,
  (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'is_featured')) AS is_featured_column_exists;
