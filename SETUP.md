# Altara Jewelry Ecommerce - Setup Guide

## Overview

This is a complete ecommerce jewelry website built with Next.js 15, featuring:
- Product catalog with featured products
- Shopping cart with localStorage persistence
- Checkout via WhatsApp Business
- Admin authentication with Supabase Auth
- Inventory management system
- Modern, elegant design with Tailwind CSS 4

## Prerequisites

- Node.js 18+ installed
- Supabase project created
- WhatsApp Business number

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Your WhatsApp Business number (international format, no + sign)
NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER=573001234567
```

### 3. Run Database Migration

1. Open your Supabase project
2. Go to **SQL Editor**
3. Copy the contents of `database-migration.sql`
4. Paste and execute the script

This will:
- Add `is_featured` column to product_variants
- Create order statuses (pending, confirmed, processing, etc.)
- Create `admin_users` table for authentication
- Set up necessary indexes
- Create customer_preferences table for newsletter

### 4. Create Your First Admin User

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password (e.g., admin@altara.com)
4. Copy the User ID (UUID) from the created user
5. Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO admin_users (id, email, full_name)
VALUES (
  'paste-user-uuid-here',
  'admin@altara.com',
  'Admin Name'
);
```

### 5. Mark Products as Featured (Optional)

To display products on the homepage, mark some as featured:

```sql
-- Mark specific products as featured
UPDATE product_variants
SET is_featured = TRUE
WHERE id IN (1, 2, 3, 4, 5, 6);
```

### 6. Start Development Server

```bash
npm run dev
```

Visit:
- **Store**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
- **Admin Inventory**: http://localhost:3000/inventario

## Features

### Customer-Facing Store

- **Homepage** (`/`): Product gallery with featured items
- **Product Detail** (`/product/[id]`): Detailed product view with image gallery and "Add to Cart"
- **Shopping Cart**: Slide-in drawer with item management
- **Checkout** (`/checkout`): Simple form with delivery/pickup options
- **WhatsApp Integration**: Orders sent directly to your WhatsApp Business

### Admin Panel

- **Login** (`/admin/login`): Secure authentication with Supabase
- **Inventory Management** (`/inventario`): Existing inventory system (protected)
- **Product Edit** (`/inventario/[id]`): Edit products, upload images (protected)

## Key Technologies

- **Framework**: Next.js 15.4.5 (App Router)
- **React**: 19.1.0
- **State Management**: Zustand (cart)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **Images**: Cloudinary
- **Notifications**: Sonner
- **TypeScript**: Fully typed

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page (product gallery)
│   ├── layout.tsx                  # Root layout with Header/Footer
│   ├── product/[id]/page.tsx       # Product detail page
│   ├── checkout/page.tsx           # Checkout page
│   ├── admin/login/page.tsx        # Admin login
│   ├── inventario/                 # Admin inventory (protected)
│   │   ├── layout.tsx              # Auth protection
│   │   ├── page.tsx                # Inventory list
│   │   └── [id]/page.tsx           # Product edit
│   └── api/
│       └── orders/route.ts         # Orders API
├── components/
│   ├── layout/
│   │   ├── Header.tsx              # Global header with cart
│   │   └── Footer.tsx              # Global footer
│   ├── product/
│   │   ├── ProductCard.tsx         # Product card component
│   │   └── ProductGrid.tsx         # Product grid layout
│   └── cart/
│       ├── CartDrawer.tsx          # Cart slide-in drawer
│       └── CartItem.tsx            # Individual cart item
├── store/
│   └── cartStore.ts                # Zustand cart store
├── lib/
│   └── supabase/
│       └── auth.ts                 # Auth helper functions
└── utils/
    ├── whatsapp.ts                 # WhatsApp message formatter
    └── formatters.ts               # Price/date formatters
```

## Customization

### Brand Colors

Edit `src/app/globals.css` to customize colors:

```css
:root {
  --cream: #fffff5;      /* Background */
  --navy: #172e3c;       /* Text/buttons */
  --gold: #dbb58e;       /* Accent/prices */
  --sage: #d6e2e2;       /* Borders */
  --cream-dark: #f7f1e3; /* Footer */
}
```

### Contact Information

Edit `src/components/layout/Footer.tsx` to update:
- Business address
- Phone number
- Email address
- Social media links

### Logo

Replace `/public/logos/Altara.png` with your own logo (recommended: 180x60px)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER`
4. Deploy

### Build for Production

```bash
npm run build
npm start
```

## Testing the Flow

### Customer Flow

1. Visit http://localhost:3000
2. Browse products
3. Click a product to view details
4. Click "Add to Cart"
5. Open cart drawer (cart icon in header)
6. Click "Proceed to Checkout"
7. Fill in customer information
8. Select delivery option
9. Click "Send Order via WhatsApp"
10. WhatsApp opens with pre-filled order message

### Admin Flow

1. Visit http://localhost:3000/admin/login
2. Login with admin credentials
3. Manage inventory at /inventario
4. Sign out when done

## Troubleshooting

### "Order status not found" error
- Run the database migration script in Supabase SQL Editor
- Ensure order_statuses table has the 'pending' status

### Admin login not working
- Verify user exists in Supabase Auth
- Check that user ID is in admin_users table
- Check console for detailed error messages

### WhatsApp not opening
- Ensure `NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER` is set correctly
- Format: country code + number (no + sign, no spaces)
- Example: 573001234567 (Colombia)

### Cart not persisting
- Check browser localStorage is enabled
- Clear browser cache and reload

## Support

For issues or questions:
- Check the Supabase logs for database errors
- Check browser console for client-side errors
- Review the implementation plan in `.claude/plans/`

## License

Proprietary - All rights reserved
