import { test, expect } from '@playwright/test';

test.describe('Public Access', () => {
  test('homepage is accessible', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Math for Business Operations/i);
    await expect(
      page.getByRole('heading', { level: 1, name: /Math for Business Operations/i }),
    ).toBeVisible();
  });

  test('curriculum overview is accessible', async ({ page }) => {
    await page.goto('/curriculum');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('preface is accessible', async ({ page }) => {
    await page.goto('/preface');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('login page is accessible', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^login$/i })).toBeVisible();
  });
});
