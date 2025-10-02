// Simple migration runner for H1/H2 banner structure
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🔄 Running H1/H2 banner migration...');

    // Add column_type column
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE banner_columns ADD COLUMN IF NOT EXISTS column_type TEXT DEFAULT 'h2_column'`
    });

    // Add constraint for column_type
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE banner_columns ADD CONSTRAINT IF NOT EXISTS check_column_type CHECK (column_type IN ('h1_group', 'h2_column'))`
    });

    // Add parent_h1_id column
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE banner_columns ADD COLUMN IF NOT EXISTS parent_h1_id UUID`
    });

    // Add group_title column
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE banner_columns ADD COLUMN IF NOT EXISTS group_title TEXT`
    });

    // Add logic_equation column
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE banner_columns ADD COLUMN IF NOT EXISTS logic_equation TEXT`
    });

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();