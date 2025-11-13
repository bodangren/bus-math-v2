-- Sample lesson seeding for Unit 1, 2, and 3 - Lesson 1
-- This seeds the database with the first lesson from each unit to enable testing

-- ============================================================================
-- UNIT 1, LESSON 1: Launch Unit - Understanding the Accounting Equation
-- ============================================================================

INSERT INTO lessons (id, unit_number, title, slug, description, learning_objectives, order_index, metadata, created_at, updated_at)
VALUES (
  '10000000-0000-0000-0000-000000000001'::uuid,
  1,
  'Launch Unit - Understanding the Accounting Equation',
  'unit-1-lesson-1-accounting-equation',
  'Introduce the fundamental accounting equation (A=L+E) and explore why balance matters in business financial systems.',
  '["Identify the three components of the accounting equation: Assets, Liabilities, and Equity", "Explain why the accounting equation must always balance", "Recognize the importance of accurate financial records for business credibility", "Connect real-world business items to the appropriate accounting categories"]'::jsonb,
  1,
  '{"duration": 45, "difficulty": "beginner", "tags": ["accounting-equation", "assets", "liabilities", "equity", "balance"]}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  learning_objectives = EXCLUDED.learning_objectives,
  order_index = EXCLUDED.order_index,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 1, Lesson 1, Phase 1: Entry/Launch
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '11000000-0000-0000-0000-000000000001'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  1,
  'Hook: From Chaos to Balance',
  '[
    {
      "id": "intro-1",
      "type": "markdown",
      "content": "# Welcome to Unit 1: Balance by Design\\n\\nImagine starting a business with nothing but a messy notebook to track your finances. Every sale, every expense, every payment—all scribbled in different places. When tax season comes, or when an investor asks to see your books, you realize: chaos doesn''t inspire confidence.\\n\\nThis is where the **accounting equation** comes in. It''s the foundation that ensures every business transaction stays balanced and trustworthy."
    },
    {
      "id": "video-1",
      "type": "video",
      "props": {
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "duration": 180,
        "transcript": "Welcome to the world of business accounting! In this unit, we will explore how businesses keep their financial records organized and balanced..."
      }
    },
    {
      "id": "callout-1",
      "type": "callout",
      "variant": "why-this-matters",
      "content": "Every successful business—from small startups to Fortune 500 companies—relies on the accounting equation. It''s not just theory; it''s the language of business credibility."
    },
    {
      "id": "activity-1",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000001",
      "required": false
    }
  ]'::jsonb,
  10,
  '{"color": "blue", "icon": "Rocket", "phaseType": "intro"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 1, Lesson 1, Phase 2: Mini-Lesson
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '11000000-0000-0000-0000-000000000002'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  2,
  'Concept: What is A=L+E?',
  '[
    {
      "id": "concept-1",
      "type": "markdown",
      "content": "# The Accounting Equation\\n\\nAt the heart of all accounting is one simple formula:\\n\\n**Assets = Liabilities + Equity**\\n\\n## Breaking It Down\\n\\n- **Assets (A):** What the business owns (cash, equipment, inventory)\\n- **Liabilities (L):** What the business owes (loans, bills to pay)\\n- **Equity (E):** The owner''s stake in the business\\n\\nThis equation must **always balance**. If it doesn''t, something is wrong with your records."
    },
    {
      "id": "callout-2",
      "type": "callout",
      "variant": "tip",
      "content": "Think of it like this: Assets show what you have, while Liabilities + Equity show where it came from (borrowed money or owner investment)."
    },
    {
      "id": "example-1",
      "type": "markdown",
      "content": "## Example: Sarah''s TechStart Solutions\\n\\nWhen Sarah started her business, she:\\n- Invested $5,000 of her own money (Equity)\\n- Borrowed $3,000 from a bank (Liability)\\n- Now has $8,000 in cash (Asset)\\n\\nCheck the balance: $8,000 (Assets) = $3,000 (Liabilities) + $5,000 (Equity) ✓"
    },
    {
      "id": "activity-2",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000002",
      "required": true
    }
  ]'::jsonb,
  15,
  '{"color": "green", "icon": "BookOpen", "phaseType": "example"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 1, Lesson 1, Phase 3: Guided Practice
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '11000000-0000-0000-0000-000000000003'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  3,
  'Guided Practice: Sorting Items',
  '[
    {
      "id": "practice-intro",
      "type": "markdown",
      "content": "# Practice: Categorizing Business Items\\n\\nNow it''s your turn! Can you identify which items are Assets, Liabilities, or Equity?"
    },
    {
      "id": "activity-3",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000003",
      "required": true
    },
    {
      "id": "callout-3",
      "type": "callout",
      "variant": "tip",
      "content": "Remember: Assets are what you own, Liabilities are what you owe, and Equity is the owner''s investment."
    }
  ]'::jsonb,
  10,
  '{"color": "amber", "icon": "PenTool", "phaseType": "practice"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 1, Lesson 1, Phase 4: Independent Work
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '11000000-0000-0000-0000-000000000004'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  4,
  'Independent Practice: Apply Your Knowledge',
  '[
    {
      "id": "independent-intro",
      "type": "markdown",
      "content": "# Work Independently\\n\\nTake what you''ve learned and apply it to these scenarios. Work with a partner to discuss your thinking."
    },
    {
      "id": "activity-4",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000004",
      "required": true
    }
  ]'::jsonb,
  5,
  '{"color": "purple", "icon": "Users", "phaseType": "practice"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 1, Lesson 1, Phase 5: Reflection
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '11000000-0000-0000-0000-000000000005'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  5,
  'Reflection: Why Balance Builds Trust',
  '[
    {
      "id": "reflection-1",
      "type": "markdown",
      "content": "# Why Balance Matters\\n\\nThe accounting equation isn''t just a formula—it''s a system of checks and balances that ensures accuracy.\\n\\n## Discussion Questions\\n\\n1. Why would an investor want to see balanced books?\\n2. What could go wrong if the equation doesn''t balance?\\n3. How does this system build trust in business?"
    },
    {
      "id": "callout-4",
      "type": "callout",
      "variant": "why-this-matters",
      "content": "Balanced books mean transparent, auditable records. This is the foundation of investor confidence, loan approval, and business growth."
    }
  ]'::jsonb,
  3,
  '{"color": "indigo", "icon": "MessageCircle", "phaseType": "reflection"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 1, Lesson 1, Phase 6: Assessment
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '11000000-0000-0000-0000-000000000006'::uuid,
  '10000000-0000-0000-0000-000000000001'::uuid,
  6,
  'Assessment: Exit Ticket',
  '[
    {
      "id": "assessment-intro",
      "type": "markdown",
      "content": "# Check Your Understanding\\n\\nBefore you leave today, show what you''ve learned about the accounting equation."
    },
    {
      "id": "activity-5",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000005",
      "required": true
    }
  ]'::jsonb,
  2,
  '{"color": "red", "icon": "CheckCircle", "phaseType": "assessment"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- ============================================================================
