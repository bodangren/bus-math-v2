import { describe, expect, it, vi } from 'vitest';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

const { default: StudentIndexPage } = await import('../../../app/student/page');

describe('StudentIndexPage', () => {
  it('redirects /student to the dashboard', async () => {
    await expect(StudentIndexPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(redirect).toHaveBeenCalledWith('/student/dashboard');
  });
});
