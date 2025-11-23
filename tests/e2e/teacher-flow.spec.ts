import { test, expect } from '@playwright/test';

test.describe('Teacher Flow', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('teacher can login, create student, and view dashboard', async ({ page }) => {
    // 1. Login as teacher
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo teacher credentials' }).click(); // Use demo button via aria-label
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation
    await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });

    // 2. Verify redirect to teacher dashboard
    await expect(page).toHaveURL(/\/teacher\/dashboard/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: /teacher dashboard/i })).toBeVisible({ timeout: 30000 });

    // 3. Create a new student
    await page.getByRole('button', { name: /create student/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const randomId = Math.random().toString(36).substring(7);
    const firstName = `TestFirst${randomId}`;
    const lastName = `TestLast${randomId}`;

    await page.getByLabel(/first name/i).fill(firstName);
    await page.getByLabel(/last name/i).fill(lastName);
    await page.getByLabel(/display name/i).fill(`${firstName} ${lastName}`);

    await page.getByRole('button', { name: /create student account/i }).click();

    // 4. Verify success and credentials
    const success = page.getByText(/student created/i);
    const error = page.getByText(/unable to create/i);
    await expect(success.or(error)).toBeVisible({ timeout: 10000 });
    
    if (await error.isVisible()) {
        // Capture the error message if possible
        const errorText = await page.locator('role=alert').innerText();
        throw new Error(`Failed to create student: ${errorText}`);
    }

    await expect(page.getByText(/username/i)).toBeVisible();
    await expect(page.getByText(/password/i)).toBeVisible();

    // 5. Verify student appears in dashboard list
    await page.reload();
    await expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible();
  });
});