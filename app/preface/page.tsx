import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ComprehensionCheck, type ComprehensionCheckActivity } from '@/components/activities/quiz/ComprehensionCheck';
import { CashFlowChallenge } from '@/components/activities/simulations/CashFlowChallenge';
import type { CashFlowChallengeActivityProps } from '@/types/activities';

export const dynamic = 'force-dynamic';

/* ── Static activity data (preface-only, not curriculum content) ── */

const staticTimestamp = () => new Date('2024-01-01T00:00:00.000Z');

const introQuizActivity: ComprehensionCheckActivity = {
  id: 'preface-intro-quiz',
  componentKey: 'comprehension-quiz',
  displayName: 'Quick Course Quiz',
  description: 'See if you already know how this course works.',
  standardId: null,
  props: {
    title: 'Quick Course Quiz',
    description: 'See if you already know how this course works.',
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

const cashFlowChallengeActivity: CashFlowChallengeActivityProps = {
  title: '60-Second Cash Flow Challenge',
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

const lessonPhases = [
  { name: 'Hook', desc: 'A scenario that pulls you in' },
  { name: 'Instruction', desc: 'Plain-language teaching' },
  { name: 'Guided Practice', desc: 'Build together with feedback' },
  { name: 'Independent Practice', desc: 'Prove it on your own' },
  { name: 'Assessment', desc: 'Quick checks for understanding' },
  { name: 'Closing', desc: 'Reflect and preview next steps' },
] as const;

const valuePillars = [
  {
    number: '01',
    headline: 'Build real workbooks',
    detail: 'Every unit ends with an Excel artifact you designed, not a worksheet you filled in. Ledgers, dashboards, financial models — all yours.',
  },
  {
    number: '02',
    headline: 'Present to real audiences',
    detail: 'Mock loan officers, mentor panels, and Demo Day judges. You learn to explain numbers the way professionals do.',
  },
  {
    number: '03',
    headline: 'Finish with a capstone',
    detail: 'An investor-ready business plan, a linked workbook, and a pitch deck. 40% of your grade. One shot to prove it all connects.',
  },
];

export default function PrefacePage() {
  return (
    <main className="flex-1 bg-background">

      {/* ── Hero ── */}
      <section className="hero-gradient relative overflow-hidden py-20 md:py-28 border-b border-white/[0.08]">
        <div
          className="absolute inset-0 accounting-grid-dark pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 text-center max-w-3xl space-y-6">
          <span className="section-label section-label-light">Welcome</span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mt-4 leading-tight">
            Spreadsheets become<br />
            <span style={{ color: "oklch(0.68 0.17 157)" }}>decision tools.</span>
          </h1>
          <p className="text-lg text-white/70 font-body max-w-xl mx-auto">
            Math for Business Operations is applied accounting with Excel.
            You build working models, present to real audiences, and finish
            with a capstone that shows investor-level thinking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/curriculum"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-md bg-white font-body font-semibold shadow-lg hover:bg-white/90 hover:shadow-xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
              style={{ color: "oklch(0.22 0.05 157)" }}
            >
              See the curriculum
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-transparent border text-white font-body hover:bg-white/10 hover:border-white/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2"
              style={{ borderColor: "oklch(1 0 0 / 0.25)" }}
            >
              Student or teacher login
            </Link>
          </div>
        </div>
      </section>

      {/* ── Value Pillars ── */}
      <section className="py-16 md:py-20 bg-background ledger-bg">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="section-label">What makes this different</span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mt-4">
              Not a textbook. A workshop.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {valuePillars.map((pillar) => (
              <div key={pillar.number} className="relative">
                <span
                  className="font-display font-bold leading-none select-none block mb-3"
                  style={{ fontSize: "2.5rem", color: "oklch(var(--primary) / 0.10)" }}
                  aria-hidden="true"
                >
                  {pillar.number}
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {pillar.headline}
                </h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {pillar.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How Every Lesson Works — compact strip ── */}
      <section className="py-14 bg-forest-dark relative overflow-hidden">
        <div
          className="absolute inset-0 accounting-grid-dark pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <span className="section-label section-label-light">Lesson rhythm</span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-white mt-4">
              Six phases, every class
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {lessonPhases.map((phase, i) => (
              <div
                key={phase.name}
                className="rounded-lg p-4 text-center"
                style={{
                  background: "oklch(1 0 0 / 0.05)",
                  border: "1px solid oklch(1 0 0 / 0.08)",
                }}
              >
                <span className="font-mono-num text-[10px] text-white/60 tracking-widest uppercase block mb-2">
                  {i + 1}
                </span>
                <p className="font-display text-sm font-semibold text-white mb-1">
                  {phase.name}
                </p>
                <p className="text-xs text-white/70 font-body leading-snug">
                  {phase.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Try It — Interactive Demo ── */}
      <section className="py-16 md:py-20 bg-muted/20 ledger-bg">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <span className="section-label">Try it right now</span>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mt-4">
              This is what class feels like
            </h2>
            <p className="text-muted-foreground font-body mt-2 max-w-lg mx-auto">
              No login required. Try a quiz and a cash flow simulation
              from the actual course.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <ComprehensionCheck activity={introQuizActivity} />
            <CashFlowChallenge activity={cashFlowChallengeActivity} />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 md:py-20 bg-forest-dark relative overflow-hidden">
        <div
          className="absolute inset-0 accounting-grid-dark pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative container mx-auto px-4 max-w-3xl text-center space-y-6">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Ready to start building?
          </h2>
          <p className="text-white/70 font-body text-lg">
            Log in to access your first unit, or browse the curriculum to see the full sequence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-white font-body font-semibold shadow-lg hover:bg-white/90 hover:shadow-xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
              style={{ color: "oklch(0.22 0.05 157)" }}
            >
              Student or teacher login
            </Link>
            <Link
              href="/curriculum"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-transparent border text-white font-body hover:bg-white/10 hover:border-white/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2"
              style={{ borderColor: "oklch(1 0 0 / 0.25)" }}
            >
              View the curriculum
            </Link>
          </div>
          <div className="flex items-center justify-center gap-4 pt-4 text-sm text-white/60 font-body">
            <Link href="/capstone" className="hover:text-white/90 transition-colors">Capstone</Link>
            <span>&middot;</span>
            <Link href="/acknowledgments" className="hover:text-white/90 transition-colors">Acknowledgments</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
