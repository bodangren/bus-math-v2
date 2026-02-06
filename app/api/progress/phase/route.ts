export async function POST(request: Request) {
  void request;
  return Response.json(
    {
      error: 'Deprecated endpoint',
      message: 'Use POST /api/phases/complete with lessonId, phaseNumber, timeSpent, and idempotencyKey.',
      replacement: '/api/phases/complete',
    },
    { status: 410 },
  );
}
