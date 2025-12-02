import Link from 'next/link';
import { asc, type InferSelectModel } from 'drizzle-orm';
import { BookOpen, CalendarDays, Rocket, School, Target, Users, CheckCircle2, Lightbulb } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ComprehensionCheck, type ComprehensionCheckActivity } from '@/components/exercises/ComprehensionCheck';
import { FillInTheBlank, type FillInTheBlankActivity } from '@/components/exercises/FillInTheBlank';
import ReflectionJournal from '@/components/exercises/ReflectionJournal';
import { CashFlowChallenge } from '@/components/business-simulations/CashFlowChallenge';
import { db } from '@/lib/db/drizzle';
import { lessons } from '@/lib/db/schema';
import type {
  CashFlowChallengeActivityProps,
  ReflectionJournalActivityProps,
} from '@/lib/db/schema/activities';
import type { Activity } from '@/lib/db/schema/validators';

export const dynamic = 'force-dynamic';

type LessonRow = InferSelectModel<typeof lessons>;

interface UnitSummary {
  unitNumber: number;
  title: string;
  summary: string;
}

function sanitizeUnitTitle(rawTitle: string | undefined | null, unitNumber: number) {
  if (!rawTitle) return `Unit ${unitNumber}`;

  let value = rawTitle.trim();
  const lowerValue = value.toLowerCase();
  const targetPrefix = `unit ${unitNumber}`;

  if (lowerValue.startsWith(targetPrefix)) {
    value = value.slice(targetPrefix.length);
  }

  value = removeLeadingDelimiters(value);

  if (value.length > 0) {
    return value;
  }

  const fallback = removeLeadingDelimiters(rawTitle);
  return fallback.length > 0 ? fallback : `Unit ${unitNumber}`;
}

function removeLeadingDelimiters(input: string) {
  let result = input;
  while (result.length > 0) {
    const char = result[0];
    if (char === ' ' || char === ':' || char === '-' || char === '\t' || char === '\n') {
      result = result.slice(1);
      continue;
    }
    break;
  }
  return result.trim();
}

function deriveUnitTitle(metadata: LessonRow['metadata'], unitNumber: number) {
  const rawTitle =
    metadata?.unitContent?.introduction?.unitTitle ??
    metadata?.unitContent?.introduction?.unitNumber ??
    undefined;

  return sanitizeUnitTitle(rawTitle, unitNumber);
}

function deriveUnitSummary(row: LessonRow) {
  return (
    row.metadata?.unitContent?.drivingQuestion?.question ??
    row.metadata?.unitContent?.introduction?.projectOverview?.scenario ??
    row.description ??
    'Explore authentic business scenarios with spreadsheet-first problem solving.'
  );
}

async function getUnitSummaries() {
  const lessonRows = await db
    .select()
    .from(lessons)
    .orderBy(asc(lessons.unitNumber), asc(lessons.orderIndex));

  const units = new Map<number, UnitSummary>();

  lessonRows.forEach((row) => {
    if (!units.has(row.unitNumber)) {
      units.set(row.unitNumber, {
        unitNumber: row.unitNumber,
        title: deriveUnitTitle(row.metadata, row.unitNumber),
        summary: deriveUnitSummary(row),
      });
    }
  });

  return Array.from(units.values()).slice(0, 8);
}

const lessonPhases = [
  { n: 1, name: 'Hook', icon: '▶' },
  { n: 2, name: 'Introduction', icon: '📘' },
  { n: 3, name: 'Guided Practice', icon: '👥' },
  { n: 4, name: 'Independent Practice', icon: '🎯' },
  { n: 5, name: 'Assessment', icon: '✅' },
  { n: 6, name: 'Closing', icon: '💡' },
] as const;

const staticTimestamp = () => new Date('2024-01-01T00:00:00.000Z');

