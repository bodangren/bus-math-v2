import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock('convex/react', () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
}));

vi.mock('@/convex/_generated/api', () => ({
  api: {
    study: {
      getStudyPreferences: 'api.study.getStudyPreferences',
      updatePreferences: 'api.study.updatePreferences',
      getTermMasteryByUnit: 'api.study.getTermMasteryByUnit',
      getDueTerms: 'api.study.getDueTerms',
      getRecentSessions: 'api.study.getRecentSessions',
      processReview: 'api.study.processReview',
      recordSession: 'api.study.recordSession',
    },
  },
}));

const {
  useStudyPreferences,
  useTermMastery,
  useDueTerms,
  useRecentSessions,
  useProcessReview,
  useRecordSession,
  getGlossaryTermDisplay,
} = await import('../../hooks/useStudy');

describe('useStudy hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useStudyPreferences', () => {
    it('returns study preferences, updatePreferences mutation, and default languageMode', () => {
      mockUseQuery.mockReturnValue(undefined);
      const mockUpdatePrefs = vi.fn();
      mockUseMutation.mockReturnValue(mockUpdatePrefs);

      const { result } = renderHook(() => useStudyPreferences());

      expect(mockUseQuery).toHaveBeenCalledWith('api.study.getStudyPreferences');
      expect(mockUseMutation).toHaveBeenCalledWith('api.study.updatePreferences');
      expect(result.current.preferences).toBeUndefined();
      expect(result.current.updatePreferences).toBe(mockUpdatePrefs);
      expect(result.current.languageMode).toBe('en_to_en');
    });

    it('returns loaded preferences and correct languageMode', () => {
      mockUseQuery.mockReturnValue({ languageMode: 'en_to_zh' });
      const { result } = renderHook(() => useStudyPreferences());
      expect(result.current.preferences).toEqual({ languageMode: 'en_to_zh' });
      expect(result.current.languageMode).toBe('en_to_zh');
    });
  });

  describe('useTermMastery', () => {
    it('calls useQuery without args when unitNumber is not provided', () => {
      renderHook(() => useTermMastery());
      expect(mockUseQuery).toHaveBeenCalledWith('api.study.getTermMasteryByUnit', 'skip');
    });

    it('calls useQuery with unitNumber when provided', () => {
      renderHook(() => useTermMastery(1));
      expect(mockUseQuery).toHaveBeenCalledWith('api.study.getTermMasteryByUnit', { unitNumber: 1 });
    });

    it('returns the query result', () => {
      const mockMastery = [{ termSlug: 'asset', mastery: 0.8 }];
      mockUseQuery.mockReturnValue(mockMastery);
      const { result } = renderHook(() => useTermMastery(1));
      expect(result.current).toEqual(mockMastery);
    });
  });

  describe('useDueTerms', () => {
    it('calls useQuery for getDueTerms', () => {
      renderHook(() => useDueTerms());
      expect(mockUseQuery).toHaveBeenCalledWith('api.study.getDueTerms');
    });

    it('returns the query result', () => {
      const mockDue = [{ termSlug: 'liability', scheduledFor: Date.now() }];
      mockUseQuery.mockReturnValue(mockDue);
      const { result } = renderHook(() => useDueTerms());
      expect(result.current).toEqual(mockDue);
    });
  });

  describe('useRecentSessions', () => {
    it('calls useQuery with skip when limit not provided', () => {
      renderHook(() => useRecentSessions());
      expect(mockUseQuery).toHaveBeenCalledWith('api.study.getRecentSessions', 'skip');
    });

    it('calls useQuery with limit when provided', () => {
      renderHook(() => useRecentSessions(5));
      expect(mockUseQuery).toHaveBeenCalledWith('api.study.getRecentSessions', { limit: 5 });
    });

    it('returns the query result', () => {
      const mockSessions = [{ id: 'session-1', type: 'flashcards' }];
      mockUseQuery.mockReturnValue(mockSessions);
      const { result } = renderHook(() => useRecentSessions(5));
      expect(result.current).toEqual(mockSessions);
    });
  });

  describe('useProcessReview', () => {
    it('returns the useMutation result', () => {
      const mockProcessReview = vi.fn();
      mockUseMutation.mockReturnValue(mockProcessReview);
      const { result } = renderHook(() => useProcessReview());
      expect(mockUseMutation).toHaveBeenCalledWith('api.study.processReview');
      expect(result.current).toBe(mockProcessReview);
    });
  });

  describe('useRecordSession', () => {
    it('returns the useMutation result', () => {
      const mockRecordSession = vi.fn();
      mockUseMutation.mockReturnValue(mockRecordSession);
      const { result } = renderHook(() => useRecordSession());
      expect(mockUseMutation).toHaveBeenCalledWith('api.study.recordSession');
      expect(result.current).toBe(mockRecordSession);
    });
  });

  describe('getGlossaryTermDisplay', () => {
    const mockTerm = {
      slug: 'asset',
      term_en: 'Asset',
      term_zh: '资产',
      def_en: 'An economic resource owned by a business',
      def_zh: '企业拥有的经济资源',
      unitNumber: 1,
      topic: 'accounting-basics',
      synonyms: [],
      relatedTerms: [],
    };

    it('returns en_to_en mode', () => {
      const result = getGlossaryTermDisplay(mockTerm, 'en_to_en');
      expect(result).toEqual({ prompt: 'Asset', answer: 'An economic resource owned by a business' });
    });

    it('returns en_to_zh mode', () => {
      const result = getGlossaryTermDisplay(mockTerm, 'en_to_zh');
      expect(result).toEqual({ prompt: 'Asset', answer: '资产' });
    });

    it('returns zh_to_en mode', () => {
      const result = getGlossaryTermDisplay(mockTerm, 'zh_to_en');
      expect(result).toEqual({ prompt: '资产', answer: 'Asset' });
    });

    it('returns zh_to_zh mode', () => {
      const result = getGlossaryTermDisplay(mockTerm, 'zh_to_zh');
      expect(result).toEqual({ prompt: '资产', answer: '企业拥有的经济资源' });
    });

    it('returns default en_to_en for unknown mode', () => {
      // @ts-expect-error testing invalid mode
      const result = getGlossaryTermDisplay(mockTerm, 'invalid_mode');
      expect(result).toEqual({ prompt: 'Asset', answer: 'An economic resource owned by a business' });
    });
  });
});
