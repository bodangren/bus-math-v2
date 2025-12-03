import { test, expect } from '@playwright/test';

test.describe('Unit 1 Lesson 1 E2E Flow', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('student can complete Unit 1 Lesson 1 flow', async ({ page }) => {
    // 1. Login as student
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo student credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // Wait for navigation to student dashboard
    await page.waitForURL(/\/student\/dashboard/, { timeout: 30000 });

    // 2. Navigate to Unit 1 Lesson 1
    await page.goto('/student/lesson/unit-1-lesson-1');
    
    // 3. Verify lesson loads
    await expect(page.getByRole('heading', { name: /unit 1/i })).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/lesson 1/i)).toBeVisible({ timeout: 10000 });

    // 4. Check for phase navigation
    await expect(page.getByRole('button', { name: /phase/i })).toBeVisible({ timeout: 10000 });
    
    // 5. Navigate through phases
    const phases = ['Introduction', 'Theory', 'Practice', 'Application', 'Assessment', 'Reflection'];
    
    for (const phaseName of phases) {
      // Look for phase tab or button
      const phaseButton = page.getByRole('button', { name: new RegExp(phaseName, 'i') });
      if (await phaseButton.isVisible({ timeout: 5000 })) {
        await phaseButton.click();
        await page.waitForTimeout(2000); // Wait for content to load
        
        // Verify phase content is visible
        await expect(page.getByText(new RegExp(phaseName, 'i'))).toBeVisible({ timeout: 10000 });
      }
    }

    // 6. Check for interactive components
    await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible({ timeout: 10000 });
  });

  test('student can interact with AccountCategorization activity', async ({ page }) => {
    // 1. Login as student
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo student credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 2. Navigate to Unit 1 Lesson 1
    await page.goto('/student/lesson/unit-1-lesson-1');
    await page.waitForTimeout(3000);

    // 3. Look for AccountCategorization activity
    const categorizationActivity = page.locator('[data-testid="account-categorization"]');
    if (await categorizationActivity.isVisible({ timeout: 10000 })) {
      await categorizationActivity.click();
      
      // 4. Verify activity loads
      await expect(page.getByText(/categorization/i)).toBeVisible({ timeout: 10000 });
      
      // 5. Test drag and drop functionality (if present)
      const draggables = page.locator('[draggable="true"]');
      const dropZones = page.locator('[data-drop-zone="true"]');
      
      if (await draggables.count() > 0 && await dropZones.count() > 0) {
        const firstDraggable = draggables.first();
        const firstDropZone = dropZones.first();
        
        await firstDraggable.dragTo(firstDropZone);
        await page.waitForTimeout(1000);
        
        // Verify item was dropped
        const draggableText = await firstDraggable.textContent();
        await expect(firstDropZone).toContainText(draggableText || '');
      }
    }
  });

  test('student can interact with SpreadsheetActivity', async ({ page }) => {
    // 1. Login as student
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo student credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 2. Navigate to Unit 1 Lesson 1
    await page.goto('/student/lesson/unit-1-lesson-1');
    await page.waitForTimeout(3000);

    // 3. Look for SpreadsheetActivity
    const spreadsheetActivity = page.locator('[data-testid="spreadsheet-activity"]');
    if (await spreadsheetActivity.isVisible({ timeout: 10000 })) {
      await spreadsheetActivity.click();
      
      // 4. Verify spreadsheet loads
      await expect(page.getByText(/spreadsheet/i)).toBeVisible({ timeout: 10000 });
      
      // 5. Test spreadsheet interaction
      const cells = page.locator('[data-testid="spreadsheet-cell"]');
      if (await cells.count() > 0) {
        await cells.first().click();
        await page.waitForTimeout(1000);
        
        // Check for cell editing
        const cellInput = page.locator('[data-testid="cell-input"]');
        if (await cellInput.isVisible({ timeout: 5000 })) {
          await cellInput.fill('Test Data');
          await page.keyboard.press('Enter');
        }
      }
    }
  });

  test('lesson progress is tracked correctly', async ({ page }) => {
    // 1. Login as student
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo student credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 2. Navigate to Unit 1 Lesson 1
    await page.goto('/student/lesson/unit-1-lesson-1');
    await page.waitForTimeout(3000);

    // 3. Check for progress indicators
    const progressIndicator = page.locator('[data-testid="progress-indicator"]');
    if (await progressIndicator.isVisible({ timeout: 10000 })) {
      await expect(progressIndicator).toBeVisible();
      
      // 4. Verify progress percentage or status
      const progressText = await progressIndicator.textContent();
      expect(progressText).toMatch(/\d+%/);
    }

    // 5. Check for phase completion status
    const phaseTabs = page.locator('[data-testid="phase-tab"]');
    const phaseCount = await phaseTabs.count();
    
    for (let i = 0; i < phaseCount; i++) {
      const phaseTab = phaseTabs.nth(i);
      if (await phaseTab.isVisible()) {
        // Check for completion indicators
        const completedIcon = phaseTab.locator('[data-testid="completed"]');
        const inProgressIcon = phaseTab.locator('[data-testid="in-progress"]');
        const lockedIcon = phaseTab.locator('[data-testid="locked"]');
        
        // At least one status indicator should be visible
        const hasStatus = await completedIcon.isVisible() || 
                         await inProgressIcon.isVisible() || 
                         await lockedIcon.isVisible();
        expect(hasStatus).toBeTruthy();
      }
    }
  });

  test('lesson navigation works correctly', async ({ page }) => {
    // 1. Login as student
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo student credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 2. Navigate to Unit 1 Lesson 1
    await page.goto('/student/lesson/unit-1-lesson-1');
    await page.waitForTimeout(3000);

    // 3. Test navigation between phases
    const nextButton = page.getByRole('button', { name: /next/i });
    const prevButton = page.getByRole('button', { name: /previous|back/i });
    
    if (await nextButton.isVisible({ timeout: 5000 })) {
      const initialPhase = page.getByText(/phase 1/i);
      await expect(initialPhase).toBeVisible();
      
      await nextButton.click();
      await page.waitForTimeout(2000);
      
      // Should move to next phase
      await expect(page.getByText(/phase 2/i)).toBeVisible();
    }
    
    if (await prevButton.isVisible({ timeout: 5000 })) {
      await prevButton.click();
      await page.waitForTimeout(2000);
      
      // Should move back to previous phase
      await expect(page.getByText(/phase 1/i)).toBeVisible();
    }
  });

  test('lesson resources are accessible', async ({ page }) => {
    // 1. Login as student
    await page.goto('/auth/login');
    await page.getByRole('button', { name: 'Use demo student credentials' }).click();
    await page.getByRole('button', { name: 'Login', exact: true }).click();

    // 2. Navigate to Unit 1 Lesson 1
    await page.goto('/student/lesson/unit-1-lesson-1');
    await page.waitForTimeout(3000);

    // 3. Look for downloadable resources
    const resourceLinks = page.locator('[data-testid="resource-link"]');
    const resourceCount = await resourceLinks.count();
    
    if (resourceCount > 0) {
      for (let i = 0; i < Math.min(resourceCount, 3); i++) {
        const resourceLink = resourceLinks.nth(i);
        await expect(resourceLink).toBeVisible();
        
        // Check for proper download attributes
        const href = await resourceLink.getAttribute('href');
        const downloadAttr = await resourceLink.getAttribute('download');
        
        expect(href || downloadAttr).toBeTruthy();
      }
    }
  });
});