const introQuizActivity: ComprehensionCheckActivity = {
  id: 'preface-intro-quiz',
  componentKey: 'comprehension-quiz',
  displayName: 'Preface: Getting Started Quiz',
  description: 'Check your understanding of the course structure and capstone.',
  standardId: null,
  props: {
    title: 'Getting Started Quiz',
    description: 'Check your understanding of the course structure and capstone.',
    allowRetry: true,
    showExplanations: true,
    questions: [
      {
        id: 'q1',
        text: 'Which tool will you use most to build models in this course?',
        type: 'multiple-choice',
        options: ['Excel', 'Python', 'Google Slides', 'Photoshop'],
        correctAnswer: 'Excel',
        explanation: 'We use Excel for modeling, automation, and dashboards.',
      },
      {
        id: 'q2',
        text: 'How is your course grade balanced?',
        type: 'multiple-choice',
        options: [
          '60% formative, 40% summative',
          '100% tests',
          '50% homework, 50% participation',
          '30% formative, 70% summative',
        ],
        correctAnswer: '60% formative, 40% summative',
        explanation: 'Formative checkpoints are 60%; summative capstone artifacts are 40%.',
      },
      {
        id: 'q3',
        text: 'What is a key deliverable for the Semester 2 capstone?',
        type: 'multiple-choice',
        options: [
          'An investor pitch and a linked Excel model',
          'A group poster about history',
          'A coding project in Java',
          'A lab report on chemistry',
        ],
        correctAnswer: 'An investor pitch and a linked Excel model',
        explanation: 'You will present a VC-style pitch and demo a linked workbook.',
      },
    ],
  },
  gradingConfig: null,
  createdAt: staticTimestamp(),
  updatedAt: staticTimestamp(),
};

const vocabWarmupActivity: FillInTheBlankActivity = {
  id: 'preface-vocab-warmup',
  componentKey: 'fill-in-the-blank',
  displayName: 'Business Math Vocabulary Warm-Up',
  standardId: null,
  description: "Fill the blanks to preview key ideas we'll use often.",
  props: {
    title: 'Business Math Vocabulary Warm-Up',
    description: "Fill the blanks to preview key ideas we'll use often.",
    showHints: true,
    showWordList: true,
    randomizeWordOrder: true,
    sentences: [
      {
        id: 's1',
        text: 'Assets = {blank} + Equity',
        answer: 'Liabilities',
        hint: 'Money the business owes',
      },
      {
        id: 's2',
        text: 'A CVP model studies Cost-Volume-{blank}.',
        answer: 'Profit',
        hint: 'The “P” in CVP',
      },
      {
        id: 's3',
        text: "Excel's {blank} Manager lets you compare best, base, and worst cases.",
        answer: 'Scenario',
        hint: 'Used for what-if analysis',
      },
    ],
  },
  gradingConfig: null,
  createdAt: staticTimestamp(),
  updatedAt: staticTimestamp(),
};

type ReflectionJournalActivity = Omit<Activity, 'componentKey' | 'props'> & {
  componentKey: 'reflection-journal';
  props: ReflectionJournalActivityProps;
};

const reflectionJournalActivity: ReflectionJournalActivity = {
  id: 'preface-reflection',
  componentKey: 'reflection-journal',
  displayName: 'Quick Reflection',
  standardId: null,
  description: 'Set goals for the semester using the CAP framework.',
  props: {
    unitTitle: 'My Starting Goals',
    prompts: [
      {
        id: 'courage-1',
        category: 'courage',
        prompt: 'What was the most challenging part of this unit that required you to step outside your comfort zone?',
        placeholder: 'Describe a specific moment when you had to take a risk or try something new...'
      },
      {
        id: 'adaptability-1',
        category: 'adaptability',
        prompt: 'How did you adjust your approach when you encountered unexpected problems or feedback?',
        placeholder: 'Think about times when you had to change your strategy or method...'
      },
      {
        id: 'persistence-1',
        category: 'persistence',
        prompt: 'Describe a time when you wanted to give up but kept working. What motivated you to continue?',
        placeholder: 'Reflect on your perseverance and what helped you push through...'
      },
    ],
  },
  gradingConfig: null,
  createdAt: staticTimestamp(),
  updatedAt: staticTimestamp(),
};

