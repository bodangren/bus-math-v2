import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetClassSrsHealth = vi.fn();
const mockGetWeakFamilies = vi.fn();
const mockGetStrugglingStudents = vi.fn();
const mockResetStudentCard = vi.fn();
const mockBumpFamilyPriority = vi.fn();

vi.mock('@/convex/_generated/api', () => ({
  api: {
    srs: {
      getClassSrsHealth: mockGetClassSrsHealth,
      getWeakFamilies: mockGetWeakFamilies,
      getStrugglingStudents: mockGetStrugglingStudents,
      resetStudentCard: mockResetStudentCard,
      bumpFamilyPriority: mockBumpFamilyPriority,
    },
  },
}));

describe('convex/srs teacher queries and mutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getClassSrsHealth', () => {
    it('returns health metrics for a class', async () => {
      mockGetClassSrsHealth.mockReturnValue({
        classId: 'class_123',
        totalStudents: 10,
        studentsWithCards: 8,
        averageRetentionRate: 75.5,
        overdueCardCount: 12,
        cardsDueToday: 5,
        totalCards: 24,
      });

      const result = await mockGetClassSrsHealth({ classId: 'class_123' });

      expect(result.totalStudents).toBe(10);
      expect(result.studentsWithCards).toBe(8);
      expect(result.averageRetentionRate).toBe(75.5);
      expect(result.overdueCardCount).toBe(12);
    });

    it('rejects non-teachers', async () => {
      mockGetClassSrsHealth.mockRejectedValue(new Error('Unauthorized'));

      await expect(mockGetClassSrsHealth({ classId: 'class_123' })).rejects.toThrow('Unauthorized');
    });

    it('rejects access to classes not taught by caller', async () => {
      mockGetClassSrsHealth.mockRejectedValue(new Error('Unauthorized'));

      await expect(mockGetClassSrsHealth({ classId: 'other_class' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('getWeakFamilies', () => {
    it('returns families sorted by again rate descending', async () => {
      mockGetWeakFamilies.mockReturnValue([
        {
          problemFamilyId: 'transaction-effects',
          displayName: 'Transaction Effects',
          againCount: 5,
          hardCount: 2,
          goodCount: 3,
          easyCount: 0,
          totalReviews: 10,
          againRate: 0.5,
          averageRating: 1.7,
        },
        {
          problemFamilyId: 'cvp-analysis',
          displayName: 'Cvp Analysis',
          againCount: 1,
          hardCount: 1,
          goodCount: 8,
          easyCount: 0,
          totalReviews: 10,
          againRate: 0.1,
          averageRating: 2.9,
        },
      ]);

      const result = await mockGetWeakFamilies({ classId: 'class_123' });

      expect(result).toHaveLength(2);
      expect(result[0].problemFamilyId).toBe('transaction-effects');
      expect(result[0].againRate).toBe(0.5);
      expect(result[1].problemFamilyId).toBe('cvp-analysis');
      expect(result[1].againRate).toBe(0.1);
    });

    it('includes display names for families', async () => {
      mockGetWeakFamilies.mockReturnValue([
        {
          problemFamilyId: 'journal-entry',
          displayName: 'Journal Entry',
          againCount: 0,
          totalReviews: 0,
          againRate: 0,
          averageRating: 0,
        },
      ]);

      const result = await mockGetWeakFamilies({ classId: 'class_123' });

      expect(result[0].displayName).toBe('Journal Entry');
    });

    it('rejects non-teachers', async () => {
      mockGetWeakFamilies.mockRejectedValue(new Error('Unauthorized'));

      await expect(mockGetWeakFamilies({ classId: 'class_123' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('getStrugglingStudents', () => {
    it('returns students sorted by overdue cards descending', async () => {
      mockGetStrugglingStudents.mockReturnValue({
        classId: 'class_123',
        students: [
          {
            studentId: 's1',
            username: 'alice',
            displayName: 'Alice',
            overdueCards: 5,
            totalCards: 8,
            totalReviews: 12,
            againRate: 0.25,
            lastActive: Date.now() - 86400000,
          },
          {
            studentId: 's2',
            username: 'bob',
            displayName: 'Bob',
            overdueCards: 2,
            totalCards: 10,
            totalReviews: 20,
            againRate: 0.1,
            lastActive: Date.now() - 172800000,
          },
        ],
      });

      const result = await mockGetStrugglingStudents({ classId: 'class_123' });

      expect(result.students).toHaveLength(2);
      expect(result.students[0].studentId).toBe('s1');
      expect(result.students[0].overdueCards).toBe(5);
      expect(result.students[1].studentId).toBe('s2');
    });

    it('rejects non-teachers', async () => {
      mockGetStrugglingStudents.mockRejectedValue(new Error('Unauthorized'));

      await expect(mockGetStrugglingStudents({ classId: 'class_123' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('resetStudentCard', () => {
    it('resets a student card to new state', async () => {
      mockResetStudentCard.mockResolvedValue({ success: true });

      const result = await mockResetStudentCard({
        studentId: 's1',
        problemFamilyId: 'transaction-effects',
      });

      expect(result.success).toBe(true);
      expect(mockResetStudentCard).toHaveBeenCalledWith({
        studentId: 's1',
        problemFamilyId: 'transaction-effects',
      });
    });

    it('rejects non-teachers', async () => {
      mockResetStudentCard.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        mockResetStudentCard({ studentId: 's1', problemFamilyId: 'f1' }),
      ).rejects.toThrow('Unauthorized');
    });

    it('rejects resetting cards for students outside teacher classes', async () => {
      mockResetStudentCard.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        mockResetStudentCard({ studentId: 'other_student', problemFamilyId: 'f1' }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('bumpFamilyPriority', () => {
    it('bumps priority for a family across the class', async () => {
      mockBumpFamilyPriority.mockResolvedValue({ success: true, affectedCount: 8 });

      const result = await mockBumpFamilyPriority({
        classId: 'class_123',
        problemFamilyId: 'transaction-effects',
      });

      expect(result.success).toBe(true);
      expect(result.affectedCount).toBe(8);
    });

    it('rejects non-teachers', async () => {
      mockBumpFamilyPriority.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        mockBumpFamilyPriority({ classId: 'class_123', problemFamilyId: 'f1' }),
      ).rejects.toThrow('Unauthorized');
    });

    it('rejects bumping for classes not taught by caller', async () => {
      mockBumpFamilyPriority.mockRejectedValue(new Error('Unauthorized'));

      await expect(
        mockBumpFamilyPriority({ classId: 'other_class', problemFamilyId: 'f1' }),
      ).rejects.toThrow('Unauthorized');
    });
  });
});
