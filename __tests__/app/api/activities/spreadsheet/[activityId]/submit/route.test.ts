import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockRequireStudentRequestClaims = vi.fn();
const mockFetchInternalQuery = vi.fn();
const mockFetchInternalMutation = vi.fn();
const mockValidateSpreadsheetData = vi.fn();
const mockValidateSubmission = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
  requireStudentRequestClaims: mockRequireStudentRequestClaims,
}));

vi.mock('@/lib/convex/server', async () => {
  const actual = await vi.importActual<typeof import('@/lib/convex/server')>(
    '@/lib/convex/server',
  );
  return {
    ...actual,
    fetchInternalQuery: mockFetchInternalQuery,
    fetchInternalMutation: mockFetchInternalMutation,
    internal: {
      activities: {
        getProfileByUserId: 'internal.activities.getProfileByUserId',
        getProfileById: 'internal.activities.getProfileById',
        getSpreadsheetResponse: 'internal.activities.getSpreadsheetResponse',
        getActivityForValidation: 'internal.activities.getActivityForValidation',
        submitSpreadsheet: 'internal.activities.submitSpreadsheet',
        submitAssessment: 'internal.activities.submitAssessment',
        updateCompetency: 'internal.activities.updateCompetency',
      },
    },
  };
});

vi.mock('@/lib/activities/spreadsheet-validation', () => ({
  validateSpreadsheetData: mockValidateSpreadsheetData,
  validateSubmission: mockValidateSubmission,
  getCellValue: (data: Array<Array<{ value?: string | number }>>, cellRef: string) => {
    const match = cellRef.match(/^([A-Z]+)([0-9]+)$/);
    if (!match) return '';

    const colLabel = match[1];
    const rowIndex = Number(match[2]) - 1;
    let colIndex = 0;
    for (const char of colLabel) {
      colIndex = colIndex * 26 + (char.charCodeAt(0) - 64);
    }
    colIndex -= 1;

    return data[rowIndex]?.[colIndex]?.value ?? '';
  },
}));

const { GET, POST } = await import(
  '../../../../../../../app/api/activities/spreadsheet/[activityId]/submit/route'
);

function buildContext(activityId = 'activity_123') {
  return {
    params: Promise.resolve({ activityId }),
  };
}

