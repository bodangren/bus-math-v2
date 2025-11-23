import { test, expect } from '@playwright/test';

test.describe('Protected Routes', () => {
  test('redirects unauthenticated user to login from student dashboard', async ({ page }) => {
    await page.goto('/student/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('redirects unauthenticated user to login from teacher dashboard', async ({ page }) => {
    await page.goto('/teacher/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('redirects unauthenticated user to login from admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('redirects unauthenticated user to login from protected route', async ({ page }) => {
    await page.goto('/protected');
    await expect(page).toHaveURL(/.*\/login/);
  });
});
