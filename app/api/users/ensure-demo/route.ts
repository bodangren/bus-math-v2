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
const DEMO_LESSON_VERSION_NUMBER = 999;
const DEMO_SPREADSHEET_ACTIVITY_ID = '10000000-0000-0000-0000-000000000401';
const DEMO_PHASE_IDS = [
  '10000000-0000-0000-0000-000000000201',
  '10000000-0000-0000-0000-000000000202',
  '10000000-0000-0000-0000-000000000203',
  '10000000-0000-0000-0000-000000000204',
  '10000000-0000-0000-0000-000000000205',
  '10000000-0000-0000-0000-000000000206',
] as const;

export async function POST(request?: Request) {
  try {
    const requestUrl = request ? new URL(request.url) : null;
    const shouldResetFull = requestUrl?.searchParams.get('reset') === 'full';

    const adminClient = createAdminClient();
    const demoUserIds = new Map<string, string>();

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

      if (userId) {
        demoUserIds.set(demoUser.username, userId);
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
          'Use a spreadsheet evaluator to check accounting equation entries',
          'Track progress across lesson phases and competency evidence',
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
        version: DEMO_LESSON_VERSION_NUMBER,
        title: 'Introduction to Business Math',
        description: 'Foundational lesson automatically provisioned for demo environments.',
        status: 'published',
      },
      { onConflict: 'lesson_id,version' }
    );
    if (versionError) {
      throw versionError;
    }

    // Normalize to a single active demo lesson version so runtime "latest version" selection
    // cannot land on stale empty content from prior local test runs.
    const { data: staleVersions, error: staleVersionsError } = await adminClient
      .from('lesson_versions')
      .select('id')
      .eq('lesson_id', DEMO_LESSON_ID)
      .neq('id', DEMO_LESSON_VERSION_ID);
    if (staleVersionsError) {
      throw staleVersionsError;
    }

    const staleVersionIds = (staleVersions ?? []).map((row) => row.id);
    if (staleVersionIds.length > 0) {
      const { error: deleteStaleVersionsError } = await adminClient
        .from('lesson_versions')
        .delete()
        .in('id', staleVersionIds);
      if (deleteStaleVersionsError) {
        throw deleteStaleVersionsError;
      }
    }

    const { error: activityError } = await adminClient.from('activities').upsert(
      {
        id: DEMO_SPREADSHEET_ACTIVITY_ID,
        component_key: 'spreadsheet-evaluator',
        display_name: 'TechStart Equation Check',
        description: 'Enter the accounting equation values from Sarah Chen’s startup transactions.',
        props: {
          templateId: 'techstart-equation-demo',
          instructions:
            'Update A1 with total assets and B1 with owner equity after the sample transaction.',
          targetCells: [
            { cell: 'A1', expectedValue: 1200 },
            { cell: 'B1', expectedValue: 1200 },
          ],
          initialData: [
            [{ value: '' }, { value: '' }],
            [{ value: 'Assets' }, { value: 'Owner Equity' }],
          ],
        },
        grading_config: {
          autoGrade: false,
          partialCredit: false,
        },
        updated_at: now,
      },
      { onConflict: 'id' }
    );
    if (activityError) {
      throw activityError;
    }

    const phaseRows = [
      {
        id: DEMO_PHASE_IDS[0],
        lesson_version_id: DEMO_LESSON_VERSION_ID,
        phase_number: 1,
        title: 'Hook: Why Balance Matters',
        estimated_minutes: 5,
      },
      {
        id: DEMO_PHASE_IDS[1],
        lesson_version_id: DEMO_LESSON_VERSION_ID,
        phase_number: 2,
        title: 'Concept: Accounting Equation',
        estimated_minutes: 10,
      },
      {
        id: DEMO_PHASE_IDS[2],
        lesson_version_id: DEMO_LESSON_VERSION_ID,
        phase_number: 3,
        title: 'Guided Practice',
        estimated_minutes: 10,
      },
      {
        id: DEMO_PHASE_IDS[3],
        lesson_version_id: DEMO_LESSON_VERSION_ID,
        phase_number: 4,
        title: 'Independent Practice',
        estimated_minutes: 10,
      },
      {
        id: DEMO_PHASE_IDS[4],
        lesson_version_id: DEMO_LESSON_VERSION_ID,
        phase_number: 5,
        title: 'Assessment',
        estimated_minutes: 10,
      },
      {
        id: DEMO_PHASE_IDS[5],
        lesson_version_id: DEMO_LESSON_VERSION_ID,
        phase_number: 6,
        title: 'Reflection',
        estimated_minutes: 5,
      },
    ];

    const { error: phaseError } = await adminClient.from('phase_versions').upsert(phaseRows, {
      onConflict: 'lesson_version_id,phase_number',
    });
    if (phaseError) {
      throw phaseError;
    }

    const { data: persistedPhases, error: persistedPhasesError } = await adminClient
      .from('phase_versions')
      .select('id, phase_number')
      .eq('lesson_version_id', DEMO_LESSON_VERSION_ID);
    if (persistedPhasesError) {
      throw persistedPhasesError;
    }

    const phaseIdByNumber = new Map<number, string>();
    for (const row of persistedPhases ?? []) {
      if (typeof row.phase_number === 'number' && typeof row.id === 'string') {
        phaseIdByNumber.set(row.phase_number, row.id);
      }
    }

    const getPhaseId = (phaseNumber: number) => {
      const phaseId = phaseIdByNumber.get(phaseNumber);
      if (!phaseId) {
        throw new Error(`Missing persisted phase for phase number ${phaseNumber}`);
      }
      return phaseId;
    };

    const sectionRows = [
      {
        id: '10000000-0000-0000-0000-000000000301',
        phase_version_id: getPhaseId(1),
        sequence_order: 1,
        section_type: 'text',
        content: {
          markdown:
            'Welcome to TechStart. Sarah Chen needs reliable numbers to make strong business decisions.',
        },
      },
      {
        id: '10000000-0000-0000-0000-000000000302',
        phase_version_id: getPhaseId(2),
        sequence_order: 1,
        section_type: 'text',
        content: {
          markdown:
            'Every transaction must keep the accounting equation balanced: Assets = Liabilities + Equity.',
        },
      },
      {
        id: '10000000-0000-0000-0000-000000000303',
        phase_version_id: getPhaseId(3),
        sequence_order: 1,
        section_type: 'text',
        content: {
          markdown:
            'Now practice the equation with a spreadsheet check. Enter the two values and submit your answer.',
        },
      },
      {
        id: '10000000-0000-0000-0000-000000000304',
        phase_version_id: getPhaseId(3),
        sequence_order: 2,
        section_type: 'activity',
        content: {
          activityId: DEMO_SPREADSHEET_ACTIVITY_ID,
          required: true,
        },
      },
      {
        id: '10000000-0000-0000-0000-000000000305',
        phase_version_id: getPhaseId(4),
        sequence_order: 1,
        section_type: 'text',
        content: {
          markdown:
            'Phase 4 lets students retry and reinforce spreadsheet evidence before formal assessment.',
        },
      },
      {
        id: '10000000-0000-0000-0000-000000000306',
        phase_version_id: getPhaseId(5),
        sequence_order: 1,
        section_type: 'callout',
        content: {
          variant: 'why-this-matters',
          markdown: 'Accurate spreadsheet work becomes competency evidence teachers can review.',
        },
      },
      {
        id: '10000000-0000-0000-0000-000000000307',
        phase_version_id: getPhaseId(6),
        sequence_order: 1,
        section_type: 'text',
        content: {
          markdown:
            'Reflection: What changed in your confidence using the accounting equation in a spreadsheet?',
        },
      },
    ];

    const { error: sectionError } = await adminClient.from('phase_sections').upsert(sectionRows, {
      onConflict: 'phase_version_id,sequence_order',
    });
    if (sectionError) {
      throw sectionError;
    }

    if (shouldResetFull) {
      const demoStudentId = demoUserIds.get('demo_student');
      if (!demoStudentId) {
        throw new Error('Unable to resolve demo_student ID for reset');
      }

      const resetTargets: Array<{ table: string; column: string }> = [
        { table: 'student_progress', column: 'user_id' },
        { table: 'activity_submissions', column: 'user_id' },
        { table: 'activity_completions', column: 'student_id' },
        { table: 'student_spreadsheet_responses', column: 'student_id' },
        { table: 'student_competency', column: 'student_id' },
      ];

      for (const target of resetTargets) {
        const { error: resetError } = await adminClient
          .from(target.table)
          .delete()
          .eq(target.column, demoStudentId);
        if (resetError) {
          throw resetError;
        }
      }
    }

    return NextResponse.json({ ok: true, resetApplied: shouldResetFull });
  } catch (error) {
    console.error('Failed to ensure demo users', error);
    return NextResponse.json({ error: 'Failed to ensure demo users' }, { status: 500 });
  }
}
