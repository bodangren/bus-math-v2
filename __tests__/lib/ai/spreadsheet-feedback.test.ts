import { describe, it, expect, vi } from 'vitest';
import { generateAiFeedback, type AiFeedback } from '@/lib/ai/spreadsheet-feedback';
import * as providers from '@/lib/ai/providers';

describe('spreadsheet-feedback', () => {
  describe('generateAiFeedback', () => {
    const mockTargetCells = [
      { cell: 'B2', expectedValue: 100 },
      { cell: 'B3', expectedValue: 200 },
      { cell: 'B4', expectedValue: 300 },
    ];

    const mockValidationResult = {
      isComplete: false,
      totalCells: 3,
      correctCells: 1,
      feedback: [
        { cell: 'B2', isCorrect: true, expectedValue: 100, actualValue: 100 },
        { cell: 'B3', isCorrect: false, expectedValue: 200, actualValue: 150 },
        { cell: 'B4', isCorrect: false, expectedValue: 300, actualValue: 250 },
      ],
      timestamp: new Date().toISOString(),
    };

    const mockSpreadsheetData = [
      [{ value: '' }, { value: 'Value' }],
      [{ value: 'Item 1' }, { value: 100 }],
      [{ value: 'Item 2' }, { value: 150 }],
      [{ value: 'Item 3' }, { value: 250 }],
    ];

    it('should return deterministic feedback when AI provider is not configured', async () => {
      vi.spyOn(providers, 'resolveOpenRouterProviderFromEnv').mockReturnValue(null);

      const feedback: AiFeedback = await generateAiFeedback({
        spreadsheetData: mockSpreadsheetData,
        validationResult: mockValidationResult,
        targetCells: mockTargetCells,
        activityName: 'Test Activity',
      });

      expect(feedback.preliminaryScore).toBe(13);
      expect(feedback.strengths).toEqual(['Completed the spreadsheet submission']);
      expect(feedback.improvements).toEqual(['Review your work for possible errors']);
      expect(feedback.nextSteps).toEqual(['Ask your teacher for feedback']);
      expect(feedback.rawAiResponse).toContain('AI provider not configured');
    });

    it('should clamp preliminary score between 0 and 40', async () => {
      vi.spyOn(providers, 'resolveOpenRouterProviderFromEnv').mockReturnValue(null);

      const allCorrectValidation = {
        ...mockValidationResult,
        correctCells: 3,
        feedback: mockValidationResult.feedback.map(f => ({ ...f, isCorrect: true })),
      };

      const feedback: AiFeedback = await generateAiFeedback({
        spreadsheetData: mockSpreadsheetData,
        validationResult: allCorrectValidation,
        targetCells: mockTargetCells,
      });

      expect(feedback.preliminaryScore).toBe(40);
    });

    it('should use AI provider when available', async () => {
      const mockProvider = vi.fn().mockResolvedValue(JSON.stringify({
        preliminaryScore: 35,
        strengths: ['Got B2 correct', 'Good effort'],
        improvements: ['Fix B3', 'Fix B4'],
        nextSteps: ['Review formulas', 'Double-check values'],
      }));

      vi.spyOn(providers, 'resolveOpenRouterProviderFromEnv').mockReturnValue(mockProvider);

      const feedback: AiFeedback = await generateAiFeedback({
        spreadsheetData: mockSpreadsheetData,
        validationResult: mockValidationResult,
        targetCells: mockTargetCells,
      });

      expect(mockProvider).toHaveBeenCalled();
      expect(feedback.preliminaryScore).toBe(35);
      expect(feedback.strengths).toHaveLength(2);
      expect(feedback.improvements).toHaveLength(2);
      expect(feedback.nextSteps).toHaveLength(2);
    });

    it('should fall back to deterministic feedback on AI parse error', async () => {
      const mockProvider = vi.fn().mockResolvedValue('Not valid JSON');

      vi.spyOn(providers, 'resolveOpenRouterProviderFromEnv').mockReturnValue(mockProvider);

      const feedback: AiFeedback = await generateAiFeedback({
        spreadsheetData: mockSpreadsheetData,
        validationResult: mockValidationResult,
        targetCells: mockTargetCells,
      });

      expect(feedback.preliminaryScore).toBe(13);
      expect(feedback.rawAiResponse).toBe('Not valid JSON');
    });
  });
});
