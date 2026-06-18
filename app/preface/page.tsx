import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ComprehensionCheck, type ComprehensionCheckActivity } from '@/components/activities/quiz/ComprehensionCheck';
import { CashFlowChallenge } from '@/components/activities/simulations/CashFlowChallenge';
import type { CashFlowChallengeActivityProps } from '@/types/activities';
import { Button } from '@/components/ui/button';

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
      <section className="relative overflow-hidden py-20 md:py-28 border-b border-border">
        <div className="relative container mx-auto px-4 text-center max-w-3xl space-y-6">
          <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
            Welcome
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-4 leading-tight tracking-tight">
            Spreadsheets become<br />
            <span className="text-muted-foreground">decision tools.</span>
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-xl mx-auto">
            Math for Business Operations is applied accounting with Excel.
            You build working models, present to real audiences, and finish
            with a capstone that shows investor-level thinking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/curriculum">
                See the curriculum
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/auth/login">
                Student or teacher login
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Value Pillars ── */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
              Philosophy
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-4 tracking-tight">
              Not a textbook. A workshop.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {valuePillars.map((pillar) => (
              <div key={pillar.number} className="relative p-6 border border-border hover:bg-secondary transition-colors duration-200">
                <span
                  className="font-mono font-bold leading-none select-none block mb-6 text-muted-foreground/20"
                  style={{ fontSize: "2rem" }}
                  aria-hidden="true"
                >
                  {pillar.number}
                </span>
                <h3 className="font-display text-lg font-bold text-foreground mb-3 tracking-tight">
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
      <section className="py-20 md:py-28 border-b border-border bg-secondary/20">
        <div className="relative container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
              Lesson Rhythm
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-4 tracking-tight">
              Six phases, every class
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-border border border-border">
            {lessonPhases.map((phase, i) => (
              <div
                key={phase.name}
                className="bg-background p-6 text-center group hover:bg-secondary transition-colors"
              >
                <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase block mb-3 font-bold">
                  {i + 1}
                </span>
                <p className="font-display text-xs font-bold text-foreground mb-2 uppercase tracking-tight">
                  {phase.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-body leading-relaxed">
                  {phase.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Try It — Interactive Demo ── */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block px-2 py-0.5 border border-border text-muted-foreground font-mono text-[10px] uppercase tracking-widest">
              Interactive Demo
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-4 tracking-tight">
              This is what class feels like
            </h2>
            <p className="text-muted-foreground font-body mt-4 max-w-lg mx-auto">
              No login required. Try a quiz and a cash flow simulation
              from the actual course.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <ComprehensionCheck activity={introQuizActivity} />
            <CashFlowChallenge activity={cashFlowChallengeActivity} />
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 md:py-32">
        <div className="relative container mx-auto px-4 max-w-3xl text-center space-y-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Ready to start building?
          </h2>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            Log in to access your first unit, or browse the curriculum to see the full sequence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="h-12 px-8">
              <Link href="/auth/login">
                Student or teacher login
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8">
              <Link href="/curriculum">
                View the curriculum
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 pt-12 text-[10px] text-muted-foreground font-mono uppercase tracking-widest">
            <Link href="/capstone" className="hover:text-foreground transition-colors">Capstone</Link>
            <Link href="/acknowledgments" className="hover:text-foreground transition-colors">Acknowledgments</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
