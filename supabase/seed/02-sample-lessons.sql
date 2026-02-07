-- Sample curriculum seeding using versioned lesson schema
-- Seeds Unit 1-3 Lesson 1 shells plus active lesson/phase versions.

-- --------------------------------------------------------------------------
-- 1) Base lesson identity rows (slug/order/unit)
-- --------------------------------------------------------------------------
INSERT INTO lessons (
  id,
  unit_number,
  title,
  slug,
  description,
  learning_objectives,
  order_index,
  metadata,
  created_at,
  updated_at
)
VALUES
  (
    '10000000-0000-0000-0000-000000000001'::uuid,
    1,
    'Launch Unit - Understanding the Accounting Equation',
    'unit-1-lesson-1-accounting-equation',
    'Introduce the accounting equation and why balanced records build trust.',
    '["Identify assets, liabilities, and equity", "Explain why the equation must balance", "Apply equation logic in startup scenarios"]'::jsonb,
    1,
    '{"duration":45,"difficulty":"beginner","tags":["accounting-equation","assets","liabilities","equity"]}'::jsonb,
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000001'::uuid,
    2,
    'Transaction Flow - Journal to Ledger',
    'unit-2-lesson-1-journal-ledger-flow',
    'Follow transactions from source document to journal and ledger.',
    '["Trace transaction flow", "Post balanced entries", "Connect entries to statements"]'::jsonb,
    1,
    '{"duration":45,"difficulty":"beginner","tags":["journal","ledger","double-entry"]}'::jsonb,
    now(),
    now()
  ),
  (
    '30000000-0000-0000-0000-000000000001'::uuid,
    3,
    'Financial Statements in Sync',
    'unit-3-lesson-1-financial-statements-sync',
    'Build understanding of how the three core financial statements connect.',
    '["Explain statement linkage", "Interpret profit and cash movement", "Validate statement consistency"]'::jsonb,
    1,
    '{"duration":45,"difficulty":"intermediate","tags":["income-statement","balance-sheet","cash-flow"]}'::jsonb,
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

-- --------------------------------------------------------------------------
-- 2) Active lesson versions
-- --------------------------------------------------------------------------
INSERT INTO lesson_versions (
  id,
  lesson_id,
  version,
  title,
  description,
  status,
  created_at
)
VALUES
  (
    '10000000-0000-0000-0000-000000000101'::uuid,
    '10000000-0000-0000-0000-000000000001'::uuid,
    1,
    'Launch Unit - Understanding the Accounting Equation',
    'Versioned lesson content for Unit 1 Lesson 1.',
    'published',
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000101'::uuid,
    '20000000-0000-0000-0000-000000000001'::uuid,
    1,
    'Transaction Flow - Journal to Ledger',
    'Versioned lesson content for Unit 2 Lesson 1.',
    'published',
    now()
  ),
  (
    '30000000-0000-0000-0000-000000000101'::uuid,
    '30000000-0000-0000-0000-000000000001'::uuid,
    1,
    'Financial Statements in Sync',
    'Versioned lesson content for Unit 3 Lesson 1.',
    'published',
    now()
  )
ON CONFLICT (lesson_id, version) DO UPDATE
SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status;

-- Keep lesson shell pointers aligned to active version where supported.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'lessons'
      AND column_name = 'current_version_id'
  ) THEN
    UPDATE lessons l
    SET current_version_id = lv.id,
        updated_at = now()
    FROM lesson_versions lv
    WHERE lv.lesson_id = l.id
      AND lv.version = 1;
  END IF;
END $$;