const cashFlowChallengeActivity: CashFlowChallengeActivityProps = {
  title: '60-Second Simulation',
  description: 'Keep your startup cash-positive for a month.',
  incomingFlows: [
    { id: 'incoming-0', description: 'Customer Payment A', amount: 15000, daysLeft: 5, type: 'incoming', canModify: true },
    { id: 'incoming-1', description: 'Customer Payment B', amount: 20000, daysLeft: 12, type: 'incoming', canModify: true },
    { id: 'incoming-2', description: 'Invoice Collection', amount: 10000, daysLeft: 25, type: 'incoming', canModify: true },
  ],
  outgoingFlows: [
    { id: 'outgoing-0', description: 'Supplier Payment', amount: 12000, daysLeft: 3, type: 'outgoing', canModify: true },
    { id: 'outgoing-1', description: 'Payroll', amount: 18000, daysLeft: 15, type: 'outgoing', canModify: false },
    { id: 'outgoing-2', description: 'Rent Payment', amount: 8000, daysLeft: 30, type: 'outgoing', canModify: true },
  ],
  initialState: {
    cashPosition: 25000,
    day: 1,
    maxDays: 30,
    incomingFlows: [],
    outgoingFlows: [],
    lineOfCredit: 20000,
    creditUsed: 0,
    creditInterestRate: 0.08,
    actionsUsed: { requestPayment: 0, negotiateTerms: 0, lineOfCredit: 0, delayExpense: 0 },
    gameStatus: 'playing',
  },
};

