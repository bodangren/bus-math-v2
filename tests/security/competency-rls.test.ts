import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { config } from 'dotenv';

config({ path: '.env.local' });

// Create test clients for security tests
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Clients
const adminClient = createClient(supabaseUrl, serviceRoleKey);

// Test users
let studentAUser: { id: string };
let studentBUser: { id: string };
let teacherUser: { id: string };
let testClassId: string;
let testStandardId: string;

let studentAClient: ReturnType<typeof createClient>;
let teacherClient: ReturnType<typeof createClient>;

const TEST_PREFIX = 'comp_rls_test_';

async function createTestUser(role: 'student' | 'teacher', suffix: string = '') {
  const email = `${TEST_PREFIX}${role}${suffix}_${Date.now()}@example.com`;
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

  // Sign in to get a session client
  const client = createClient(supabaseUrl, anonKey);
  await client.auth.signInWithPassword({ email, password });

  return { user: data.user, client };
}

describe('Competency RLS Security Policies', () => {
  beforeAll(async () => {
    // Setup users
    const sA = await createTestUser('student', '_a');
    studentAUser = sA.user;
    studentAClient = sA.client;

    const sB = await createTestUser('student', '_b');
    studentBUser = sB.user;

    const t1 = await createTestUser('teacher');
    teacherUser = t1.user;
    teacherClient = t1.client;

    // Create a test class with the teacher
    const { data: classData, error: classError } = await adminClient
      .from('classes')
      .insert({
        teacher_id: teacherUser.id,
        name: 'Test Class for RLS',
        description: 'Testing competency RLS policies'
      })
      .select()
      .single();

    if (classError) throw classError;
    testClassId = classData.id;

    // Enroll only Student A in the teacher's class
    await adminClient.from('class_enrollments').insert({
      class_id: testClassId,
      student_id: studentAUser.id,
      status: 'active'
    });

    // Create a test competency standard
    const { data: standardData, error: standardError } = await adminClient
      .from('competency_standards')
      .insert({
        code: `TEST-RLS-${Date.now()}`,
        description: 'Test standard for RLS verification',
        student_friendly_description: 'A test standard',
        category: 'test',
        is_active: true
      })
      .select()
      .single();

    if (standardError) throw standardError;
    testStandardId = standardData.id;

    // Create competency records for both students
    await adminClient.from('student_competency').insert([
      {
        student_id: studentAUser.id,
        standard_id: testStandardId,
        mastery_level: 75,
        updated_by: teacherUser.id
      },
      {
        student_id: studentBUser.id,
        standard_id: testStandardId,
        mastery_level: 60,
        updated_by: teacherUser.id
      }
    ]);
  }, 60000); // Increased timeout for setup

  afterAll(async () => {
    // Cleanup in reverse order of creation (to respect FK constraints)
    if (testStandardId) {
      await adminClient.from('student_competency').delete().eq('standard_id', testStandardId);
      await adminClient.from('competency_standards').delete().eq('id', testStandardId);
    }
    if (testClassId) {
      await adminClient.from('class_enrollments').delete().eq('class_id', testClassId);
      await adminClient.from('classes').delete().eq('id', testClassId);
    }
    if (studentAUser) await adminClient.auth.admin.deleteUser(studentAUser.id);
    if (studentBUser) await adminClient.auth.admin.deleteUser(studentBUser.id);
    if (teacherUser) await adminClient.auth.admin.deleteUser(teacherUser.id);
  });

  describe('Competency Standards Policies', () => {
    it('Authenticated users can view competency standards', async () => {
      const { data, error } = await studentAClient
        .from('competency_standards')
        .select('*')
        .eq('id', testStandardId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.id).toBe(testStandardId);
    });

    it('Students CANNOT modify competency standards', async () => {
      const { error } = await studentAClient
        .from('competency_standards')
        .update({ description: 'Hacked description' })
        .eq('id', testStandardId);

      expect(error).not.toBeNull();
      expect(error?.message).toContain('new row violates row-level security policy');
    });

    it('Teachers CANNOT modify competency standards', async () => {
      const { error } = await teacherClient
        .from('competency_standards')
        .update({ description: 'Teacher modified' })
        .eq('id', testStandardId);

      expect(error).not.toBeNull();
      expect(error?.message).toContain('new row violates row-level security policy');
    });
  });

  describe('Student Competency Access Policies', () => {
    it('Student A can view their own competency record', async () => {
      const { data, error } = await studentAClient
        .from('student_competency')
        .select('*')
        .eq('student_id', studentAUser.id)
        .eq('standard_id', testStandardId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.student_id).toBe(studentAUser.id);
      expect(data.mastery_level).toBe(75);
    });

    it('Student A CANNOT view Student B\'s competency record', async () => {
      const { data, error } = await studentAClient
        .from('student_competency')
        .select('*')
        .eq('student_id', studentBUser.id)
        .eq('standard_id', testStandardId);

      // RLS should filter this out, returning empty array
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });

    it('Teacher can view enrolled Student A\'s competency record', async () => {
      const { data, error } = await teacherClient
        .from('student_competency')
        .select('*')
        .eq('student_id', studentAUser.id)
        .eq('standard_id', testStandardId)
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data.student_id).toBe(studentAUser.id);
      expect(data.mastery_level).toBe(75);
    });

    it('Teacher CANNOT view non-enrolled Student B\'s competency record', async () => {
      const { data, error } = await teacherClient
        .from('student_competency')
        .select('*')
        .eq('student_id', studentBUser.id)
        .eq('standard_id', testStandardId);

      // RLS should filter this out since Student B is not enrolled in teacher's class
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });

  describe('Student Competency Modification Policies', () => {
    it('Teacher can update enrolled student\'s competency record', async () => {
      const { error } = await teacherClient
        .from('student_competency')
        .update({ mastery_level: 80 })
        .eq('student_id', studentAUser.id)
        .eq('standard_id', testStandardId);

      expect(error).toBeNull();

      // Verify the update
      const { data } = await adminClient
        .from('student_competency')
        .select('mastery_level')
        .eq('student_id', studentAUser.id)
        .eq('standard_id', testStandardId)
        .single();

      expect(data?.mastery_level).toBe(80);

      // Reset for other tests
      await adminClient
        .from('student_competency')
        .update({ mastery_level: 75 })
        .eq('student_id', studentAUser.id)
        .eq('standard_id', testStandardId);
    });

    it('Teacher CANNOT update non-enrolled student\'s competency record', async () => {
      const { error } = await teacherClient
        .from('student_competency')
        .update({ mastery_level: 90 })
        .eq('student_id', studentBUser.id)
        .eq('standard_id', testStandardId);

      expect(error).not.toBeNull();
    });

    it('Student CANNOT update their own competency record', async () => {
      const { error } = await studentAClient
        .from('student_competency')
        .update({ mastery_level: 100 })
        .eq('student_id', studentAUser.id)
        .eq('standard_id', testStandardId);

      expect(error).not.toBeNull();
      expect(error?.message).toContain('new row violates row-level security policy');
    });

    it('Teacher can insert competency record for enrolled student', async () => {
      // Create another test standard
      const { data: newStandard } = await adminClient
        .from('competency_standards')
        .insert({
          code: `TEST-RLS-INSERT-${Date.now()}`,
          description: 'Test standard for insert verification',
          is_active: true
        })
        .select()
        .single();

      const { error } = await teacherClient
        .from('student_competency')
        .insert({
          student_id: studentAUser.id,
          standard_id: newStandard!.id,
          mastery_level: 50
        });

      expect(error).toBeNull();

      // Cleanup
      await adminClient.from('student_competency').delete().eq('standard_id', newStandard!.id);
      await adminClient.from('competency_standards').delete().eq('id', newStandard!.id);
    });

    it('Teacher CANNOT insert competency record for non-enrolled student', async () => {
      // Create another test standard
      const { data: newStandard } = await adminClient
        .from('competency_standards')
        .insert({
          code: `TEST-RLS-INSERT-FAIL-${Date.now()}`,
          description: 'Test standard for failed insert verification',
          is_active: true
        })
        .select()
        .single();

      const { error } = await teacherClient
        .from('student_competency')
        .insert({
          student_id: studentBUser.id,
          standard_id: newStandard!.id,
          mastery_level: 50
        });

      expect(error).not.toBeNull();
      expect(error?.message).toContain('new row violates row-level security policy');

      // Cleanup the standard
      await adminClient.from('competency_standards').delete().eq('id', newStandard!.id);
    });

    it('Students CANNOT delete competency records', async () => {
      const { error } = await studentAClient
        .from('student_competency')
        .delete()
        .eq('student_id', studentAUser.id)
        .eq('standard_id', testStandardId);

      expect(error).not.toBeNull();
    });

    it('Teachers CANNOT delete competency records', async () => {
      const { error } = await teacherClient
        .from('student_competency')
        .delete()
        .eq('student_id', studentAUser.id)
        .eq('standard_id', testStandardId);

      expect(error).not.toBeNull();
    });
  });
});
