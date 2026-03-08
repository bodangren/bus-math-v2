/**
 * Convex development seed — full curriculum content for local smoke testing.
 *
 * Convex is the single source of truth. This seed populates everything the
 * student lesson page and API routes need:
 *
 *   activities       — notebook-organizer + comprehension-quiz for Lesson 1
 *   lessons          — unit-1-lesson-1 metadata
 *   lesson_versions  — published v1
 *   phase_versions   — 6 phases
 *   phase_sections   — all content blocks (text, callout, video, activity)
 *
 * Activity section content references the Convex-generated activity _ids so
 * that the ActivityRenderer and submission routes use consistent identifiers.
 *
 * Safe to run multiple times — idempotent (skips if lesson already exists).
 *
 * Usage:
 *   npx convex run seed:seedUnit1Lesson1
 */

import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ── Web Crypto helpers (mirrors lib/auth/session.ts, Web Crypto works in Convex) ──

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function pbkdf2Hash(password: string, salt: string, iterations: number): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations },
    keyMaterial,
    256,
  );
  return base64UrlEncodeBytes(new Uint8Array(derived));
}

// ── Section content helpers (mirror supabase/seed/unit1/lesson-01.ts shapes) ─

function text(markdown: string) {
  return { sectionType: "text" as const, content: { markdown } };
}

function video(videoUrl: string, duration: number, transcript: string) {
  return { sectionType: "video" as const, content: { videoUrl, duration, transcript } };
}

function callout(variant: "why-this-matters" | "tip" | "warning" | "example", content: string) {
  return { sectionType: "callout" as const, content: { variant, content } };
}

function activitySection(activityId: Id<"activities">, required: boolean, linkedStandardId?: string) {
  return {
    sectionType: "activity" as const,
    content: { activityId, required, ...(linkedStandardId ? { linkedStandardId } : {}) },
  };
}

