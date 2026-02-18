import { describe, it, expect } from 'vitest';
import {
  computeLessonStatus,
  computeCellColor,
  sortRowsByName,
  buildGradebookCell,
  type GradebookRow,
} from '@/lib/teacher/gradebook';

// ---------------------------------------------------------------------------
// computeLessonStatus
// ---------------------------------------------------------------------------
describe('computeLessonStatus', () => {
  it('returns not_started when phase list is empty', () => {
    expect(computeLessonStatus([])).toBe('not_started');
  });

  it('returns not_started when all phases are not_started', () => {
    expect(computeLessonStatus(['not_started', 'not_started', 'not_started'])).toBe('not_started');
  });

  it('returns completed when all 6 phases are completed', () => {
    expect(
      computeLessonStatus([
        'completed', 'completed', 'completed',
        'completed', 'completed', 'completed',
      ]),
    ).toBe('completed');
  });

  it('returns in_progress when at least one phase is completed but not all', () => {
    expect(
      computeLessonStatus(['completed', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started']),
    ).toBe('in_progress');
  });

  it('returns in_progress when at least one phase is in_progress', () => {
    expect(
      computeLessonStatus(['in_progress', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started']),
    ).toBe('in_progress');
  });

  it('returns in_progress when mix of in_progress and completed (not all done)', () => {
    expect(
      computeLessonStatus(['completed', 'completed', 'in_progress', 'not_started', 'not_started', 'not_started']),
    ).toBe('in_progress');
  });

  it('requires all phases to be completed — 5 of 6 is still in_progress', () => {
    expect(
      computeLessonStatus(['completed', 'completed', 'completed', 'completed', 'completed', 'not_started']),
    ).toBe('in_progress');
  });
});

// ---------------------------------------------------------------------------
// computeCellColor
// ---------------------------------------------------------------------------
describe('computeCellColor', () => {
  it('returns gray when not_started with no mastery data', () => {
    expect(computeCellColor('not_started', null)).toBe('gray');
  });

  it('returns green when status is completed (regardless of mastery)', () => {
    expect(computeCellColor('completed', null)).toBe('green');
    expect(computeCellColor('completed', 0)).toBe('green');
    expect(computeCellColor('completed', 40)).toBe('green');
    expect(computeCellColor('completed', 80)).toBe('green');
  });

  it('returns green when mastery >= 80 (regardless of completion status)', () => {
    expect(computeCellColor('not_started', 80)).toBe('green');
    expect(computeCellColor('not_started', 100)).toBe('green');
    expect(computeCellColor('in_progress', 80)).toBe('green');
    expect(computeCellColor('in_progress', 95)).toBe('green');
  });

  it('returns yellow when status is in_progress with no high mastery', () => {
    expect(computeCellColor('in_progress', null)).toBe('yellow');
    expect(computeCellColor('in_progress', 0)).toBe('yellow');
    expect(computeCellColor('in_progress', 50)).toBe('yellow');
    expect(computeCellColor('in_progress', 79)).toBe('yellow');
  });

  it('returns yellow when mastery is 50-79 and not completed', () => {
    expect(computeCellColor('not_started', 50)).toBe('yellow');
    expect(computeCellColor('not_started', 65)).toBe('yellow');
    expect(computeCellColor('not_started', 79)).toBe('yellow');
  });

  it('returns red when not_started with mastery below 50', () => {
    expect(computeCellColor('not_started', 0)).toBe('red');
    expect(computeCellColor('not_started', 49)).toBe('red');
  });

  it('returns yellow when in_progress even with mastery below 50 — in_progress beats mastery threshold', () => {
    // A student actively working through a lesson stays yellow; red only applies
    // to not_started students whose mastery dipped below 50.
    expect(computeCellColor('in_progress', 30)).toBe('yellow');
    expect(computeCellColor('in_progress', null)).toBe('yellow');
  });

  it('green beats yellow — mastery 80 with in_progress → green', () => {
    expect(computeCellColor('in_progress', 80)).toBe('green');
  });
});

// ---------------------------------------------------------------------------
// sortRowsByName
// ---------------------------------------------------------------------------
describe('sortRowsByName', () => {
  const makeRow = (displayName: string, username: string): GradebookRow => ({
    studentId: username,
    displayName,
    username,
    cells: [],
  });

  it('sorts students alphabetically by displayName (ascending)', () => {
    const rows = [
      makeRow('Zara Ahmed', 'zahmed'),
      makeRow('Alice Brown', 'abrown'),
      makeRow('Mike Chen', 'mchen'),
    ];
    const sorted = sortRowsByName(rows);
    expect(sorted.map(r => r.displayName)).toEqual(['Alice Brown', 'Mike Chen', 'Zara Ahmed']);
  });

  it('is case-insensitive', () => {
    const rows = [makeRow('zara ahmed', 'z'), makeRow('Alice Brown', 'a')];
    const sorted = sortRowsByName(rows);
    expect(sorted[0].displayName).toBe('Alice Brown');
  });

  it('does not mutate the original array', () => {
    const rows = [makeRow('Zara', 'z'), makeRow('Alice', 'a')];
    const original = [...rows];
    sortRowsByName(rows);
    expect(rows[0].displayName).toBe(original[0].displayName);
  });

  it('handles empty array', () => {
    expect(sortRowsByName([])).toEqual([]);
  });

  it('handles single-item array', () => {
    const rows = [makeRow('Alice', 'alice')];
    expect(sortRowsByName(rows)).toEqual(rows);
  });

  it('is stable: equal names preserve original order', () => {
    const rows = [
      makeRow('Alice Brown', 'alice1'),
      makeRow('Alice Brown', 'alice2'),
    ];
    const sorted = sortRowsByName(rows);
    expect(sorted[0].username).toBe('alice1');
    expect(sorted[1].username).toBe('alice2');
  });
});

// ---------------------------------------------------------------------------
// buildGradebookCell
// ---------------------------------------------------------------------------
describe('buildGradebookCell', () => {
  const lesson = {
    lessonId: 'lesson-1',
    lessonTitle: 'Accounting Equation',
    orderIndex: 1,
    isUnitTest: false,
  };

  const unitTestLesson = {
    lessonId: 'lesson-11',
    lessonTitle: 'Unit Test',
    orderIndex: 11,
    isUnitTest: true,
  };

  it('builds a gray cell when no progress and no mastery', () => {
    const cell = buildGradebookCell(lesson, [], null);
    expect(cell.completionStatus).toBe('not_started');
    expect(cell.masteryLevel).toBeNull();
    expect(cell.color).toBe('gray');
    expect(cell.lesson.isUnitTest).toBe(false);
  });

  it('builds a green cell when all 6 phases completed', () => {
    const phases = Array(6).fill('completed') as Array<'completed'>;
    const cell = buildGradebookCell(lesson, phases, null);
    expect(cell.completionStatus).toBe('completed');
    expect(cell.color).toBe('green');
  });

  it('builds a green cell when mastery >= 80 even if in_progress', () => {
    const cell = buildGradebookCell(lesson, ['completed', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started'], 85);
    expect(cell.color).toBe('green');
  });

  it('builds a yellow cell when in_progress with moderate mastery', () => {
    const cell = buildGradebookCell(lesson, ['completed', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started'], 60);
    expect(cell.completionStatus).toBe('in_progress');
    expect(cell.masteryLevel).toBe(60);
    expect(cell.color).toBe('yellow');
  });

  it('marks unit test lesson correctly', () => {
    const cell = buildGradebookCell(unitTestLesson, [], null);
    expect(cell.lesson.isUnitTest).toBe(true);
    expect(cell.lesson.orderIndex).toBe(11);
  });

  it('passes mastery level through to the cell', () => {
    const cell = buildGradebookCell(lesson, [], 73);
    expect(cell.masteryLevel).toBe(73);
  });
});
