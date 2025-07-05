# Supabase Setup

This page documents how to set up Supabase for the Smartbuy Backoffice project.

## 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com/) and sign up or log in.
- Click "New Project" and follow the instructions.
- Note your project URL and anon/public API key (found in Project Settings > API).

## 2. Database Schema & Migrations
- All SQL migrations are in the `migrations/` folder of this repository.
- You can apply migrations using the Supabase SQL editor or the Supabase CLI.

### Applying Migrations via Supabase SQL Editor
1. Open your Supabase project dashboard.
2. Go to "SQL Editor".
3. Copy the contents of each migration file (in order) from the `migrations/` folder and run them.

### Applying Migrations via Supabase CLI
1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Authenticate and link your project.
3. Run:
   ```bash
   supabase db push
   ```
   or apply each migration manually as needed.

## 3. Regenerate Supabase Types
After changing the schema, regenerate the TypeScript types:
```bash
npx supabase gen types typescript --project-id <your-project-id> > components/general/supabase.types.ts
```

## 4. Environment Variables
Add your Supabase credentials to your environment:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

## 5. Usage in the App
- The app uses `utils/supabaseClient.ts` to connect to Supabase.
- All database operations use the generated types for type safety.

## 6. Updating Supabase Types

The `supabase.types.ts` file is auto-generated and should never be edited manually. To update the file, run the following command:

```bash
./update-supabase-types.sh
```

This script fetches the latest schema from Supabase and updates the file accordingly. Any manual edits will be overwritten.

## 7. Useful Links
- [Supabase Docs](https://supabase.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Supabase SQL Editor](https://app.supabase.com/project/_/sql)

---
For more details, see the main README or ask in the project discussions.
