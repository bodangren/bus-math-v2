import { describe, expect, it } from 'vitest';

const { POST } = await import('../../../../../app/api/progress/phase/route');

describe('POST /api/progress/phase', () => {
  it('returns 410 and points clients to canonical endpoint', async () => {
    const response = await POST(
      new Request('http://localhost/api/progress/phase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(410);
    const body = await response.json();
    expect(body.error).toBe('Deprecated endpoint');
    expect(body.replacement).toBe('/api/phases/complete');
  });
});
