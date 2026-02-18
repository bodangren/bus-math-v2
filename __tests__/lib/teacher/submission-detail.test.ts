import { describe, it, expect, vi } from 'vitest';

// Mock DB so importing submission-detail doesn't require DATABASE_URL
vi.mock('@/lib/db/drizzle', () => ({ db: {} }));

import {
  assembleSubmissionDetail,
  type RawPhaseVersion,
  type RawProgressRow,
} from '@/lib/teacher/submission-detail';
import type { SpreadsheetData } from '@/lib/db/schema/spreadsheet-responses';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const PHASES: RawPhaseVersion[] = [
  { id: 'phase-1', phaseNumber: 1, title: 'Hook' },
  { id: 'phase-2', phaseNumber: 2, title: 'Introduction' },
  { id: 'phase-3', phaseNumber: 3, title: null }, // null title → fallback
  { id: 'phase-4', phaseNumber: 4, title: 'Independent Practice' },
  { id: 'phase-5', phaseNumber: 5, title: 'Assessment' },
  { id: 'phase-6', phaseNumber: 6, title: 'Closing' },
];

const PROGRESS_ALL_COMPLETE: RawProgressRow[] = [
  { phaseId: 'phase-1', status: 'completed', completedAt: '2024-01-10T12:00:00.000Z' },
  { phaseId: 'phase-2', status: 'completed', completedAt: '2024-01-11T12:00:00.000Z' },
  { phaseId: 'phase-3', status: 'completed', completedAt: '2024-01-12T12:00:00.000Z' },
  { phaseId: 'phase-4', status: 'completed', completedAt: '2024-01-13T12:00:00.000Z' },
  { phaseId: 'phase-5', status: 'completed', completedAt: '2024-01-14T12:00:00.000Z' },
  { phaseId: 'phase-6', status: 'completed', completedAt: '2024-01-15T12:00:00.000Z' },
];

// ---------------------------------------------------------------------------
// assembleSubmissionDetail
// ---------------------------------------------------------------------------

describe('assembleSubmissionDetail', () => {
  it('returns studentName and lessonTitle unchanged', () => {
    const result = assembleSubmissionDetail(
      'Alice Brown',
      'Accounting Equation',
      PHASES,
      [],
      new Map(),
    );
    expect(result.studentName).toBe('Alice Brown');
    expect(result.lessonTitle).toBe('Accounting Equation');
  });

  it('returns phases sorted by phaseNumber ascending', () => {
    const shuffled = [...PHASES].reverse();
    const result = assembleSubmissionDetail('Alice', 'L1', shuffled, [], new Map());
    const nums = result.phases.map(p => p.phaseNumber);
    expect(nums).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('uses phase title from DB when available', () => {
    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map());
    expect(result.phases[0].title).toBe('Hook');
    expect(result.phases[1].title).toBe('Introduction');
  });

  it('falls back to default name when DB title is null', () => {
    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map());
    // phase-3 has title: null → should fall back to 'Guided Practice'
    const phase3 = result.phases.find(p => p.phaseNumber === 3)!;
    expect(phase3.title).toBe('Guided Practice');
  });

  it('falls back to "Phase N" for unknown phase numbers', () => {
    const oddPhase: RawPhaseVersion = { id: 'phase-9', phaseNumber: 9, title: null };
    const result = assembleSubmissionDetail('Alice', 'L1', [oddPhase], [], new Map());
    expect(result.phases[0].title).toBe('Phase 9');
  });

  it('marks phases without progress as not_started', () => {
    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map());
    for (const phase of result.phases) {
      expect(phase.status).toBe('not_started');
      expect(phase.completedAt).toBeNull();
    }
  });

  it('assigns correct status from progress rows', () => {
    const progress: RawProgressRow[] = [
      { phaseId: 'phase-1', status: 'completed', completedAt: '2024-01-10T12:00:00.000Z' },
      { phaseId: 'phase-2', status: 'in_progress', completedAt: null },
    ];
    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, progress, new Map());

    const p1 = result.phases.find(p => p.phaseId === 'phase-1')!;
    expect(p1.status).toBe('completed');
    expect(p1.completedAt).toBe('2024-01-10T12:00:00.000Z');

    const p2 = result.phases.find(p => p.phaseId === 'phase-2')!;
    expect(p2.status).toBe('in_progress');
    expect(p2.completedAt).toBeNull();
  });

  it('attaches spreadsheetData to the correct phase', () => {
    const mockData: SpreadsheetData = [[{ value: 'Revenue', readOnly: true }, { value: 1000 }]];
    const ssMap = new Map<number, SpreadsheetData>([[5, mockData]]);

    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], ssMap);

    const phase5 = result.phases.find(p => p.phaseNumber === 5)!;
    expect(phase5.spreadsheetData).toBe(mockData);

    // Other phases have no spreadsheet data
    for (const phase of result.phases.filter(p => p.phaseNumber !== 5)) {
      expect(phase.spreadsheetData).toBeNull();
    }
  });

  it('returns spreadsheetData as null for phases without submissions', () => {
    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map());
    for (const phase of result.phases) {
      expect(phase.spreadsheetData).toBeNull();
    }
  });

  it('handles all phases completed — full progress snapshot', () => {
    const result = assembleSubmissionDetail(
      'Alice',
      'L1',
      PHASES,
      PROGRESS_ALL_COMPLETE,
      new Map(),
    );
    for (const phase of result.phases) {
      expect(phase.status).toBe('completed');
      expect(phase.completedAt).not.toBeNull();
    }
  });

  it('does not mutate the original rawPhases array ordering', () => {
    const reversed = [...PHASES].reverse();
    const original = reversed.map(p => p.phaseNumber);
    assembleSubmissionDetail('Alice', 'L1', reversed, [], new Map());
    expect(reversed.map(p => p.phaseNumber)).toEqual(original);
  });

  it('includes phaseId in each PhaseDetail', () => {
    const result = assembleSubmissionDetail('Alice', 'L1', PHASES, [], new Map());
    const ids = result.phases.map(p => p.phaseId);
    expect(ids).toEqual(['phase-1', 'phase-2', 'phase-3', 'phase-4', 'phase-5', 'phase-6']);
  });

  it('handles empty phases array', () => {
    const result = assembleSubmissionDetail('Alice', 'L1', [], [], new Map());
    expect(result.phases).toHaveLength(0);
  });
});
