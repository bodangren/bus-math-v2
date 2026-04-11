import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRequestSessionClaims = vi.fn();
const mockFsExistsSync = vi.fn();
const mockFsReadFileSync = vi.fn();

vi.mock('@/lib/auth/server', () => ({
  getRequestSessionClaims: mockGetRequestSessionClaims,
}));

vi.mock('fs', () => ({
  existsSync: mockFsExistsSync,
  readFileSync: mockFsReadFileSync,
}));

const { GET } = await import('../../../../../app/api/pdfs/[pdfName]/route');

function makeRequest(pdfName: string) {
  return new Request(`http://localhost/api/pdfs/${pdfName}`, {
    method: 'GET',
  });
}

describe('GET /api/pdfs/[pdfName]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRequestSessionClaims.mockResolvedValue({
      sub: 'student-1',
      username: 'student',
      role: 'student',
      iat: 1,
      exp: 2,
    });
    mockFsReadFileSync.mockReturnValue(Buffer.from('test pdf content'));
  });

  it('returns 401 when unauthenticated', async () => {
    mockGetRequestSessionClaims.mockResolvedValue(null);

    const response = await GET(makeRequest('test.pdf'), { params: Promise.resolve({ pdfName: 'test.pdf' }) });
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Unauthorized');
  });

  it('returns 400 for invalid PDF names', async () => {
    const invalidNames = ['test', 'test.txt', 'test/../test.pdf', 'test.pdf.exe', 'test pdf.pdf'];
    for (const name of invalidNames) {
      const response = await GET(makeRequest(name), { params: Promise.resolve({ pdfName: name }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe('Invalid PDF name');
    }
  });

  it('returns 404 when file does not exist', async () => {
    mockFsExistsSync.mockReturnValue(false);

    const response = await GET(makeRequest('nonexistent.pdf'), { params: Promise.resolve({ pdfName: 'nonexistent.pdf' }) });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe('File not found');
  });

  it('returns 200 with correct headers for valid PDF names', async () => {
    mockFsExistsSync.mockReturnValue(true);
    const pdfName = 'business-plan-guide.pdf';

    const response = await GET(makeRequest(pdfName), { params: Promise.resolve({ pdfName }) });
    const buffer = await response.arrayBuffer();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toBe(`attachment; filename="${pdfName}"`);
    expect(Buffer.from(buffer)).toEqual(Buffer.from('test pdf content'));
  });
});
