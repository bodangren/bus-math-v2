import { test, expect } from '@playwright/test';

const LESSON_SLUG = '/student/lesson/unit-1-lesson-1-accounting-equation';

async function loginAsDemoStudent(page: any) {
  await page.goto('/auth/login');
  await page.getByRole('button', { name: 'Use demo student credentials' }).click();
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.waitForURL(/\/student\/dashboard/, { timeout: 30000 });
}

test.describe('Unit 1 Lesson 1 E2E Flow', () => {
  test('student can view key Phase content and activities', async ({ page }) => {
    await loginAsDemoStudent(page);

    // Phase 1: video + comprehension check
    await page.goto(LESSON_SLUG);
    await expect(page.getByText(/welcome to unit 1/i)).toBeVisible();
    await expect(page.getByText(/accounting equation/i)).toBeVisible();

    const checkpoints = [
      { phase: 2, text: /the accounting equation/i },
      { phase: 3, text: /balance simulator/i },
      { phase: 3, text: /categorizing business items/i },
      { phase: 4, text: /budget balancer/i },
      { phase: 5, text: /why balance matters/i },
      { phase: 6, text: /check your understanding/i },
    ];

    for (const { phase, text } of checkpoints) {
      await page.goto(`${LESSON_SLUG}?phase=${phase}`);
      await expect(page.getByText(text)).toBeVisible({ timeout: 10000 });
    }
  });
});