export const seedUnit1Lesson1 = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // ── Idempotency check ─────────────────────────────────────────────────────
    const existing = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", "unit-1-lesson-1"))
      .unique();

    if (existing) {
      return { status: "already_seeded", lessonId: existing._id };
    }

    // ── Activities ────────────────────────────────────────────────────────────

    const notebookSimId = await ctx.db.insert("activities", {
      componentKey: "notebook-organizer",
      displayName: "The Notebook Organizer",
      description: "Help Sarah sort her messy desk into 'What she has' vs 'What she owes'.",
      props: {
        title: "The Notebook Organizer",
        description: "Sort Sarah's scraps of paper into the correct accounting buckets.",
        problemTemplate: {
          parameters: {
            assets: { min: 3000, max: 9000, step: 100 },
            liabilities: { min: 1000, max: 5000, step: 100 },
          },
          answerFormula: "assets - liabilities",
          questionTemplate: "Given assets {{assets}} and liabilities {{liabilities}}, compute equity.",
          tolerance: 1,
        },
        initialMessage: "Sarah's desk is a mess! Help her sort these items so she can see if her business is in balance.",
        successMessage: "Great job! Sarah's records are now organized. Now we can see the A = L + E equation in action.",
        items: [
          { id: "item1", label: "Cash in Bank",           amount: 4200, category: "asset",     description: "Money available for business use.",        icon: "cash" },
          { id: "item2", label: "New Laptop",             amount: 1200, category: "asset",     description: "Computer used for client server work.",    icon: "equipment" },
          { id: "item3", label: "Bank Loan",              amount: 3000, category: "liability", description: "Money borrowed to buy equipment.",         icon: "bill" },
          { id: "item4", label: "Sarah's Investment",     amount: 5000, category: "equity",    description: "Personal savings put into the business.",  icon: "owner" },
          { id: "item5", label: "Client Unpaid Invoice",  amount: 1500, category: "asset",     description: "Money a client owes TechStart.",          icon: "receivable" },
          { id: "item6", label: "Credit Card Bill",       amount:  450, category: "liability", description: "Unpaid balance for office supplies.",      icon: "bill" },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 83,
        partialCredit: false,
      },
      createdAt: now,
      updatedAt: now,
    });

    const exitTicketId = await ctx.db.insert("activities", {
      componentKey: "comprehension-quiz",
      displayName: "Exit Ticket: Define A, L, and E",
      description: "Five questions to confirm you understand the three parts of the accounting equation.",
      props: {
        title: "Exit Ticket: Define A, L, and E",
        description: "Answer each question on your own. Score 4/5 to unlock Lesson 2.",
        showExplanations: true,
        allowRetry: true,
        problemTemplate: {
          parameters: {
            assets: { min: 4000, max: 12000, step: 100 },
            liabilities: { min: 1000, max: 6000, step: 100 },
          },
          answerFormula: "assets - liabilities",
          questionTemplate: "TechStart has assets {{assets}} and liabilities {{liabilities}}. Find equity.",
          tolerance: 1,
        },
        questions: [
          {
            id: "q1",
            text: "Which of the following BEST describes an Asset?",
            type: "multiple-choice",
            options: [
              "Something the business owes to another party",
              "Something the business owns or controls that has economic value",
              "The owner's share of the business",
              "Money received from selling goods or services",
            ],
            correctAnswer: "Something the business owns or controls that has economic value",
            explanation: "Assets are things the business owns (cash, equipment, receivables). They appear on the left side of the equation: A = L + E.",
          },
          {
            id: "q2",
            text: "TechStart borrowed $3,000 from the bank. How does this affect the accounting equation?",
            type: "multiple-choice",
            options: [
              "Assets +$3,000; Equity +$3,000",
              "Assets +$3,000; Liabilities +$3,000",
              "Liabilities +$3,000; Equity −$3,000",
              "Assets −$3,000; Liabilities −$3,000",
            ],
            correctAnswer: "Assets +$3,000; Liabilities +$3,000",
            explanation: "The loan gives TechStart cash (Asset ↑) but creates an obligation to repay the bank (Liability ↑). Both sides increase by the same amount, so it stays balanced.",
          },
          {
            id: "q3",
            text: "Sarah invested $5,000 of her own money into TechStart. What category does this belong to?",
            type: "multiple-choice",
            options: ["Asset", "Liability", "Equity", "Revenue"],
            correctAnswer: "Equity",
            explanation: "When an owner puts money into a business, it increases Equity (the owner's stake). The cash received is an Asset, and the owner's claim to that cash is Equity.",
          },
          {
            id: "q4",
            text: "The accounting equation must always balance.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: "True",
            explanation: "Every transaction affects at least two accounts in a way that keeps A = L + E balanced. This is the dual-entry principle.",
          },
          {
            id: "q5",
            text: "Which account below is a Liability for TechStart?",
            type: "multiple-choice",
            options: [
              "Cash in the bank",
              "Laptop computer",
              "Unpaid electricity bill",
              "Sarah's original investment",
            ],
            correctAnswer: "Unpaid electricity bill",
            explanation: "An unpaid bill is money TechStart owes to the utility company — that's a Liability. Cash and equipment are Assets; Sarah's investment is Equity.",
          },
        ],
      },
      gradingConfig: {
        autoGrade: true,
        passingScore: 80,
        partialCredit: false,
      },
      createdAt: now,
      updatedAt: now,
    });

    // ── Lesson ────────────────────────────────────────────────────────────────

    const lessonId = await ctx.db.insert("lessons", {
      unitNumber: 1,
      title: "Launch Unit: A = L + E",
      slug: "unit-1-lesson-1",
      description:
        "Introduce the fundamental accounting equation and explore why financial balance " +
        "is the cornerstone of every business.",
      learningObjectives: [
        "Define Assets, Liabilities, and Equity in plain language",
        "Explain why the accounting equation must always balance",
        "Identify how a simple business event affects the equation",
      ],
      orderIndex: 1,
      createdAt: now,
      updatedAt: now,
    });

    // ── Lesson version (published v1) ─────────────────────────────────────────

    const versionId = await ctx.db.insert("lesson_versions", {
      lessonId,
      version: 1,
      title: "Launch Unit: A = L + E",
      description: "Discover the accounting equation through Sarah Chen's TechStart story.",
      status: "published",
      createdAt: now,
    });

    // ── Phases + sections ─────────────────────────────────────────────────────

    type SectionSpec = ReturnType<typeof text | typeof video | typeof callout> | ReturnType<typeof activitySection>;

    const phaseSpecs: Array<{
      phaseNumber: number;
      title: string;
      estimatedMinutes: number;
      sections: SectionSpec[];
    }> = [
      {
        phaseNumber: 1,
        title: "Hook: Sarah's Messy Notebook",
        estimatedMinutes: 10,
        sections: [
          text(`## The Messy Notebook Challenge

Sarah Chen opened her laptop and stared at her screen. TechStart Solutions had just completed its best month ever — three new clients, two hardware orders, and a server upgrade. But her accounting notebook was a mess.

"Laptop purchase: $2,400." "Client deposit: $1,500." "Internet bill: $89." "Owner's investment: $5,000."

Nothing was organized. Every business — from a lemonade stand to a Fortune 500 company — faces this problem. The solution has existed for over 500 years.`),
          text(`### Turn-and-Talk
If you were Sarah, how would you figure out if you're actually **"ahead"** or **"behind"** right now? Share your idea with a partner.`),
          callout(
            "why-this-matters",
            "The accounting equation **A = L + E** is the foundation of every financial statement ever made. Banks use it to decide whether to give loans. Investors use it to decide whether to buy stock. You will use it to run TechStart. Once you understand it, you can read any company's financial health at a glance.",
          ),
        ],
      },
      {
        phaseNumber: 2,
        title: "Introduction: What Is A = L + E?",
        estimatedMinutes: 15,
        sections: [
          video(
            "https://www.youtube.com/watch?v=IN4MBaOdLRY",
            5,
            `Welcome to Unit 1 of Math for Business Operations. I'm excited to introduce you to the most important idea in all of accounting: the accounting equation.

Every business — no matter how big or small — keeps track of three things. First: everything it owns. Second: everything it owes. Third: everything that belongs to the owner. These three buckets have names. Assets, Liabilities, and Equity.

Here's the rule that connects them, and it never breaks: Assets equal Liabilities plus Equity.

Let's think about TechStart Solutions, the company we'll follow all year. When Sarah Chen started TechStart, she put in five thousand dollars of her own money. That five thousand is an Asset because TechStart now has cash. It's also Equity because it's Sarah's own investment. Assets equal Equity. The equation balances.

Then Sarah borrowed three thousand dollars from a bank to buy equipment. Now TechStart has eight thousand dollars in Assets. But three thousand of that came from the bank — that's a Liability. And five thousand still belongs to Sarah — that's Equity. Eight thousand equals three thousand plus five thousand. The equation still balances.

Every single transaction in TechStart's history follows this pattern. Something changes on the left side, something changes on the right side, and the equation always stays balanced.

In this unit, you'll learn to classify every account as an Asset, a Liability, or Equity. You'll trace how business events move money between these categories. And you'll build TechStart's first real Balance Sheet.

The accounting equation isn't just a formula to memorize. It's a lens for understanding every financial decision a business makes. Let's get started.`,
          ),
          text(`## The Three Building Blocks

Every dollar in a business belongs to one of three categories:

**Assets (A)** — Things the business *owns* or controls that have value.
- TechStart examples: Cash in the bank, laptops, accounts receivable (money clients owe you)

**Liabilities (L)** — Things the business *owes* to others.
- TechStart examples: Bank loan, unpaid internet bill, credit card balance

**Equity (E)** — The owner's stake in the business. What's left over after paying all debts.
- TechStart examples: Sarah's original investment, profits kept in the business

**The rule that never breaks:**

> **Assets = Liabilities + Equity**
> (What you own) = (What you owe) + (Owner's share)

Think of it this way: everything TechStart owns was paid for either by borrowing money (Liabilities) or by Sarah's own contributions (Equity). There is no third option. This is why the equation *always* balances.`),
        ],
      },
      {
        phaseNumber: 3,
        title: "Guided Practice: Sort It Out",
        estimatedMinutes: 20,
        sections: [
          text(`## The Notebook Organizer

Sarah has dozens of scraps of paper representing different parts of TechStart. Before we can build a proper spreadsheet, we need to sort these "buckets."

Open the simulation below and help Sarah categorize her records into **Assets**, **Liabilities**, and **Equity**.`),
          activitySection(notebookSimId, true),
          text(`## Why did it stay balanced?
As you sorted the items, did you notice how every "Asset" Sarah had was either something she bought with a loan (Liability) or something she provided herself (Equity)?

If Sarah buys a new laptop using $2,000 from her bank account, her total Assets stay the same (Cash goes down, Equipment goes up). If she buys it on credit, her Assets go up and her Liabilities go up. **The equation always stays in balance.**`),
        ],
      },
      {
        phaseNumber: 4,
        title: "Independent Practice: Pair Sort & Share",
        estimatedMinutes: 20,
        sections: [
          text(`## Your Turn: Sort TechStart's Full Account List

Sarah has compiled her complete account list for Month 1. Work individually to classify each account, then compare your answers with a partner.

| Account Name | Balance | Category (A / L / E) |
|---|---|---|
| Cash | $4,200 | ? |
| Office Supplies | $310 | ? |
| Accounts Receivable | $1,500 | ? |
| Laptops (2) | $2,400 | ? |
| Bank Loan | $3,000 | ? |
| Accounts Payable | $450 | ? |
| Sarah's Capital | $5,000 | ? |
| Retained Earnings | $960 | ? |

**Step 1:** Classify each account individually (2 minutes).
**Step 2:** Compare with your partner. Discuss any differences.
**Step 3:** Calculate the total for each category. Does A = L + E?`),
          activitySection(notebookSimId, true),
          text(`## Share-Out Preparation

After you finish the sort, prepare to share one insight with the class:

1. **Which account was the hardest to classify?** Why did it confuse you?
2. **Did your totals balance?** If not, which side was larger — and what does that tell you?
3. **In your own words:** Why must Assets always equal Liabilities plus Equity?

Write two to three sentences for question 3. You will use this explanation in your exit ticket.`),
        ],
      },
      {
        phaseNumber: 5,
        title: "Assessment: Exit Ticket",
        estimatedMinutes: 10,
        sections: [
          text(`## Prove Your Understanding

Time to show what you know. This exit ticket has five questions covering today's lesson.

Answer each question on your own — no notes, no partners. Your goal is to score at least 4 out of 5 before moving on to Lesson 2.

You can retry once if you don't hit the target. Each retry randomizes the answer order, so read carefully.`),
          activitySection(exitTicketId, true),
        ],
      },
      {
        phaseNumber: 6,
        title: "Closing: Why Balance Builds Trust",
        estimatedMinutes: 5,
        sections: [
          text(`## Reflect: Why Does This Matter?

You just learned the most fundamental rule in all of accounting. Take a moment to think about why it matters beyond the classroom.

**The accounting equation builds trust:**

When a bank considers giving TechStart a loan, they look at the Balance Sheet — which is built entirely on A = L + E. If Sarah's books balance, it signals discipline and reliability. If they don't balance, it signals an error or worse.

Financial balance isn't just math. It's a promise: "We know where every dollar came from, and every dollar is accounted for."

**Reflection prompt:** Think of a business you use regularly (a coffee shop, an app, a store). Write one sentence explaining how the accounting equation applies to that business.`),
          text(`## What's Coming Next

In **Lesson 2**, you will go deeper into account classification. You'll learn:
- Why some accounts are harder to classify than others ("gray zone" accounts)
- How to build an Excel Table from a CSV file and tag each account type
- The normal balance for each account category

**Before Lesson 2:** Make sure you can define Asset, Liability, and Equity without looking at your notes. That foundation will make everything that follows much easier.`),
        ],
      },
    ];

    const phaseIds: Id<"phase_versions">[] = [];

    for (const spec of phaseSpecs) {
      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId: versionId,
        phaseNumber: spec.phaseNumber,
        title: spec.title,
        estimatedMinutes: spec.estimatedMinutes,
        createdAt: now,
      });
      phaseIds.push(phaseId);

      for (let i = 0; i < spec.sections.length; i++) {
        const section = spec.sections[i];
        await ctx.db.insert("phase_sections", {
          phaseVersionId: phaseId,
          sequenceOrder: i + 1,
          sectionType: section.sectionType,
          content: section.content,
          createdAt: now,
        });
      }
    }

    return {
      status: "seeded",
      lessonId,
      versionId,
      phaseCount: phaseIds.length,
      activityIds: { notebookSimId, exitTicketId },
    };
  },
});

