import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockTestDatabaseConnection = vi.fn();

vi.mock('@/lib/db/test-connection', () => ({
  testDatabaseConnection: mockTestDatabaseConnection,
}));

const { GET } = await import('../../../../app/api/test-db/route');
const mutableEnv = process.env as Record<string, string | undefined>;

const originalNodeEnv = process.env.NODE_ENV;
const originalTestApiKey = process.env.TEST_API_KEY;

describe('GET /api/test-db', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTestDatabaseConnection.mockResolvedValue({ success: true, message: 'ok' });
  });

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete mutableEnv.NODE_ENV;
    } else {
      mutableEnv.NODE_ENV = originalNodeEnv;
    }

    if (originalTestApiKey === undefined) {
      delete mutableEnv.TEST_API_KEY;
    } else {
      mutableEnv.TEST_API_KEY = originalTestApiKey;
    }
  });

  it('returns 403 in production', async () => {
    mutableEnv.NODE_ENV = 'production';

    const response = await GET(new Request('http://localhost/api/test-db'));

    expect(response.status).toBe(403);
  });

  it('returns 401 when TEST_API_KEY is configured and missing from request', async () => {
    mutableEnv.NODE_ENV = 'development';
    mutableEnv.TEST_API_KEY = 'secret-key';

    const response = await GET(new Request('http://localhost/api/test-db'));

    expect(response.status).toBe(401);
  });

  it('allows access with valid x-test-api-key outside production', async () => {
    mutableEnv.NODE_ENV = 'development';
    mutableEnv.TEST_API_KEY = 'secret-key';

    const response = await GET(
      new Request('http://localhost/api/test-db', {
        headers: { 'x-test-api-key': 'secret-key' },
      }),
    );

    expect(response.status).toBe(200);
    expect(mockTestDatabaseConnection).toHaveBeenCalled();
  });
});
