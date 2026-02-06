import { NextResponse } from 'next/server';

export function enforceTestRouteGuard(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { success: false, error: 'Test API cannot be used in production' },
      { status: 403 },
    );
  }

  const expectedApiKey = process.env.TEST_API_KEY?.trim();
  if (expectedApiKey) {
    const providedKey = request.headers.get('x-test-api-key')?.trim();
    if (providedKey !== expectedApiKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized test API access' },
        { status: 401 },
      );
    }
  }

  return null;
}
