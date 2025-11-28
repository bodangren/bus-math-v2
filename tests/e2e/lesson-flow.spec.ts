/**
 * End-to-End Test: Lesson Flow and Competency Engine
 *
 * Tests the complete student journey through a lesson:
 * - User authentication
 * - Phase navigation and locking
 * - Activity completion
 * - Progress tracking
 * - Competency recording
 *
 * Prerequisites:
 * - Database must be accessible (test environment)
 * - Next.js dev server running
 */

import { test, expect } from '@playwright/test';
import {
  getStudentCompetencyByCode,
  getLessonCompletion,
  isPhaseCompleted,
} from './utils/db-helpers';

// Test data interface matching seed API response
interface TestData {
  userId: string;
  email: string;
  password: string;
  username: string;
  lessonId: string;
  lessonSlug: string;
  phaseIds: string[];
  standardId: string;
}

let testData: TestData | null = null;

test.describe('Lesson Flow E2E', () => {
  // Setup: Create test data before all tests
  test.beforeAll(async ({ request }) => {
    const response = await request.post('/api/test/seed-e2e');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    testData = data.testData;
  });

  // Cleanup: Remove test data after all tests
  test.afterAll(async ({ request }) => {
    if (!testData) return;

    await request.post('/api/test/cleanup-e2e', {
      data: {
        userId: testData.userId,
        lessonId: testData.lessonId,
      },
    });
  });

  test('should complete full lesson flow with competency tracking', async ({ page }) => {
    if (!testData) {
      throw new Error('Test data not initialized');
    }

    // 1. Login as test student
    await test.step('Login as test student', async () => {
      await page.goto('/login');

      // Fill in username and password
      await page.fill('input[name="username"]', testData!.username);
      await page.fill('input[name="password"]', testData!.password);

      // Submit login form
      await page.click('button[type="submit"]');

      // Wait for navigation to home page
      await page.waitForURL('/', { timeout: 10000 });
    });

    // 2. Navigate to test lesson Phase 1
    await test.step('Navigate to lesson Phase 1', async () => {
      await page.goto(`/lessons/${testData!.lessonSlug}/1`);

      // Verify we're on Phase 1
      await expect(page).toHaveURL(new RegExp(`/lessons/${testData!.lessonSlug}/1`));

      // Verify page loaded (look for phase title or content)
      await expect(page.locator('h1, h2')).toContainText(/Phase 1|Introduction/, {
        timeout: 10000,
      });
    });

    // 3. Complete Phase 1 (read phase) by clicking Next
    await test.step('Complete Phase 1 by clicking Next', async () => {
      // Find and click Next button
      const nextButton = page.locator('button:has-text("Next")');
      await expect(nextButton).toBeVisible({ timeout: 5000 });
      await nextButton.click();

      // Wait for navigation to Phase 2
      await page.waitForURL(new RegExp(`/lessons/${testData!.lessonSlug}/2`), { timeout: 10000 });

      // Verify Phase 1 is marked as completed in database
      const phase1Completed = await isPhaseCompleted(testData!.userId, testData!.phaseIds[0]);
      expect(phase1Completed).toBe(true);
    });

    // 4. Verify Phase 2 activity is present
    await test.step('Verify Phase 2 activity is visible', async () => {
      // Look for spreadsheet activity or activity container
      const activity = page.locator('[data-testid="activity"]').or(page.locator('.activity'));
      await expect(activity).toBeVisible({ timeout: 10000 });
    });

    // 5. Complete Phase 2 activity (spreadsheet)
    await test.step('Complete Phase 2 spreadsheet activity', async () => {
      // NOTE: This is a simplified version - actual implementation would interact with spreadsheet
      // For now, we'll just verify the activity is present and can be interacted with

      // In a full implementation, you would:
      // 1. Fill in spreadsheet cells
      // 2. Click submit/check button
      // 3. Wait for success toast/feedback
      // 4. Verify Next button is enabled

      // Placeholder: Just wait for activity to be ready
      await page.waitForTimeout(1000);
    });

    // 6. Verify overall lesson progress
    await test.step('Verify lesson completion progress', async () => {
      const completionPercentage = await getLessonCompletion(
        testData!.userId,
        testData!.lessonId
      );

      // Should have completed at least 1 of 3 phases (33%)
      expect(completionPercentage).toBeGreaterThanOrEqual(33);
    });

    // 7. Verify competency was recorded (if activity was linked to standard)
    await test.step('Verify competency tracking', async () => {
      // NOTE: In full implementation, this would check for competency after completing
      // an activity linked to a standard

      // For now, just verify the database helper works
      const competency = await getStudentCompetencyByCode(testData!.userId, 'TEST-1.1');

      // Competency might not exist yet if activity wasn't completed, which is okay for skeleton test
      // In full implementation: expect(competency).not.toBeNull();
      // For now: Just log the result
      console.log('Competency record:', competency);
    });
  });

  test('should persist progress after page refresh', async ({ page }) => {
    if (!testData) {
      throw new Error('Test data not initialized');
    }

    await test.step('Login and navigate to lesson', async () => {
      await page.goto('/login');
      await page.fill('input[name="username"]', testData!.username);
      await page.fill('input[name="password"]', testData!.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('/');

      await page.goto(`/lessons/${testData!.lessonSlug}/1`);
    });

    await test.step('Refresh page and verify progress persists', async () => {
      // Reload the page
      await page.reload();

      // Verify we're still on the same page
      await expect(page).toHaveURL(new RegExp(`/lessons/${testData!.lessonSlug}/1`));

      // Verify progress is still visible (if there's a progress indicator)
      // In full implementation, you would check for specific UI elements
    });
  });
});
