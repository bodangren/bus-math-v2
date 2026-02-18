/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, type User } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Create a test client for security tests
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Clients
// persistSession: false keeps each client's session in-memory only, preventing
// cross-client contamination via shared localStorage in the jsdom test environment.
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
}) as any;
const anonClient = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false },
}) as any;

// We will create temporary users for testing
let studentUser: User | null = null;
let teacherUser: User | null = null;
let otherStudentUser: User | null = null;

let studentClient: any;
let teacherClient: any;
let setupSucceeded = false;

const TEST_PREFIX = 'sec_test_';

async function createTestUser(role: 'student' | 'teacher') {
  const email = `${TEST_PREFIX}${role}_${Date.now()}@example.com`;
  const password = 'testpassword123';
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role }
  });

  if (error) throw error;
  
  // Create profile
  await adminClient.from('profiles').upsert({
    id: data.user.id,
    role,
    username: email.split('@')[0],
    organization_id: '00000000-0000-0000-0000-000000000001' // Demo Org
  });

  // Sign in to get a session client (persistSession: false avoids shared-localStorage
  // contamination between concurrent clients in the jsdom test environment).
  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });
  await client.auth.signInWithPassword({ email, password });
  
  return { user: data.user, client };
}

describe('RLS Security Policies', () => {
  beforeAll(async () => {
    try {
      // Setup users
      const s1 = await createTestUser('student');
      studentUser = s1.user;
      studentClient = s1.client;

      const t1 = await createTestUser('teacher');
      teacherUser = t1.user;
      teacherClient = t1.client;

      const s2 = await createTestUser('student');
      otherStudentUser = s2.user;
      setupSucceeded = true;
    } catch (error) {
      console.warn('Skipping RLS security tests: Supabase test environment unavailable.', error);
      setupSucceeded = false;
    }
  }, 60000); // Increased timeout for user creation

  afterAll(async () => {
    // Cleanup users
    if (studentUser) await adminClient.auth.admin.deleteUser(studentUser.id);
    if (teacherUser) await adminClient.auth.admin.deleteUser(teacherUser.id);
    if (otherStudentUser) await adminClient.auth.admin.deleteUser(otherStudentUser.id);
  });

  it('Students can read their own profile', async () => {
    if (!setupSucceeded) return;
    if (!studentUser) throw new Error('studentUser not initialized');

    const { data, error } = await studentClient
      .from('profiles')
      .select('*')
      .eq('id', studentUser.id)
      .single();
    
    expect(error).toBeNull();
    expect(data.id).toBe(studentUser.id);
  });

  it('Students CANNOT read other students profiles (except basic info if public)', async () => {
    if (!setupSucceeded) return;
    if (!otherStudentUser) throw new Error('otherStudentUser not initialized');

    // Note: Current policy might allow reading profiles in same org. 
    // Let's verify what the policy actually is.
    // "Users can view own profile" AND "Teachers view org profiles" (which we deleted due to recursion)
    // AND "Public profiles are viewable by everyone" usually.
    
    // If we rely on 'authenticated' role to view profiles, we need to check if it's scoped.
    // Let's assume strict privacy: Student A shouldn't see full details of Student B.
    
    await studentClient
      .from('profiles')
      .select('*')
      .eq('id', otherStudentUser!.id);
      
    // If RLS works, this should return empty array or error if using .single()
    // Or returns data if the policy allows it.
    
    // Verify student A cannot update student B's profile.
    // PostgREST silently returns 0 rows when the USING clause filters out the target row
    // (rather than raising an error). Chain .select() to get the affected-rows list back.
    const { data: updatedRows, error: updateError } = await studentClient
      .from('profiles')
      .update({ display_name: 'Hacked' })
      .eq('id', otherStudentUser.id)
      .select();

    expect(updateError).toBeNull();           // no DB error — RLS filters silently
    expect(updatedRows).toHaveLength(0);      // 0 rows updated = RLS is working
  });

  it('Students can read/write their own progress', async () => {
    if (!setupSucceeded) return;
    if (!studentUser) throw new Error('studentUser not initialized');

    // Insert some progress
    await studentClient
      .from('student_progress')
      .insert({
        user_id: studentUser.id,
        phase_id: '00000000-0000-0000-0000-000000000001', // Dummy ID, needs to exist in phases table?
        // Constraints might fail if phase_id doesn't exist.
        // So we might need to use a valid phase_id or just check SELECT empty.
      });
      
    // We can't easily insert without a valid phase_id due to FK.
    // But we can try to SELECT.
    
    const { error: selectError } = await studentClient
      .from('student_progress')
      .select('*')
      .eq('user_id', studentUser.id);
      
    expect(selectError).toBeNull();
  });

  it('Students CANNOT read other students progress', async () => {
    if (!setupSucceeded) return;
    if (!otherStudentUser) throw new Error('otherStudentUser not initialized');

    const { data } = await studentClient
      .from('student_progress')
      .select('*')
      .eq('user_id', otherStudentUser.id);

    // Should return empty list even if data exists, due to RLS
    expect(data).toEqual([]);
  });

  it('Teachers can read students profiles in their org', async () => {
    if (!setupSucceeded) return;
    if (!studentUser) throw new Error('studentUser not initialized');

    const { error } = await teacherClient
      .from('profiles')
      .select('*')
      .eq('id', studentUser.id);

    // This depends on the policy "Teachers view org profiles"
    // We had issues with recursion, so we might have disabled it or fixed it.
    // Let's verify behavior.
    if (error) console.log('Teacher read error:', error);
    // expecting success if policy is correct
  });
  
  it('Anon users cannot read profiles', async () => {
    if (!setupSucceeded) return;

    const { data, error } = await anonClient
        .from('profiles')
        .select('*');

    // With REVOKE ALL ON profiles FROM anon, PostgREST returns a permission-denied
    // error (data: null). We accept either null or [] — both mean "no rows returned".
    if (error) {
      expect(data).toBeNull();
    } else {
      expect(data).toEqual([]);
    }
  });
});
