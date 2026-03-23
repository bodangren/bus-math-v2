/**
 * Unit 1, Lesson 2 — Classify Accounts: A/L/E (ACC-1.2)
 *
 * Seeds "Classify Accounts into A/L/E" using the versioned content schema.
 * All content follows the unit_01_lesson_matrix.md row for L2:
 *  - Accounting focus: Account types; normal sense-making (what belongs where)
 *  - Excel skill: Excel Table from CSV; headers; number formats
 *  - Formative product: Categorized list (A/L/E) in Table; turn-in screenshot
 *
 * Usage:
 *   npx tsx supabase/seed/unit1/lesson-02.ts
 */


import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

// ─── Deterministic IDs (d6b57545 namespace, Lesson 2) ────────────────────────

export const IDS = {
  LESSON: 'd6b57545-65f6-4c39-80d5-000000000002',
  VERSION: 'd6b57545-65f6-4c39-80d5-000200000002',
  PHASES: {
    1: 'd6b57545-65f6-4c39-80d5-000200000100',
    2: 'd6b57545-65f6-4c39-80d5-000200000200',
    3: 'd6b57545-65f6-4c39-80d5-000200000300',
    4: 'd6b57545-65f6-4c39-80d5-000200000400',
    5: 'd6b57545-65f6-4c39-80d5-000200000500',
    6: 'd6b57545-65f6-4c39-80d5-000200000600',
  },
  ACTIVITY_CARD_SORT: 'd6b57545-65f6-4c39-80d5-000200001001',
  ACTIVITY_CARD_SORT_INDEPENDENT: 'd6b57545-65f6-4c39-80d5-000200001003',
  ACTIVITY_EXIT_TICKET: 'd6b57545-65f6-4c39-80d5-000200001002',
} as const;

// ─── Section helpers ──────────────────────────────────────────────────────────

function text(markdown: string) {
  return { sectionType: 'text' as const, content: { markdown } };
}

function callout(variant: 'why-this-matters' | 'tip' | 'warning' | 'example', content: string) {
  return { sectionType: 'callout' as const, content: { variant, content } };
}

function activity(activityId: string, required: boolean) {
  return {
    sectionType: 'activity' as const,
    content: { activityId, required },
  };
}

// ─── Exported seed data (used by tests) ──────────────────────────────────────

