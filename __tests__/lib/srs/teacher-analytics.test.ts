import { describe, it, expect } from 'vitest';
import {
  computeClassHealth,
  computeFamilyPerformance,
  computeStrugglingStudents,
  formatFamilyDisplayName,
} from '../../../lib/srs/teacher-analytics';

describe('lib/srs/teacher-analytics', () => {
  describe('computeClassHealth', () => {
    it('returns zeros for empty class', () => {
      const now = Date.now();
      const startOfDay = now - 86400000;
      const endOfDay = now + 86400000;

      const result = computeClassHealth([], [], now, startOfDay, endOfDay);

      expect(result).toEqual({
        totalStudents: 0,
        studentsWithCards: 0,
        averageRetentionRate: 0,
        overdueCardCount: 0,
        cardsDueToday: 0,
        totalCards: 0,
      });
    });

    it('computes basic health metrics correctly', () => {
      const now = 1000000000000;
      const startOfDay = now - 43200000; // 12 hours ago
      const endOfDay = now + 43200000; // 12 hours later

      const students = [
        { _id: 's1', username: 'alice' },
        { _id: 's2', username: 'bob' },
      ];

      const cards = [
        { studentId: 's1', problemFamilyId: 'f1', due: now - 1000, lastReview: now - 2000, reviewCount: 1, createdAt: now - 3000 },
        { studentId: 's1', problemFamilyId: 'f2', due: now + 10000, lastReview: 0, reviewCount: 0, createdAt: now - 3000 },
        { studentId: 's2', problemFamilyId: 'f1', due: now - 500, lastReview: now - 1000, reviewCount: 2, createdAt: now - 3000 },
      ];

      const result = computeClassHealth(students, cards, now, startOfDay, endOfDay);

      expect(result.totalStudents).toBe(2);
      expect(result.studentsWithCards).toBe(2);
      expect(result.totalCards).toBe(3);
      expect(result.averageRetentionRate).toBeCloseTo(66.7, 1);
      expect(result.overdueCardCount).toBe(2);
      expect(result.cardsDueToday).toBe(3);
    });

    it('counts only cards due today within day boundaries', () => {
      const now = 1000000000000;
      const startOfDay = now;
      const endOfDay = now + 86400000;

      const students = [{ _id: 's1', username: 'alice' }];
      const cards = [
        { studentId: 's1', problemFamilyId: 'f1', due: now + 1000, lastReview: 0, reviewCount: 0, createdAt: now - 1000 },
        { studentId: 's1', problemFamilyId: 'f2', due: now + 90000000, lastReview: 0, reviewCount: 0, createdAt: now - 1000 },
      ];

      const result = computeClassHealth(students, cards, now, startOfDay, endOfDay);

      expect(result.cardsDueToday).toBe(1);
    });
  });

  describe('computeFamilyPerformance', () => {
    it('returns empty array when no reviews exist', () => {
      expect(computeFamilyPerformance([])).toEqual([]);
    });

    it('computes per-family stats and sorts by again rate descending', () => {
      const reviews = [
        { studentId: 's1', problemFamilyId: 'family-a', rating: 'Again' as const, reviewedAt: 1000 },
        { studentId: 's1', problemFamilyId: 'family-a', rating: 'Good' as const, reviewedAt: 2000 },
        { studentId: 's2', problemFamilyId: 'family-a', rating: 'Again' as const, reviewedAt: 3000 },
        { studentId: 's1', problemFamilyId: 'family-b', rating: 'Easy' as const, reviewedAt: 4000 },
        { studentId: 's2', problemFamilyId: 'family-b', rating: 'Good' as const, reviewedAt: 5000 },
      ];

      const result = computeFamilyPerformance(reviews);

      expect(result).toHaveLength(2);
      
      // family-a should be first (higher again rate)
      expect(result[0].problemFamilyId).toBe('family-a');
      expect(result[0].againCount).toBe(2);
      expect(result[0].goodCount).toBe(1);
      expect(result[0].totalReviews).toBe(3);
      expect(result[0].againRate).toBeCloseTo(0.667, 2);
      expect(result[0].averageRating).toBeCloseTo(1.667, 2);

      expect(result[1].problemFamilyId).toBe('family-b');
      expect(result[1].againCount).toBe(0);
      expect(result[1].easyCount).toBe(1);
      expect(result[1].goodCount).toBe(1);
      expect(result[1].againRate).toBe(0);
      expect(result[1].averageRating).toBe(3.5);
    });

    it('handles single review per family', () => {
      const reviews = [
        { studentId: 's1', problemFamilyId: 'family-x', rating: 'Hard' as const, reviewedAt: 1000 },
      ];

      const result = computeFamilyPerformance(reviews);

      expect(result).toHaveLength(1);
      expect(result[0].againRate).toBe(0);
      expect(result[0].averageRating).toBe(2);
    });
  });

  describe('computeStrugglingStudents', () => {
    it('returns all students sorted by overdue descending', () => {
      const now = 1000000000000;

      const students = [
        { _id: 's1', username: 'alice' },
        { _id: 's2', username: 'bob' },
        { _id: 's3', username: 'charlie' },
      ];

      const cards = [
        { studentId: 's1', problemFamilyId: 'f1', due: now - 1000, lastReview: now - 2000, reviewCount: 1, createdAt: now - 3000 },
        { studentId: 's1', problemFamilyId: 'f2', due: now - 500, lastReview: now - 1000, reviewCount: 1, createdAt: now - 3000 },
        { studentId: 's2', problemFamilyId: 'f1', due: now + 10000, lastReview: 0, reviewCount: 0, createdAt: now - 3000 },
        { studentId: 's3', problemFamilyId: 'f1', due: now - 2000, lastReview: now - 3000, reviewCount: 2, createdAt: now - 4000 },
      ];

      const reviews = [
        { studentId: 's1', problemFamilyId: 'f1', rating: 'Again' as const, reviewedAt: now - 2000 },
        { studentId: 's1', problemFamilyId: 'f2', rating: 'Again' as const, reviewedAt: now - 1000 },
        { studentId: 's2', problemFamilyId: 'f1', rating: 'Good' as const, reviewedAt: now - 500 },
        { studentId: 's3', problemFamilyId: 'f1', rating: 'Easy' as const, reviewedAt: now - 3000 },
      ];

      const result = computeStrugglingStudents(students, cards, reviews, now);

      expect(result).toHaveLength(3);
      // alice has 2 overdue, charlie has 1, bob has 0
      expect(result[0].studentId).toBe('s1');
      expect(result[0].overdueCards).toBe(2);
      expect(result[0].againRate).toBe(1);

      expect(result[1].studentId).toBe('s3');
      expect(result[1].overdueCards).toBe(1);
      expect(result[1].againRate).toBe(0);

      expect(result[2].studentId).toBe('s2');
      expect(result[2].overdueCards).toBe(0);
      expect(result[2].againRate).toBe(0);
    });

    it('includes students with zero cards and zero reviews', () => {
      const now = 1000000000000;
      const students = [{ _id: 's1', username: 'alice' }];

      const result = computeStrugglingStudents(students, [], [], now);

      expect(result).toHaveLength(1);
      expect(result[0].overdueCards).toBe(0);
      expect(result[0].totalCards).toBe(0);
      expect(result[0].totalReviews).toBe(0);
      expect(result[0].againRate).toBe(0);
    });

    it('breaks ties using again rate', () => {
      const now = 1000000000000;
      const students = [
        { _id: 's1', username: 'alice' },
        { _id: 's2', username: 'bob' },
      ];

      const cards = [
        { studentId: 's1', problemFamilyId: 'f1', due: now - 1000, lastReview: 0, reviewCount: 0, createdAt: now - 2000 },
        { studentId: 's2', problemFamilyId: 'f1', due: now - 1000, lastReview: 0, reviewCount: 0, createdAt: now - 2000 },
      ];

      const reviews = [
        { studentId: 's1', problemFamilyId: 'f1', rating: 'Again' as const, reviewedAt: now - 1000 },
        { studentId: 's2', problemFamilyId: 'f1', rating: 'Good' as const, reviewedAt: now - 1000 },
      ];

      const result = computeStrugglingStudents(students, cards, reviews, now);

      expect(result[0].studentId).toBe('s1'); // higher again rate
      expect(result[1].studentId).toBe('s2');
    });

    it('caps results at 10 students', () => {
      const now = 1000000000000;
      const students = Array.from({ length: 15 }, (_, i) => ({
        _id: `s${i}`,
        username: `student${i}`,
      }));

      const cards = students.map((s, i) => ({
        studentId: s._id,
        problemFamilyId: 'f1',
        due: now - i * 1000,
        lastReview: 0,
        reviewCount: 0,
        createdAt: now - 2000,
      }));

      const result = computeStrugglingStudents(students, cards, [], now);

      expect(result).toHaveLength(10);
    });
  });

  describe('formatFamilyDisplayName', () => {
    it('converts kebab-case to title case', () => {
      expect(formatFamilyDisplayName('transaction-effects')).toBe('Transaction Effects');
      expect(formatFamilyDisplayName('cvp-analysis')).toBe('Cvp Analysis');
    });

    it('handles single word', () => {
      expect(formatFamilyDisplayName('classification')).toBe('Classification');
    });
  });
});
