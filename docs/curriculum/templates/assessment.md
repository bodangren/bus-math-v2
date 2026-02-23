---
lesson_id: "UXXLXX"
type: "assessment"
objectives:
  - "Standard 1"
  - "Standard 2"
narrative_hook: "Sarah Chen's summative checkpoint context"
standards:
  primary: "ACC-X.1"
  secondary:
    - "ACC-X.2"
    - "ACC-X.3"
quality_rules:
  required_phases:
    - instructions
    - knowledge
    - understanding
    - application
  questions_per_standard: 3
  application_problems_per_standard: 1
  passing_score: 70
  all_items_auto_graded: true
  all_items_require_problem_template: true
---

# Summative Assessment: {{lesson_title}}

## Phase 1: Instructions
- **Goal:** Explain timing, attempts, and tier structure.
- **Required:** Include standards-to-question coverage map.

## Phase 2: Knowledge Tier
- **Goal:** Recall-level checks (non-MCQ preferred).
- **Required:** One question per standard with algorithmic support.

## Phase 3: Understanding Tier
- **Goal:** Scenario-based conceptual reasoning.
- **Required:** One question per standard with algorithmic support.

## Phase 4: Application Tier
- **Goal:** Procedural solving and transfer.
- **Required:**
  - One application-tier question per standard
  - One application problem per standard
  - Cell-value validation for spreadsheet-style problems when applicable

---

## Activity Contract

```yaml
componentKey: tiered-assessment
gradingConfig:
  autoGrade: true
  passingScore: 70
props:
  tier: application
  questions: []
  applicationProblems: []
  problemTemplate: {}
```

## Question Type Guidance
- Favor `true-false`, `fill-in-the-blank`, `numeric-entry`, `categorization`, and `equation-solver`.
- Avoid all-MCQ assessments for summative tiers.