-- UNIT 2, LESSON 1: Introduction to Debit/Credit Logic
-- ============================================================================

INSERT INTO lessons (id, unit_number, title, slug, description, learning_objectives, order_index, metadata, created_at, updated_at)
VALUES (
  '20000000-0000-0000-0000-000000000001'::uuid,
  2,
  'Introduction to Debit/Credit Logic',
  'unit-2-lesson-1-debit-credit',
  'Learn the fundamental debit/credit framework (DEA LER) using visual T-Accounts to understand how transactions flow through the accounting system.',
  '["Understand the debit/credit framework and the DEA LER pattern", "Identify which accounts increase with debits vs credits", "Apply T-Account structure to visualize transaction effects", "Recognize why debit/credit symmetry is essential for balanced records"]'::jsonb,
  1,
  '{"duration": 45, "difficulty": "beginner", "tags": ["debits", "credits", "t-accounts", "DEA-LER"]}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  learning_objectives = EXCLUDED.learning_objectives,
  order_index = EXCLUDED.order_index,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 2, Lesson 1, Phase 1: Entry/Launch
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '21000000-0000-0000-0000-000000000001'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  1,
  'Hook: Business Event Animation',
  '[
    {
      "id": "intro-2-1",
      "type": "markdown",
      "content": "# Welcome to Unit 2: Flow of Transactions\\n\\nYou''ve learned that Assets = Liabilities + Equity. But how do we record changes to these accounts? What happens when a business makes a sale, pays a bill, or borrows money?\\n\\nThis is where **debits and credits** come in—the language that makes the accounting equation work in practice."
    },
    {
      "id": "video-2-1",
      "type": "video",
      "props": {
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "duration": 200,
        "transcript": "Watch as we animate a business transaction and see how it flows through the accounting system using debits and credits..."
      }
    },
    {
      "id": "callout-2-1",
      "type": "callout",
      "variant": "why-this-matters",
      "content": "Debits and credits aren''t about good or bad—they''re simply the left and right sides of accounts. Mastering this system unlocks the ability to track any business transaction accurately."
    }
  ]'::jsonb,
  10,
  '{"color": "blue", "icon": "Zap", "phaseType": "intro"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 2, Lesson 1, Phase 2: Mini-Lesson
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '21000000-0000-0000-0000-000000000002'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  2,
  'Concept: DEA LER Explained',
  '[
    {
      "id": "concept-2-1",
      "type": "markdown",
      "content": "# The DEA LER Pattern\\n\\nTo remember which accounts increase with debits vs credits, use the acronym **DEA LER**:\\n\\n## Debit to Increase (DEA)\\n- **D**ebits increase **Expenses**\\n- **D**ebits increase **Assets**\\n\\n## Credit to Increase (LER)\\n- **C**redits increase **Liabilities**\\n- **C**redits increase **Equity**\\n- **C**redits increase **Revenues**\\n\\n## T-Accounts\\n\\nWe visualize accounts using T-Accounts:\\n```\\n        Account Name\\n   _____|_____\\n   Debit | Credit\\n     +   |   -   (for Assets)\\n     -   |   +   (for Liabilities)\\n```"
    },
    {
      "id": "callout-2-2",
      "type": "callout",
      "variant": "tip",
      "content": "Every transaction has at least one debit and one credit. The total debits must always equal total credits—this keeps the equation balanced!"
    },
    {
      "id": "activity-2-2",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000006",
      "required": true
    }
  ]'::jsonb,
  15,
  '{"color": "green", "icon": "BookOpen", "phaseType": "example"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 2, Lesson 1, Phase 3: Guided Practice
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '21000000-0000-0000-0000-000000000003'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  3,
  'Guided Practice: Classify Accounts',
  '[
    {
      "id": "practice-2-1",
      "type": "markdown",
      "content": "# Practice: Identifying Debit and Credit Sides\\n\\nFor each account below, determine whether it increases with a debit or a credit."
    },
    {
      "id": "activity-2-3",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000007",
      "required": true
    }
  ]'::jsonb,
  10,
  '{"color": "amber", "icon": "PenTool", "phaseType": "practice"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 2, Lesson 1, Phase 4: Independent Work
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '21000000-0000-0000-0000-000000000004'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  4,
  'Independent Practice: Apply DEA LER',
  '[
    {
      "id": "independent-2-1",
      "type": "markdown",
      "content": "# Work Independently\\n\\nApply the DEA LER pattern to classify these business scenarios."
    },
    {
      "id": "activity-2-4",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000008",
      "required": true
    }
  ]'::jsonb,
  5,
  '{"color": "purple", "icon": "Users", "phaseType": "practice"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 2, Lesson 1, Phase 5: Reflection
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '21000000-0000-0000-0000-000000000005'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  5,
  'Reflection: Why D/C Symmetry Matters',
  '[
    {
      "id": "reflection-2-1",
      "type": "markdown",
      "content": "# Why Debit/Credit Symmetry Matters\\n\\n## Discussion Questions\\n\\n1. Why must every transaction have equal debits and credits?\\n2. What happens if they don''t balance?\\n3. How does this system prevent errors?"
    },
    {
      "id": "callout-2-3",
      "type": "callout",
      "variant": "why-this-matters",
      "content": "The double-entry system (debits = credits) is the foundation of modern accounting. It creates a built-in error-checking mechanism that has been used for over 500 years."
    }
  ]'::jsonb,
  3,
  '{"color": "indigo", "icon": "MessageCircle", "phaseType": "reflection"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 2, Lesson 1, Phase 6: Assessment
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '21000000-0000-0000-0000-000000000006'::uuid,
  '20000000-0000-0000-0000-000000000001'::uuid,
  6,
  'Assessment: Exit Ticket',
  '[
    {
      "id": "assessment-2-1",
      "type": "markdown",
      "content": "# Check Your Understanding\\n\\nComplete this exit ticket to demonstrate your understanding of debit/credit logic."
    },
    {
      "id": "activity-2-5",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000009",
      "required": true
    }
  ]'::jsonb,
  2,
  '{"color": "red", "icon": "CheckCircle", "phaseType": "assessment"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- ============================================================================
