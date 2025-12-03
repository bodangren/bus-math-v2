import { test, expect } from '@playwright/test';

test.describe('Teacher Gradebook View', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('teacher can view student progress in gradebook format', async ({ page }) => {
    // 1. Login as teacher
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo teacher credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation to teacher dashboard
    await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });

    // 2. Verify dashboard shows student progress data
    await expect(page.getByRole('heading', { name: /teacher dashboard/i })).toBeVisible({ timeout: 30000 });
    
    // 3. Check for progress indicators
    await expect(page.getByText(/progress/i)).toBeVisible({ timeout: 10000 });
    
    // 4. Verify student list displays with progress information
    const studentRows = page.locator('[data-testid="student-row"]');
    await expect(studentRows.first()).toBeVisible({ timeout: 10000 });
    
    // 5. Check for progress percentage displays
    await expect(page.getByText(/\d+%/)).toBeVisible({ timeout: 10000 });
    
    // 6. Verify completion status indicators
    await expect(page.getByText(/completed/i)).toBeVisible({ timeout: 10000 });
  });

  test('teacher can see detailed progress for individual students', async ({ page }) => {
    // 1. Login as teacher
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo teacher credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation
    await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });

    // 2. Click on first student to view detailed progress
    const firstStudentRow = page.locator('[data-testid="student-row"]').first();
    await firstStudentRow.click();
    
    // 3. Verify detailed progress view (placeholder for future implementation)
    // This test will be expanded when detailed student progress view is implemented
    await expect(page.getByRole('heading', { name: /student progress/i })).toBeVisible({ timeout: 10000 });
  });

  test('teacher can export gradebook data', async ({ page }) => {
    // 1. Login as teacher
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo teacher credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation
    await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });

    // 2. Test CSV export with gradebook data
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export csv/i }).click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/students.*\.csv$/i);
    
    // 3. Verify download contains progress data
    const path = await download.path();
    const fs = require('fs');
    const content = fs.readFileSync(path, 'utf8');
    expect(content).toContain(/username/i);
    expect(content).toContain(/progress/i);
    expect(content).toContain(/completed/i);
  });

  test('gradebook shows accurate completion statistics', async ({ page }) => {
    // 1. Login as teacher
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo teacher credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation
    await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });

    // 2. Look for completion statistics
    await expect(page.getByText(/completed/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/in progress/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/not started/i)).toBeVisible({ timeout: 10000 });
    
    // 3. Verify progress bars or visual indicators
    const progressBars = page.locator('[data-testid="progress-bar"]');
    if (await progressBars.count() > 0) {
      await expect(progressBars.first()).toBeVisible();
    }
  });

  test('placeholder for advanced gradebook features', async ({ page }) => {
    // 1. Login as teacher
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo teacher credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation
    await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });

    // 2. Verify basic gradebook structure
    await expect(page.getByRole('heading', { name: /teacher dashboard/i })).toBeVisible({ timeout: 30000 });
    
    // 3. Placeholder assertions for future advanced features
    // These will be implemented as the gradebook functionality expands
    
    // Filtering by unit/lesson (future feature)
    // await expect(page.getByRole('button', { name: /filter/i })).toBeVisible();
    
    // Sorting by progress/completion (future feature)
    // await expect(page.getByRole('button', { name: /sort/i })).toBeVisible();
    
    // Individual student detail views (future feature)
    // await expect(page.getByText(/view details/i)).toBeVisible();
    
    // Bulk operations on students (future feature)
    // await expect(page.getByRole('checkbox', { name: /select student/i })).toBeVisible();
  });
});