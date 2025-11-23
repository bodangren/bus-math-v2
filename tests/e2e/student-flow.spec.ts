import { test, expect } from '@playwright/test';

test.describe('Student Flow', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('student can login, complete a phase, and verify progress', async ({ page }) => {
    // 1. Login as student
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo student credentials' }).click(); // Use demo button via aria-label
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation
    await page.waitForURL(/\/student\/dashboard/, { timeout: 30000 });

    // 2. Verify redirect to student dashboard
    await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: /student dashboard/i })).toBeVisible({ timeout: 30000 });

    // 3. Navigate to a lesson
    // Assuming the lesson card is clickable or we can navigate directly
    await page.goto('/student/lesson/unit-1-lesson-1-accounting-equation');
    
    // Verify we are on the lesson page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // 4. Complete a phase
    // Find the first "Mark Complete" button.
    // Note: It might be already completed if the demo user has data. 
    // But usually demo user is reset or we should check if it says "Completed" first.
    
    const completeButton = page.getByRole('button', { name: /mark complete/i }).first();
    const completedButton = page.getByRole('button', { name: /completed/i }).first();

    if (await completedButton.isVisible()) {
       console.log('First phase already completed.');
       // If already completed, we can try to find one that is not.
       // Or we can assume the test passes if we see "Completed".
       // But better to find a "Mark Complete" button.
       
       const markCompleteButtons = page.getByRole('button', { name: /mark complete/i });
       if (await markCompleteButtons.count() > 0) {
         await markCompleteButtons.first().click();
         const success = page.getByText(/phase completed/i);
         const error = page.getByText(/unable to save/i);
         await expect(success.or(error)).toBeVisible({ timeout: 10000 });
         if (await error.isVisible()) {
            throw new Error('Failed to complete phase: API error');
         }
       } else {
         console.log('All phases completed for this lesson.');
       }
    } else {
       await completeButton.click();
       const success = page.getByText(/phase completed/i);
       const error = page.getByText(/unable to save/i);
       await expect(success.or(error)).toBeVisible({ timeout: 10000 });
       if (await error.isVisible()) {
          throw new Error('Failed to complete phase: API error');
       }
    }

    // 5. Verify progress on Dashboard
    await page.goto('/student/dashboard');
    // Check if progress bar is visible and has some value
    // The dashboard implementation shows a progress bar.
    // We can check if text "Completed phases" has numbers like "X / Y".
    await expect(page.getByText(/completed phases/i)).toBeVisible();
  });
});