-- --------------------------------------------------------------------------
-- 3) Active phase versions (6-phase model per lesson)
-- --------------------------------------------------------------------------
INSERT INTO phase_versions (
  id,
  lesson_version_id,
  phase_number,
  title,
  estimated_minutes,
  created_at
)
VALUES
  ('11000000-0000-0000-0000-000000000001'::uuid, '10000000-0000-0000-0000-000000000101'::uuid, 1, 'Hook', 8, now()),
  ('11000000-0000-0000-0000-000000000002'::uuid, '10000000-0000-0000-0000-000000000101'::uuid, 2, 'Introduction', 10, now()),
  ('11000000-0000-0000-0000-000000000003'::uuid, '10000000-0000-0000-0000-000000000101'::uuid, 3, 'Guided Practice', 10, now()),
  ('11000000-0000-0000-0000-000000000004'::uuid, '10000000-0000-0000-0000-000000000101'::uuid, 4, 'Independent Practice', 8, now()),
  ('11000000-0000-0000-0000-000000000005'::uuid, '10000000-0000-0000-0000-000000000101'::uuid, 5, 'Assessment', 6, now()),
  ('11000000-0000-0000-0000-000000000006'::uuid, '10000000-0000-0000-0000-000000000101'::uuid, 6, 'Closing', 3, now()),

  ('21000000-0000-0000-0000-000000000001'::uuid, '20000000-0000-0000-0000-000000000101'::uuid, 1, 'Hook', 8, now()),
  ('21000000-0000-0000-0000-000000000002'::uuid, '20000000-0000-0000-0000-000000000101'::uuid, 2, 'Introduction', 10, now()),
  ('21000000-0000-0000-0000-000000000003'::uuid, '20000000-0000-0000-0000-000000000101'::uuid, 3, 'Guided Practice', 10, now()),
  ('21000000-0000-0000-0000-000000000004'::uuid, '20000000-0000-0000-0000-000000000101'::uuid, 4, 'Independent Practice', 8, now()),
  ('21000000-0000-0000-0000-000000000005'::uuid, '20000000-0000-0000-0000-000000000101'::uuid, 5, 'Assessment', 6, now()),
  ('21000000-0000-0000-0000-000000000006'::uuid, '20000000-0000-0000-0000-000000000101'::uuid, 6, 'Closing', 3, now()),

  ('31000000-0000-0000-0000-000000000001'::uuid, '30000000-0000-0000-0000-000000000101'::uuid, 1, 'Hook', 8, now()),
  ('31000000-0000-0000-0000-000000000002'::uuid, '30000000-0000-0000-0000-000000000101'::uuid, 2, 'Introduction', 10, now()),
  ('31000000-0000-0000-0000-000000000003'::uuid, '30000000-0000-0000-0000-000000000101'::uuid, 3, 'Guided Practice', 10, now()),
  ('31000000-0000-0000-0000-000000000004'::uuid, '30000000-0000-0000-0000-000000000101'::uuid, 4, 'Independent Practice', 8, now()),
  ('31000000-0000-0000-0000-000000000005'::uuid, '30000000-0000-0000-0000-000000000101'::uuid, 5, 'Assessment', 6, now()),
  ('31000000-0000-0000-0000-000000000006'::uuid, '30000000-0000-0000-0000-000000000101'::uuid, 6, 'Closing', 3, now())
ON CONFLICT (lesson_version_id, phase_number) DO UPDATE
SET
  title = EXCLUDED.title,
  estimated_minutes = EXCLUDED.estimated_minutes;

