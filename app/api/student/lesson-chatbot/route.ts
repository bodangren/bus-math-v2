import { getRequestSessionClaims } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import { resolveOpenRouterProviderFromEnv } from '@/lib/ai/providers';
import { assembleLessonChatbotContext } from '@/lib/ai/lesson-context';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';
import { fetchInternalMutation, internal } from '@/lib/convex/server';

interface ChatbotRequest {
  lessonId: string;
  phaseNumber: number;
  question: string;
}

function sanitizeInput(input: string): string {
  return input
    .replace(/[#*`_~]/g, '')
    .trim();
}

function buildPrompt(
  context: {
    lessonTitle: string;
    unitTitle: string;
    phaseTitle: string;
    learningObjectives: string[];
    contentSummary: string;
  },
  question: string,
): string {
  return `You are a helpful tutor for a business math textbook. Answer only about the current lesson. Do not use external knowledge.

Lesson context:
- Unit: ${context.unitTitle}
- Lesson: ${context.lessonTitle}
- Phase: ${context.phaseTitle}
- Learning objectives: ${context.learningObjectives.join(', ')}
- Lesson content summary: ${context.contentSummary}

Student question: ${question}

Answer concisely, using only the lesson context above.`;
}

export async function POST(request: NextRequest) {
  const session = await getRequestSessionClaims(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const rateLimitResult = await fetchInternalMutation(
      internal.rateLimits.checkAndIncrementRateLimit,
      {}
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429 }
      );
    }
  } catch (error) {
    console.error('[lesson-chatbot] Rate limit check failed:', error);
  }

  let body: ChatbotRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { lessonId, phaseNumber, question } = body;

  if (!lessonId || typeof lessonId !== 'string' || lessonId.trim().length === 0) {
    return NextResponse.json({ error: 'Missing or invalid lessonId' }, { status: 400 });
  }

  if (!phaseNumber || typeof phaseNumber !== 'number' || phaseNumber < 1) {
    return NextResponse.json({ error: 'Missing or invalid phaseNumber' }, { status: 400 });
  }

  if (!question || typeof question !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid question' }, { status: 400 });
  }

  const sanitizedQuestion = sanitizeInput(question);
  if (sanitizedQuestion.length === 0 || sanitizedQuestion.length > 1000) {
    return NextResponse.json({ error: 'Question must be between 1 and 1000 characters' }, { status: 400 });
  }

  const manifest = buildPublishedCurriculumManifest();
  const lesson = manifest.lessons.find((l) => l.slug === lessonId);
  if (!lesson) {
    return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
  }

  const phase = lesson.phases.find((p) => p.phaseNumber === phaseNumber);
  if (!phase) {
    return NextResponse.json({ error: 'Phase not found' }, { status: 404 });
  }

  const context = assembleLessonChatbotContext(
    { title: lesson.title, unit: { title: lesson.unitTitle } },
    {
      title: phase.title,
      learningObjectives: lesson.learningObjectives,
      content: phase.sections
        .filter((s) => s.sectionType === 'text')
        .map((s) => (s.content as { markdown?: string }).markdown || '')
        .join('\n\n'),
    },
  );

  const provider = resolveOpenRouterProviderFromEnv();
  if (!provider) {
    return NextResponse.json({ error: 'AI provider not configured' }, { status: 503 });
  }

  const prompt = buildPrompt(context, sanitizedQuestion);
  const aiResponse = await provider(prompt);

  console.log('[lesson-chatbot]', {
    userId: session.sub,
    lessonId,
    phaseNumber,
    questionLength: sanitizedQuestion.length,
    responseLength: aiResponse.length,
  });

  return NextResponse.json({ response: aiResponse });
}
