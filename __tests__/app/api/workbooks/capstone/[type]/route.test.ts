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
  '@/app/api/workbooks/capstone/[type]/route'
);

function buildContext(type: string) {
  return {
    params: Promise.resolve({ type }),
  };
}

function buildRequest(url: string) {
  return new Request(url) as NextRequest;
}

describe('GET /api/workbooks/capstone/[type]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/capstone/student'),
      buildContext('student')
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
      buildRequest('http://localhost/api/workbooks/capstone/teacher'),
      buildContext('teacher')
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
      buildRequest('http://localhost/api/workbooks/capstone/student'),
      buildContext('student')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="capstone_investor_ready_workbook.xlsx"'
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
      buildRequest('http://localhost/api/workbooks/capstone/teacher'),
      buildContext('teacher')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="capstone_investor_ready_workbook_teacher.xlsx"'
    );
  });

  it('returns 404 when student file not found', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    mockExistsSync.mockReturnValue(false);

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/capstone/student'),
      buildContext('student')
    );

    expect(response.status).toBe(404);
  });

  it('returns 404 when teacher file not found', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_456',
      username: 'teacher',
      role: 'teacher',
      iat: 1,
      exp: 2,
    });

    mockExistsSync.mockReturnValue(false);

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/capstone/teacher'),
      buildContext('teacher')
    );

    expect(response.status).toBe(404);
  });

  it('returns 400 for invalid type parameter', async () => {
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'profile_123',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });

    const response = await GET(
      buildRequest('http://localhost/api/workbooks/capstone/admin'),
      buildContext('admin')
    );

    expect(response.status).toBe(400);
  });
});