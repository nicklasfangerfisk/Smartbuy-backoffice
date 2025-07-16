import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key present:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addNotesColumn() {
  try {
    console.log('Adding notes column to Orders table...');
    
    // Add the notes column
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Orders' AND column_name = 'notes'
          ) THEN
            ALTER TABLE "Orders" ADD COLUMN notes TEXT;
            COMMENT ON COLUMN "Orders".notes IS 'Optional notes or comments for the order';
            RAISE NOTICE 'Notes column added successfully';
          ELSE
            RAISE NOTICE 'Notes column already exists';
          END IF;
        END $$;
      `
    });

    if (error) {
      console.error('Error adding notes column:', error);
    } else {
      console.log('Migration completed successfully');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

addNotesColumn();
