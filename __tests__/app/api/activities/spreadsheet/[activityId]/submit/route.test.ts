import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockDbSelect = vi.fn();
const mockDbTransaction = vi.fn();
const mockEq = vi.fn();
const mockAnd = vi.fn();
const mockSupabaseFrom = vi.fn();
const mockSupabaseSelect = vi.fn();
const mockSupabaseEq = vi.fn();
const mockSupabaseMaybeSingle = vi.fn();

const mockTxLimit = vi.fn();
const mockTxWhere = vi.fn(() => ({ limit: mockTxLimit }));
const mockTxFrom = vi.fn(() => ({ where: mockTxWhere }));
const mockTxSelect = vi.fn(() => ({ from: mockTxFrom }));
const mockTxInsertValues = vi.fn();
const mockTxInsert = vi.fn(() => ({ values: mockTxInsertValues }));
const mockTxUpdateWhere = vi.fn();
const mockTxUpdateSet = vi.fn(() => ({ where: mockTxUpdateWhere }));
const mockTxUpdate = vi.fn(() => ({ set: mockTxUpdateSet }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: mockSupabaseFrom,
    }),
  ),
}));

vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: mockDbSelect,
    transaction: mockDbTransaction,
  },
}));

vi.mock('drizzle-orm', async () => {
  const actual = await vi.importActual<typeof import('drizzle-orm')>('drizzle-orm');
  return {
    ...actual,
    eq: mockEq,
    and: mockAnd,
  };
});

vi.mock('@/lib/db/schema', () => ({
  activities: {
    id: 'activities.id',
    props: 'activities.props',
    componentKey: 'activities.component_key',
    standardId: 'activities.standard_id',
  },
  studentSpreadsheetResponses: {
    id: 'student_spreadsheet_responses.id',
    studentId: 'student_spreadsheet_responses.student_id',
    activityId: 'student_spreadsheet_responses.activity_id',
  },
  studentCompetency: {
    id: 'student_competency.id',
    studentId: 'student_competency.student_id',
    standardId: 'student_competency.standard_id',
  },
}));

const { GET, POST } = await import(
  '../../../../../../../app/api/activities/spreadsheet/[activityId]/submit/route'
);

function buildRequest(body: unknown) {
  return new Request('http://localhost/api/activities/spreadsheet/test-activity-id/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

function buildContext(activityId = '11111111-1111-4111-8111-111111111111') {
  return {
    params: Promise.resolve({ activityId }),
  };
}

function buildGetRequest(studentId?: string) {
  const url = new URL('http://localhost/api/activities/spreadsheet/test-activity-id/submit');
  if (studentId) {
    url.searchParams.set('studentId', studentId);
  }

  return new Request(url.toString(), { method: 'GET' });
}

describe('POST /api/activities/spreadsheet/[activityId]/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'student-user-id' } },
      error: null,
    });

    mockEq.mockReturnValue(Symbol('eq'));
    mockAnd.mockReturnValue(Symbol('and'));
    mockSupabaseFrom.mockReturnValue({ select: mockSupabaseSelect });
    mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq });
    mockSupabaseEq.mockReturnValue({ maybeSingle: mockSupabaseMaybeSingle });
    mockSupabaseMaybeSingle.mockResolvedValue({
      data: {
        id: 'student-user-id',
        role: 'student',
        organization_id: 'org-1',
      },
      error: null,
    });

    const mockDbLimit = vi.fn();
    const mockDbWhere = vi.fn(() => ({ limit: mockDbLimit }));
    const mockDbFrom = vi.fn(() => ({ where: mockDbWhere }));
    mockDbSelect.mockReturnValue({ from: mockDbFrom });

    mockDbLimit.mockResolvedValue([
      {
        id: '11111111-1111-4111-8111-111111111111',
        componentKey: 'spreadsheet-evaluator',
        props: {
          templateId: 'seeded-template',
          instructions: 'Use server-defined targets',
          targetCells: [{ cell: 'A1', expectedValue: 100 }],
        },
        standardId: null,
      },
    ]);

    mockTxInsertValues.mockResolvedValue(undefined);
    mockTxUpdateWhere.mockResolvedValue(undefined);

    mockTxLimit.mockResolvedValue([]);
    const tx = {
      select: mockTxSelect,
      insert: mockTxInsert,
      update: mockTxUpdate,
    };
    mockDbTransaction.mockImplementation(async (callback: (tx: typeof tx) => Promise<void>) =>
      callback(tx),
    );
  });

  it('uses server-side target cells instead of client-provided target cells', async () => {
    const response = await POST(
      buildRequest({
        spreadsheetData: [[{ value: 0 }]],
        // client attempts to mark incorrect answer as correct
        targetCells: [{ cell: 'A1', expectedValue: 0 }],
      }),
      buildContext(),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.isComplete).toBe(false);
    expect(body.feedback).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          cell: 'A1',
          isCorrect: false,
          expectedValue: 100,
          actualValue: 0,
        }),
      ]),
    );
  });

  it('returns 422 when activity config does not include valid server target cells', async () => {
    const mockDbLimit = vi.fn();
    const mockDbWhere = vi.fn(() => ({ limit: mockDbLimit }));
    const mockDbFrom = vi.fn(() => ({ where: mockDbWhere }));
    mockDbSelect.mockReturnValue({ from: mockDbFrom });
    mockDbLimit.mockResolvedValue([
      {
        id: '11111111-1111-4111-8111-111111111111',
        componentKey: 'spreadsheet-evaluator',
        props: {
          templateId: 'missing-targets',
          instructions: 'Invalid config',
        },
        standardId: null,
      },
    ]);

    const response = await POST(
      buildRequest({
        spreadsheetData: [[{ value: 100 }]],
        targetCells: [{ cell: 'A1', expectedValue: 100 }],
      }),
      buildContext(),
    );

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toMatch(/activity configuration/i);
  });
});

