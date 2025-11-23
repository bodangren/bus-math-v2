
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsers() {
  console.log('Checking demo users...');
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('Error listing users:', error);
    return;
  }

  const demoTeacher = users.find(u => u.email === 'demo_teacher@internal.domain');
  const demoStudent = users.find(u => u.email === 'demo_student@internal.domain');

  console.log('Demo Teacher Auth:', demoTeacher ? 'Found' : 'Missing');
  console.log('Demo Student Auth:', demoStudent ? 'Found' : 'Missing');

  if (demoTeacher) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', demoTeacher.id).single();
    console.log('Demo Teacher Profile:', profile ? 'Found' : 'Missing', profile);
  }

  if (demoStudent) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', demoStudent.id).single();
    console.log('Demo Student Profile:', profile ? 'Found' : 'Missing', profile);
  }
}

checkUsers();
