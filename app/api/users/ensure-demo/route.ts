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
const DEMO_LESSON_VERSION_ID = '10000000-0000-0000-0000-000000000101';
const DEMO_PHASE_IDS = [
  '10000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000202',
  '10000000-0000-0000-0000-000000000203',
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

    const { error: versionError } = await adminClient.from('lesson_versions').upsert(
      {
        id: DEMO_LESSON_VERSION_ID,
        lesson_id: DEMO_LESSON_ID,
        version: 1,
        title: 'Introduction to Business Math',
        description: 'Foundational lesson automatically provisioned for demo environments.',
        status: 'published',
      },
      { onConflict: 'lesson_id,version' }
    );
    if (versionError) {
      throw versionError;
    }

    const phaseRows = [
      {
        id: DEMO_PHASE_IDS[0],
        lesson_version_id: DEMO_LESSON_VERSION_ID,
        phase_number: 1,
        title: 'Hook',
        estimated_minutes: 5,
      },
      {
        id: DEMO_PHASE_IDS[1],
        lesson_version_id: DEMO_LESSON_VERSION_ID,
        phase_number: 2,
        title: 'Guided Practice',
        estimated_minutes: 10,
      },
      {
        id: DEMO_PHASE_IDS[2],
        lesson_version_id: DEMO_LESSON_VERSION_ID,
        phase_number: 3,
        title: 'Closing',
        estimated_minutes: 5,
      },
    ];

    const { error: phaseError } = await adminClient.from('phase_versions').upsert(phaseRows, {
      onConflict: 'lesson_version_id,phase_number',
    });
    if (phaseError) {
      throw phaseError;
    }

    const sectionRows = [
      {
        id: '10000000-0000-0000-0000-000000000301',
        phase_version_id: DEMO_PHASE_IDS[0],
        sequence_order: 1,
        section_type: 'text',
        content: {
          markdown:
            'Welcome to Math for Business Operations. This demo lesson confirms curriculum provisioning is working.',
        },
      },
      {
        id: '10000000-0000-0000-0000-000000000302',
        phase_version_id: DEMO_PHASE_IDS[1],
        sequence_order: 1,
        section_type: 'text',
        content: {
          markdown:
            'Use this phase to practice identifying revenue, expenses, and profit in a basic startup scenario.',
        },
      },
      {
        id: '10000000-0000-0000-0000-000000000303',
        phase_version_id: DEMO_PHASE_IDS[1],
        sequence_order: 2,
        section_type: 'callout',
        content: {
          variant: 'why-this-matters',
          markdown: 'Business math helps founders make confident decisions with real data.',
        },
      },
      {
        id: '10000000-0000-0000-0000-000000000304',
        phase_version_id: DEMO_PHASE_IDS[2],
        sequence_order: 1,
        section_type: 'text',
        content: {
          markdown:
            'Great work. You can now continue through the platform with a guaranteed starter lesson in place.',
        },
      },
    ];

    const { error: sectionError } = await adminClient.from('phase_sections').upsert(sectionRows, {
      onConflict: 'phase_version_id,sequence_order',
    });
    if (sectionError) {
      throw sectionError;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to ensure demo users', error);
    return NextResponse.json({ error: 'Failed to ensure demo users' }, { status: 500 });
  }
}
