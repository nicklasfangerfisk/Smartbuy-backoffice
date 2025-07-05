# Supabase Setup Guide

This guide covers the complete setup process for Supabase in the SmartBack project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign up or log in
2. Click "New Project" and follow the instructions
3. Note your project URL and anon/public API key (found in Project Settings > API)

## 2. Database Schema & Migrations

All SQL migrations are located in the `migrations/` folder of this repository.

### Applying Migrations via Supabase SQL Editor

1. Open your Supabase project dashboard
2. Go to "SQL Editor"
3. Copy the contents of each migration file (in chronological order) from the `migrations/` folder and run them

### Applying Migrations via Supabase CLI

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
2. Authenticate and link your project:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
3. Apply migrations:
   ```bash
   supabase db push
   ```

## 3. Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**For Vercel deployment**, add these environment variables in the Vercel dashboard under "Environment Variables".

## 4. Generate TypeScript Types

After setting up the database schema, generate TypeScript types:

```bash
npx supabase gen types typescript --project-id <your-project-id> > src/general/supabase.types.ts
```

Or use the provided script:

```bash
./update-supabase-types.sh
```

## 5. Update Supabase Types

The `supabase.types.ts` file is auto-generated and should **never be edited manually**. 

To update the types file:

```bash
./update-supabase-types.sh
```

This script:
- Fetches the latest schema from Supabase
- Updates the types file automatically
- Overwrites any manual edits

## 6. Database Tables Overview

The SmartBack system uses the following main tables:

### Core Tables
- `products`: Product catalog and inventory
- `orders`: Customer orders and order management
- `orderitems`: Individual items within orders
- `users`: User accounts and authentication
- `suppliers`: Supplier information
- `purchaseorders`: Purchase order management
- `purchaseorderitems`: Items within purchase orders

### Support Tables
- `stock_movements`: Inventory movement tracking
- `tickets`: Support ticket system
- `sms_campaigns`: SMS marketing campaigns

### Views and Functions
- Various database views for reporting
- Stored procedures for complex operations
- Triggers for data integrity

## 7. Authentication Setup

Supabase handles authentication automatically. The application uses:

- **Email/Password authentication**
- **Session management** via Supabase Auth
- **Row Level Security (RLS)** for data protection
- **Protected routes** via React Router

## 8. Real-time Features

The application leverages Supabase's real-time capabilities for:
- Live inventory updates
- Real-time order status changes
- Collaborative editing features

## 9. Usage in the Application

The application connects to Supabase via:
- **Client**: `src/utils/supabaseClient.ts`
- **Types**: `src/general/supabase.types.ts`
- **API calls**: Throughout page components and utilities

## 10. Troubleshooting

### Common Issues

**Connection Issues:**
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure API keys are valid

**Type Errors:**
- Regenerate types after schema changes
- Check TypeScript compilation
- Verify import paths

**Migration Issues:**
- Apply migrations in chronological order
- Check for foreign key constraints
- Verify data integrity

### Useful Commands

```bash
# Test connection
supabase projects list

# Check migrations status
supabase db diff

# Reset local database (development only)
supabase db reset
```

## 11. Security Considerations

- **API Keys**: Never commit API keys to version control
- **Environment Variables**: Use proper environment variable management
- **RLS Policies**: Ensure proper Row Level Security policies
- **User Permissions**: Implement proper user role management

## 12. Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Guide](https://supabase.com/docs/guides/cli)
- [Supabase SQL Editor](https://app.supabase.com/project/_/sql)
- [TypeScript Type Generation](https://supabase.com/docs/guides/api/generating-types)

## 13. Migration Files

The migration files are organized chronologically:

```
migrations/
├── 2025-06-08-fix-orderitems-trigger.sql
├── 2025-06-08-orderitems-uuid.sql
├── 2025-06-09-order-rollups.sql
├── 2025-06-09-orderitems-discount-percent.sql
├── 2025-06-09-orderitems-unitprice.sql
├── 2025-06-09-orders-autonumber.sql
├── 2025-06-09-orders-discount.sql
├── 2025-06-09-orders-total-decimal.sql
├── 2025-06-16-purchaseorderitems.sql
├── 2025-06-16-purchaseorders-autonumber.sql
├── 2025-06-17-tickets-rls.sql
├── 2025-06-17-tickets.sql
├── 2025-06-24-create-sms-campaigns.sql
└── ... (additional migrations)
```

Apply these migrations in the order shown to ensure proper database setup.