export const LESSON_02_SEED_DATA = {
  lesson: {
    id: IDS.LESSON,
    slug: 'unit-1-lesson-2',
    title: 'Classify Accounts: A, L, and E',
    unitNumber: 1,
    orderIndex: 2,
    description:
      'Learn to sort every account into the right category — Asset, Liability, or Equity — and build TechStart\'s first organized account list using Excel Tables.',
    learningObjectives: [
      'Classify business accounts as Assets, Liabilities, or Equity',
      'Explain the logic behind each classification using real examples',
      'Identify "gray zone" accounts that require careful analysis',
    ],
  },
  version: {
    id: IDS.VERSION,
    title: 'Classify Accounts: A, L, and E',
    description: "Sort TechStart's accounts into the right buckets and fix Sarah's balance sheet.",
    status: 'published',
  },
  standards: [
    { code: 'ACC-1.2', isPrimary: true },
  ],
  phases: [
    {
      id: IDS.PHASES[1],
      phaseNumber: 1,
      title: "Hook: Sarah's Balance Sheet Is Wrong",
      estimatedMinutes: 10,
      sections: [
        text(`## The Report That Didn't Add Up

Sarah ran her first Balance Sheet report on Friday afternoon. She expected to feel proud — TechStart had a great month. Instead, she stared at a number that made no sense.

Total Assets: **$9,410**
Total Liabilities + Equity: **$7,960**

The difference? **$1,450.** The equation didn't balance. But she hadn't spent any money she didn't track — so where did $1,450 go?

After an hour of searching, she found it. Two accounts were in the wrong category:
- **Prepaid Insurance** ($350): listed under Liabilities instead of Assets
- **Deferred Revenue** ($1,100): listed under Assets instead of Liabilities

One mix-up. Two accounts. A $1,450 error that made her entire report untrustworthy.

This is why account classification matters — not just for getting an A, but for making decisions you can actually trust.`),
        callout(
          'why-this-matters',
          'Every account belongs in exactly one category: Asset, Liability, or Equity. Put it in the wrong bucket and your entire Balance Sheet breaks. Banks, investors, and even the IRS use these classifications to evaluate a business. Getting this right is one of the most practical accounting skills you\'ll ever develop.',
        ),
        text(`## Today's Goal

By the end of this lesson, you will be able to look at any business account and correctly answer: "Is this an Asset, a Liability, or Equity?"

You'll also learn to handle the tricky "gray zone" accounts that trip up even experienced bookkeepers.

### Quick Case: The Uncle's Loan
Sarah's Uncle lent her **$5,000** to start TechStart. Is this $5,000 something Sarah **OWNS** or something she **OWES**? 

*Discuss with your neighbor: how does this affect the accounting equation?*

Let's fix Sarah's books — and your future ones.`),
      ],
    },
    {
      id: IDS.PHASES[2],
      phaseNumber: 2,
      title: 'Introduction: What Belongs in Each Bucket?',
      estimatedMinutes: 15,
      sections: [
        text(`## Introduction: The Three-Question Classification Test

Every account in TechStart's ledger belongs to exactly one of three categories. Apply these three questions in order — the first "yes" determines the category:

1. Does TechStart **own or control it** with future economic value? → **Asset**
2. Does TechStart **owe it** to someone else? → **Liability**
3. Is it the **owner's stake** — original investment or accumulated profit? → **Equity**

The trickiest accounts are "gray zone" accounts that seem to fit two categories. **Prepaid Insurance** is an Asset because TechStart still owns unused coverage. **Deferred Revenue** is a Liability because TechStart owes the client a future service. The rule: ask *who has a claim* — if TechStart can use it freely, it's an Asset; if someone else can demand it back or demand delivery, it's a Liability.`),
        text(`## The Classification Test

Before you can sort accounts, you need a reliable test. Use these three questions in order:

**1. Does TechStart own or control it, and does it have future value?**
→ If yes → **Asset**

**2. Does TechStart owe it to someone else?**
→ If yes → **Liability**

**3. Is it the owner's stake (investment or accumulated profit)?**
→ If yes → **Equity**

Every account passes exactly one of these tests. If you're unsure, work through all three before deciding.

---

### Assets — What TechStart Owns

| Account | Why It's an Asset |
|---------|------------------|
| Cash | TechStart controls it; can spend it anytime |
| Laptops | Equipment TechStart owns and uses |
| Accounts Receivable | Money clients owe TechStart — TechStart controls the future payment |
| Prepaid Insurance | TechStart paid for 6 months of coverage; it has future value |
| Office Supplies | TechStart owns them; they'll be used in operations |

### Liabilities — What TechStart Owes

| Account | Why It's a Liability |
|---------|---------------------|
| Bank Loan | TechStart must repay the principal |
| Accounts Payable | Vendor invoices TechStart hasn't paid yet |
| Credit Card Balance | TechStart charged it; must pay it off |
| Deferred Revenue | Client paid in advance; TechStart owes the service |
| Accrued Wages | Employees earned it; TechStart must pay |

### Equity — What's Left for the Owner

| Account | Why It's Equity |
|---------|----------------|
| Sarah's Capital | Her original investment in TechStart |
| Retained Earnings | Profits kept in the business from prior periods |
| Current Month Net Income | This period's profit (before closing to retained earnings) |`),
        callout(
          'example',
          `**Worked Example: Prepaid Insurance vs. Deferred Revenue**

If TechStart has already paid for six months of insurance, that future coverage is still an **Asset** because the business can use it later.

If a client has paid TechStart in advance for work that has not been delivered yet, that obligation is a **Liability** because the service is still owed.

The account name alone is not enough. Ask who still has the claim.`,
        ),
        text(`## The Gray Zone: Tricky Accounts

Some accounts look like they could go two ways. Here's how to handle the most common ones:

**Prepaid Expenses** (e.g., Prepaid Insurance, Prepaid Rent)
→ **Asset.** TechStart paid cash but hasn't used the benefit yet. The future benefit is the asset.

**Deferred Revenue** (e.g., a client pays for 3 months of consulting upfront)
→ **Liability.** TechStart received the cash but hasn't done the work. The obligation to deliver is the liability.

**Accrued Wages**
→ **Liability.** Employees worked; TechStart owes the payroll but hasn't paid yet.

**Owner Drawings / Withdrawals**
→ **Reduces Equity.** When Sarah takes money out for personal use, it lowers her equity stake.

**Memory trick:** If someone else can knock on TechStart's door and demand something, it's probably a Liability. If TechStart can walk in the door and use it, it's probably an Asset.`),
      ],
    },
    {
      id: IDS.PHASES[3],
      phaseNumber: 3,
      title: 'Guided Practice: Sort the Accounts',
      estimatedMinutes: 20,
      sections: [
        text(`## Excel Setup: From CSV to Table

Sarah exported her account list as a CSV file. Your first job in real accounting work is turning raw data into a usable Table.

**Follow these steps in Excel:**

1. Open the CSV file (or paste the data below into a blank sheet)
2. Select any cell inside the data range
3. Press **Ctrl + T** (Windows) or **Cmd + T** (Mac) to create a Table
4. Check "My table has headers" and click OK
5. Add a new column header: **Category**
6. Format the Balance column as **Accounting** number format ($1,234.00)

**TechStart Month 2 Account Data (paste into Excel):**

| Account Name | Balance |
|---|---|
| Cash | 4,200 |
| Accounts Receivable | 1,500 |
| Office Equipment | 2,400 |
| Prepaid Insurance | 350 |
| Bank Loan | 3,000 |
| Accounts Payable | 450 |
| Accrued Wages | 600 |
| Deferred Revenue | 1,100 |
| Sarah's Capital | 5,000 |
| Retained Earnings | 960 |
| Current Net Income | 340 |

**Your job:** Fill in the Category column (A, L, or E) for each account. Then use the drag-and-drop exercise below to check your work.`),
        callout('example', `**Walk-Through: Two Accounts**

**Deferred Revenue ($1,100):**
Does TechStart own it and get future value? → No (TechStart received cash but owes work)
Does TechStart owe something? → **Yes** — the service hasn't been delivered yet → **Liability**

**Prepaid Insurance ($350):**
Does TechStart own it and get future value? → **Yes** — the coverage hasn't been used yet → **Asset**

These two are the exact accounts that broke Sarah's Balance Sheet. Now you know why.`),
        activity(IDS.ACTIVITY_CARD_SORT, true),
      ],
    },
    {
      id: IDS.PHASES[4],
      phaseNumber: 4,
      title: 'Independent Practice: Build Your Table',
      estimatedMinutes: 20,
      sections: [
        text(`## Individual Table Build

Now work on your own. Sarah has added three new accounts from this week's activity. Classify each one and add it to your Excel Table.

| New Account | Balance | Your Classification |
|---|---|---|
| Office Supplies | $310 | ? |
| Credit Card Balance | $200 | ? |
| Sarah's Drawings | $500 | ? |

**Steps:**
1. Add these three rows to your Excel Table
2. Classify each in the Category column
3. Calculate totals for each category using a SUMIF formula:
   - \`=SUMIF([Category],"A",[Balance])\` → Total Assets
   - \`=SUMIF([Category],"L",[Balance])\` → Total Liabilities
   - \`=SUMIF([Category],"E",[Balance])\` → Total Equity

**Hint for Sarah's Drawings:** Owner withdrawals are not expenses. They reduce the owner's equity stake directly. Ask yourself: does this increase or decrease Sarah's claim on TechStart?`),
        text(`## Share-Out: Does It Balance?

After you finish:

1. **Check your totals.** Do Assets = Liabilities + Equity? If not, hunt for the misclassified account.
2. **Compare with a partner.** Did you classify Sarah's Drawings the same way? Discuss why.
3. **Prepare one sentence** explaining the hardest account you classified. You'll use this in today's reflection.

> **Expected totals (without Sarah's Drawings misclassified):**
> Assets: $8,760 | Liabilities: $5,150 | Equity: $3,800 (note: does not balance — Sarah's Drawings must reduce Equity, not be classified as an Asset)

If your equation doesn't balance, trace through the classification test for each account one more time.`),
        activity(IDS.ACTIVITY_CARD_SORT_INDEPENDENT, true),
      ],
    },
    {
      id: IDS.PHASES[5],
      phaseNumber: 5,
      title: 'Assessment: Exit Ticket',
      estimatedMinutes: 10,
      sections: [
        text(`## Prove Your Classification Skills

Five questions. No notes. Score at least 4 out of 5 to move on.

Focus on the classification test you practiced today:
- Asset: TechStart owns it and it has future value
- Liability: TechStart owes it to someone else
- Equity: The owner's stake`),
        activity(IDS.ACTIVITY_EXIT_TICKET, true),
      ],
    },
    {
      id: IDS.PHASES[6],
      phaseNumber: 6,
      title: "Closing: Gray Zones and What's Next",
      estimatedMinutes: 5,
      sections: [
        text(`## The "Gray Zone" Recap

You've classified 14 accounts today. The ones students most often get wrong:

| Account | Common Mistake | Why It's Actually... |
|---------|---------------|----------------------|
| Prepaid Insurance | Listed as Liability ("we paid the insurer, so we owe them") | **Asset** — we've already paid; the future coverage belongs to us |
| Deferred Revenue | Listed as Asset ("we have the cash!") | **Liability** — we owe the client their service |
| Owner Drawings | Listed as Expense ("Sarah spent money") | **Reduces Equity** — it's not an operating cost; it's the owner reclaiming her stake |

The trick: don't ask "did money move in or out?" Ask "who has a claim on this?"

**Reflection prompt:** In your own words, explain why Deferred Revenue is a Liability, not an Asset. What does TechStart owe, and to whom?`),
        text(`## What's Coming in Lesson 3

You can now classify accounts. Next, you'll see what happens to those classifications **when business events occur**.

In **Lesson 3**, TechStart has five new transactions — and for each one, you'll track which category goes up and which goes down, without worrying about debits or credits yet.

**Before Lesson 3:** Make sure you can explain the gray zone accounts without looking at your notes. The dual-impact concept in Lesson 3 builds directly on today's classification skill.`),
      ],
    },
  ],
  activities: [
    {
      id: IDS.ACTIVITY_CARD_SORT,
      componentKey: 'account-categorization',
      displayName: 'Sort TechStart Month 2 Accounts',
      description: 'Drag each account into the correct category with the class model visible and hints turned on.',
      props: {
        title: 'Classify TechStart\'s Accounts',
        description: "Drag each account into the correct bucket with the class model visible. Use the classification test: own it (Asset), owe it (Liability), or owner's stake (Equity).",
        problemTemplate: {
          parameters: {
            assets: { min: 3500, max: 11000, step: 100 },
            liabilities: { min: 1200, max: 7000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'With assets {{assets}} and liabilities {{liabilities}}, compute equity.',
          tolerance: 1,
        },
        categories: [
          {
            id: 'assets',
            name: 'Assets',
            description: 'What TechStart owns or controls with future value',
            whyItMatters: 'Assets are the resources that power TechStart\'s operations and growth.',
          },
          {
            id: 'liabilities',
            name: 'Liabilities',
            description: 'What TechStart owes to others',
            whyItMatters: 'Liabilities represent TechStart\'s obligations — money or services owed to creditors and clients.',
          },
          {
            id: 'equity',
            name: 'Equity',
            description: "The owner's stake in TechStart",
            whyItMatters: 'Equity is what remains for Sarah after all debts are paid — her real ownership of the business.',
          },
        ],
        accounts: [
          {
            id: 'cash',
            name: 'Cash',
            description: 'TechStart\'s bank account balance',
            categoryId: 'assets',
            hint: 'TechStart controls this money and can spend it anytime.',
          },
          {
            id: 'accounts-receivable',
            name: 'Accounts Receivable',
            description: 'Money clients owe TechStart for completed work',
            categoryId: 'assets',
            hint: 'TechStart has already delivered the service. The payment is coming to TechStart.',
          },
          {
            id: 'office-equipment',
            name: 'Office Equipment',
            description: 'Laptops and monitors purchased for client work',
            categoryId: 'assets',
            hint: 'TechStart owns these and uses them to generate revenue.',
          },
          {
            id: 'prepaid-insurance',
            name: 'Prepaid Insurance',
            description: 'Six months of business insurance paid upfront',
            categoryId: 'assets',
            hint: 'The money is gone, but the benefit (coverage) hasn\'t been used yet. Future value = Asset.',
          },
          {
            id: 'bank-loan',
            name: 'Bank Loan',
            description: 'Startup loan from First National Bank',
            categoryId: 'liabilities',
            hint: 'TechStart must repay this with interest. It\'s an obligation to the bank.',
          },
          {
            id: 'accounts-payable',
            name: 'Accounts Payable',
            description: 'Unpaid vendor invoices (software subscriptions, supplies)',
            categoryId: 'liabilities',
            hint: 'TechStart received goods or services but hasn\'t paid yet. It owes the vendors.',
          },
          {
            id: 'accrued-wages',
            name: 'Accrued Wages',
            description: 'Wages earned by part-time staff, not yet paid',
            categoryId: 'liabilities',
            hint: 'Staff worked this week. TechStart owes them payroll even though payday is Friday.',
          },
          {
            id: 'deferred-revenue',
            name: 'Deferred Revenue',
            description: 'A client paid 3 months of retainer upfront',
            categoryId: 'liabilities',
            hint: 'TechStart has the cash but hasn\'t done the work yet. It owes the client a service.',
          },
          {
            id: 'sarahs-capital',
            name: "Sarah's Capital",
            description: "Sarah's original $5,000 investment to launch TechStart",
            categoryId: 'equity',
            hint: "This is Sarah's personal claim on the business — her ownership stake.",
          },
          {
            id: 'retained-earnings',
            name: 'Retained Earnings',
            description: "Profits from prior months kept in the business",
            categoryId: 'equity',
            hint: "These are profits Sarah chose not to withdraw. They belong to her as the owner.",
          },
          {
            id: 'net-income',
            name: 'Current Net Income',
            description: "This month's profit (Revenue minus Expenses)",
            categoryId: 'equity',
            hint: "Until the books are closed at month-end, current profit sits in Equity.",
          },
        ],
        showHintsByDefault: true,
        shuffleItems: true,
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: true,
      },
    },
    {
      id: IDS.ACTIVITY_CARD_SORT_INDEPENDENT,
      componentKey: 'account-categorization',
      displayName: 'Classify TechStart Month 2 Accounts Without Hints',
      description: 'Drag a fresh month-end account set into the correct category without opening the hint panel.',
      props: {
        title: 'Classify TechStart\'s Fresh Account Set',
        description: "Sort a fresh Month 2 account set into Asset, Liability, or Equity without turning on hints.",
        problemTemplate: {
          parameters: {
            assets: { min: 4200, max: 12500, step: 100 },
            liabilities: { min: 1500, max: 8000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'With assets {{assets}} and liabilities {{liabilities}}, compute equity.',
          tolerance: 1,
        },
        categories: [
          {
            id: 'assets',
            name: 'Assets',
            description: 'What TechStart owns or controls with future value',
            whyItMatters: 'Assets are the resources that power TechStart\'s operations and growth.',
          },
          {
            id: 'liabilities',
            name: 'Liabilities',
            description: 'What TechStart owes to others',
            whyItMatters: 'Liabilities represent TechStart\'s obligations — money or services owed to creditors and clients.',
          },
          {
            id: 'equity',
            name: 'Equity',
            description: "The owner's stake in TechStart",
            whyItMatters: 'Equity is what remains for Sarah after all debts are paid — her real ownership of the business.',
          },
        ],
        accounts: [
          {
            id: 'cash',
            name: 'Cash',
            description: 'TechStart\'s bank account balance',
            categoryId: 'assets',
            hint: 'TechStart controls this money and can spend it anytime.',
          },
          {
            id: 'accounts-receivable',
            name: 'Accounts Receivable',
            description: 'Money clients owe TechStart for completed work',
            categoryId: 'assets',
            hint: 'TechStart has already delivered the service. The payment is coming to TechStart.',
          },
          {
            id: 'office-supplies',
            name: 'Office Supplies',
            description: 'Paper, printer ink, and other small operating supplies',
            categoryId: 'assets',
            hint: 'These are resources TechStart still owns and will use in the business.',
          },
          {
            id: 'prepaid-insurance',
            name: 'Prepaid Insurance',
            description: 'Six months of business insurance paid upfront',
            categoryId: 'assets',
            hint: 'The money is gone, but the benefit (coverage) hasn\'t been used yet. Future value = Asset.',
          },
          {
            id: 'security-deposit',
            name: 'Security Deposit',
            description: 'Rent deposit TechStart expects to recover at lease end',
            categoryId: 'assets',
            hint: 'TechStart controls the deposit and should receive it back later.',
          },
          {
            id: 'bank-loan',
            name: 'Bank Loan',
            description: 'Startup loan from First National Bank',
            categoryId: 'liabilities',
            hint: 'TechStart must repay this with interest. It\'s an obligation to the bank.',
          },
          {
            id: 'accounts-payable',
            name: 'Accounts Payable',
            description: 'Unpaid vendor invoices (software subscriptions, supplies)',
            categoryId: 'liabilities',
            hint: 'TechStart received goods or services but hasn\'t paid yet. It owes the vendors.',
          },
          {
            id: 'accrued-wages',
            name: 'Accrued Wages',
            description: 'Wages earned by part-time staff, not yet paid',
            categoryId: 'liabilities',
            hint: 'Staff worked this week. TechStart owes them payroll even though payday is Friday.',
          },
          {
            id: 'deferred-consulting-revenue',
            name: 'Deferred Consulting Revenue',
            description: 'A client paid TechStart upfront for future consulting work',
            categoryId: 'liabilities',
            hint: 'TechStart has the cash but still owes the client the work.',
          },
          {
            id: 'sarahs-capital',
            name: "Sarah's Capital",
            description: "Sarah's original $5,000 investment to launch TechStart",
            categoryId: 'equity',
            hint: "This is Sarah's personal claim on the business — her ownership stake.",
          },
          {
            id: 'retained-earnings',
            name: 'Retained Earnings',
            description: "Profits from prior months kept in the business",
            categoryId: 'equity',
            hint: "These are profits Sarah chose not to withdraw. They belong to her as the owner.",
          },
          {
            id: 'current-net-income',
            name: 'Current Net Income',
            description: "This month's profit (Revenue minus Expenses)",
            categoryId: 'equity',
            hint: "Until the books are closed at month-end, current profit sits in Equity.",
          },
        ],
        showHintsByDefault: false,
        shuffleItems: true,
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: false,
      },
    },
    {
      id: IDS.ACTIVITY_EXIT_TICKET,
      componentKey: 'comprehension-quiz',
      displayName: 'Exit Ticket: Classify Accounts (L2)',
      description: 'Five questions to confirm you can classify Assets, Liabilities, and Equity correctly.',
      props: {
        title: 'Exit Ticket: Account Classification',
        description: 'Classify each account correctly. Score 4/5 to move on to Lesson 3.',
        showExplanations: true,
        allowRetry: true,
        problemTemplate: {
          parameters: {
            assets: { min: 3000, max: 12000, step: 100 },
            liabilities: { min: 800, max: 7000, step: 100 },
          },
          answerFormula: 'assets - liabilities',
          questionTemplate:
            'Given assets {{assets}} and liabilities {{liabilities}}, what is equity?',
          tolerance: 1,
        },
        questions: [
          {
            id: 'q1',
            text: 'TechStart paid 6 months of rent upfront ($1,800). Before any of the months pass, this payment is a:',
            type: 'multiple-choice',
            options: [
              'Asset (Prepaid Rent)',
              'Liability (Rent Payable)',
              'Equity (Owner Expense)',
              'Expense (Rent Expense)',
            ],
            correctAnswer: 'Asset (Prepaid Rent)',
            explanation: 'The payment is already made, but the benefit (the right to use the space) hasn\'t been consumed yet. Future economic benefit owned by TechStart = Asset.',
          },
          {
            id: 'q2',
            text: 'A client paid TechStart $2,400 upfront for three months of consulting. TechStart hasn\'t started the work yet. This $2,400 is a:',
            type: 'multiple-choice',
            options: [
              'Asset — TechStart has the cash',
              'Liability — TechStart owes the client three months of work',
              'Equity — it\'s Sarah\'s profit',
              'Revenue — TechStart earned it when payment was received',
            ],
            correctAnswer: 'Liability — TechStart owes the client three months of work',
            explanation: 'Deferred Revenue is a Liability. TechStart has the cash, but it also has an obligation to deliver work. Until the work is done, TechStart "owes" the client.',
          },
          {
            id: 'q3',
            text: 'Sarah withdrew $500 from TechStart\'s bank account for personal expenses. This withdrawal:',
            type: 'multiple-choice',
            options: [
              'Is an Expense that reduces profit',
              'Increases Liabilities (TechStart owes Sarah)',
              'Reduces Equity (Owner Drawings decrease the owner\'s stake)',
              'Has no effect on the accounting equation',
            ],
            correctAnswer: 'Reduces Equity (Owner Drawings decrease the owner\'s stake)',
            explanation: 'Owner Drawings are not expenses — they\'re withdrawals of the owner\'s own equity. They reduce both Cash (Asset) and Equity simultaneously, keeping the equation balanced.',
          },
          {
            id: 'q4',
            text: 'Which of these is a Liability for TechStart?',
            type: 'multiple-choice',
            options: [
              'Accounts Receivable',
              'Office Supplies',
              'Accrued Wages (payroll earned but not yet paid)',
              'Retained Earnings',
            ],
            correctAnswer: 'Accrued Wages (payroll earned but not yet paid)',
            explanation: 'Accrued Wages are a Liability — TechStart\'s staff earned the wages, so TechStart owes them. AR and Supplies are Assets; Retained Earnings is Equity.',
          },
          {
            id: 'q5',
            text: 'The accounting equation ALWAYS balances.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswer: 'True',
            explanation: 'Every transaction changes two or more accounts in a way that keeps Assets = Liabilities + Equity. If your Balance Sheet doesn\'t balance, there\'s a misclassification or missing entry.',
          },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: false,
      },
    },
  ],
} as const;

// ─── Type helpers ─────────────────────────────────────────────────────────────

type SeedData = typeof LESSON_02_SEED_DATA;
type PhaseSeedData = SeedData['phases'][number];
type SectionData = PhaseSeedData['sections'][number];

// ─── DB seeding ───────────────────────────────────────────────────────────────

async function createPhase(
  db: ReturnType<typeof drizzle>,
  phaseData: PhaseSeedData,
  versionId: string,
) {
  await db.execute(sql`
    INSERT INTO phase_versions (id, lesson_version_id, phase_number, title, estimated_minutes, created_at)
    VALUES (
      ${phaseData.id}::uuid,
      ${versionId}::uuid,
      ${phaseData.phaseNumber},
      ${phaseData.title},
      ${phaseData.estimatedMinutes},
      NOW()
    )
    ON CONFLICT (lesson_version_id, phase_number)
    DO UPDATE SET title = EXCLUDED.title, estimated_minutes = EXCLUDED.estimated_minutes
  `);

  await db.execute(sql`
    DELETE FROM phase_sections
    WHERE phase_version_id = ${phaseData.id}::uuid
      AND sequence_order > ${phaseData.sections.length}
  `);

  for (let i = 0; i < phaseData.sections.length; i++) {
    const section = phaseData.sections[i] as SectionData;
    await db.execute(sql`
      INSERT INTO phase_sections (phase_version_id, sequence_order, section_type, content, created_at)
      VALUES (
        ${phaseData.id}::uuid,
        ${i + 1},
        ${section.sectionType},
        ${JSON.stringify(section.content)}::jsonb,
        NOW()
      )
      ON CONFLICT (phase_version_id, sequence_order)
      DO UPDATE SET section_type = EXCLUDED.section_type, content = EXCLUDED.content
    `);
  }
}

export async function seedLesson02(): Promise<void> {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) throw new Error('DIRECT_URL not set in environment');

  const queryClient = postgres(directUrl);
  const db = drizzle(queryClient);

  try {
    const { lesson, version, standards, phases, activities } = LESSON_02_SEED_DATA;

    await db.execute(sql`
      INSERT INTO lessons (id, unit_number, title, slug, description, learning_objectives, order_index, created_at, updated_at)
      VALUES (
        ${lesson.id}::uuid, ${lesson.unitNumber}, ${lesson.title}, ${lesson.slug},
        ${lesson.description}, ${JSON.stringify(lesson.learningObjectives)}::jsonb,
        ${lesson.orderIndex}, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, slug = EXCLUDED.slug,
        description = EXCLUDED.description, learning_objectives = EXCLUDED.learning_objectives,
        order_index = EXCLUDED.order_index, updated_at = NOW()
    `);

    await db.execute(sql`
      INSERT INTO lesson_versions (id, lesson_id, version, title, description, status, created_at)
      VALUES (${version.id}::uuid, ${lesson.id}::uuid, 1, ${version.title}, ${version.description}, ${version.status}, NOW())
      ON CONFLICT (lesson_id, version) DO UPDATE SET
        title = EXCLUDED.title, description = EXCLUDED.description, status = EXCLUDED.status
    `);

    for (const std of standards) {
      await db.execute(sql`
        INSERT INTO lesson_standards (lesson_version_id, standard_id, is_primary, created_at)
        SELECT ${version.id}::uuid, id, ${std.isPrimary}, NOW()
        FROM competency_standards WHERE code = ${std.code}
        ON CONFLICT (lesson_version_id, standard_id) DO UPDATE SET is_primary = EXCLUDED.is_primary
      `);
    }

    for (const act of activities) {
      await db.execute(sql`
        INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
        VALUES (
          ${act.id}::uuid, ${act.componentKey}, ${act.displayName}, ${act.description},
          ${JSON.stringify(act.props)}::jsonb, ${JSON.stringify(act.gradingConfig)}::jsonb,
          NOW(), NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          component_key = EXCLUDED.component_key, display_name = EXCLUDED.display_name,
          description = EXCLUDED.description, props = EXCLUDED.props,
          grading_config = EXCLUDED.grading_config, updated_at = NOW()
      `);
    }

    for (const phase of phases) {
      await createPhase(db, phase, version.id);
    }

    await db.execute(sql`
      UPDATE lessons SET current_version_id = ${version.id}::uuid WHERE id = ${lesson.id}::uuid
    `);

    console.log('✅ Lesson 02 seeded successfully');
  } finally {
    await queryClient.end();
  }
}

if (require.main === module) {
  seedLesson02()
    .then(() => { console.log('Done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
}
