import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { rateLimit, getClientIP, RATE_LIMITS } from "@/lib/rate-limit";

// This endpoint runs database migrations to add missing columns
// Protected by ADMIN_SECRET - must provide Bearer token
export async function POST(req: Request) {
  // Rate limiting - prevent brute force attacks
  const clientIP = getClientIP(req);
  const rateLimitResult = rateLimit(`setup:migrate:${clientIP}`, RATE_LIMITS.admin);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  // Admin secret check - prevent unauthorized access
  const adminSecret = process.env.ADMIN_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Server configuration error' },
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
  // Don't expose schema information publicly
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
