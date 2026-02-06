import { afterEach, describe, expect, it, vi } from 'vitest';

const mockRpc = vi.fn();
const mockFromSelectLimit = vi.fn();
const mockCreateClient = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

const { GET } = await import('./route');
const mutableEnv = process.env as Record<string, string | undefined>;

const originalNodeEnv = process.env.NODE_ENV;
const originalTestApiKey = process.env.TEST_API_KEY;
const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

afterEach(() => {
  vi.clearAllMocks();

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

  if (originalSupabaseUrl === undefined) {
    delete mutableEnv.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    mutableEnv.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  }

  if (originalServiceRoleKey === undefined) {
    delete mutableEnv.SUPABASE_SERVICE_ROLE_KEY;
  } else {
    mutableEnv.SUPABASE_SERVICE_ROLE_KEY = originalServiceRoleKey;
  }
});

describe('GET /api/test-supabase', () => {
  it('returns 403 in production', async () => {
    mutableEnv.NODE_ENV = 'production';

    const response = await GET(new Request('http://localhost/api/test-supabase'));

    expect(response.status).toBe(403);
  });

  it('returns 401 when TEST_API_KEY is configured and missing from request', async () => {
    mutableEnv.NODE_ENV = 'development';
    mutableEnv.TEST_API_KEY = 'secret-key';

    const response = await GET(new Request('http://localhost/api/test-supabase'));

    expect(response.status).toBe(401);
  });

  it('allows access with valid key in development', async () => {
    mutableEnv.NODE_ENV = 'development';
    mutableEnv.TEST_API_KEY = 'secret-key';
    mutableEnv.NEXT_PUBLIC_SUPABASE_URL = 'https://demo.supabase.co';
    mutableEnv.SUPABASE_SERVICE_ROLE_KEY = 'service-role';

    mockRpc.mockResolvedValue({ data: 'ok', error: null });
    mockFromSelectLimit.mockResolvedValue({ data: [{ tablename: 'profiles' }], error: null });

    mockCreateClient.mockReturnValue({
      rpc: mockRpc,
      from: () => ({
        select: () => ({
          limit: mockFromSelectLimit,
        }),
      }),
    });

    const response = await GET(
      new Request('http://localhost/api/test-supabase', {
        headers: { 'x-test-api-key': 'secret-key' },
      }),
    );

    expect(response.status).toBe(200);
  });
});
