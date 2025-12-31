import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint runs database migrations to add missing columns
// Only works with service role key (not exposed to client)
export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Missing Supabase credentials. Set SUPABASE_SERVICE_ROLE_KEY in .env' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const migrations = [
    // Profiles table
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currently_available BOOLEAN DEFAULT false`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_to_help BOOLEAN DEFAULT true`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_group_size INTEGER DEFAULT 3`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS knowledge_areas TEXT[]`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_handle TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_user_id TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_access_token TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_team_id TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_connected BOOLEAN DEFAULT false`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT`,
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true`,
    // Pods table
    `ALTER TABLE pods ADD COLUMN IF NOT EXISTS manager_id UUID`,
    `ALTER TABLE pods ADD COLUMN IF NOT EXISTS allow_cross_pod_help BOOLEAN DEFAULT true`,
  ];

  const results = [];

  for (const sql of migrations) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        // Try alternative method - direct query
        const { error: error2 } = await supabase.from('_migrations').select('*').limit(0);
        results.push({ sql: sql.substring(0, 50) + '...', status: 'skipped', note: 'RPC not available' });
      } else {
        results.push({ sql: sql.substring(0, 50) + '...', status: 'success' });
      }
    } catch (e: any) {
      results.push({ sql: sql.substring(0, 50) + '...', status: 'error', error: e.message });
    }
  }

  return NextResponse.json({
    message: 'Migration attempted. Please run SQL manually in Supabase dashboard if RPC is not enabled.',
    results,
    manualSql: migrations.join(';\n') + ';'
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to run migrations, or copy the SQL below to run in Supabase SQL Editor',
    sql: `
-- Run this in Supabase SQL Editor (Database > SQL Editor)

-- Profiles table updates
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currently_available BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS looking_to_help BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_group_size INTEGER DEFAULT 3;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS knowledge_areas TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_handle TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_user_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_access_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_team_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slack_connected BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Pods table updates
ALTER TABLE pods ADD COLUMN IF NOT EXISTS manager_id UUID;
ALTER TABLE pods ADD COLUMN IF NOT EXISTS allow_cross_pod_help BOOLEAN DEFAULT true;
    `.trim()
  });
}
