import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockGetRequestSessionClaims = vi.fn();
const mockResolveOpenRouterProviderFromEnv = vi.fn();
const mockAssembleLessonChatbotContext = vi.fn();
const mockBuildPublishedCurriculumManifest = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('@/lib/ai/providers', () => ({
  resolveOpenRouterProviderFromEnv: mockResolveOpenRouterProviderFromEnv,
}));

vi.mock('@/lib/ai/lesson-context', () => ({
  assembleLessonChatbotContext: mockAssembleLessonChatbotContext,
}));

vi.mock('@/lib/curriculum/published-manifest', () => ({
  buildPublishedCurriculumManifest: mockBuildPublishedCurriculumManifest,
}));

// We'll import the route after mocks are set up
let POST: (request: NextRequest) => Promise<Response>;

function buildRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/student/lesson-chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest;
}

describe('POST /api/student/lesson-chatbot', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset module import
    vi.resetModules();
    const routeModule = await import('@/app/api/student/lesson-chatbot/route');
    POST = routeModule.POST;
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await POST(buildRequest({
      lessonId: 'lesson_01_01',
      phaseNumber: 1,
      question: 'What is accounting?',
    }));

    expect(response.status).toBe(401);
  });

  it('returns 403 when user is not a student', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    const response = await POST(buildRequest({
      lessonId: 'lesson_01_01',
      phaseNumber: 1,
      question: 'What is accounting?',
    }));

    expect(response.status).toBe(403);
  });

  it('returns 400 when required fields are missing', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await POST(buildRequest({}));

    expect(response.status).toBe(400);
  });

  it('returns 400 when question is too long', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const longQuestion = 'a'.repeat(1001);

    const response = await POST(buildRequest({
      lessonId: 'lesson_01_01',
      phaseNumber: 1,
      question: longQuestion,
    }));

    expect(response.status).toBe(400);
  });

  it('returns 200 with AI response when valid request', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const mockProvider = vi.fn().mockResolvedValue('This is a lesson-scoped response.');
    mockResolveOpenRouterProviderFromEnv.mockReturnValue(mockProvider);

    mockAssembleLessonChatbotContext.mockReturnValue({
      lessonTitle: 'Test Lesson',
      unitTitle: 'Test Unit',
      phaseTitle: 'Test Phase',
      learningObjectives: ['Learn something'],
      contentSummary: 'Test content summary',
    });

    mockBuildPublishedCurriculumManifest.mockReturnValue({
      instructionalUnitCount: 8,
      capstoneLessonCount: 1,
      lessons: [
        {
          slug: 'lesson_01_01',
          title: 'Test Lesson',
          unitTitle: 'Test Unit',
          learningObjectives: ['Learn something'],
          phases: [
            {
              phaseNumber: 1,
              title: 'Test Phase',
              sections: [{ sectionType: 'text', content: { markdown: 'Test content' } }],
            },
          ],
        },
      ],
    });

    const response = await POST(buildRequest({
      lessonId: 'lesson_01_01',
      phaseNumber: 1,
      question: 'What is this lesson about?',
    }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.response).toBe('This is a lesson-scoped response.');
  });
});
