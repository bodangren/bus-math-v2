import { test, expect } from '@playwright/test';

test.describe('Teacher Command Center', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('teacher can access dashboard and export CSV', async ({ page }) => {
    // 1. Login as teacher
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo teacher credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation to teacher dashboard
    await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });

    // 2. Verify dashboard elements
    await expect(page.getByRole('heading', { name: /teacher dashboard/i })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /create student/i })).toBeVisible({ timeout: 10000 });

    // 3. Test CSV export functionality
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export csv/i }).click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/students.*\.csv$/i);
  });

  test('teacher can create individual student', async ({ page }) => {
    // 1. Login as teacher
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo teacher credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation
    await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });

    // 2. Create a new student
    await page.getByRole('button', { name: /create student/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    const randomId = Math.random().toString(36).substring(7);
    const firstName = `BulkTest${randomId}`;
    const lastName = `Student${randomId}`;

    await page.getByLabel(/first name/i).fill(firstName);
    await page.getByLabel(/last name/i).fill(lastName);
    await page.getByLabel(/display name/i).fill(`${firstName} ${lastName}`);

    await page.getByRole('button', { name: /create student account/i }).click();

    // 3. Verify success
    await expect(page.getByText(/student created/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/username/i)).toBeVisible();
    await expect(page.getByText(/password/i)).toBeVisible();
  });

  test('teacher can bulk import students', async ({ page }) => {
    // 1. Login as teacher
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo teacher credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation
    await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });

    // 2. Open bulk import dialog
    await page.getByRole('button', { name: /bulk import/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // 3. Paste student names
    const students = [
      "Ada Lovelace",
      "Charles Babbage",
      "Grace Hopper"
    ].join('\n');

    await page.getByLabel(/student names/i).fill(students);
    await page.getByRole('button', { name: /next: review/i }).click();

    // 4. Review step
    await expect(page.getByText(/review and customize/i)).toBeVisible();
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByText("Charles Babbage")).toBeVisible();
    await expect(page.getByText("Grace Hopper")).toBeVisible();

    // 5. Submit
    await page.getByRole('button', { name: /create 3 accounts/i }).click();

    // 6. Verify success and credentials sheet
    await expect(page.getByText(/successfully created 3 student accounts/i)).toBeVisible({ timeout: 20000 });
    
    await page.getByRole('button', { name: /view credentials sheet/i }).click();
    await expect(page.getByText(/student credentials sheet/i)).toBeVisible();
    await expect(page.getByText(/ada.lovelace/i)).toBeVisible();
    await expect(page.getByText(/charles.babbage/i)).toBeVisible();
    await expect(page.getByText(/grace.hopper/i)).toBeVisible();

    // 7. Close sheet
    await page.getByRole('button', { name: /close/i }).click();
    await expect(page.getByText(/student credentials sheet/i)).not.toBeVisible();
  });
});