function buildPostRequest(body: unknown) {
  return new Request('http://localhost/api/activities/spreadsheet/activity_123/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function buildGetRequest(studentId?: string) {
  const url = new URL('http://localhost/api/activities/spreadsheet/activity_123/submit');
  if (studentId) {
    url.searchParams.set('studentId', studentId);
  }
  return new Request(url.toString(), { method: 'GET' });
}

function setDefaultFetchQueryMocks() {
  mockFetchInternalQuery.mockImplementation(async (name: string) => {
    if (name === 'internal.activities.getProfileByUserId') {
      return {
        role: 'student',
        organizationId: 'org_1',
      };
    }

    if (name === 'internal.activities.getSpreadsheetResponse') {
      return {
        studentId: 'profile_student',
        spreadsheetData: [[{ value: 100 }]],
        draftData: [[{ value: 100 }]],
        isCompleted: true,
        attempts: 2,
        lastValidationResult: null,
        submittedAt: '2026-02-26T10:00:00.000Z',
        updatedAt: '2026-02-26T10:00:00.000Z',
      };
    }

    if (name === 'internal.activities.getActivityForValidation') {
      return {
        componentKey: 'spreadsheet-evaluator',
        standardId: null,
        props: {
          templateId: 'seeded-template',
          instructions: 'Use server-defined targets',
          targetCells: [{ cell: 'A1', expectedValue: 100 }],
        },
      };
    }

    if (name === 'internal.activities.getProfileById') {
      return {
        role: 'student',
        organizationId: 'org_1',
      };
    }

    return null;
  });
}

describe('POST /api/activities/spreadsheet/[activityId]/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_student',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });
    mockRequireStudentRequestClaims.mockImplementation(async () => {
      const claims = await mockGetRequestSessionClaims();
      if (!claims) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (claims.role !== 'student') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
      return claims;
    });

    setDefaultFetchQueryMocks();

    mockFetchInternalMutation.mockResolvedValue({});

    mockValidateSpreadsheetData.mockReturnValue({ isValid: true });
    mockValidateSubmission.mockReturnValue({
      isComplete: false,
      feedback: [
        {
          cell: 'A1',
          isCorrect: false,
          expectedValue: 100,
          actualValue: 0,
        },
      ],
    });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await POST(
      buildPostRequest({
        spreadsheetData: [[{ value: 0 }]],
      }),
      buildContext(),
    );

    expect(response.status).toBe(401);
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
  });

  it('returns 403 when a teacher session attempts to submit spreadsheet work', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_teacher',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    const response = await POST(
      buildPostRequest({
        spreadsheetData: [[{ value: 0 }]],
      }),
      buildContext(),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({ error: 'Forbidden' });
    expect(mockFetchInternalQuery).not.toHaveBeenCalled();
    expect(mockFetchInternalMutation).not.toHaveBeenCalled();
  });

  it('uses server-side target cells and stores submission for claims subject', async () => {
    const response = await POST(
      buildPostRequest({
        spreadsheetData: [[{ value: 0 }]],
      }),
      buildContext(),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.isComplete).toBe(false);

    expect(mockValidateSubmission).toHaveBeenCalledWith(
      [[{ value: 0 }]],
      [{ cell: 'A1', expectedValue: 100 }],
    );

    expect(mockFetchInternalMutation).toHaveBeenCalledWith(
      'internal.activities.submitAssessment',
      expect.objectContaining({
        userId: 'profile_student',
        activityId: 'activity_123',
        submissionData: expect.objectContaining({
          contractVersion: 'practice.v1',
          activityId: 'activity_123',
          mode: 'assessment',
        }),
      }),
    );
  });

  it('returns 422 when server activity config is missing target cells', async () => {
    mockFetchInternalQuery.mockImplementation(async (name: string) => {
      if (name === 'internal.activities.getActivityForValidation') {
        return {
          componentKey: 'spreadsheet-evaluator',
          standardId: null,
          props: {
            templateId: 'seeded-template',
            instructions: 'Invalid config',
          },
        };
      }

      return setDefaultFetchQueryMocks();
    });

    const response = await POST(
      buildPostRequest({
        spreadsheetData: [[{ value: 100 }]],
      }),
      buildContext(),
    );

    expect(response.status).toBe(422);
    const body = await response.json();
    expect(body.error).toMatch(/configuration is invalid/i);
  });
});

describe('GET /api/activities/spreadsheet/[activityId]/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_student',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    setDefaultFetchQueryMocks();
  });

  it('returns read-only replay payload for the authenticated student', async () => {
    const response = await GET(buildGetRequest(), buildContext());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.readOnly).toBe(true);
    expect(body.studentId).toBe('profile_student');
    expect(body.isCompleted).toBe(true);
  });

  it('allows teacher replay for a student in the same organization', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_teacher',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    mockFetchInternalQuery.mockImplementation(async (name: string) => {
      if (name === 'internal.activities.getProfileByUserId') {
        return {
          role: 'teacher',
          organizationId: 'org_1',
        };
      }

      if (name === 'internal.activities.getProfileById') {
        return {
          role: 'student',
          organizationId: 'org_1',
        };
      }

      if (name === 'internal.activities.getSpreadsheetResponse') {
        return {
          studentId: 'profile_student_2',
          spreadsheetData: [[{ value: 55 }]],
          draftData: [[{ value: 55 }]],
          isCompleted: true,
          attempts: 3,
          lastValidationResult: null,
          submittedAt: '2026-02-26T10:00:00.000Z',
          updatedAt: '2026-02-26T10:00:00.000Z',
        };
      }

      return null;
    });

    const response = await GET(buildGetRequest('profile_student_2'), buildContext());

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.studentId).toBe('profile_student_2');
    expect(body.readOnly).toBe(true);
  });

  it('rejects teacher replay requests for students outside the teacher organization', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_teacher',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    mockFetchInternalQuery.mockImplementation(async (name: string) => {
      if (name === 'internal.activities.getProfileByUserId') {
        return {
          role: 'teacher',
          organizationId: 'org_1',
        };
      }

      if (name === 'internal.activities.getProfileById') {
        return {
          role: 'student',
          organizationId: 'org_2',
        };
      }

      return null;
    });

    const response = await GET(buildGetRequest('profile_student_2'), buildContext());

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toMatch(/forbidden/i);
  });
});
