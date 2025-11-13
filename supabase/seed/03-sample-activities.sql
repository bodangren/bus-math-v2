-- Sample activity seeding for Unit 1, 2, and 3 - Lesson 1
-- Creates interactive activities referenced in the lesson content blocks

-- ============================================================================
-- UNIT 1 ACTIVITIES: Understanding the Accounting Equation
-- ============================================================================

-- Activity 1: Hook Video Comprehension Check
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000001'::uuid,
  'comprehension-quiz',
  'Hook Video Comprehension Check',
  'Quick check to ensure students understood the introductory video about the accounting equation',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "What is the fundamental accounting equation?",
        "type": "multiple-choice",
        "options": [
          "Assets = Liabilities + Equity",
          "Revenue = Expenses + Profit",
          "Cash = Income - Expenses",
          "Assets = Revenue - Liabilities"
        ],
        "correctAnswer": "Assets = Liabilities + Equity",
        "explanation": "The fundamental accounting equation is Assets = Liabilities + Equity. This equation must always balance for accurate financial records."
      },
      {
        "id": "q2",
        "text": "True or False: The accounting equation only applies to large corporations.",
        "type": "true-false",
        "options": ["True", "False"],
        "correctAnswer": "False",
        "explanation": "False. The accounting equation applies to businesses of all sizes, from sole proprietorships to multinational corporations."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 70,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 2: A=L+E Concept Quiz
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000002'::uuid,
  'comprehension-quiz',
  'Accounting Equation Concept Check',
  'Test understanding of the three components of the accounting equation',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "Which of the following is an example of an Asset?",
        "type": "multiple-choice",
        "options": [
          "Cash in the bank",
          "Money owed to suppliers",
          "Owner investment",
          "Revenue from sales"
        ],
        "correctAnswer": "Cash in the bank",
        "explanation": "Cash in the bank is an Asset—something the business owns. Money owed to suppliers is a Liability, owner investment is Equity, and revenue is an income statement item."
      },
      {
        "id": "q2",
        "text": "What does Equity represent in the accounting equation?",
        "type": "multiple-choice",
        "options": [
          "What the business owes",
          "The owner''s stake in the business",
          "What the business owns",
          "Monthly expenses"
        ],
        "correctAnswer": "The owner''s stake in the business",
        "explanation": "Equity represents the owner''s stake in the business—what remains after subtracting liabilities from assets."
      },
      {
        "id": "q3",
        "text": "If a business has $10,000 in assets and $4,000 in liabilities, what is the equity?",
        "type": "multiple-choice",
        "options": [
          "$6,000",
          "$14,000",
          "$4,000",
          "$10,000"
        ],
        "correctAnswer": "$6,000",
        "explanation": "Using A = L + E, we can solve: $10,000 = $4,000 + E, therefore E = $6,000."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 70,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 3: Sorting Items (Drag-Drop)
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000003'::uuid,
  'categorization-drag-drop',
  'Sort Business Items into A/L/E',
  'Drag and drop business items into the correct categories: Assets, Liabilities, or Equity',
  '{
    "items": [
      {"id": "item1", "text": "Office equipment", "category": "Assets"},
      {"id": "item2", "text": "Bank loan", "category": "Liabilities"},
      {"id": "item3", "text": "Owner investment", "category": "Equity"},
      {"id": "item4", "text": "Inventory", "category": "Assets"},
      {"id": "item5", "text": "Accounts payable", "category": "Liabilities"},
      {"id": "item6", "text": "Retained earnings", "category": "Equity"},
      {"id": "item7", "text": "Cash", "category": "Assets"},
      {"id": "item8", "text": "Credit card debt", "category": "Liabilities"}
    ],
    "categories": ["Assets", "Liabilities", "Equity"]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 75,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 4: Independent Categorization Exercise
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000004'::uuid,
  'comprehension-quiz',
  'Independent A/L/E Practice',
  'Apply your knowledge to categorize items independently',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "A delivery truck purchased for business use is classified as:",
        "type": "multiple-choice",
        "options": ["Asset", "Liability", "Equity", "Expense"],
        "correctAnswer": "Asset",
        "explanation": "A delivery truck is something the business owns, making it an Asset."
      },
      {
        "id": "q2",
        "text": "Money invested by the business owner at startup is classified as:",
        "type": "multiple-choice",
        "options": ["Asset", "Liability", "Equity", "Revenue"],
        "correctAnswer": "Equity",
        "explanation": "Owner investment represents the owner''s stake in the business, which is Equity."
      },
      {
        "id": "q3",
        "text": "A 5-year loan from the bank is classified as:",
        "type": "multiple-choice",
        "options": ["Asset", "Liability", "Equity", "Expense"],
        "correctAnswer": "Liability",
        "explanation": "A loan represents money the business owes, making it a Liability."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 70,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 5: Unit 1 Lesson 1 Exit Ticket
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000005'::uuid,
  'comprehension-quiz',
  'Unit 1 Lesson 1 Exit Ticket',
  'Final check: Define A/L/E in your own words',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "In your own words, what is an Asset?",
        "type": "short-answer",
        "correctAnswer": "Something the business owns",
        "explanation": "Assets are resources owned by the business that have economic value."
      },
      {
        "id": "q2",
        "text": "In your own words, what is a Liability?",
        "type": "short-answer",
        "correctAnswer": "Something the business owes",
        "explanation": "Liabilities are obligations or debts the business must pay."
      },
      {
        "id": "q3",
        "text": "Why must the accounting equation always balance?",
        "type": "short-answer",
        "correctAnswer": "To ensure accuracy and credibility",
        "explanation": "A balanced equation ensures that all transactions are recorded correctly and that financial records are trustworthy."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": false,
    "passingScore": 70,
    "partialCredit": false
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- ============================================================================
-- UNIT 2 ACTIVITIES: Debit/Credit Logic (DEA LER)
-- ============================================================================

-- Activity 6: DEA LER Comprehension Quiz
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000006'::uuid,
  'comprehension-quiz',
  'DEA LER Pattern Quiz',
  'Test your understanding of the DEA LER pattern for debits and credits',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "Which accounts increase with a DEBIT?",
        "type": "multiple-choice",
        "options": [
          "Debits increase Assets and Expenses",
          "Debits increase Liabilities and Equity",
          "Debits increase Revenue and Equity",
          "Debits decrease all accounts"
        ],
        "correctAnswer": "Debits increase Assets and Expenses",
        "explanation": "Remember DEA: Debits increase Expenses and Assets."
      },
      {
        "id": "q2",
        "text": "Which accounts increase with a CREDIT?",
        "type": "multiple-choice",
        "options": [
          "Credits increase Assets and Expenses",
          "Credits increase Liabilities, Equity, and Revenue",
          "Credits decrease all accounts",
          "Credits increase only Assets"
        ],
        "correctAnswer": "Credits increase Liabilities, Equity, and Revenue",
        "explanation": "Remember LER: Credits increase Liabilities, Equity, and Revenue."
      },
      {
        "id": "q3",
        "text": "True or False: Every transaction must have at least one debit and one credit.",
        "type": "true-false",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "explanation": "True. This is the foundation of double-entry accounting—debits must equal credits."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 70,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 7: Classify Accounts Exercise
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000007'::uuid,
  'comprehension-quiz',
  'Classify Account Normal Balances',
  'Determine whether each account has a normal debit or credit balance',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "What is the normal balance for Cash (an Asset)?",
        "type": "multiple-choice",
        "options": ["Debit", "Credit"],
        "correctAnswer": "Debit",
        "explanation": "Cash is an Asset, and assets have normal debit balances (DEA pattern)."
      },
      {
        "id": "q2",
        "text": "What is the normal balance for Accounts Payable (a Liability)?",
        "type": "multiple-choice",
        "options": ["Debit", "Credit"],
        "correctAnswer": "Credit",
        "explanation": "Accounts Payable is a Liability, and liabilities have normal credit balances (LER pattern)."
      },
      {
        "id": "q3",
        "text": "What is the normal balance for Rent Expense?",
        "type": "multiple-choice",
        "options": ["Debit", "Credit"],
        "correctAnswer": "Debit",
        "explanation": "Expenses have normal debit balances (DEA pattern)."
      },
      {
        "id": "q4",
        "text": "What is the normal balance for Service Revenue?",
        "type": "multiple-choice",
        "options": ["Debit", "Credit"],
        "correctAnswer": "Credit",
        "explanation": "Revenue has a normal credit balance (LER pattern)."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 75,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 8: Independent DEA LER Practice
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000008'::uuid,
  'comprehension-quiz',
  'Independent DEA LER Application',
  'Apply the DEA LER pattern to business scenarios',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "When a business pays rent, which account is debited?",
        "type": "multiple-choice",
        "options": ["Rent Expense", "Cash", "Rent Payable", "Revenue"],
        "correctAnswer": "Rent Expense",
        "explanation": "Paying rent increases Rent Expense (debit) and decreases Cash (credit)."
      },
      {
        "id": "q2",
        "text": "When a business receives cash from a customer for services performed, which account is credited?",
        "type": "multiple-choice",
        "options": ["Cash", "Service Revenue", "Accounts Receivable", "Equipment"],
        "correctAnswer": "Service Revenue",
        "explanation": "Receiving cash for services increases Cash (debit) and increases Service Revenue (credit)."
      },
      {
        "id": "q3",
        "text": "When a business purchases equipment on credit, which account is credited?",
        "type": "multiple-choice",
        "options": ["Equipment", "Cash", "Accounts Payable", "Revenue"],
        "correctAnswer": "Accounts Payable",
        "explanation": "Purchasing on credit increases Equipment (debit) and increases Accounts Payable (credit)."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 70,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 9: Unit 2 Lesson 1 Exit Ticket
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000009'::uuid,
  'comprehension-quiz',
  'Unit 2 Lesson 1 Exit Ticket',
  'Final check: Identify debit/credit direction',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "What does DEA stand for in the DEA LER pattern?",
        "type": "short-answer",
        "correctAnswer": "Debits increase Expenses and Assets",
        "explanation": "DEA helps remember that Debits increase Expenses and Assets."
      },
      {
        "id": "q2",
        "text": "Why must debits always equal credits in every transaction?",
        "type": "short-answer",
        "correctAnswer": "To keep the accounting equation balanced",
        "explanation": "Equal debits and credits ensure the accounting equation (A=L+E) stays balanced and records are accurate."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": false,
    "passingScore": 70,
    "partialCredit": false
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- ============================================================================
-- UNIT 3 ACTIVITIES: Connecting Financial Statements
-- ============================================================================

-- Activity 10: Statement Connection Quiz
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000010'::uuid,
  'comprehension-quiz',
  'Statement Connection Quiz',
  'Test your understanding of how Income Statement and Balance Sheet connect',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "Where does Net Income from the Income Statement flow to on the Balance Sheet?",
        "type": "multiple-choice",
        "options": [
          "Retained Earnings (Equity)",
          "Cash (Asset)",
          "Accounts Payable (Liability)",
          "Revenue"
        ],
        "correctAnswer": "Retained Earnings (Equity)",
        "explanation": "Net Income flows into Retained Earnings, which is part of Equity on the Balance Sheet."
      },
      {
        "id": "q2",
        "text": "Which accounts are considered temporary and reset each period?",
        "type": "multiple-choice",
        "options": [
          "Revenue and Expense accounts",
          "Asset and Liability accounts",
          "Cash and Equity accounts",
          "All accounts reset each period"
        ],
        "correctAnswer": "Revenue and Expense accounts",
        "explanation": "Revenue and Expense accounts are temporary—they reset each accounting period during the closing process."
      },
      {
        "id": "q3",
        "text": "True or False: The Balance Sheet shows the financial position at a specific point in time.",
        "type": "true-false",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "explanation": "True. The Balance Sheet is a snapshot showing what the business owns and owes at a specific date."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 70,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 11: Account Mapping Activity
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000011'::uuid,
  'comprehension-quiz',
  'Map Accounts to Statements',
  'Identify whether each account belongs on the Income Statement or Balance Sheet',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "On which statement does Cash appear?",
        "type": "multiple-choice",
        "options": ["Income Statement", "Balance Sheet", "Both", "Neither"],
        "correctAnswer": "Balance Sheet",
        "explanation": "Cash is an Asset and appears on the Balance Sheet."
      },
      {
        "id": "q2",
        "text": "On which statement does Service Revenue appear?",
        "type": "multiple-choice",
        "options": ["Income Statement", "Balance Sheet", "Both", "Neither"],
        "correctAnswer": "Income Statement",
        "explanation": "Service Revenue is a temporary account that appears on the Income Statement."
      },
      {
        "id": "q3",
        "text": "On which statement does Rent Expense appear?",
        "type": "multiple-choice",
        "options": ["Income Statement", "Balance Sheet", "Both", "Neither"],
        "correctAnswer": "Income Statement",
        "explanation": "Rent Expense is a temporary account that appears on the Income Statement."
      },
      {
        "id": "q4",
        "text": "On which statement does Retained Earnings appear?",
        "type": "multiple-choice",
        "options": ["Income Statement", "Balance Sheet", "Both", "Neither"],
        "correctAnswer": "Balance Sheet",
        "explanation": "Retained Earnings is an Equity account and appears on the Balance Sheet."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 75,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 12: Independent Linking Practice
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000012'::uuid,
  'comprehension-quiz',
  'Independent Statement Linking',
  'Practice linking net income to retained earnings',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "If a business has Revenue of $10,000 and Expenses of $6,000, what is the Net Income?",
        "type": "multiple-choice",
        "options": ["$4,000", "$16,000", "$6,000", "$10,000"],
        "correctAnswer": "$4,000",
        "explanation": "Net Income = Revenue - Expenses = $10,000 - $6,000 = $4,000."
      },
      {
        "id": "q2",
        "text": "If beginning Retained Earnings is $20,000 and Net Income is $4,000 (with no dividends), what is ending Retained Earnings?",
        "type": "multiple-choice",
        "options": ["$24,000", "$20,000", "$16,000", "$4,000"],
        "correctAnswer": "$24,000",
        "explanation": "Ending Retained Earnings = Beginning RE + Net Income = $20,000 + $4,000 = $24,000."
      },
      {
        "id": "q3",
        "text": "True or False: If a business has a Net Loss, Retained Earnings will decrease.",
        "type": "true-false",
        "options": ["True", "False"],
        "correctAnswer": "True",
        "explanation": "True. A Net Loss (negative net income) reduces Retained Earnings."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": true,
    "passingScore": 70,
    "partialCredit": true
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();

-- Activity 13: Unit 3 Lesson 1 Exit Ticket
INSERT INTO activities (id, component_key, display_name, description, props, grading_config, created_at, updated_at)
VALUES (
  '30000000-0000-0000-0000-000000000013'::uuid,
  'comprehension-quiz',
  'Unit 3 Lesson 1 Exit Ticket',
  'Final check: How do Income Statement and Balance Sheet connect?',
  '{
    "questions": [
      {
        "id": "q1",
        "text": "Explain how the Income Statement and Balance Sheet are connected.",
        "type": "short-answer",
        "correctAnswer": "Net Income from the IS flows to Retained Earnings on the BS",
        "explanation": "Net Income from the Income Statement flows into Retained Earnings on the Balance Sheet, linking profitability to financial position."
      },
      {
        "id": "q2",
        "text": "Why do we separate temporary accounts from permanent accounts?",
        "type": "short-answer",
        "correctAnswer": "To measure performance period by period while tracking cumulative position",
        "explanation": "Temporary accounts (Revenue/Expense) measure period performance, while permanent accounts (A/L/E) show cumulative financial position over time."
      }
    ]
  }'::jsonb,
  '{
    "autoGrade": false,
    "passingScore": 70,
    "partialCredit": false
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE
SET
  component_key = EXCLUDED.component_key,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  props = EXCLUDED.props,
  grading_config = EXCLUDED.grading_config,
  updated_at = now();
