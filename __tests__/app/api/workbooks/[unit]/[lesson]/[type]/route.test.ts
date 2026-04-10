import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const mockGetRequestSessionClaims = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

const mockExistsSync = vi.fn();
const mockReadFileSync = vi.fn();

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    existsSync: mockExistsSync,
    readFileSync: mockReadFileSync,
  };
});

const { GET } = await import(
  '@/app/api/workbooks/[unit]/[lesson]/[type]/route'
);

function buildContext(unit: string, lesson: string, type: string) {
  return {
    params: Promise.resolve({ unit, lesson, type }),
  };
}

function buildRequest(url: string) {
  return new Request(url) as NextRequest;
}

describe('GET /api/workbooks/[unit]/[lesson]/[type]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/01/04/student'),
      buildContext('01', '04', 'student')
    );

    expect(response.status).toBe(401);
  });

  it('returns 403 when student tries to access teacher workbook', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/01/04/teacher'),
      buildContext('01', '04', 'teacher')
    );

    expect(response.status).toBe(403);
  });

  it('returns 200 with student workbook when student accesses student type', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(Buffer.from('test content'));

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/01/04/student'),
      buildContext('01', '04', 'student')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  });

  it('returns 200 with teacher workbook when teacher accesses teacher type', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_456',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue(Buffer.from('test content'));

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/01/04/teacher'),
      buildContext('01', '04', 'teacher')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  });

  it('returns 404 when file not found', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    mockExistsSync.mockReturnValue(false);

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/01/04/student'),
      buildContext('01', '04', 'student')
    );

    expect(response.status).toBe(404);
  });

  it('returns 400 for path traversal in unit parameter', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/../../etc/04/student'),
      buildContext('../../etc', '04', 'student')
    );

    expect(response.status).toBe(400);
  });

  it('returns 400 for non-numeric unit parameter', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/abc/04/student'),
      buildContext('abc', '04', 'student')
    );

    expect(response.status).toBe(400);
  });

  it('returns 400 for non-numeric lesson parameter', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/01/xyz/student'),
      buildContext('01', 'xyz', 'student')
    );

    expect(response.status).toBe(400);
  });
});
