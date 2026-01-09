/**
 * Seed test users for development
 *
 * Run with: npx tsx scripts/seed-test-users.ts
 *
 * Creates fake team members in your organization for testing the knowledge graph.
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Load env from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test users with diverse departments and expertise
const TEST_USERS = [
  {
    first_name: 'Sarah',
    last_name: 'Chen',
    department: 'Engineering',
    major: 'Computer Science',
    expertise_text: 'Full-stack development with React and Node.js. Experienced in building scalable APIs, microservices architecture, and database optimization. Strong background in TypeScript and GraphQL.',
  },
  {
    first_name: 'Marcus',
    last_name: 'Johnson',
    department: 'Engineering',
    major: 'Software Engineering',
    expertise_text: 'Backend systems and infrastructure. Kubernetes, Docker, CI/CD pipelines. Performance optimization and monitoring. Previously built high-throughput data processing systems.',
  },
  {
    first_name: 'Emily',
    last_name: 'Rodriguez',
    department: 'Product',
    major: 'Business Administration',
    expertise_text: 'Product strategy and roadmap planning. User research, A/B testing, and data-driven decision making. Experience launching B2B SaaS products from 0 to 1.',
  },
  {
    first_name: 'David',
    last_name: 'Kim',
    department: 'Design',
    major: 'Interaction Design',
    expertise_text: 'UX/UI design with focus on enterprise applications. Design systems, accessibility, and user testing. Proficient in Figma and prototyping tools.',
  },
  {
    first_name: 'Lisa',
    last_name: 'Wang',
    department: 'Data Science',
    major: 'Statistics',
    expertise_text: 'Machine learning and predictive analytics. NLP, recommendation systems, and A/B test analysis. Python, TensorFlow, and SQL for large-scale data processing.',
  },
  {
    first_name: 'James',
    last_name: 'Thompson',
    department: 'Sales',
    major: 'Marketing',
    expertise_text: 'Enterprise sales and account management. Deal negotiation, pipeline management, and CRM optimization. Strong background in B2B SaaS sales cycles.',
  },
  {
    first_name: 'Priya',
    last_name: 'Patel',
    department: 'Marketing',
    major: 'Communications',
    expertise_text: 'Content marketing and SEO. Brand storytelling, demand generation, and marketing automation. Experience with HubSpot and content strategy.',
  },
  {
    first_name: 'Alex',
    last_name: 'Martinez',
    department: 'Engineering',
    major: 'Computer Science',
    expertise_text: 'Mobile development for iOS and Android. React Native and Flutter. App performance optimization and push notification systems.',
  },
];

async function main() {
  console.log('🌱 Seeding test users...\n');

  // First, get the organization to seed into
  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .limit(1)
    .single();

  if (orgError || !orgs) {
    console.error('❌ No organization found. Please create an organization first.');
    process.exit(1);
  }

  const organizationId = orgs.id;
  console.log(`📍 Using organization: ${orgs.name} (${organizationId})\n`);

  let created = 0;
  let skipped = 0;

  for (const user of TEST_USERS) {
    const userId = randomUUID();

    // Check if a profile with this name already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('first_name', user.first_name)
      .eq('last_name', user.last_name)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  ${user.first_name} ${user.last_name} already exists, skipping`);
      skipped++;
      continue;
    }

    // Create profile with basic columns only
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        organization_id: organizationId,
        first_name: user.first_name,
        last_name: user.last_name,
        department: user.department,
        major: user.major,
        expertise_text: user.expertise_text,
      });

    if (profileError) {
      console.error(`❌ Failed to create profile for ${user.first_name}:`, profileError.message);
      continue;
    }

    // Note: organization_members table is not needed since graph API now queries profiles directly
    console.log(`✅ Created ${user.first_name} ${user.last_name} (${user.department})`);
    created++;
  }

  console.log(`\n🎉 Done! Created ${created} users, skipped ${skipped} existing.`);
  console.log('Refresh your /groups page to see the knowledge graph!');
}

main().catch(console.error);
