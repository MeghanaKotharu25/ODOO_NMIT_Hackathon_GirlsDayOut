/**
 * Server-side Admin Auth Provisioning Script
 * 
 * IMPORTANT SECURITY RULES:
 * 1. This script is intended ONLY to be executed locally or in backend CI via Node.js:
 *    node scripts/provision-auth-users.js
 * 2. Uses process.env.SUPABASE_SERVICE_ROLE_KEY (NOT VITE_ keys, NEVER in browser code).
 * 3. Never commit real service_role keys to Git.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://tdiztowzchvtvfxakgql.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  console.error('Example: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/provision-auth-users.js');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const defaultUsers = [
  { email: 'sarah.chen@dayflow.io', password: 'Password123!', firstName: 'Sarah', lastName: 'Chen' },
  { email: 'marcus.j@dayflow.io', password: 'Password123!', firstName: 'Marcus', lastName: 'Johnson' },
  { email: 'elena.r@dayflow.io', password: 'Password123!', firstName: 'Elena', lastName: 'Rodriguez' },
  { email: 'david.kim@dayflow.io', password: 'Password123!', firstName: 'David', lastName: 'Kim' },
  { email: 'aisha.p@dayflow.io', password: 'Password123!', firstName: 'Aisha', lastName: 'Patel' },
  { email: 'james.w@dayflow.io', password: 'Password123!', firstName: 'James', lastName: 'Wilson' },
  { email: 'chloe.m@dayflow.io', password: 'Password123!', firstName: 'Chloe', lastName: 'Martin' },
  { email: 'daniel.g@dayflow.io', password: 'Password123!', firstName: 'Daniel', lastName: 'Garcia' },
  { email: 'sophia.l@dayflow.io', password: 'Password123!', firstName: 'Sophia', lastName: 'Lee' },
  { email: 'liam.b@dayflow.io', password: 'Password123!', firstName: 'Liam', lastName: 'Brown' },
  { email: 'olivia.t@dayflow.io', password: 'Password123!', firstName: 'Olivia', lastName: 'Taylor' },
  { email: 'noah.a@dayflow.io', password: 'Password123!', firstName: 'Noah', lastName: 'Anderson' },
];

async function provisionUsers() {
  console.log('Starting Auth user provisioning via Admin Auth API...');
  for (const user of defaultUsers) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { first_name: user.firstName, last_name: user.lastName }
    });

    if (error) {
      if (error.message?.includes('already exists') || error.status === 422) {
        console.log(`User ${user.email} already exists.`);
      } else {
        console.error(`Failed to create ${user.email}:`, error.message);
      }
    } else {
      console.log(`Successfully created Auth user: ${user.email} (ID: ${data.user?.id})`);
    }
  }
  console.log('Auth user provisioning complete.');
}

provisionUsers().catch(console.error);
