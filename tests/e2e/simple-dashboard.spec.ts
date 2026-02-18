import { test, expect } from '@playwright/test';

test('simple dashboard load', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByRole('button', { name: 'Use demo teacher credentials' }).click();
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await page.waitForURL(/\/teacher\/dashboard/, { timeout: 30000 });
  await expect(page.locator('body')).toContainText('Teacher Dashboard');
});
