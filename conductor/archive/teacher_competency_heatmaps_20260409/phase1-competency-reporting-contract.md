# Competency Reporting Contract

## Overview

This document defines the canonical teacher-facing competency reporting hierarchy and data contracts for the Teacher Competency Heatmaps and Mastery Views track.

## Data Sources

### Competency Standards (`competency_standards`)

- `id`: UUID primary key
- `code`: Unique code (e.g., "ACC-1.1")
- `description`: Technical description
- `studentFriendlyDescription`: UX-friendly description (optional)
- `category`: Category grouping (optional)
- `isActive`: Boolean filter for active standards

### Student Competency (`student_competency`)

- `id`: UUID primary key
- `studentId`: FK to profiles
- `standardId`: FK to competency_standards
- `masteryLevel`: Integer 0-100
- `evidenceActivityId`: FK to activities (optional)
- `lastUpdated`: Timestamp
- `updatedBy`: FK to profiles (who updated the record)

### Lesson Standards (`lesson_standards`)

- `id`: UUID primary key
- `lessonVersionId`: FK to lesson_versions
- `standardId`: FK to competency_standards
- `isPrimary`: Boolean flag for primary standards

## Reporting Hierarchy

### Level 1: Course Competency Heatmap (NEW)

**Route**: `/teacher/competency` (planned)

**Scope**: Course-wide view of all students across all units

**Data Contract**:
```typescript
interface CompetencyHeatmapRow {
  studentId: string;
  displayName: string;
  username: string;
  cells: CompetencyHeatmapCell[];
}

interface CompetencyHeatmapCell {
  standardId: string;
  standardCode: string;
  standardDescription: string;
  category: string | null;
  masteryLevel: number | null;
  color: "green" | "yellow" | "red" | "gray";
}

interface CompetencyHeatmapResponse {
  rows: CompetencyHeatmapRow[];
  standards: CompetencyStandard[];
}

interface CompetencyStandard {
  id: string;
  code: string;
  description: string;
  studentFriendlyDescription: string | null;
  category: string | null;
}
```

**Color Logic**:
- `gray`: No competency data for this standard
- `green`: masteryLevel ≥ 80
- `yellow`: masteryLevel 50–79
- `red`: masteryLevel < 50

### Level 2: Unit Competency Heatmap (NEW)

**Route**: `/teacher/competency/units/[unitNumber]` (planned)

**Scope**: Single unit view showing all students and all standards in that unit

**Data Contract**: Same structure as Level 1, filtered to standards belonging to the specified unit.

### Level 3: Student Competency Detail (NEW)

**Route**: `/teacher/students/[studentId]/competency` (planned)

**Scope**: Single student view showing all their competencies across all units

**Data Contract**:
```typescript
interface StudentCompetencyDetail {
  studentId: string;
  displayName: string;
  username: string;
  competencies: StudentCompetency[];
}

interface StudentCompetency {
  standardId: string;
  standardCode: string;
  standardDescription: string;
  category: string | null;
  masteryLevel: number | null;
  evidenceActivityId: string | null;
  lastUpdated: number | null;
  updatedBy: string | null;
  unitNumber: number | null; // Derived from lesson_standards → lessons
  lessonTitle: string | null; // Primary lesson for this standard
}
```

## Drill-Down Contracts

### From Course Heatmap to Unit Heatmap
- Click standard column header → Navigate to `/teacher/competency/units/[unitNumber]` filtered to that standard
- Click cell → Navigate to `/teacher/students/[studentId]/competency` with that standard highlighted

### From Unit Heatmap to Gradebook
- Click student row → Navigate to `/teacher/gradebook/units/[unitNumber]/students/[studentId]` (if exists)
- Click standard column → Navigate to `/teacher/gradebook/units/[unitNumber]` showing that standard's lessons

### From Student Detail to Gradebook/Lesson
- Click evidenceActivityId → Open `SubmissionDetailModal` with that activity
- Click unitNumber → Navigate to `/teacher/gradebook/units/[unitNumber]`

## Existing Reporting Integration

### Course Overview (Existing)
- Route: `/teacher/gradebook`
- Component: `CourseOverviewGrid`
- Data: `getTeacherCourseOverviewData` → `assembleCourseOverviewRows`
- Shows: Unit-level avgMastery per student, colored cells
- **Note**: This is course-level but aggregates by unit, not by standard

### Unit Gradebook (Existing)
- Route: `/teacher/gradebook/units/[unitNumber]`
- Component: `GradebookGrid`
- Data: `getTeacherGradebookData` → `assembleGradebookRows`
- Shows: Lesson-level progress, masteryLevel, independentPractice, assessment per student

## Data Inconsistencies Found During Audit

None found. The existing competency data model is clean:
- `masteryLevel` is constrained to 0-100 via CHECK constraint
- All foreign keys are properly defined with ON DELETE rules
- Unique constraints prevent duplicate (studentId, standardId) pairs

## Labeling Inconsistencies Found During Audit

None found. All standards have required fields, and student-friendly descriptions are optional but provided where needed.

## Next Steps

Phase 1 deliverables:
- [x] Audit existing competency schema, teacher helpers, and reporting seams
- [x] Define canonical course/unit/student competency reporting contract
- [ ] Add failing tests for competency view-model assembly and route states
- [ ] Record any data or labeling inconsistencies (none found)