/**
 * Seed demo user accounts for local development.
 *
 * Creates demo-org plus three demo accounts (teacher, student, admin),
 * all with password "demo123". Uses a reduced PBKDF2 iteration count
 * (10k vs 120k) for fast seeding — the stored iteration count is used
 * at verification time, so login works correctly.
 *
 * Safe to run multiple times — idempotent.
 *
 * Usage:
 *   npx convex run seed:seedDemoAccounts
 */
export const seedDemoAccounts = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const DEV_ITERATIONS = 10_000; // fast for local seeding; stored and used at verify time

    // ── Ensure demo org ───────────────────────────────────────────────────────
    let org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", "demo-org"))
      .unique();

    if (!org) {
      const orgId = await ctx.db.insert("organizations", {
        name: "Demo Organization",
        slug: "demo-org",
        settings: {},
        createdAt: now,
        updatedAt: now,
      });
      org = await ctx.db.get(orgId);
    }

    if (!org) throw new Error("Failed to create or retrieve demo-org");

    // ── Demo users ────────────────────────────────────────────────────────────
    const DEMO_USERS = [
      { username: "demo_teacher", role: "teacher" as const, displayName: "Demo Teacher", password: "demo123" },
      { username: "demo_student", role: "student" as const, displayName: "Demo Student", password: "demo123" },
      { username: "demo_admin",   role: "admin"   as const, displayName: "Demo Admin",   password: "demo123" },
    ];

    const results: Array<{ username: string; status: string }> = [];

    for (const user of DEMO_USERS) {
      // Ensure profile
      let profile = await ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", user.username))
        .unique();

      if (!profile) {
        const profileId = await ctx.db.insert("profiles", {
          organizationId: org._id,
          username: user.username,
          role: user.role,
          displayName: user.displayName,
          createdAt: now,
          updatedAt: now,
        });
        profile = await ctx.db.get(profileId);
      }

      if (!profile) {
        results.push({ username: user.username, status: "profile_error" });
        continue;
      }

      // Generate fresh hash
      const saltBytes = crypto.getRandomValues(new Uint8Array(16));
      const salt = base64UrlEncodeBytes(saltBytes);
      const passwordHash = await pbkdf2Hash(user.password, salt, DEV_ITERATIONS);

      // Upsert credential
      const existing = await ctx.db
        .query("auth_credentials")
        .withIndex("by_username", (q) => q.eq("username", user.username))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          passwordHash,
          passwordSalt: salt,
          passwordHashIterations: DEV_ITERATIONS,
          isActive: true,
          updatedAt: now,
        });
        results.push({ username: user.username, status: "updated" });
      } else {
        await ctx.db.insert("auth_credentials", {
          profileId: profile._id,
          username: user.username,
          role: user.role,
          organizationId: org._id,
          passwordHash,
          passwordSalt: salt,
          passwordHashIterations: DEV_ITERATIONS,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.push({ username: user.username, status: "created" });
      }
    }

    return { status: "seeded", orgId: org._id, results };
  },
});
