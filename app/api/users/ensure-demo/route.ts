import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

const DEMO_USERS = [
  {
    username: 'demo_teacher',
    password: 'demo123',
    role: 'teacher' as const,
    displayName: 'Demo Teacher',
  },
  {
    username: 'demo_student',
    password: 'demo123',
    role: 'student' as const,
    displayName: 'Demo Student',
  },
];

const DEMO_LESSON_ID = '10000000-0000-0000-0000-000000000001';
const DEMO_PHASE_IDS = [
  '10000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000004',
] as const;

export async function POST() {
  try {
    const adminClient = createAdminClient();

    const { error: organizationError } = await adminClient.from('organizations').upsert(
      {
        id: DEMO_ORG_ID,
        name: 'Demo School',
        slug: 'demo-school',
        settings: {
          timezone: 'America/New_York',
          locale: 'en-US',
          features: {
            enableLivePolling: true,
            enableLeaderboards: true,
            enableAnalytics: true,
          },
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (organizationError) {
      throw organizationError;
    }

    const { data: listUsersData, error: listUsersError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listUsersError) {
      throw listUsersError;
    }

    const usersByEmail = new Map(listUsersData.users.map((user) => [user.email, user]));

    for (const demoUser of DEMO_USERS) {
      const email = `${demoUser.username}@internal.domain`;
      const existingUser = usersByEmail.get(email);
      let userId = existingUser?.id;

      if (existingUser) {
        const { error: updateAuthError } = await adminClient.auth.admin.updateUserById(existingUser.id, {
          password: demoUser.password,
          user_metadata: { role: demoUser.role },
        });
        if (updateAuthError) {
          throw updateAuthError;
        }
      } else {
        const { data: createAuthData, error: createAuthError } = await adminClient.auth.admin.createUser({
          email,
          password: demoUser.password,
          email_confirm: true,
          user_metadata: { role: demoUser.role },
        });
        if (createAuthError || !createAuthData.user?.id) {
          throw createAuthError ?? new Error(`Unable to create demo user: ${demoUser.username}`);
        }
        userId = createAuthData.user.id;
      }

      const { error: profileError } = await adminClient.from('profiles').upsert(
        {
          id: userId,
          organization_id: DEMO_ORG_ID,
          username: demoUser.username,
          role: demoUser.role,
          display_name: demoUser.displayName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (profileError) {
        throw profileError;
      }
    }

    const now = new Date().toISOString();

    const { error: lessonError } = await adminClient.from('lessons').upsert(
      {
        id: DEMO_LESSON_ID,
        unit_number: 1,
        title: 'Introduction to Business Math',
        slug: 'demo-introduction-to-business-math',
        description: 'Foundational lesson automatically provisioned for demo environments.',
        learning_objectives: [
          'Understand the six-phase lesson flow',
          'Track progress across lesson phases',
          'Connect business scenarios to spreadsheet-based decisions',
        ],
        order_index: 1,
        metadata: {
          unitContent: {
            introduction: {
              unitNumber: 'Unit 1',
              unitTitle: 'Smart Ledger Launch',
            },
          },
        },
        updated_at: now,
      },
      { onConflict: 'id' }
    );
    if (lessonError) {
      throw lessonError;
    }

    const phaseRows = [
      {
        id: DEMO_PHASE_IDS[0],
        lesson_id: DEMO_LESSON_ID,
        phase_number: 1,
        title: 'Hook',
        content_blocks: [
          {
            id: 'demo-phase-1-block-1',
            type: 'markdown',
            content:
              'Welcome to Math for Business Operations. This demo lesson confirms curriculum provisioning is working.',
          },
        ],
        estimated_minutes: 5,
        metadata: { phaseType: 'intro', color: '#2563eb', icon: 'book-open' },
        updated_at: now,
      },
      {
        id: DEMO_PHASE_IDS[1],
        lesson_id: DEMO_LESSON_ID,
        phase_number: 2,
        title: 'Guided Practice',
        content_blocks: [
          {
            id: 'demo-phase-2-block-1',
            type: 'markdown',
            content:
              'Use this phase to practice identifying revenue, expenses, and profit in a basic startup scenario.',
          },
          {
            id: 'demo-phase-2-block-2',
            type: 'callout',
            variant: 'why-this-matters',
            content: 'Business math helps founders make confident decisions with real data.',
          },
        ],
        estimated_minutes: 10,
        metadata: { phaseType: 'practice', color: '#0891b2', icon: 'calculator' },
        updated_at: now,
      },
      {
        id: DEMO_PHASE_IDS[2],
        lesson_id: DEMO_LESSON_ID,
        phase_number: 3,
        title: 'Closing',
        content_blocks: [
          {
            id: 'demo-phase-3-block-1',
            type: 'markdown',
            content:
              'Great work. You can now continue through the platform with a guaranteed starter lesson in place.',
          },
        ],
        estimated_minutes: 5,
        metadata: { phaseType: 'reflection', color: '#7c3aed', icon: 'check-circle' },
        updated_at: now,
      },
    ];

    const { error: phaseError } = await adminClient.from('phases').upsert(phaseRows, { onConflict: 'id' });
    if (phaseError) {
      throw phaseError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to ensure demo users', error);
    return NextResponse.json({ error: 'Failed to ensure demo users' }, { status: 500 });
  }
}