export default async function PrefacePage() {
  const units = await getUnitSummaries();
  const unitGroups = [
    {
      title: 'Units 1–3 · Build the Financial Spine',
      description: 'Balance by Design, Flow of Transactions, and Statements in Balance focus on the accounting equation, debit/credit fluency, and publishing clean statements for lenders.',
      minUnit: 1,
      maxUnit: 3,
    },
    {
      title: 'Units 4–6 · Run Real Operations',
      description: 'Payroll in Motion, Assets That Age, and Inventory & Project Costing push students into compliance-grade payroll, depreciation schedules, and inventory/project costing dashboards.',
      minUnit: 4,
      maxUnit: 6,
    },
    {
      title: 'Units 7–8 · Finance & Forecast the Venture',
      description: 'Financing the Future and Integrated Model Sprint layer financing models, loan amortization, and full 3-statement forecasting to prepare for investor scrutiny.',
      minUnit: 7,
      maxUnit: 8,
    },
  ].map((group) => ({
    ...group,
    units: units.filter(
      (unit) => unit.unitNumber >= group.minUnit && unit.unitNumber <= group.maxUnit,
    ),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="text-center space-y-4">
            <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
              <BookOpen className="inline-block mr-2 h-4 w-4" /> Preface: Welcome &amp; Syllabus
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">Math for Business Operations: Applied Accounting with Excel</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              This course turns spreadsheets into decision tools. You will build working Excel models,
              present to real audiences, and finish with a capstone that shows investor-level thinking.
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-10 max-w-6xl">
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" /> Course Snapshot
              </CardTitle>
              <CardDescription>Your first-day overview at a glance</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2">What you&rsquo;ll learn</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Core accounting (ledger → statements → KPIs)</li>
                  <li>Excel automation (tables, SUMIF/SUMIFS, Goal Seek, data tables, macros)</li>
                  <li>Decision skills (pricing, forecasting, cash flow)</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How the class runs</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Six-phase lessons with frequent checks for understanding</li>
                  <li>Team projects with public-facing demos</li>
                  <li>Realistic datasets and authentic scenarios</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How you&rsquo;re graded</h3>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Formative: 60% (benchmarks, peer reviews, weekly reflections)</li>
                  <li>Summative: 40% (capstone workbook, pitch, model-tour video)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-blue-100 text-blue-800">Lesson Flow</Badge>
            <h2 className="text-2xl font-semibold">Our Six-Phase Structure</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Each lesson follows a clear rhythm so you always know what&rsquo;s next. You&rsquo;ll read short explanations,
              try a focused task, check your understanding, and reflect on what you learned.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {lessonPhases.map((phase) => (
              <Card key={phase.n}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{phase.icon}</span>
                    Phase {phase.n}: {phase.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {phase.name === 'Hook' && 'A fast scenario or short video that pulls you into the problem.'}
                    {phase.name === 'Introduction' && 'Plain-language teaching with examples that connect to real business.'}
                    {phase.name === 'Guided Practice' && 'We build together. You get feedback as you go.'}
                    {phase.name === 'Independent Practice' && 'You try it solo to show skill growth and confidence.'}
                    {phase.name === 'Assessment' && 'Quick checks for understanding. Fix mistakes while they are small.'}
                    {phase.name === 'Closing' && 'Reflect, summarize, and preview what comes next.'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-blue-100 text-blue-800">Course Map</Badge>
            <h2 className="text-2xl font-semibold">Eight Hands-On Units</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Semester 1 builds solid accounting and Excel skills. Semester 2 assembles a full startup model and prepares you for the capstone.
            </p>
          </div>
          {units.length === 0 ? (
            <Card>
              <CardContent>
                <p className="text-center text-muted-foreground">
                  Curriculum data isn&apos;t available yet. Seed lessons in Supabase to populate this overview.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {unitGroups
                .filter((group) => group.units.length > 0)
                .map((group) => (
                  <Card key={group.title}>
                    <CardHeader>
                      <CardTitle className="text-base">{group.title}</CardTitle>
                      <CardDescription>{group.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {group.units.map((unit) => (
                          <li key={unit.unitNumber}>
                            <strong>
                              Unit {unit.unitNumber}
                              {unit.title && unit.title !== `Unit ${unit.unitNumber}`
                                ? `: ${unit.title}`
                                : ''}
                            </strong>
                            {' '}- {unit.summary}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-blue-100 text-blue-800">Capstone</Badge>
            <h2 className="text-2xl font-semibold">Second-Semester Capstone: Investor-Ready</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Over 13 weeks you will extend your best mini-projects into one investor-ready business plan with a linked Excel workbook.
              You&rsquo;ll deliver a 10-slide pitch, a 3-minute model-tour video, and a self-auditing dashboard.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Weeks 1-2: Proposal + research</li>
                  <li>Weeks 3-8: Build revenue, budget, payroll, inventory tabs</li>
                  <li>Weeks 9-11: Integrate 3 statements + scenarios</li>
                  <li>Weeks 12-13: Pitch, model tour, final reflection</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Deliverables</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Linked Excel model with validation checks</li>
                  <li>10-slide investor pitch (+ Q&amp;A)</li>
                  <li>3-minute model-tour video</li>
                  <li>Weekly CAP reflections + peer reviews</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> How it&rsquo;s graded</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Model fidelity &amp; automation (10)</li>
                  <li>Analytic insight (10)</li>
                  <li>Documentation &amp; sourcing (5)</li>
                  <li>Pitch quality (10) + peer critique (2)</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">See Capstone guidelines and rubrics for full details.</p>
                <p className="text-xs mt-1">
                  <Link href="/capstone" className="underline">Capstone Overview</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-blue-100 text-blue-800">Try It</Badge>
            <h2 className="text-2xl font-semibold">How learning feels in this course</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">A quick taste of our interactive checks and business simulations.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <ComprehensionCheck activity={introQuizActivity} />
              <FillInTheBlank activity={vocabWarmupActivity} />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><Rocket className="h-4 w-4" /> 60-Second Simulation</CardTitle>
                  <CardDescription>Keep your startup cash-positive for a month.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CashFlowChallenge activity={cashFlowChallengeActivity} />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="text-center space-y-2">
            <Badge className="bg-blue-100 text-blue-800">Expectations</Badge>
            <h2 className="text-2xl font-semibold">How to succeed here</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><School className="h-4 w-4" /> Daily Habits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Bring your laptop and keep files organized</li>
                  <li>Build every day; small steps add up</li>
                  <li>Ask questions early and often</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Teamwork</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Share roles: modeler, designer, auditor</li>
                  <li>Give kind, specific, helpful feedback</li>
                  <li>Document sources and formulas</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Academic Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>No hard-coded totals-formulas must show your reasoning</li>
                  <li>Cite data sources; summarize AI help you used</li>
                  <li>Keep a clear change-log for major edits</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Reflection</CardTitle>
              <CardDescription>Set goals for the semester using the CAP framework.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReflectionJournal activity={reflectionJournalActivity} />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-3 text-center">
          <p className="text-muted-foreground">Ready to start?</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/curriculum" className="underline">View Curriculum</Link>
            <span>•</span>
            <Link href="/capstone" className="underline">Preview the Capstone</Link>
            <span>•</span>
            <Link href="/acknowledgments" className="underline">Acknowledgments &amp; Author</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
