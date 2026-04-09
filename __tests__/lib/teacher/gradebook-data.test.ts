import { describe, it, expect } from 'vitest';
import { assembleGradebookRows } from '@/lib/teacher/gradebook';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const lesson1 = { id: 'l1', title: 'Accounting Equation', orderIndex: 1, unitNumber: 1 };
const lesson2 = { id: 'l2', title: 'Journal Entries',     orderIndex: 2, unitNumber: 1 };
const lesson11 = { id: 'l11', title: 'Unit Test',         orderIndex: 11, unitNumber: 1 };

const lv1  = { id: 'lv1',  lessonId: 'l1'  };
const lv2  = { id: 'lv2',  lessonId: 'l2'  };
const lv11 = { id: 'lv11', lessonId: 'l11' };

// 6 phases each
const phasesFor = (lvId: string, prefix: string) =>
  Array.from({ length: 6 }, (_, i) => ({
    id: `${prefix}-p${i + 1}`,
    lessonVersionId: lvId,
    phaseNumber: i + 1,
  }));

const pv1  = phasesFor('lv1',  'pv1');
const pv2  = phasesFor('lv2',  'pv2');
const pv11 = phasesFor('lv11', 'pv11');
const allPhases = [...pv1, ...pv2, ...pv11];

const std1  = { lessonVersionId: 'lv1',  standardId: 'std-acc', isPrimary: true };
const std2  = { lessonVersionId: 'lv2',  standardId: 'std-jnl', isPrimary: true };
const std11 = { lessonVersionId: 'lv11', standardId: 'std-ut',  isPrimary: true };

const alice = { id: 'alice', username: 'abrown', displayName: 'Alice Brown' };
const bob   = { id: 'bob',   username: 'bsmith', displayName: null }; // null displayName

// ---------------------------------------------------------------------------
// assembleGradebookRows
// ---------------------------------------------------------------------------

