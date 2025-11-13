import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Derived from docs/curriculum/accounting_excel_curriculum.md
const unitStrands = [
  {
    unit: 'Unit 1',
    title: 'Balance by Design',
    accountingFocus: 'Accounting equation, account types',
    excelFocus: 'Excel tables, SUMIF, conditional formatting',
    deliverable: 'Self-auditing ledger + mini balance sheet',
  },
  {
    unit: 'Unit 2',
    title: 'Flow of Transactions',
    accountingFocus: 'Debit/Credit logic, T-accounts',
    excelFocus: 'IF, SWITCH, SUMIFS, conditional formats',
    deliverable: 'Transaction workbook + income statement check',
  },
  {
    unit: 'Unit 3',
    title: 'Statements in Balance',
    accountingFocus: 'Income + balance sheet integration',
    excelFocus: 'Named ranges, XLOOKUP, INDEX/MATCH',
    deliverable: 'Two-statement model + operating cash summary',
  },
  {
    unit: 'Unit 4',
    title: 'Payroll in Motion',
    accountingFocus: 'Gross-to-net payroll & compliance',
    excelFocus: 'XLOOKUP, rounding, formatting standards',
    deliverable: 'Payroll register + pay stub analysis',
  },
  {
    unit: 'Unit 5',
    title: 'Assets That Age',
    accountingFocus: 'Depreciation schedules, accumulated depreciation',
    excelFocus: 'SLN, DDB, linked schedules',
    deliverable: 'Depreciation schedule + financial updates',
  },
  {
    unit: 'Unit 6',
    title: 'Inventory & Project Costing',
    accountingFocus: 'FIFO/LIFO, WIP costing, turnover KPIs',
    excelFocus: 'INDEX/MATCH, dynamic arrays, sparklines',
    deliverable: 'Inventory + project cost dashboard',
  },
  {
    unit: 'Unit 7',
    title: 'Financing the Future',
    accountingFocus: 'Loans, member equity, financing options',
    excelFocus: 'PMT, IPMT, CHOOSE, Goal Seek',
    deliverable: 'Loan amortization + financing model',
  },
  {
    unit: 'Unit 8',
    title: 'Integrated Model Sprint',
    accountingFocus: '3-statement integration & scenarios',
    excelFocus: 'Data tables, dashboards, KPI design',
    deliverable: 'Integrated dashboard with linked financials',
  },
  {
    unit: 'Capstone',
    title: 'Investor-Ready Plan',
    accountingFocus: 'Synthesize all reports into one model',
    excelFocus: 'Story-driven dashboard + linked workbook',
    deliverable: 'Business plan, model-tour, and pitch',
  },
];

const drivingQuestions = [
  {
    unit: 'Unit 1',
    question:
      'How can we design a self-auditing ledger that proves our books are investor-ready?',
    audience: 'PTA panel & local mentors',
  },
  {
    unit: 'Unit 2',
    question: 'How do business transactions tell the story of profit and loss?',
    audience: 'Peer review teams',
  },
  {
    unit: 'Unit 3',
    question: 'How do our reports prove financial stability to lenders or investors?',
    audience: 'Mock bank loan officers',
  },
  {
    unit: 'Unit 4',
    question: 'How can a small business pay employees accurately and on time?',
    audience: 'School HR or finance staff',
  },
  {
    unit: 'Unit 5',
    question: 'How do we measure and manage the aging of our assets?',
    audience: 'Accountant mentor feedback',
  },
  {
    unit: 'Unit 6',
    question: 'How can we manage both inventory and project costs to stay profitable?',
    audience: 'Retail managers & client panels',
  },
  {
    unit: 'Unit 7',
    question: 'How can financing decisions shape a company’s growth and risk?',
    audience: 'Lender & advisor panel',
  },
  {
    unit: 'Unit 8',
    question: 'How can we integrate every report to forecast our business’s future?',
    audience: 'Entrepreneurs & investors',
  },
  {
    unit: 'Capstone',
    question: 'Can we convince an investor our business model is fundable and sustainable?',
    audience: 'Live Demo Day judges',
  },
];

const weekByWeekMilestones = [
  { week: '1', focus: 'Concept proposal & team roles with Sarah’s TechStart scenario.' },
  { week: '2', focus: 'Market research sprint + early public product summary.' },
  { week: '3', focus: 'Revenue logic and unit economics (Goal Seek practice).' },
  { week: '4', focus: 'Start-up budget linking CapEx/OpEx to cash flow.' },
  { week: '5', focus: 'Funding strategy—equity vs. debt with amortization links.' },
  { week: '6', focus: 'Pricing + CVP dashboard with data tables.' },
  { week: '7', focus: 'Payroll plan with wage bands and compliance checks.' },
  { week: '8', focus: 'Inventory & WIP planner with FIFO/LIFO logic.' },
  { week: '9', focus: 'Depreciation + asset schedules linked to statements.' },
  { week: '10', focus: '12-month integrated model build + validation scripts.' },
  { week: '11', focus: 'Sensitivity analysis + tornado chart storytelling.' },
  { week: '12', focus: 'Pitch deck + rehearsal feedback loops.' },
  { week: '13', focus: 'Demo Day presentation, model tour, final reflection.' },
];