-- UNIT 3, LESSON 1: Connecting Financial Statements
-- ============================================================================

INSERT INTO lessons (id, unit_number, title, slug, description, learning_objectives, order_index, metadata, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000001'::uuid,
  3,
  'Connecting Financial Statements',
  'unit-3-lesson-1-connecting-statements',
  'Understand how the Income Statement and Balance Sheet work together, and learn how net income flows into equity through retained earnings.',
  '["Explain the relationship between the Income Statement and Balance Sheet", "Identify temporary vs permanent accounts", "Trace how net income affects retained earnings", "Understand the basics of linking financial statements in Excel"]'::jsonb,
  1,
  '{"duration": 45, "difficulty": "intermediate", "tags": ["income-statement", "balance-sheet", "retained-earnings", "closing-entries"]}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  learning_objectives = EXCLUDED.learning_objectives,
  order_index = EXCLUDED.order_index,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 3, Lesson 1, Phase 1: Entry/Launch
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '31000000-0000-0000-0000-000000000001'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  1,
  'Hook: Review Sarah''s Unit 2 Ledger',
  '[
    {
      "id": "intro-3-1",
      "type": "markdown",
      "content": "# Welcome to Unit 3: Statements in Balance\\n\\nIn Unit 1, you learned the accounting equation. In Unit 2, you mastered debits and credits. Now it''s time to see the big picture: how do the **Income Statement** and **Balance Sheet** work together?\\n\\nLet''s revisit Sarah''s TechStart Solutions and see what happens at the end of an accounting period."
    },
    {
      "id": "video-3-1",
      "type": "video",
      "props": {
        "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "duration": 210,
        "transcript": "Reviewing Sarah''s ledger from Unit 2, we can see her revenues and expenses. But where does net income go? How does it connect to the Balance Sheet?"
      }
    },
    {
      "id": "callout-3-1",
      "type": "callout",
      "variant": "why-this-matters",
      "content": "Understanding how statements connect is crucial for financial analysis. Investors, lenders, and business owners all need to see how profitability (Income Statement) affects financial position (Balance Sheet)."
    }
  ]'::jsonb,
  10,
  '{"color": "blue", "icon": "Link", "phaseType": "intro"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 3, Lesson 1, Phase 2: Mini-Lesson
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '31000000-0000-0000-0000-000000000002'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  2,
  'Concept: How Income Affects Equity',
  '[
    {
      "id": "concept-3-1",
      "type": "markdown",
      "content": "# Connecting the Statements\\n\\n## The Flow of Net Income\\n\\n1. During the period, we track revenues and expenses on the **Income Statement**\\n2. At period end, we calculate **Net Income** (Revenue - Expenses)\\n3. Net Income flows into **Retained Earnings** on the **Balance Sheet**\\n4. This increases Equity, keeping A = L + E balanced\\n\\n## Temporary vs Permanent Accounts\\n\\n- **Temporary:** Revenue, Expense accounts (reset each period)\\n- **Permanent:** Asset, Liability, Equity accounts (carry forward)"
    },
    {
      "id": "callout-3-2",
      "type": "callout",
      "variant": "tip",
      "content": "Think of it this way: The Income Statement tells the story of ONE period. The Balance Sheet shows the cumulative position at a point in time."
    },
    {
      "id": "activity-3-2",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000010",
      "required": true
    }
  ]'::jsonb,
  15,
  '{"color": "green", "icon": "BookOpen", "phaseType": "example"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 3, Lesson 1, Phase 3: Guided Practice
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '31000000-0000-0000-0000-000000000003'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  3,
  'Guided Practice: Map Accounts to Statements',
  '[
    {
      "id": "practice-3-1",
      "type": "markdown",
      "content": "# Practice: Identifying Statement Categories\\n\\nFor each account, identify whether it belongs on the Income Statement or Balance Sheet."
    },
    {
      "id": "activity-3-3",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000011",
      "required": true
    }
  ]'::jsonb,
  10,
  '{"color": "amber", "icon": "PenTool", "phaseType": "practice"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 3, Lesson 1, Phase 4: Independent Work
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '31000000-0000-0000-0000-000000000004'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  4,
  'Independent Practice: Linking Statements',
  '[
    {
      "id": "independent-3-1",
      "type": "markdown",
      "content": "# Work Independently\\n\\nPractice linking net income to retained earnings using these scenarios."
    },
    {
      "id": "activity-3-4",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000012",
      "required": true
    }
  ]'::jsonb,
  5,
  '{"color": "purple", "icon": "Users", "phaseType": "practice"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 3, Lesson 1, Phase 5: Reflection
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '31000000-0000-0000-0000-000000000005'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  5,
  'Reflection: What Surprised You?',
  '[
    {
      "id": "reflection-3-1",
      "type": "markdown",
      "content": "# Reflecting on Statement Connections\\n\\n## Discussion Questions\\n\\n1. What surprised you about how closing entries work?\\n2. Why do we separate temporary from permanent accounts?\\n3. How does this system help businesses track performance over time?"
    },
    {
      "id": "callout-3-3",
      "type": "callout",
      "variant": "why-this-matters",
      "content": "The closing process resets the Income Statement each period so businesses can measure performance period-by-period while building cumulative equity over time."
    }
  ]'::jsonb,
  3,
  '{"color": "indigo", "icon": "MessageCircle", "phaseType": "reflection"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- Unit 3, Lesson 1, Phase 6: Assessment
INSERT INTO phases (id, lesson_id, phase_number, title, content_blocks, estimated_minutes, metadata, created_at, updated_at)
VALUES (
  '31000000-0000-0000-0000-000000000006'::uuid,
  '30000000-0000-0000-0000-000000000001'::uuid,
  6,
  'Assessment: Exit Ticket',
  '[
    {
      "id": "assessment-3-1",
      "type": "markdown",
      "content": "# Check Your Understanding\\n\\nComplete this exit ticket to demonstrate your understanding of how financial statements connect."
    },
    {
      "id": "activity-3-5",
      "type": "activity",
      "activityId": "30000000-0000-0000-0000-000000000013",
      "required": true
    }
  ]'::jsonb,
  2,
  '{"color": "red", "icon": "CheckCircle", "phaseType": "assessment"}'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  content_blocks = EXCLUDED.content_blocks,
  estimated_minutes = EXCLUDED.estimated_minutes,
  metadata = EXCLUDED.metadata,
  updated_at = now();
