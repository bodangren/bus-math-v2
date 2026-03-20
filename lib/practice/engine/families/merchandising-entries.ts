import { buildPracticeSubmissionEnvelope, type PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import { getAccountById } from '@/lib/practice/engine/accounts';
import type { GradeResult, ProblemDefinition, ProblemFamily, ProblemPartDefinition } from '@/lib/practice/engine/types';
import {
  generateMerchandisingTimeline,
  solveMerchandisingTimeline,
  type MerchandisingJournalLine,
  type MerchandisingTimelineDefinition,
  type MerchandisingTimelineEvent,
} from '@/lib/practice/engine/merchandising';
import type { JournalEntryAccountOption } from './journal-entry';

export type MerchandisingEntryScenarioKind = 'seller-timeline' | 'buyer-timeline';

export interface MerchandisingEntryLine extends MerchandisingJournalLine {
  id: string;
}

export interface MerchandisingEntryPart extends ProblemPartDefinition {
  id: string;
  kind: 'journal-entry';
  label: string;
  description?: string;
  targetId: string;
  details: {
    date: string;
    eventId: string;
    accountId: string;
    accountLabel: string;
    debit: number;
    credit: number;
    memo: string;
    explanation: string;
  };
}

export interface MerchandisingEntryScenario {
  kind: MerchandisingEntryScenarioKind;
  title: string;
  stem: string;
  narrative: string;
  focus: string;
  dates: string[];
  timeline: MerchandisingTimelineDefinition;
  events: MerchandisingTimelineEvent[];
  journalLines: MerchandisingEntryLine[];
  availableAccounts: JournalEntryAccountOption[];
  tags: string[];
}

export interface MerchandisingEntryDefinition extends ProblemDefinition {
  scenario: MerchandisingEntryScenario;
  timeline: MerchandisingTimelineDefinition;
  events: MerchandisingTimelineEvent[];
  journalLines: MerchandisingEntryLine[];
  availableAccounts: JournalEntryAccountOption[];
  expectedLineCount: number;
  parts: MerchandisingEntryPart[];
  workedExample?: Record<string, unknown>;
  scaffolding: Record<string, unknown>;
}

export type MerchandisingEntryResponse = MerchandisingEntryLine[];

export interface MerchandisingEntryConfig {
  mode?: ProblemDefinition['mode'];
  scenarioKey?: MerchandisingEntryScenarioKind;
}

export interface MerchandisingEntryReviewFeedback {
  status: 'correct' | 'incorrect' | 'partial';
  scoreLabel?: string;
  selectedLabel?: string;
  expectedLabel?: string;
  misconceptionTags?: string[];
  message?: string;
}

interface MerchandisingEntryScenarioBuilder {
  kind: MerchandisingEntryScenarioKind;
  build(seed: number): MerchandisingEntryScenario;
}

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    const r = Math.imul(t ^ (t >>> 15), 1 | t);
    const mixed = r ^ (r + Math.imul(r ^ (r >>> 7), 61 | r));
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: readonly T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

function formatAmount(amount: number) {
  return amount.toLocaleString('en-US');
}

function cloneLine(line: MerchandisingEntryLine): MerchandisingEntryLine {
  return { ...line };
}

function lineSignature(line: MerchandisingEntryLine) {
  return [
    line.date.trim().toLowerCase(),
    line.accountId.trim().toLowerCase(),
    Number(line.debit ?? 0).toFixed(2),
    Number(line.credit ?? 0).toFixed(2),
  ].join('|');
}

function lineMatches(expected: MerchandisingEntryLine, actual?: MerchandisingEntryLine) {
  return !!actual && lineSignature(expected) === lineSignature(actual);
}

function linePresentAnywhere(expected: MerchandisingEntryLine, actualLines: MerchandisingEntryLine[]) {
  const expectedSignature = lineSignature(expected);
  return actualLines.some((line) => lineSignature(line) === expectedSignature);
}

function buildScenarioTitle(role: 'seller' | 'buyer') {
  const action = role === 'seller' ? 'Seller perpetual merchandising entries' : 'Buyer perpetual merchandising entries';
  return `${action}`;
}

function buildFocus(timeline: MerchandisingTimelineDefinition) {
  const traps = [];
  if (timeline.role === 'seller') {
    traps.push('seller-side paired revenue and inventory relief');
  } else {
    traps.push(timeline.discountMethod === 'gross' ? 'gross-method discount treatment' : 'net-method purchase logic');
  }

  if (timeline.freightAmount > 0) {
    traps.push(timeline.fobCondition === 'destination' ? 'seller freight-out' : 'buyer freight-in');
  }

  if (timeline.returnAmount > 0) {
    traps.push('return and allowance sequencing');
  }

  return traps.join(' • ');
}

function enrichTimeline(timeline: MerchandisingTimelineDefinition): MerchandisingEntryScenario {
  const solution = solveMerchandisingTimeline(timeline);
  const journalLines = solution.journalLines.map((line, index) => ({
    ...line,
    id: `line-${index + 1}`,
  }));
  const dates = Array.from(new Set(timeline.events.map((event) => event.date)));
  const availableAccounts = Array.from(
    new Map(
      journalLines.map((line) => [
        line.accountId,
        {
          id: line.accountId,
          label: getAccountById(line.accountId)?.label ?? line.accountId,
        },
      ]),
    ).values(),
  );

  return {
    kind: timeline.role === 'seller' ? 'seller-timeline' : 'buyer-timeline',
    title: buildScenarioTitle(timeline.role),
    stem:
      timeline.role === 'seller'
        ? 'Read the timeline before entering the seller-side perpetual inventory entries.'
        : 'Read the timeline before entering the buyer-side perpetual inventory entries.',
    narrative:
      timeline.role === 'seller'
        ? 'Seller perpetual timeline with sale, return, freight, and collection.'
        : 'Buyer perpetual timeline with purchase, return, freight, and payment.',
    focus: buildFocus(timeline),
    dates,
    timeline,
    events: timeline.events,
    journalLines,
    availableAccounts,
    tags: [
      timeline.role,
      timeline.discountMethod,
      timeline.paymentTiming,
      timeline.fobCondition,
      `events:${timeline.events.length}`,
    ],
  };
}

function buildSellerScenario(seed: number): MerchandisingEntryScenario {
  const rng = mulberry32(seed ^ 0x632be59b);
  const saleAmount = pick([1200, 1500, 1800, 2400, 3000], rng);
  return enrichTimeline(
    generateMerchandisingTimeline(seed, {
      role: 'seller',
      discountMethod: pick(['gross', 'net'] as const, rng),
      paymentTiming: pick(['within-discount-period', 'after-discount-period'] as const, rng),
      fobCondition: pick(['destination', 'shipping-point'] as const, rng),
      saleAmount,
      costAmount: Math.round(saleAmount * 0.6),
      returnAmount: pick([0, 120, 150, 180, 240] as const, rng),
      discountRate: pick([0.02, 0.05, 0.1] as const, rng),
      freightAmount: pick([0, 25, 35, 45, 60] as const, rng),
    }),
  );
}

function buildBuyerScenario(seed: number): MerchandisingEntryScenario {
  const rng = mulberry32(seed ^ 0x94d049bb);
  const saleAmount = pick([900, 1200, 1500, 1800, 2400], rng);
  return enrichTimeline(
    generateMerchandisingTimeline(seed, {
      role: 'buyer',
      discountMethod: pick(['gross', 'net'] as const, rng),
      paymentTiming: pick(['within-discount-period', 'after-discount-period'] as const, rng),
      fobCondition: pick(['shipping-point', 'destination'] as const, rng),
      saleAmount,
      costAmount: Math.round(saleAmount * 0.6),
      returnAmount: pick([0, 90, 120, 150, 180] as const, rng),
      discountRate: pick([0.02, 0.05, 0.1] as const, rng),
      freightAmount: pick([0, 25, 35, 45, 60] as const, rng),
    }),
  );
}

export const merchandisingEntryScenarioCatalog = [
  { kind: 'seller-timeline', build: buildSellerScenario },
  { kind: 'buyer-timeline', build: buildBuyerScenario },
] as const satisfies readonly MerchandisingEntryScenarioBuilder[];

function pickScenarioKind(seed: number) {
  const rng = mulberry32(seed ^ 0x3c6ef372);
  return merchandisingEntryScenarioCatalog[Math.floor(rng() * merchandisingEntryScenarioCatalog.length)].kind;
}

function buildScenario(seed: number, config: MerchandisingEntryConfig): MerchandisingEntryScenario {
  const scenarioKey = config.scenarioKey ?? pickScenarioKind(seed);
  const builder = merchandisingEntryScenarioCatalog.find((entry) => entry.kind === scenarioKey) ?? merchandisingEntryScenarioCatalog[0];
  return builder.build(seed);
}

function buildParts(scenario: MerchandisingEntryScenario): MerchandisingEntryPart[] {
  return scenario.journalLines.map((line, index) => {
    const accountLabel = getAccountById(line.accountId)?.label ?? line.accountId;
    return {
      id: line.id,
      kind: 'journal-entry',
      label: `Line ${index + 1}`,
      description: `${line.date} ${accountLabel}`,
      prompt: `Enter the journal line for ${accountLabel}.`,
      expectedAnswerShape: 'journal-line',
      canonicalAnswer: line,
      explanation: `${accountLabel} is recorded with ${line.debit > 0 ? 'a debit' : 'a credit'} of $${formatAmount(line.debit > 0 ? line.debit : line.credit)}.`,
      misconceptionTags: [`merchandising-entries:${scenario.kind}:${line.accountId}`],
      standardCode: `ACC-M7-ME-${scenario.kind.toUpperCase().replace(/-/g, '_')}`,
      artifactTarget: lineSignature(line),
      targetId: line.id,
      details: {
        date: line.date,
        eventId: line.eventId,
        accountId: line.accountId,
        accountLabel,
        debit: line.debit,
        credit: line.credit,
        memo: line.memo,
        explanation: `${accountLabel} is recorded with ${line.debit > 0 ? 'a debit' : 'a credit'} of $${formatAmount(line.debit > 0 ? line.debit : line.credit)}.`,
      },
    };
  });
}

function buildResponse(definition: MerchandisingEntryDefinition): MerchandisingEntryResponse {
  return definition.journalLines.map(cloneLine);
}

function buildPartFeedback(
  part: MerchandisingEntryPart,
  studentResponse: MerchandisingEntryResponse,
  gradeResultPart: GradeResult['parts'][number],
  expectedLine: MerchandisingEntryLine,
  studentLine: MerchandisingEntryLine | undefined,
): MerchandisingEntryReviewFeedback {
  const selectedLabel = studentLine ? `${studentLine.date} • ${studentLine.accountId}` : 'Not entered';
  const expectedLabel = `${part.details.date} • ${part.details.accountLabel} ${part.details.debit ? `debit $${formatAmount(part.details.debit)}` : `credit $${formatAmount(part.details.credit)}`}`;
  const exactMatch = lineMatches(expectedLine, studentLine);
  const equivalent = !exactMatch && studentLine ? linePresentAnywhere(expectedLine, studentResponse) : false;

  if (exactMatch) {
    return {
      status: 'correct',
      scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
      selectedLabel,
      expectedLabel,
      misconceptionTags: gradeResultPart.misconceptionTags,
      message: `${part.label} is correct.`,
    };
  }

  return {
    status: equivalent ? 'partial' : 'incorrect',
    scoreLabel: `${gradeResultPart.score}/${gradeResultPart.maxScore}`,
    selectedLabel,
    expectedLabel,
    misconceptionTags: gradeResultPart.misconceptionTags,
    message: equivalent
      ? `Accepted equivalent ordering. ${expectedLabel} is present, just not in the canonical position.`
      : `${part.label} should be ${expectedLabel}. ${part.details.explanation}`,
  };
}

export function buildMerchandisingEntryReviewFeedback(
  definition: MerchandisingEntryDefinition,
  studentResponse: MerchandisingEntryResponse,
  gradeResult: GradeResult,
): Record<string, MerchandisingEntryReviewFeedback> {
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
      return [
        part.id,
        buildPartFeedback(part, studentResponse, gradeResultPart, definition.journalLines[expectedIndex], studentResponse[expectedIndex]),
      ] as const;
    }),
  );
}

