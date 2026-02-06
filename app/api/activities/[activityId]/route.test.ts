import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockLimit = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: mockGetUser,
      },
      from: mockFrom,
    }),
  ),
}));

vi.mock('@/lib/db/drizzle', () => ({
  db: {
    select: mockSelect,
  },
}));

vi.mock('drizzle-orm', async (importOriginal) => {
  const actual = await importOriginal<typeof import('drizzle-orm')>();
  return {
    ...actual,
    eq: vi.fn(() => ({ _tag: 'eq' })),
  };
});

const { GET } = await import('./route');

function buildContext(activityId: string) {
  return {
    params: Promise.resolve({ activityId }),
  };
}

function buildRequest(url: string) {
  return new Request(url) as NextRequest;
}

const fullActivity = {
  id: '7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b',
  componentKey: 'comprehension-quiz',
  displayName: 'Quick Check',
  description: 'Assess understanding',
  props: {
    questions: [
      {
        id: 'q1',
        text: 'Choose one',
        type: 'multiple-choice',
        options: ['A', 'B'],
        correctAnswer: 'A',
      },
    ],
  },
  gradingConfig: {
    autoGrade: true,
    passingScore: 70,
  },
};

describe('GET /api/activities/[activityId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({
      data: { user: { id: 'student-123' } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: { role: 'student' }, error: null })),
            })),
          })),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    mockLimit.mockResolvedValue([fullActivity]);
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockSelect.mockReturnValue({ from: () => ({ where: mockWhere }) });
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await GET(
      buildRequest('http://localhost/api/activities/7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b'),
      buildContext('7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b'),
    );

    expect(response.status).toBe(401);
  });

  it('redacts answer keys and grading internals for students', async () => {
    const response = await GET(
      buildRequest('http://localhost/api/activities/7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b'),
      buildContext('7a0bfc56-4b5a-4c41-a90e-0e5cc2e7319b'),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();

    expect(payload.gradingConfig).toBeNull();
    expect(payload.props.questions[0]).not.toHaveProperty('correctAnswer');
  });
});
