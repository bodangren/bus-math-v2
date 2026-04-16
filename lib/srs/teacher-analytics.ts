

export interface SrsCardData {
  studentId: string;
  problemFamilyId: string;
  due: number;
  lastReview: number;
  reviewCount: number;
  createdAt: number;
}

export interface SrsReviewLogEntry {
  studentId: string;
  problemFamilyId: string;
  rating: string;
  reviewedAt: number;
}

export interface StudentInfo {
  _id: string;
  username: string;
  displayName?: string | null;
}

export interface ClassHealthSummary {
  totalStudents: number;
  studentsWithCards: number;
  averageRetentionRate: number; // % of cards that have been reviewed at least once
  overdueCardCount: number;
  cardsDueToday: number;
  totalCards: number;
}

export interface FamilyPerformance {
  problemFamilyId: string;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  totalReviews: number;
  againRate: number; // 0-1
  averageRating: number; // 1-4 scale (Again=1, Hard=2, Good=3, Easy=4)
}

export interface StudentStruggleMetrics {
  studentId: string;
  username: string;
  displayName?: string | null;
  overdueCards: number;
  totalCards: number;
  totalReviews: number;
  againRate: number; // 0-1
  lastActive: number | null; // timestamp of last review
}

const RATING_VALUES: Record<string, number> = {
  Again: 1,
  Hard: 2,
  Good: 3,
  Easy: 4,
};

export function computeClassHealth(
  students: StudentInfo[],
  cards: SrsCardData[],
  now: number,
  startOfDay: number,
  endOfDay: number
): ClassHealthSummary {
  const totalStudents = students.length;
  const studentIdsWithCards = new Set(cards.map((c) => c.studentId));
  const studentsWithCards = studentIdsWithCards.size;

  let totalCards = 0;
  let reviewedCards = 0;
  let overdueCardCount = 0;
  let cardsDueToday = 0;

  for (const card of cards) {
    totalCards++;
    if (card.reviewCount > 0) {
      reviewedCards++;
    }
    if (card.due < startOfDay) {
      overdueCardCount++;
    }
    if (card.due >= startOfDay && card.due <= endOfDay) {
      cardsDueToday++;
    }
  }

  const averageRetentionRate =
    totalCards > 0 ? (reviewedCards / totalCards) * 100 : 0;

  return {
    totalStudents,
    studentsWithCards,
    averageRetentionRate: Math.round(averageRetentionRate * 10) / 10, // 1 decimal place
    overdueCardCount,
    cardsDueToday,
    totalCards,
  };
}

export function computeFamilyPerformance(
  reviews: SrsReviewLogEntry[]
): FamilyPerformance[] {
  const familyMap = new Map<string, FamilyPerformance>();

  for (const review of reviews) {
    const existing = familyMap.get(review.problemFamilyId);
    if (existing) {
      existing.totalReviews++;
      if (review.rating === "Again") existing.againCount++;
      if (review.rating === "Hard") existing.hardCount++;
      if (review.rating === "Good") existing.goodCount++;
      if (review.rating === "Easy") existing.easyCount++;
    } else {
      familyMap.set(review.problemFamilyId, {
        problemFamilyId: review.problemFamilyId,
        againCount: review.rating === "Again" ? 1 : 0,
        hardCount: review.rating === "Hard" ? 1 : 0,
        goodCount: review.rating === "Good" ? 1 : 0,
        easyCount: review.rating === "Easy" ? 1 : 0,
        totalReviews: 1,
        againRate: 0,
        averageRating: 0,
      });
    }
  }

  const results: FamilyPerformance[] = [];
  for (const perf of familyMap.values()) {
    perf.againRate =
      perf.totalReviews > 0 ? perf.againCount / perf.totalReviews : 0;

    const weightedSum =
      perf.againCount * RATING_VALUES.Again +
      perf.hardCount * RATING_VALUES.Hard +
      perf.goodCount * RATING_VALUES.Good +
      perf.easyCount * RATING_VALUES.Easy;

    perf.averageRating =
      perf.totalReviews > 0 ? weightedSum / perf.totalReviews : 0;

    results.push(perf);
  }

  // Sort by againRate descending (worst performing first)
  return results.sort((a, b) => b.againRate - a.againRate);
}

export function computeStrugglingStudents(
  students: StudentInfo[],
  cards: SrsCardData[],
  reviews: SrsReviewLogEntry[],
  now: number
): StudentStruggleMetrics[] {
  const studentMap = new Map<string, StudentStruggleMetrics>();

  // Initialize all students
  for (const student of students) {
    studentMap.set(student._id, {
      studentId: student._id,
      username: student.username,
      displayName: student.displayName,
      overdueCards: 0,
      totalCards: 0,
      totalReviews: 0,
      againRate: 0,
      lastActive: null,
    });
  }

  // Aggregate card data per student
  for (const card of cards) {
    const student = studentMap.get(card.studentId);
    if (student) {
      student.totalCards++;
      if (card.due <= now) {
        student.overdueCards++;
      }
    }
  }

  // Aggregate review data per student
  const studentAgainCounts = new Map<string, number>();
  for (const review of reviews) {
    const student = studentMap.get(review.studentId);
    if (student) {
      student.totalReviews++;
      if (review.rating === "Again") {
        studentAgainCounts.set(
          review.studentId,
          (studentAgainCounts.get(review.studentId) || 0) + 1
        );
      }
      // Track last active
      if (!student.lastActive || review.reviewedAt > student.lastActive) {
        student.lastActive = review.reviewedAt;
      }
    }
  }

  // Compute again rates
  for (const student of studentMap.values()) {
    const againCount = studentAgainCounts.get(student.studentId) || 0;
    student.againRate =
      student.totalReviews > 0 ? againCount / student.totalReviews : 0;
  }

  // Convert to array and sort by overdue cards descending, then by again rate
  const results = Array.from(studentMap.values()).sort((a, b) => {
    if (b.overdueCards !== a.overdueCards) {
      return b.overdueCards - a.overdueCards;
    }
    return b.againRate - a.againRate;
  });

  // Return top 10 struggling students
  return results.slice(0, 10);
}

export function formatFamilyDisplayName(problemFamilyId: string): string {
  // Convert kebab-case to title case
  // e.g., "transaction-effects" -> "Transaction Effects"
  return problemFamilyId
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