describe('assembleGradebookRows', () => {
  it('returns one GradebookLesson per lesson, ordered by orderIndex', () => {
    const { lessons } = assembleGradebookRows(
      [alice],
      [lesson2, lesson1, lesson11], // deliberately out of order
      [lv1, lv2, lv11],
      allPhases,
      [std1, std2, std11],
      [],
      [],
      [],
      [],
    );
    expect(lessons.map(l => l.orderIndex)).toEqual([1, 2, 11]);
  });

  it('marks L11 as isUnitTest', () => {
    const { lessons } = assembleGradebookRows(
      [alice],
      [lesson1, lesson11],
      [lv1, lv11],
      [...pv1, ...pv11],
      [std1, std11],
      [],
      [],
    );
    const l11 = lessons.find(l => l.orderIndex === 11);
    expect(l11?.isUnitTest).toBe(true);
    const l1 = lessons.find(l => l.orderIndex === 1);
    expect(l1?.isUnitTest).toBe(false);
  });

  it('returns one GradebookRow per student', () => {
    const { rows } = assembleGradebookRows(
      [alice, bob],
      [lesson1],
      [lv1],
      pv1,
      [std1],
      [],
      [],
    );
    expect(rows).toHaveLength(2);
  });

  it('falls back to username when displayName is null', () => {
    const { rows } = assembleGradebookRows(
      [bob],
      [lesson1],
      [lv1],
      pv1,
      [std1],
      [],
      [],
    );
    expect(rows[0].displayName).toBe('bsmith');
  });

  it('uses displayName when available', () => {
    const { rows } = assembleGradebookRows(
      [alice],
      [lesson1],
      [lv1],
      pv1,
      [std1],
      [],
      [],
    );
    expect(rows[0].displayName).toBe('Alice Brown');
  });

  it('builds a gray cell when no progress and no competency', () => {
    const { rows } = assembleGradebookRows(
      [alice],
      [lesson1],
      [lv1],
      pv1,
      [std1],
      [],
      [],
    );
    const cell = rows[0].cells[0];
    expect(cell.completionStatus).toBe('not_started');
    expect(cell.masteryLevel).toBeNull();
    expect(cell.color).toBe('gray');
  });

  it('builds a green cell when all 6 phases are completed', () => {
    const allCompleted = pv1.map(p => ({
      userId: 'alice',
      phaseId: p.id,
      status: 'completed' as const,
    }));

    const { rows } = assembleGradebookRows(
      [alice],
      [lesson1],
      [lv1],
      pv1,
      [std1],
      allCompleted,
      [],
    );
    const cell = rows[0].cells[0];
    expect(cell.completionStatus).toBe('completed');
    expect(cell.color).toBe('green');
  });

  it('builds a yellow cell when some phases completed', () => {
    const partial = [
      { userId: 'alice', phaseId: pv1[0].id, status: 'completed' as const },
    ];
    const { rows } = assembleGradebookRows(
      [alice],
      [lesson1],
      [lv1],
      pv1,
      [std1],
      partial,
      [],
    );
    const cell = rows[0].cells[0];
    expect(cell.completionStatus).toBe('in_progress');
    expect(cell.color).toBe('yellow');
  });

  it('applies mastery level to the correct lesson cell', () => {
    const competency = [
      { studentId: 'alice', standardId: 'std-acc', masteryLevel: 85 },
    ];
    const { rows } = assembleGradebookRows(
      [alice],
      [lesson1, lesson2],
      [lv1, lv2],
      [...pv1, ...pv2],
      [std1, std2],
      [],
      competency,
    );

    const aliceRow = rows.find(r => r.studentId === 'alice')!;
    const l1Cell = aliceRow.cells.find(c => c.lesson.lessonId === 'l1')!;
    const l2Cell = aliceRow.cells.find(c => c.lesson.lessonId === 'l2')!;

    expect(l1Cell.masteryLevel).toBe(85);
    expect(l2Cell.masteryLevel).toBeNull(); // no competency for std-jnl
  });

  it('mastery >= 80 makes cell green even with no completion', () => {
    const competency = [
      { studentId: 'alice', standardId: 'std-acc', masteryLevel: 90 },
    ];
    const { rows } = assembleGradebookRows(
      [alice],
      [lesson1],
      [lv1],
      pv1,
      [std1],
      [],
      competency,
    );
    expect(rows[0].cells[0].color).toBe('green');
  });

  it('only uses the primary standard for mastery (ignores non-primary)', () => {
    const nonPrimary = { lessonVersionId: 'lv1', standardId: 'std-other', isPrimary: false };
    const competency = [
      { studentId: 'alice', standardId: 'std-other', masteryLevel: 95 },
    ];
    const { rows } = assembleGradebookRows(
      [alice],
      [lesson1],
      [lv1],
      pv1,
      [nonPrimary],
      [],
      competency,
    );
    // Non-primary standard should not count → no mastery → gray
    expect(rows[0].cells[0].masteryLevel).toBeNull();
    expect(rows[0].cells[0].color).toBe('gray');
  });

  it('progress rows from other students do not affect this student', () => {
    const otherProgress = pv1.map(p => ({
      userId: 'bob',
      phaseId: p.id,
      status: 'completed' as const,
    }));
    const { rows } = assembleGradebookRows(
      [alice],
      [lesson1],
      [lv1],
      pv1,
      [std1],
      otherProgress,
      [],
    );
    // alice has no progress rows → not_started
    expect(rows[0].cells[0].completionStatus).toBe('not_started');
  });

  it('cells are ordered by lesson orderIndex within each row', () => {
    const { rows } = assembleGradebookRows(
      [alice],
      [lesson2, lesson1], // out of order
      [lv1, lv2],
      [...pv1, ...pv2],
      [std1, std2],
      [],
      [],
    );
    expect(rows[0].cells.map(c => c.lesson.orderIndex)).toEqual([1, 2]);
  });
});
