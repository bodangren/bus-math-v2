import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log(`Connecting to ${supabaseUrl}...`);

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function test() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success! Users found:', data.users.length);
    }
  } catch (e) {
    console.error('Exception:', e);
  }
}

test();
