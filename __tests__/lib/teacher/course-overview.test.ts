import { describe, it, expect } from 'vitest';
import { assembleCourseOverviewRows } from '@/lib/teacher/course-overview';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const alice = { id: 'alice', username: 'abrown', displayName: 'Alice Brown' };
const bob   = { id: 'bob',   username: 'bsmith', displayName: null };

// Lessons across 3 units
const lessons = [
  { id: 'l1a', unitNumber: 1 },
  { id: 'l1b', unitNumber: 1 },
  { id: 'l2a', unitNumber: 2 },
  { id: 'l3a', unitNumber: 3 },
];

// Published lesson versions
const lessonVersions = [
  { id: 'lv1a', lessonId: 'l1a' },
  { id: 'lv1b', lessonId: 'l1b' },
  { id: 'lv2a', lessonId: 'l2a' },
  { id: 'lv3a', lessonId: 'l3a' },
];

// Primary standards per lesson version
const standards = [
  { lessonVersionId: 'lv1a', standardId: 'std-u1a', isPrimary: true },
  { lessonVersionId: 'lv1b', standardId: 'std-u1b', isPrimary: true },
  { lessonVersionId: 'lv2a', standardId: 'std-u2a', isPrimary: true },
  { lessonVersionId: 'lv3a', standardId: 'std-u3a', isPrimary: true },
];

// ---------------------------------------------------------------------------
// assembleCourseOverviewRows
// ---------------------------------------------------------------------------

describe('assembleCourseOverviewRows', () => {
  it('returns one UnitColumn per distinct unitNumber, sorted ascending', () => {
    const { units } = assembleCourseOverviewRows(
      [alice],
      [{ id: 'l3a', unitNumber: 3 }, { id: 'l1a', unitNumber: 1 }],
      [{ id: 'lv1a', lessonId: 'l1a' }, { id: 'lv3a', lessonId: 'l3a' }],
      [
        { lessonVersionId: 'lv1a', standardId: 'std-u1', isPrimary: true },
        { lessonVersionId: 'lv3a', standardId: 'std-u3', isPrimary: true },
      ],
      [],
    );
    expect(units.map(u => u.unitNumber)).toEqual([1, 3]);
  });

  it('returns one CourseOverviewRow per student', () => {
    const { rows } = assembleCourseOverviewRows([alice, bob], lessons, lessonVersions, standards, []);
    expect(rows).toHaveLength(2);
  });

  it('falls back to username when displayName is null', () => {
    const { rows } = assembleCourseOverviewRows([bob], lessons, lessonVersions, standards, []);
    expect(rows[0].displayName).toBe('bsmith');
  });

  it('produces a gray cell when student has no competency data for a unit', () => {
    const { rows } = assembleCourseOverviewRows([alice], lessons, lessonVersions, standards, []);
    const u1 = rows[0].cells.find(c => c.unitNumber === 1)!;
    expect(u1.avgMastery).toBeNull();
    expect(u1.color).toBe('gray');
  });

  it('averages mastery across all standards in a unit', () => {
    const competency = [
      { studentId: 'alice', standardId: 'std-u1a', masteryLevel: 70 },
      { studentId: 'alice', standardId: 'std-u1b', masteryLevel: 90 },
    ];
    const { rows } = assembleCourseOverviewRows([alice], lessons, lessonVersions, standards, competency);
    const u1 = rows[0].cells.find(c => c.unitNumber === 1)!;
    expect(u1.avgMastery).toBe(80);
  });

  it('rounds avg mastery to nearest integer', () => {
    const competency = [
      { studentId: 'alice', standardId: 'std-u1a', masteryLevel: 70 },
      { studentId: 'alice', standardId: 'std-u1b', masteryLevel: 75 },
    ];
    const { rows } = assembleCourseOverviewRows([alice], lessons, lessonVersions, standards, competency);
    const u1 = rows[0].cells.find(c => c.unitNumber === 1)!;
    expect(u1.avgMastery).toBe(73); // floor of 72.5 → 73 (Math.round)
  });

  it('color is green when avg mastery >= 80', () => {
    const competency = [{ studentId: 'alice', standardId: 'std-u1a', masteryLevel: 85 }];
    const singleStdStandards = [{ lessonVersionId: 'lv1a', standardId: 'std-u1a', isPrimary: true }];
    const { rows } = assembleCourseOverviewRows(
      [alice],
      [{ id: 'l1a', unitNumber: 1 }],
      [{ id: 'lv1a', lessonId: 'l1a' }],
      singleStdStandards,
      competency,
    );
    expect(rows[0].cells[0].color).toBe('green');
  });

  it('color is yellow when avg mastery 50–79', () => {
    const competency = [{ studentId: 'alice', standardId: 'std-u1a', masteryLevel: 65 }];
    const { rows } = assembleCourseOverviewRows(
      [alice],
      [{ id: 'l1a', unitNumber: 1 }],
      [{ id: 'lv1a', lessonId: 'l1a' }],
      [{ lessonVersionId: 'lv1a', standardId: 'std-u1a', isPrimary: true }],
      competency,
    );
    expect(rows[0].cells[0].color).toBe('yellow');
  });

  it('color is red when avg mastery < 50', () => {
    const competency = [{ studentId: 'alice', standardId: 'std-u1a', masteryLevel: 30 }];
    const { rows } = assembleCourseOverviewRows(
      [alice],
      [{ id: 'l1a', unitNumber: 1 }],
      [{ id: 'lv1a', lessonId: 'l1a' }],
      [{ lessonVersionId: 'lv1a', standardId: 'std-u1a', isPrimary: true }],
      competency,
    );
    expect(rows[0].cells[0].color).toBe('red');
  });

  it('competency data from other students does not bleed into this student', () => {
    const competency = [{ studentId: 'bob', standardId: 'std-u1a', masteryLevel: 90 }];
    const { rows } = assembleCourseOverviewRows(
      [alice],
      [{ id: 'l1a', unitNumber: 1 }],
      [{ id: 'lv1a', lessonId: 'l1a' }],
      [{ lessonVersionId: 'lv1a', standardId: 'std-u1a', isPrimary: true }],
      competency,
    );
    expect(rows[0].cells[0].avgMastery).toBeNull();
    expect(rows[0].cells[0].color).toBe('gray');
  });

  it('ignores non-primary standards when computing unit mastery', () => {
    const mixedStandards = [
      { lessonVersionId: 'lv1a', standardId: 'std-u1a', isPrimary: true },
      { lessonVersionId: 'lv1a', standardId: 'std-u1b', isPrimary: false },
    ];
    const competency = [
      { studentId: 'alice', standardId: 'std-u1a', masteryLevel: 60 },
      { studentId: 'alice', standardId: 'std-u1b', masteryLevel: 100 }, // non-primary, should not count
    ];
    const { rows } = assembleCourseOverviewRows(
      [alice],
      [{ id: 'l1a', unitNumber: 1 }],
      [{ id: 'lv1a', lessonId: 'l1a' }],
      mixedStandards,
      competency,
    );
    expect(rows[0].cells[0].avgMastery).toBe(60); // only primary standard counted
  });

  it('each row has one cell per unit', () => {
    const { rows } = assembleCourseOverviewRows([alice], lessons, lessonVersions, standards, []);
    expect(rows[0].cells).toHaveLength(3); // units 1, 2, 3
  });

  it('cells are ordered by unitNumber within each row', () => {
    const { rows } = assembleCourseOverviewRows([alice], lessons, lessonVersions, standards, []);
    expect(rows[0].cells.map(c => c.unitNumber)).toEqual([1, 2, 3]);
  });
});