describe('GET /api/activities/spreadsheet/[activityId]/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'student-user-id' } },
      error: null,
    });

    mockEq.mockReturnValue(Symbol('eq'));
    mockAnd.mockReturnValue(Symbol('and'));

    mockSupabaseFrom.mockReturnValue({ select: mockSupabaseSelect });
    mockSupabaseSelect.mockReturnValue({ eq: mockSupabaseEq });
    mockSupabaseEq.mockReturnValue({ maybeSingle: mockSupabaseMaybeSingle });
    mockSupabaseMaybeSingle.mockResolvedValue({
      data: {
        id: 'student-user-id',
        role: 'student',
        organization_id: 'org-1',
      },
      error: null,
    });
  });

  it('returns read-only replay payload for the authenticated student', async () => {
    const mockDbLimit = vi.fn();
    const mockDbWhere = vi.fn(() => ({ limit: mockDbLimit }));
    const mockDbFrom = vi.fn(() => ({ where: mockDbWhere }));
    mockDbSelect.mockReturnValue({ from: mockDbFrom });
    mockDbLimit.mockResolvedValue([
      {
        studentId: 'student-user-id',
        spreadsheetData: [[{ value: 100 }]],
        draftData: [[{ value: 100 }]],
        isCompleted: true,
        attempts: 2,
        lastValidationResult: {
          isComplete: true,
          totalCells: 1,
          correctCells: 1,
          feedback: [],
          timestamp: new Date().toISOString(),
        },
        submittedAt: new Date('2026-02-09T12:00:00.000Z'),
        updatedAt: new Date('2026-02-09T12:00:00.000Z'),
      },
    ]);

    const response = await GET(buildGetRequest(), buildContext());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.readOnly).toBe(true);
    expect(body.studentId).toBe('student-user-id');
    expect(body.isCompleted).toBe(true);
    expect(body.spreadsheetData).toEqual([[{ value: 100 }]]);
  });

  it('allows teacher replay for a student in the same organization', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'teacher-user-id' } },
      error: null,
    });
    mockSupabaseMaybeSingle
      .mockResolvedValueOnce({
        data: {
          id: 'teacher-user-id',
          role: 'teacher',
          organization_id: 'org-1',
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: '22222222-2222-4222-8222-222222222222',
          role: 'student',
          organization_id: 'org-1',
        },
        error: null,
      });

    const mockDbLimit = vi.fn();
    const mockDbWhere = vi.fn(() => ({ limit: mockDbLimit }));
    const mockDbFrom = vi.fn(() => ({ where: mockDbWhere }));
    mockDbSelect.mockReturnValue({ from: mockDbFrom });
    mockDbLimit.mockResolvedValue([
      {
        studentId: '22222222-2222-4222-8222-222222222222',
        spreadsheetData: [[{ value: 55 }]],
        draftData: [[{ value: 55 }]],
        isCompleted: true,
        attempts: 3,
        lastValidationResult: null,
        submittedAt: new Date('2026-02-09T12:00:00.000Z'),
        updatedAt: new Date('2026-02-09T12:00:00.000Z'),
      },
    ]);

    const response = await GET(
      buildGetRequest('22222222-2222-4222-8222-222222222222'),
      buildContext(),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.readOnly).toBe(true);
    expect(body.studentId).toBe('22222222-2222-4222-8222-222222222222');
  });

  it('rejects teacher replay requests for students outside the teacher organization', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'teacher-user-id' } },
      error: null,
    });
    mockSupabaseMaybeSingle
      .mockResolvedValueOnce({
        data: {
          id: 'teacher-user-id',
          role: 'teacher',
          organization_id: 'org-1',
        },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: '22222222-2222-4222-8222-222222222222',
          role: 'student',
          organization_id: 'org-2',
        },
        error: null,
      });

    const response = await GET(
      buildGetRequest('22222222-2222-4222-8222-222222222222'),
      buildContext(),
    );

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toMatch(/forbidden/i);
  });
});
