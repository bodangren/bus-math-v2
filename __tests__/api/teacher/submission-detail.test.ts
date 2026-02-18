import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/teacher/submission-detail/route';

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/db/drizzle', () => ({
  db: { select: vi.fn() },
}));

vi.mock('@/lib/teacher/submission-detail', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/teacher/submission-detail')>();
  return {
    ...actual,
    fetchSubmissionDetail: vi.fn(),
  };
});

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db/drizzle';
import { fetchSubmissionDetail } from '@/lib/teacher/submission-detail';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(params: Record<string, string>) {
  const url = new URL('http://localhost/api/teacher/submission-detail');
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }
  return new Request(url.toString());
}

// Properly formatted UUIDs (v4, variant 8) that pass Zod v4 strict validation
const TEACHER_UUID = '11111111-1111-4111-8111-111111111111';
const STUDENT_UUID = '22222222-2222-4222-8222-222222222222';
const LESSON_UUID  = '33333333-3333-4333-8333-333333333333';
const ORG_UUID     = '44444444-4444-4444-8444-444444444444';
const OTHER_ORG    = '55555555-5555-4555-8555-555555555555';

function mockAuth(userId: string | null) {
  (createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: userId ? { id: userId } : null },
        error: null,
      }),
    },
  });
}

/**
 * Queues return values for successive db.select(...).from(...).where(...).limit(1) calls.
 * Each element in fixtures is the array returned by that call (destructured as [row] in route).
 */
function mockDbSelects(...fixtures: Array<unknown[]>) {
  let call = 0;
  (db.select as ReturnType<typeof vi.fn>).mockImplementation(() => {
    const idx = call++;
    return {
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(fixtures[idx] ?? []),
        }),
      }),
    };
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/teacher/submission-detail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    });

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when studentId is not a UUID', async () => {
    mockAuth(TEACHER_UUID);
    const req = makeRequest({ studentId: 'not-a-uuid', lessonId: LESSON_UUID });
    const res = await GET(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.details).toHaveProperty('studentId');
  });

  it('returns 400 when lessonId is not a UUID', async () => {
    mockAuth(TEACHER_UUID);
    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: 'bad' });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when params are missing', async () => {
    mockAuth(TEACHER_UUID);
    const req = makeRequest({});
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns 403 when caller is a student', async () => {
    mockAuth(TEACHER_UUID);
    mockDbSelects([{ role: 'student', organizationId: ORG_UUID }]);

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns 403 when caller profile is not found', async () => {
    mockAuth(TEACHER_UUID);
    mockDbSelects([]);

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns 404 when student is not in the teacher org', async () => {
    mockAuth(TEACHER_UUID);
    mockDbSelects(
      [{ role: 'teacher', organizationId: ORG_UUID }],
      [{ displayName: 'Bob', username: 'bob', organizationId: OTHER_ORG }],
    );

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('returns 404 when student is not found', async () => {
    mockAuth(TEACHER_UUID);
    mockDbSelects(
      [{ role: 'teacher', organizationId: ORG_UUID }],
      [],
    );

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('returns 404 when fetchSubmissionDetail returns null', async () => {
    mockAuth(TEACHER_UUID);
    mockDbSelects(
      [{ role: 'teacher', organizationId: ORG_UUID }],
      [{ displayName: 'Alice', username: 'alice', organizationId: ORG_UUID }],
    );
    (fetchSubmissionDetail as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it('returns 200 with detail when all checks pass', async () => {
    mockAuth(TEACHER_UUID);
    mockDbSelects(
      [{ role: 'teacher', organizationId: ORG_UUID }],
      [{ displayName: 'Alice Brown', username: 'abrown', organizationId: ORG_UUID }],
    );

    const mockDetail = {
      studentName: 'Alice Brown',
      lessonTitle: 'Accounting Equation',
      phases: [
        { phaseNumber: 1, phaseId: 'p1', title: 'Hook', status: 'completed', completedAt: null, spreadsheetData: null },
      ],
    };
    (fetchSubmissionDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockDetail);

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    const res = await GET(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.studentName).toBe('Alice Brown');
    expect(body.lessonTitle).toBe('Accounting Equation');
    expect(body.phases).toHaveLength(1);
  });

  it('calls fetchSubmissionDetail with correct studentId, lessonId, and studentName', async () => {
    mockAuth(TEACHER_UUID);
    mockDbSelects(
      [{ role: 'teacher', organizationId: ORG_UUID }],
      [{ displayName: 'Alice Brown', username: 'abrown', organizationId: ORG_UUID }],
    );
    (fetchSubmissionDetail as ReturnType<typeof vi.fn>).mockResolvedValue({
      studentName: 'Alice Brown',
      lessonTitle: 'L1',
      phases: [],
    });

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    await GET(req);

    expect(fetchSubmissionDetail).toHaveBeenCalledWith(STUDENT_UUID, LESSON_UUID, 'Alice Brown');
  });

  it('falls back to username when displayName is null', async () => {
    mockAuth(TEACHER_UUID);
    mockDbSelects(
      [{ role: 'teacher', organizationId: ORG_UUID }],
      [{ displayName: null, username: 'abrown', organizationId: ORG_UUID }],
    );
    (fetchSubmissionDetail as ReturnType<typeof vi.fn>).mockResolvedValue({
      studentName: 'abrown',
      lessonTitle: 'L1',
      phases: [],
    });

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    await GET(req);

    expect(fetchSubmissionDetail).toHaveBeenCalledWith(STUDENT_UUID, LESSON_UUID, 'abrown');
  });

  it('returns 200 for admin role (not just teacher)', async () => {
    mockAuth(TEACHER_UUID);
    mockDbSelects(
      [{ role: 'admin', organizationId: ORG_UUID }],
      [{ displayName: 'Alice', username: 'alice', organizationId: ORG_UUID }],
    );
    (fetchSubmissionDetail as ReturnType<typeof vi.fn>).mockResolvedValue({
      studentName: 'Alice',
      lessonTitle: 'L1',
      phases: [],
    });

    const req = makeRequest({ studentId: STUDENT_UUID, lessonId: LESSON_UUID });
    const res = await GET(req);
    expect(res.status).toBe(200);
  });
});