-- --------------------------------------------------------------------------
-- 4) Ordered phase sections (1 starter markdown block per phase)
-- --------------------------------------------------------------------------
INSERT INTO phase_sections (
  id,
  phase_version_id,
  sequence_order,
  section_type,
  content,
  created_at
)
VALUES
  ('11100000-0000-0000-0000-000000000001'::uuid, '11000000-0000-0000-0000-000000000001'::uuid, 1, 'text', '{"markdown":"# Unit 1 · Phase 1\\nExplore why balanced books matter for founders."}'::jsonb, now()),
  ('11100000-0000-0000-0000-000000000002'::uuid, '11000000-0000-0000-0000-000000000002'::uuid, 1, 'text', '{"markdown":"# Unit 1 · Phase 2\\nLearn Assets = Liabilities + Equity with startup examples."}'::jsonb, now()),
  ('11100000-0000-0000-0000-000000000003'::uuid, '11000000-0000-0000-0000-000000000003'::uuid, 1, 'text', '{"markdown":"# Unit 1 · Phase 3\\nPractice classifying business items accurately."}'::jsonb, now()),
  ('11100000-0000-0000-0000-000000000004'::uuid, '11000000-0000-0000-0000-000000000004'::uuid, 1, 'text', '{"markdown":"# Unit 1 · Phase 4\\nApply accounting equation logic independently."}'::jsonb, now()),
  ('11100000-0000-0000-0000-000000000005'::uuid, '11000000-0000-0000-0000-000000000005'::uuid, 1, 'text', '{"markdown":"# Unit 1 · Phase 5\\nShow mastery with a focused checkpoint."}'::jsonb, now()),
  ('11100000-0000-0000-0000-000000000006'::uuid, '11000000-0000-0000-0000-000000000006'::uuid, 1, 'text', '{"markdown":"# Unit 1 · Phase 6\\nReflect on how reliable books support decisions."}'::jsonb, now()),

  ('21100000-0000-0000-0000-000000000001'::uuid, '21000000-0000-0000-0000-000000000001'::uuid, 1, 'text', '{"markdown":"# Unit 2 · Phase 1\\nFrame the transaction lifecycle challenge."}'::jsonb, now()),
  ('21100000-0000-0000-0000-000000000002'::uuid, '21000000-0000-0000-0000-000000000002'::uuid, 1, 'text', '{"markdown":"# Unit 2 · Phase 2\\nModel journal entry structure and posting rules."}'::jsonb, now()),
  ('21100000-0000-0000-0000-000000000003'::uuid, '21000000-0000-0000-0000-000000000003'::uuid, 1, 'text', '{"markdown":"# Unit 2 · Phase 3\\nComplete guided double-entry examples."}'::jsonb, now()),
  ('21100000-0000-0000-0000-000000000004'::uuid, '21000000-0000-0000-0000-000000000004'::uuid, 1, 'text', '{"markdown":"# Unit 2 · Phase 4\\nPost entries to ledger accounts without hints."}'::jsonb, now()),
  ('21100000-0000-0000-0000-000000000005'::uuid, '21000000-0000-0000-0000-000000000005'::uuid, 1, 'text', '{"markdown":"# Unit 2 · Phase 5\\nVerify debit/credit parity in assessment items."}'::jsonb, now()),
  ('21100000-0000-0000-0000-000000000006'::uuid, '21000000-0000-0000-0000-000000000006'::uuid, 1, 'text', '{"markdown":"# Unit 2 · Phase 6\\nSummarize key transaction-control habits."}'::jsonb, now()),

  ('31100000-0000-0000-0000-000000000001'::uuid, '31000000-0000-0000-0000-000000000001'::uuid, 1, 'text', '{"markdown":"# Unit 3 · Phase 1\\nIntroduce cross-statement storytelling."}'::jsonb, now()),
  ('31100000-0000-0000-0000-000000000002'::uuid, '31000000-0000-0000-0000-000000000002'::uuid, 1, 'text', '{"markdown":"# Unit 3 · Phase 2\\nConnect income statement outcomes to equity."}'::jsonb, now()),
  ('31100000-0000-0000-0000-000000000003'::uuid, '31000000-0000-0000-0000-000000000003'::uuid, 1, 'text', '{"markdown":"# Unit 3 · Phase 3\\nTrace cash effects from operating decisions."}'::jsonb, now()),
  ('31100000-0000-0000-0000-000000000004'::uuid, '31000000-0000-0000-0000-000000000004'::uuid, 1, 'text', '{"markdown":"# Unit 3 · Phase 4\\nBuild independent statement linkage checks."}'::jsonb, now()),
  ('31100000-0000-0000-0000-000000000005'::uuid, '31000000-0000-0000-0000-000000000005'::uuid, 1, 'text', '{"markdown":"# Unit 3 · Phase 5\\nDemonstrate statement interpretation accuracy."}'::jsonb, now()),
  ('31100000-0000-0000-0000-000000000006'::uuid, '31000000-0000-0000-0000-000000000006'::uuid, 1, 'text', '{"markdown":"# Unit 3 · Phase 6\\nClose with executive-summary style reflection."}'::jsonb, now())
ON CONFLICT (phase_version_id, sequence_order) DO UPDATE
SET
  section_type = EXCLUDED.section_type,
  content = EXCLUDED.content;