const sarahNarrative = [
  {
    phase: 'Units 1-2',
    headline: 'From notebooks to self-auditing ledgers',
    detail:
      'Sarah builds disciplined ledgers that prove TechStart’s early operations and gives students a concrete protagonist for balance mechanics.',
  },
  {
    phase: 'Units 3-4',
    headline: 'Meeting lender requirements',
    detail:
      'Loan officers demand clean statements and payroll discipline, so students see why accurate reporting + compliance keep growth on track.',
  },
  {
    phase: 'Units 5-6',
    headline: 'Scaling operations & projects',
    detail:
      'Sarah invests in equipment and client projects, forcing the class to manage depreciation, inventory, and WIP profitability like analysts.',
  },
  {
    phase: 'Units 7-8',
    headline: 'Capital decisions & investor prep',
    detail:
      'Debt vs. equity tradeoffs culminate in an integrated dashboard that sets the stage for the capstone pitch.',
  },
];

function SectionHeader({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="text-center space-y-2">
      <Badge variant="outline" className="text-xs tracking-wide uppercase">
        {label}
      </Badge>
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="text-muted-foreground max-w-3xl mx-auto text-sm md:text-base">
        {description}
      </p>
    </div>
  );
}

export default function CapstonePage() {
  return (
    <main className="flex-1 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <header className="border-b border-border/40 bg-white/80 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-4 py-12 text-center space-y-4">
          <Badge className="mx-auto w-fit bg-primary/10 text-primary">Capstone Overview</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Investor-Ready Capstone Project
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-4xl mx-auto">
            13 weeks of authentic business modeling where every unit artifact fuels a final, linked Excel workbook, business plan, and investor pitch.
          </p>
          <p className="text-sm text-muted-foreground">
            Need specifics? Review the <Link className="underline" href="/capstone/guidelines">Capstone Guidelines</Link> and <Link className="underline" href="/capstone/rubrics">Rubrics</Link> before Demo Day.
          </p>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-12 space-y-12">
        <section className="space-y-6">
          <SectionHeader
            label="Curriculum Bridge"
            title="How each unit feeds the capstone"
            description="Unit deliverables become the subsystems of the integrated model. Students see the throughline from ledger discipline to investor storytelling."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {unitStrands.map((strand) => (
              <Card key={strand.unit} className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{strand.unit}</span>
                    <Badge variant="secondary">{strand.title}</Badge>
                  </div>
                  <CardTitle className="text-xl">{strand.deliverable}</CardTitle>
                  <CardDescription>
                    Accounting: {strand.accountingFocus}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <span className="font-semibold text-foreground">Excel Focus:&nbsp;</span>
                    {strand.excelFocus}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            label="Timeline"
            title="13-week investor sprint"
            description="Weekly milestones blend accounting, Excel fluency, and Sarah Chen’s TechStart narrative so teams never lose the storyline."
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {weekByWeekMilestones.map((item) => (
              <Card key={item.week}>
                <CardHeader>
                  <CardTitle className="text-base">Week {item.week}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {item.focus}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            label="Public Products"
            title="Driving questions & authentic audiences"
            description="Keep the PBL energy alive by reminding students who they are building for every time a deliverable ships."
          />
          <div className="grid gap-4 md:grid-cols-2">
            {drivingQuestions.map((item) => (
              <Card key={item.unit}>
                <CardHeader>
                  <CardTitle className="text-base">{item.unit}</CardTitle>
                  <CardDescription>{item.audience}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {item.question}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            label="Narrative"
            title="Sarah Chen’s TechStart arc"
            description="Use Sarah’s story to keep the “why” front-and-center—students step into her decision-making to justify every spreadsheet."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {sarahNarrative.map((moment) => (
              <Card key={moment.phase} className="bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base">{moment.phase}</CardTitle>
                  <CardDescription>{moment.headline}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {moment.detail}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Quality standards for submission</CardTitle>
              <CardDescription>Simple guardrails that keep every workbook investor-ready.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Linked formulas only—no hard-coded totals or plug values.</li>
                <li>Document data sources and annotate complex logic with concise comments.</li>
                <li>Use validation checks & KPI indicators so issues surface before Demo Day.</li>
                <li>Keep formatting professional: consistent currency, alignment, and label conventions.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