export const merchandisingEntriesFamily: ProblemFamily<MerchandisingEntryDefinition, MerchandisingEntryResponse, MerchandisingEntryConfig> = {
  generate(seed, config = {}) {
    const scenario = buildScenario(seed, config);
    const parts = buildParts(scenario);

    return {
      contractVersion: 'practice.v1',
      familyKey: 'merchandising-entries',
      mode: config.mode ?? 'guided_practice',
      activityId: `merchandising-entries-${scenario.kind}-${seed}`,
      prompt: {
        title: scenario.title,
        stem: scenario.stem,
      },
      scenario,
      timeline: scenario.timeline,
      events: scenario.events,
      journalLines: scenario.journalLines,
      availableAccounts: scenario.availableAccounts,
      expectedLineCount: scenario.journalLines.length,
      parts,
      workedExample: {
        scenarioKind: scenario.kind,
        narrative: scenario.narrative,
        focus: scenario.focus,
        eventCount: scenario.events.length,
      },
      scaffolding: {
        showTimelineRail: true,
        showBalanceStrip: true,
        dateCount: scenario.dates.length,
        role: scenario.timeline.role,
      },
      grading: {
        strategy: 'exact',
        partialCredit: true,
        rubric: {
          scenarioKind: scenario.kind,
        },
      },
      analyticsConfig: {
        generator: 'merchandising-entries-family',
        seed,
        scenarioKind: scenario.kind,
      },
    };
  },

  solve(definition) {
    return buildResponse(definition);
  },

  grade(definition, studentResponse) {
    const parts = definition.parts.map((part, index) => {
      const expectedLine = definition.journalLines[index];
      const rawLine = studentResponse[index];
      const normalizedAnswer = rawLine ? lineSignature(rawLine) : '';
      const exactMatch = lineMatches(expectedLine, rawLine);
      const presentAnywhere = rawLine ? linePresentAnywhere(expectedLine, studentResponse) : false;
      const isCorrect = exactMatch || presentAnywhere;

      return {
        partId: part.id,
        rawAnswer: rawLine,
        normalizedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        misconceptionTags: isCorrect ? [] : [`merchandising-entries:${definition.scenario.kind}:${part.id}`],
      };
    });

    const score = parts.reduce((sum, part) => sum + part.score, 0);

    return {
      score,
      maxScore: parts.length,
      parts,
      feedback: `${score}/${parts.length} merchandising-entry lines correct.`,
    };
  },

  toEnvelope(definition, studentResponse, gradeResult): PracticeSubmissionEnvelope {
    const artifact = {
      kind: 'merchandising-entry-recording',
      family: definition.familyKey,
      scenario: {
        kind: definition.scenario.kind,
        title: definition.scenario.title,
        narrative: definition.scenario.narrative,
        focus: definition.scenario.focus,
        dates: definition.scenario.dates,
      },
      timeline: definition.timeline,
      events: definition.events,
      journalLines: definition.journalLines,
      availableAccounts: definition.availableAccounts,
      studentResponse,
      summary: {
        lineCount: definition.journalLines.length,
        eventCount: definition.events.length,
        role: definition.timeline.role,
        discountMethod: definition.timeline.discountMethod,
        paymentTiming: definition.timeline.paymentTiming,
        fobCondition: definition.timeline.fobCondition,
      },
    };

    return buildPracticeSubmissionEnvelope({
      activityId: definition.activityId,
      mode: definition.mode,
      status: 'submitted',
      attemptNumber: 1,
      answers: Object.fromEntries(studentResponse.map((line, index) => [definition.parts[index]?.id ?? `line-${index + 1}`, line])),
      parts: gradeResult.parts.map((part) => ({
        partId: part.partId,
        rawAnswer: part.rawAnswer ?? studentResponse[Number.parseInt(part.partId.replace('line-', ''), 10) - 1],
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
        lineCount: definition.journalLines.length,
        eventCount: definition.events.length,
      },
    });
  },
};
