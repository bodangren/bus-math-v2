import { buildPracticeSubmissionEnvelope, normalizePracticeValue, type PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import { getAccountById } from '@/lib/practice/engine/accounts';
import { generateMiniLedger, type MiniLedger } from '@/lib/practice/engine/mini-ledger';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';
import type { JournalEntryAccountOption, JournalEntryLine } from './journal-entry';

export type CycleDecisionScenarioKind = 'reversing-selection' | 'closing-entry';
export type CycleDecisionSelectionChoice = 'reverse' | 'do-not-reverse';

export interface CycleDecisionSelectionRow {
  id: string;
  label: string;
  description: string;
  hint?: string;
  reversingRecommended: boolean;
  selectionMode?: 'single';
}

export interface CycleDecisionSelectionColumn {
  id: CycleDecisionSelectionChoice;
  label: string;
  description?: string;
}

export interface CycleDecisionPart extends ProblemPartDefinition {
  id: string;
  kind: 'selection' | 'journal-entry';
  label: string;
  description?: string;
  targetId: string;
  details: {
    kind: 'selection' | 'journal-entry';
    explanation: string;
    reversingRecommended?: boolean;
    expectedChoice?: CycleDecisionSelectionChoice;
    date?: string;
    accountId?: string;
    accountLabel?: string;
    debit?: number;
    credit?: number;
    memo?: string;
  };
}

export interface CycleDecisionScenario {
  kind: CycleDecisionScenarioKind;
  title: string;
  stem: string;
  narrative: string;
  dates: string[];
  selectionRows: CycleDecisionSelectionRow[];
  selectionColumns: CycleDecisionSelectionColumn[];
  journalLines: JournalEntryLine[];
  availableAccounts: JournalEntryAccountOption[];
  miniLedger?: MiniLedger;
  tags: string[];
}

export interface CycleDecisionDefinition extends ProblemDefinition {
  scenario: CycleDecisionScenario;
  selectionRows: CycleDecisionSelectionRow[];
  selectionColumns: CycleDecisionSelectionColumn[];
  journalLines: JournalEntryLine[];
  availableAccounts: JournalEntryAccountOption[];
  expectedLineCount: number;
  parts: CycleDecisionPart[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export interface CycleDecisionResponse extends Record<string, unknown> {
  selections: Record<string, string>;
  lines: JournalEntryLine[];
}

export interface CycleDecisionConfig {
  mode?: ProblemDefinition['mode'];
  scenarioKey?: CycleDecisionScenarioKind;
}

export interface CycleDecisionReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

interface CycleDecisionScenarioBuilder {
  kind: CycleDecisionScenarioKind;
  build(seed: number): CycleDecisionScenario;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

function cloneLine(line: JournalEntryLine): JournalEntryLine {
  return { ...line };
}

function buildLine(id: string, date: string, accountId: string, debit: number, credit: number, memo: string): JournalEntryLine {
  return { id, date, accountId, debit, credit, memo };
}

function buildAccountOptions(accountIds: string[]) {
  return Array.from(new Set(accountIds)).map((accountId) => ({
    id: accountId,
    label: getAccountById(accountId)?.label ?? accountId,
  }));
}

function lineSignature(line: JournalEntryLine) {
  return [
    line.date.trim().toLowerCase(),
    line.accountId.trim().toLowerCase(),
    Number(line.debit ?? 0).toFixed(2),
    Number(line.credit ?? 0).toFixed(2),
  ].join('|');
}

function lineMatches(expected: JournalEntryLine, actual?: JournalEntryLine) {
  return !!actual && lineSignature(expected) === lineSignature(actual);
}

function linePresentAnywhere(expected: JournalEntryLine, actualLines: JournalEntryLine[]) {
  const expectedSignature = lineSignature(expected);
  return actualLines.some((line) => lineSignature(line) === expectedSignature);
}

function buildSelectionRow(
  id: string,
  label: string,
  description: string,
  reversingRecommended: boolean,
  hint: string,
): CycleDecisionSelectionRow {
  return {
    id,
    label,
    description,
    reversingRecommended,
    hint,
    selectionMode: 'single',
  };
}

function buildReversingSelectionScenario(seed: number): CycleDecisionScenario {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const rows = [
    buildSelectionRow(
      'accrued-wages',
      'Accrued wages payable',
      'A year-end wage accrual that should be reversed on the first day of the new period.',
      true,
      'Reverse the accrual so the next-period payment is not doubled.',
    ),
    buildSelectionRow(
      'depreciation-entry',
      'Depreciation entry',
      'An end-of-period depreciation adjustment that stays in the books.',
      false,
      'Depreciation is not usually reversed because the expense is recognized only once.',
    ),
    buildSelectionRow(
      'closing-entry',
      'Closing entry',
      'A period-close transfer that should remain final.',
      false,
      'Closing entries reset temporary accounts and are not reversed.',
    ),
  ];

  const narrative = `The period-end file includes one reversal candidate and two entries that should stay put.`;

  return {
    kind: 'reversing-selection',
    title: 'Choose which entries should be reversed',
    stem: narrative,
    narrative,
    dates: ['01/01'],
    selectionRows: rows,
    selectionColumns: [
      { id: 'reverse', label: 'Reverse', description: 'This entry should be reversed next period.' },
      { id: 'do-not-reverse', label: 'Do not reverse', description: 'This entry should remain as posted.' },
    ],
    journalLines: [],
    availableAccounts: [],
    tags: [
      'reversing-selection',
      pick(['accrual', 'deferral', 'closing'], rng),
      'reversing-recommended',
    ],
  };
}

function buildClosingScenario(seed: number): CycleDecisionScenario {
  const ledger = generateMiniLedger(seed, {
    companyType: 'service',
    includeContraAccounts: false,
    capitalMode: 'ending',
  });

  const revenueAccounts = ledger.accounts.filter((a) => a.accountType === 'revenue');
  const expenseAccounts = ledger.accounts.filter((a) => a.accountType === 'expense');
  const dividends = ledger.totals.dividends;

  const lines: JournalEntryLine[] = [];
  let lineIndex = 1;

  // Close each revenue account: debit revenue, credit retained earnings
  for (const acct of revenueAccounts) {
    const amount = Math.abs(acct.statementBalance);
    lines.push(buildLine(`line-${lineIndex++}`, '12/31', acct.id, amount, 0, `Close ${acct.label} to retained earnings`));
    lines.push(buildLine(`line-${lineIndex++}`, '12/31', 'retained-earnings', 0, amount, `Close ${acct.label} to retained earnings`));
  }

  // Close each expense account: debit retained earnings, credit expense
  for (const acct of expenseAccounts) {
    const amount = Math.abs(acct.statementBalance);
    lines.push(buildLine(`line-${lineIndex++}`, '12/31', 'retained-earnings', amount, 0, `Close ${acct.label} to retained earnings`));
    lines.push(buildLine(`line-${lineIndex++}`, '12/31', acct.id, 0, amount, `Close ${acct.label} to retained earnings`));
  }

  // Close dividends: debit retained earnings, credit dividends
  lines.push(buildLine(`line-${lineIndex++}`, '12/31', 'retained-earnings', dividends, 0, 'Close dividends to retained earnings'));
  lines.push(buildLine(`line-${lineIndex++}`, '12/31', 'dividends', 0, dividends, 'Close dividends to retained earnings'));

  const accountIds = [
    ...revenueAccounts.map((a) => a.id),
    ...expenseAccounts.map((a) => a.id),
    'retained-earnings',
    'dividends',
  ];

  const narrative = `Close all temporary accounts from the adjusted trial balance before the next period opens. The ledger has ${revenueAccounts.length} revenue and ${expenseAccounts.length} expense accounts to close.`;

  return {
    kind: 'closing-entry',
    title: 'Prepare the closing entries',
    stem: narrative,
    narrative,
    dates: ['12/31'],
    selectionRows: [],
    selectionColumns: [],
    journalLines: lines,
    availableAccounts: buildAccountOptions(accountIds),
    miniLedger: ledger,
    tags: ['closing-entry', 'adjusted-trial-balance', 'temporary-accounts'],
  };
}

export const cycleDecisionScenarioCatalog = [
  { kind: 'reversing-selection', build: buildReversingSelectionScenario },
  { kind: 'closing-entry', build: buildClosingScenario },
] as const satisfies readonly CycleDecisionScenarioBuilder[];

function pickScenarioKind(seed: number) {
  const rng = mulberry32(seed ^ 0x3c6ef372);
  return cycleDecisionScenarioCatalog[Math.floor(rng() * cycleDecisionScenarioCatalog.length)].kind;
}

function buildScenario(seed: number, config: CycleDecisionConfig): CycleDecisionScenario {
  const scenarioKey = config.scenarioKey ?? pickScenarioKind(seed);
  const builder = cycleDecisionScenarioCatalog.find((entry) => entry.kind === scenarioKey) ?? cycleDecisionScenarioCatalog[0];
  return builder.build(seed);
}

function buildParts(scenario: CycleDecisionScenario): CycleDecisionPart[] {
  const selectionParts: CycleDecisionPart[] = scenario.selectionRows.map((row) => ({
    id: row.id,
    kind: 'selection' as const,
    label: row.label,
    description: row.description,
    prompt: `Choose whether ${row.label.toLowerCase()} should be reversed.`,
    expectedAnswerShape: 'choice-id',
    canonicalAnswer: row.reversingRecommended ? 'reverse' : 'do-not-reverse',
    explanation: row.hint,
    misconceptionTags: [`cycle-decisions:${scenario.kind}:${row.id}`],
    standardCode: `ACC-M7-CD-${scenario.kind.toUpperCase().replace(/-/g, '_')}`,
    artifactTarget: row.reversingRecommended ? 'reverse' : 'do-not-reverse',
    targetId: row.reversingRecommended ? 'reverse' : 'do-not-reverse',
    details: {
      kind: 'selection' as const,
      reversingRecommended: row.reversingRecommended,
      expectedChoice: row.reversingRecommended ? 'reverse' : 'do-not-reverse',
      explanation: row.hint ?? row.description,
    },
  }));

  const journalParts: CycleDecisionPart[] = scenario.journalLines.map((line, index) => {
    const accountLabel = getAccountById(line.accountId)?.label ?? line.accountId;
    return {
      id: line.id || `line-${index + 1}`,
      kind: 'journal-entry' as const,
      label: `Line ${index + 1}`,
      description: `${line.date} ${accountLabel}`,
      prompt: `Enter the journal line for ${accountLabel}.`,
      expectedAnswerShape: 'journal-line',
      canonicalAnswer: line,
      explanation: `${accountLabel} is recorded with ${line.debit > 0 ? 'a debit' : 'a credit'} of $${formatAmount(line.debit > 0 ? line.debit : line.credit)}.`,
      misconceptionTags: [`cycle-decisions:${scenario.kind}:${line.accountId}`],
      standardCode: `ACC-M7-CD-${scenario.kind.toUpperCase().replace(/-/g, '_')}`,
      artifactTarget: lineSignature(line),
      targetId: `line-${index + 1}`,
      details: {
        kind: 'journal-entry' as const,
        date: line.date,
        accountId: line.accountId,
        accountLabel,
        debit: line.debit,
        credit: line.credit,
        memo: line.memo,
        explanation: `${accountLabel} is recorded with ${line.debit > 0 ? 'a debit' : 'a credit'} of $${formatAmount(line.debit > 0 ? line.debit : line.credit)}.`,
      },
    };
  });

  return [...selectionParts, ...journalParts];
}

function buildResponse(definition: CycleDecisionDefinition): CycleDecisionResponse {
  const selections: Record<string, string> = {};

  for (const row of definition.selectionRows) {
    selections[row.id] = row.reversingRecommended ? 'reverse' : 'do-not-reverse';
  }

  return {
    selections,
    lines: definition.journalLines.map(cloneLine),
  };
}

function buildPartFeedback(
  part: CycleDecisionPart,
  studentResponse: CycleDecisionResponse,
  gradeResultPart: GradeResult['parts'][number],
  expectedLine?: JournalEntryLine,
  studentLine?: JournalEntryLine,
  journalLines?: JournalEntryLine[],
): CycleDecisionReviewFeedback {
  const selectedValue = studentResponse.selections[part.id];
  const selectedLabel =
    part.kind === 'journal-entry'
      ? studentLine
        ? `${studentLine.date} • ${studentLine.accountId}`
        : 'Not entered'
      : typeof selectedValue === 'string'
        ? selectedValue.replace(/-/g, ' ')
        : 'Not selected';
  const expectedLabel =
    part.kind === 'journal-entry'
      ? `${part.details.date} • ${part.details.accountLabel} ${part.details.debit ? `debit $${formatAmount(part.details.debit)}` : `credit $${formatAmount(part.details.credit ?? 0)}`}`
      : part.details.expectedChoice?.replace(/-/g, ' ') ?? 'Unknown';
  const exactMatch = part.kind === 'journal-entry' && expectedLine && studentLine ? lineMatches(expectedLine, studentLine) : false;
  const equivalent = part.kind === 'journal-entry' && !exactMatch && studentLine && expectedLine && journalLines ? linePresentAnywhere(expectedLine, journalLines) : false;

  return {
    status: part.kind === 'journal-entry' ? (exactMatch ? 'correct' : equivalent ? 'partial' : 'incorrect') : gradeResultPart.isCorrect ? 'correct' : 'incorrect',
    scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
    selectedLabel,
    expectedLabel,
    misconceptionTags: gradeResultPart.misconceptionTags,
    message:
      part.kind === 'journal-entry'
        ? exactMatch
          ? `${part.label} is correct.`
          : equivalent
            ? `Accepted equivalent ordering. ${expectedLabel} is present, just not in the canonical position.`
            : `${part.label} should be ${expectedLabel}. ${part.details.explanation}`
        : gradeResultPart.isCorrect
          ? `${part.label} uses the correct reversal decision.`
          : `${part.label} should be ${expectedLabel}. ${part.details.explanation}`,
  };
}

export function buildCycleDecisionReviewFeedback(
  definition: CycleDecisionDefinition,
  studentResponse: CycleDecisionResponse,
  gradeResult: GradeResult,
): Record<string, CycleDecisionReviewFeedback> {
  return Object.fromEntries(
    gradeResult.parts.map((gradeResultPart) => {
      const part = definition.parts.find((entry) => entry.id === gradeResultPart.partId);
      if (!part) {
        return [
          gradeResultPart.partId,
          {
            status: gradeResultPart.isCorrect ? 'correct' : 'incorrect',
            scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
            selectedLabel: 'Not entered',
            expectedLabel: 'Unknown',
            misconceptionTags: gradeResultPart.misconceptionTags,
            message: 'Review data unavailable.',
          },
        ] as const;
      }

      const expectedIndex = Number.parseInt(part.id.replace('line-', ''), 10) - 1;
      const expectedLine = part.kind === 'journal-entry' ? definition.journalLines[expectedIndex] : undefined;
      const studentLine = part.kind === 'journal-entry' ? studentResponse.lines[expectedIndex] : undefined;
      return [part.id, buildPartFeedback(part, studentResponse, gradeResultPart, expectedLine, studentLine, studentResponse.lines)] as const;
    }),
  );
}

export const cycleDecisionsFamily: ProblemFamily<CycleDecisionDefinition, CycleDecisionResponse, CycleDecisionConfig> = {
  generate(seed, config = {}) {
    const scenario = buildScenario(seed, config);
    const parts = buildParts(scenario);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'cycle-decisions',
      mode: config.mode ?? 'guided_practice',
      activityId: `cycle-decisions-${scenario.kind}-${seed}`,
      prompt: {
        title: scenario.title,
        stem: scenario.stem,
      },
      scenario,
      selectionRows: scenario.selectionRows,
      selectionColumns: scenario.selectionColumns,
      journalLines: scenario.journalLines,
      availableAccounts: scenario.availableAccounts,
      expectedLineCount: scenario.journalLines.length,
      parts,
      workedExample: {
        scenarioKind: scenario.kind,
        narrative: scenario.narrative,
        dates: scenario.dates,
      },
      scaffolding: {
        showSelectionMatrix: scenario.selectionRows.length > 0,
        showJournalTable: scenario.journalLines.length > 0,
        dateCount: scenario.dates.length,
      },
      grading: {
        strategy: 'exact',
        partialCredit: true,
        rubric: {
          scenarioKind: scenario.kind,
        },
      },
      analyticsConfig: {
        generator: 'cycle-decisions-family',
        seed,
        scenarioKind: scenario.kind,
      },
    };
  },

  solve(definition) {
    return buildResponse(definition);
  },

  grade(definition, studentResponse) {
    let journalIndex = 0;
    const parts = definition.parts.map((part) => {
      if (part.kind === 'selection') {
        const rawAnswer = studentResponse.selections[part.id];
        const normalizedAnswer = typeof rawAnswer === 'string' ? normalizePracticeValue(rawAnswer) : '';
        const isCorrect = rawAnswer === part.targetId;
        return {
          partId: part.id,
          rawAnswer,
          normalizedAnswer,
          isCorrect,
          score: isCorrect ? 1 : 0,
          maxScore: 1,
          misconceptionTags: isCorrect ? [] : [`cycle-decisions:${definition.scenario.kind}:${part.id}`],
        };
      }

      const expectedLine = definition.journalLines[journalIndex++];
      const rawLine = studentResponse.lines[journalIndex - 1];
      const normalizedAnswer = rawLine ? lineSignature(rawLine) : '';
      const exactMatch = lineMatches(expectedLine, rawLine);
      const presentAnywhere = rawLine ? linePresentAnywhere(expectedLine, studentResponse.lines) : false;
      const isCorrect = exactMatch || presentAnywhere;

      return {
        partId: part.id,
        rawAnswer: rawLine,
        normalizedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        misconceptionTags: isCorrect ? [] : [`cycle-decisions:${definition.scenario.kind}:${part.id}`],
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);

    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} cycle-decision parts correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const artifact = {
      kind: 'cycle-decisions',
      family: definition.familyKey,
      scenario: {
        kind: definition.scenario.kind,
        title: definition.scenario.title,
        narrative: definition.scenario.narrative,
        dates: definition.scenario.dates,
        reversingRecommendedCount: definition.selectionRows.filter((row) => row.reversingRecommended).length,
        journalLineCount: definition.journalLines.length,
      },
      selectionRows: definition.selectionRows,
      selectionColumns: definition.selectionColumns,
      journalLines: definition.journalLines,
      availableAccounts: definition.availableAccounts,
      studentResponse,
      summary: {
        partCount: definition.parts.length,
        selectionCount: definition.selectionRows.length,
        journalLineCount: definition.journalLines.length,
      },
    };

    return buildPracticeSubmissionEnvelope({
      activityId: definition.activityId,
      mode: definition.mode,
      status: 'submitted',
      attemptNumber: 1,
      answers: studentResponse,
      parts: gradeResult.parts.map((part) => ({
        partId: part.partId,
        rawAnswer:
          part.rawAnswer ??
          (part.partId.startsWith('line-')
            ? studentResponse.lines[Number.parseInt(part.partId.replace('line-', ''), 10) - 1]
            : studentResponse.selections[part.partId]),
        normalizedAnswer: part.normalizedAnswer,
        isCorrect: part.isCorrect,
        score: part.score,
        maxScore: part.maxScore,
        misconceptionTags: part.misconceptionTags,
      })),
      artifact,
      analytics: {
        score: gradeResult.score,
        maxScore: gradeResult.maxScore,
        scenarioKind: definition.scenario.kind,
        selectionCount: definition.selectionRows.length,
        journalLineCount: definition.journalLines.length,
      },
    });
  },
};
