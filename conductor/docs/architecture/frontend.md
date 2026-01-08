---
title: Frontend Architecture
type: architecture
status: active
created: 2025-11-11
updated: 2025-11-11
tags: [architecture, frontend, nextjs, components, patterns]
---

# Frontend Architecture

Comprehensive guide to the Next.js 15 frontend architecture for Math for Business Operations v2.

## Table of Contents

1. [Next.js 15 Structure](#nextjs-15-structure)
2. [Component Patterns](#component-patterns)
3. [Rendering Strategy](#rendering-strategy)
4. [State Management](#state-management)
5. [Routing and Navigation](#routing-and-navigation)
6. [Testing Patterns](#testing-patterns)

---

## Next.js 15 Structure

### Directory Organization

```
bus-math-v2/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Auth route group
│   ├── lesson/            # Lesson pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── activities/       # Interactive learning activities
│   ├── lesson/           # Lesson-specific components
│   └── ...
├── lib/                   # Utilities and helpers
│   ├── db/               # Database schema and queries
│   ├── utils/            # Helper functions
│   └── ...
├── public/                # Static assets
└── __tests__/            # Test files
```

### App Router Conventions

- **Route Groups**: `(auth)` for authentication routes without adding URL segments
- **Dynamic Routes**: `[slug]` for dynamic lesson pages
- **Layouts**: Shared UI across routes using `layout.tsx`
- **Loading States**: `loading.tsx` for suspense boundaries
- **Error Boundaries**: `error.tsx` for error handling

### Component Organization

Components are organized by domain and function:

- **`components/ui/`**: shadcn/ui primitives (Button, Card, Tabs, etc.)
- **`components/activities/`**: Interactive learning components
- **`components/lesson/`**: Lesson page components
- **`components/teacher/`**: Teacher-specific components
- **`components/accessibility/`**: Accessibility tools

---

## Component Patterns

Patterns and best practices from migrating 74+ components from v1 to v2.

### Database-Shaped Props

Components accept props that mirror database types from drizzle-zod validators:

```typescript
import { Lesson, Phase, Activity } from '@/lib/db/schema';

interface LessonCardProps {
  lesson: Lesson; // Direct database type
  onNavigate?: (lessonId: string) => void;
}

interface PhaseContentProps {
  phase: Phase; // Direct database type
  showTimer?: boolean;
}
```

### Drizzle-Zod Integration

Schema-first development with strict typing:

```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, jsonb } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// 1. Define Zod schema for JSONB validation
export const lessonMetadataSchema = z.object({
  duration: z.number().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
});

export type LessonMetadata = z.infer<typeof lessonMetadataSchema>;

// 2. Use schema in table definition
export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  metadata: jsonb('metadata').$type<LessonMetadata>(),
});

// 3. Export types for components
export type Lesson = typeof lessons.$inferSelect;
```

### Optional Metadata Handling

Components must gracefully handle missing or partial metadata:

```typescript
interface TeacherLessonPlanProps {
  lesson: Lesson;
  phases: Phase[];
}

export default function TeacherLessonPlan({ lesson, phases }: TeacherLessonPlanProps) {
  // Safely access optional nested metadata
  const unitContent = lesson.metadata?.unitContent;
  const learningObjectives = lesson.learningObjectives ?? [];

  // Provide sensible defaults
  const duration = lesson.metadata?.duration ?? 45;
  const difficulty = lesson.metadata?.difficulty ?? 'intermediate';

  return (
    <div>
      <h2>{lesson.title}</h2>
      <p>Duration: {duration} minutes</p>
      <p>Difficulty: {difficulty}</p>
      {/* Component JSX */}
    </div>
  );
}
```

### Callback Props Pattern

Expose clear boundaries for stateful interactions:

```typescript
interface InterestCalculatorProps {
  scenario?: string;
  onCalculationComplete?: (result: InterestResult) => void;
  onStateChange?: (state: CalculatorState) => void;
}

export default function InterestCalculator({
  scenario,
  onCalculationComplete,
  onStateChange,
}: InterestCalculatorProps) {
  const [state, setState] = useState<CalculatorState>(initialState);

  // Notify parent of state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const handleCalculate = () => {
    const result = performCalculation(state);
    onCalculationComplete?.(result);
  };

  return (/* Component JSX */);
}
```

### Activity Component Registry

Centralized registry for dynamic activity rendering:

```typescript
// lib/activities/registry.ts
import { ComponentType } from 'react';
import ComprehensionQuiz from '@/components/activities/ComprehensionQuiz';
import ProfitCalculator from '@/components/activities/ProfitCalculator';

export const activityRegistry: Record<string, ComponentType<any>> = {
  'comprehension-quiz': ComprehensionQuiz,
  'profit-calculator': ProfitCalculator,
  // Add new activities here
};

export function getActivityComponent(componentKey: string) {
  return activityRegistry[componentKey] ?? null;
}
```

### Content Block Pattern

Use discriminated unions for flexible content rendering:

```typescript
type ContentBlock =
  | { type: 'markdown'; content: string }
  | { type: 'video'; props: VideoProps }
  | { type: 'activity'; activityId: string; required: boolean }
  | { type: 'callout'; variant: CalloutVariant; content: string }
  | { type: 'image'; props: ImageProps };

function renderContentBlock(block: ContentBlock) {
  switch (block.type) {
    case 'markdown':
      return <MarkdownRenderer content={block.content} />;
    case 'video':
      return <VideoPlayer {...block.props} />;
    case 'activity':
      return <ActivityRenderer activityId={block.activityId} />;
    case 'callout':
      return <Callout variant={block.variant}>{block.content}</Callout>
    case 'image':
      return <Image {...block.props} />;
  }
}
```

### Financial Calculation Patterns

Proper precision and formatting for financial components:

```typescript
// lib/utils/financial.ts

/** Round to 2 decimal places for currency */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Format as currency with proper locale */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
```

### Common Migration Gotchas

**Import Path Updates:**
```typescript
// ❌ Old v1 pattern
import Button from '../components/ui/Button';

// ✅ New v2 pattern
import { Button } from '@/components/ui/button';
```

**Client Component Directive:**
```typescript
// Interactive components must be client components
'use client';

import { useState } from 'react';

export default function InteractiveComponent() {
  const [state, setState] = useState(0);
  // ...
}
```

**HTML Entity Escaping:**
```typescript
// ❌ Causes lint errors
<p>Let's calculate the profit</p>

// ✅ Properly escaped
<p>Let&apos;s calculate the profit</p>
```

**Unused Variable Cleanup:**
```typescript
// ❌ Unused variable
const { onClick, className, disabled } = props;
return <button className={className}>{children}</button>;

// ✅ Only destructure what you use
const { className } = props;
return <button className={className}>{children}</button>;
```

---

## Rendering Strategy

### Server Components by Default

Next.js 15 uses Server Components by default for better performance:

```typescript
// app/lesson/[slug]/page.tsx - Server Component (default)
import { getLessonBySlug } from '@/lib/db/queries';

export default async function LessonPage({
  params
}: {
  params: { slug: string }
}) {
  const lesson = await getLessonBySlug(params.slug);

  return (
    <div>
      <h1>{lesson.title}</h1>
      {/* Render lesson content */}
    </div>
  );
}
```

### Client Components for Interactivity

Use `'use client'` directive for interactive components:

```typescript
// components/activities/ProfitCalculator.tsx
'use client';

import { useState } from 'react';

export default function ProfitCalculator() {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);

  return (
    <div>
      <input
        type="number"
        value={revenue}
        onChange={(e) => setRevenue(Number(e.target.value))}
      />
      {/* Calculator UI */}
    </div>
  );
}
```

### Dynamic Imports for Browser-Dependent Code

Disable SSR for components that require browser APIs:

```typescript
// app/lesson/[slug]/page.tsx
import dynamic from 'next/dynamic';

// Disable SSR for browser-dependent components
const SpreadsheetExercise = dynamic(
  () => import('@/components/activities/SpreadsheetExercise'),
  { ssr: false }
);

export default function LessonPage() {
  return (
    <div>
      <SpreadsheetExercise data={data} />
    </div>
  );
}
```

### Streaming and Suspense

Use Suspense for incremental content loading:

```typescript
import { Suspense } from 'react';

export default function LessonPage() {
  return (
    <div>
      <Suspense fallback={<LessonSkeleton />}>
        <LessonContent />
      </Suspense>
    </div>
  );
}
```

### Data Fetching Patterns

Prefer server-side data fetching with caching:

```typescript
// lib/db/queries.ts
import { db } from '@/lib/db';
import { lessons } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';

export const getLessonBySlug = unstable_cache(
  async (slug: string) => {
    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.slug, slug))
      .limit(1);

    return lesson;
  },
  ['lesson-by-slug'],
  { revalidate: 3600 } // Cache for 1 hour
);
```

---

## State Management

### Local Component State

Use `useState` for simple component state:

```typescript
export default function ComprehensionQuiz({ questions }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (/* Quiz UI */);
}
```

### Complex State with useReducer

Use `useReducer` for complex state logic:

```typescript
type CalculatorState =
  | { status: 'idle' }
  | { status: 'calculating'; progress: number }
  | { status: 'complete'; result: CalculationResult }
  | { status: 'error'; message: string };

type CalculatorAction =
  | { type: 'START_CALCULATION' }
  | { type: 'UPDATE_PROGRESS'; progress: number }
  | { type: 'COMPLETE'; result: CalculationResult }
  | { type: 'ERROR'; message: string };

function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  switch (action.type) {
    case 'START_CALCULATION':
      return { status: 'calculating', progress: 0 };
    case 'UPDATE_PROGRESS':
      return state.status === 'calculating'
        ? { ...state, progress: action.progress }
        : state;
    case 'COMPLETE':
      return { status: 'complete', result: action.result };
    case 'ERROR':
      return { status: 'error', message: action.message };
    default:
      return state;
  }
}

export default function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, { status: 'idle' });

  const handleCalculate = async () => {
    dispatch({ type: 'START_CALCULATION' });
    try {
      const result = await performCalculation();
      dispatch({ type: 'COMPLETE', result });
    } catch (error) {
      dispatch({ type: 'ERROR', message: error.message });
    }
  };

  return (/* Calculator UI */);
}
```

### Server State with Server Components

Leverage Server Components for server state:

```typescript
// app/dashboard/page.tsx - Server Component
import { getStudentProgress } from '@/lib/db/queries';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const user = await auth();
  const progress = await getStudentProgress(user.id);

  return (
    <div>
      <h1>Your Progress</h1>
      <ProgressChart data={progress} />
    </div>
  );
}
```

### Performance Optimization

Use memoization for expensive calculations:

```typescript
import { useMemo, useCallback } from 'react';

export default function DepreciationCalculator({ asset }: Props) {
  // Memoize expensive calculations
  const schedule = useMemo(
    () => generateDepreciationSchedule(asset),
    [asset]
  );

  // Memoize callbacks to prevent re-renders
  const handleMethodChange = useCallback((method: string) => {
    setSelectedMethod(method);
  }, []);

  return (/* Calculator UI */);
}
```

---

## Routing and Navigation

### App Router Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── lesson/
│   ├── [slug]/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── page.tsx
├── dashboard/
│   └── page.tsx
├── layout.tsx
└── page.tsx
```

### Dynamic Routes

```typescript
// app/lesson/[slug]/page.tsx
export default async function LessonPage({
  params
}: {
  params: { slug: string }
}) {
  const lesson = await getLessonBySlug(params.slug);

  if (!lesson) {
    notFound();
  }

  return <LessonView lesson={lesson} />;
}

// Generate static params for known lessons
export async function generateStaticParams() {
  const lessons = await getAllLessons();
  return lessons.map((lesson) => ({
    slug: lesson.slug,
  }));
}
```

### Navigation Components

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function NavigationButtons({
  prevSlug,
  nextSlug
}: {
  prevSlug?: string;
  nextSlug?: string;
}) {
  const router = useRouter();

  return (
    <div className="flex justify-between">
      {prevSlug && (
        <Button onClick={() => router.push(`/lesson/${prevSlug}`)}>
          Previous
        </Button>
      )}
      {nextSlug && (
        <Button onClick={() => router.push(`/lesson/${nextSlug}`)}>
          Next
        </Button>
      )}
    </div>
  );
}
```

### Middleware for Protected Routes

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

## Testing Patterns

### Component Testing with Vitest

```typescript
// __tests__/LessonCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LessonCard from '@/components/lesson/LessonCard';
import { createMockLesson } from './fixtures/lessons';

describe('LessonCard', () => {
  it('renders lesson title and description', () => {
    const lesson = createMockLesson();

    render(<LessonCard lesson={lesson} />);

    expect(screen.getByText(lesson.title)).toBeInTheDocument();
    expect(screen.getByText(lesson.description!)).toBeInTheDocument();
  });

  it('handles missing optional metadata gracefully', () => {
    const lesson = createMockLesson({ metadata: undefined });

    render(<LessonCard lesson={lesson} />);

    // Should still render without errors
    expect(screen.getByText(lesson.title)).toBeInTheDocument();
  });
});
```

### Mock Factories

```typescript
// __tests__/fixtures/lessons.ts
import { Lesson } from '@/lib/db/schema';

export const createMockLesson = (overrides?: Partial<Lesson>): Lesson => ({
  id: 'test-lesson-1',
  unitNumber: 1,
  title: 'Test Lesson',
  slug: 'test-lesson',
  description: 'Test description',
  learningObjectives: ['Objective 1', 'Objective 2'],
  orderIndex: 1,
  metadata: {
    duration: 45,
    difficulty: 'intermediate',
    tags: ['test'],
  },
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z'),
  ...overrides,
});
```

### Mocking Complex Libraries

```typescript
// __tests__/setup.ts
import { vi } from 'vitest';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock react-spreadsheet
vi.mock('react-spreadsheet', () => ({
  default: vi.fn(({ data, onChange }) => (
    <div data-testid="mock-spreadsheet">
      <button onClick={() => onChange?.(data)}>Update</button>
    </div>
  )),
}));
```

### User Interaction Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ProfitCalculator from '@/components/activities/ProfitCalculator';

it('calculates profit when inputs change', async () => {
  const user = userEvent.setup();
  const onCalculate = vi.fn();

  render(<ProfitCalculator onCalculate={onCalculate} />);

  const revenueInput = screen.getByLabelText(/revenue/i);
  const expensesInput = screen.getByLabelText(/expenses/i);

  await user.clear(revenueInput);
  await user.type(revenueInput, '1000');

  await user.clear(expensesInput);
  await user.type(expensesInput, '600');

  await user.click(screen.getByRole('button', { name: /calculate/i }));

  expect(onCalculate).toHaveBeenCalledWith({
    revenue: 1000,
    expenses: 600,
    profit: 400,
  });
});
```

### Accessibility Testing

```typescript
it('has correct ARIA attributes', () => {
  const preferences = {
    language: 'en',
    fontSize: 'medium',
    highContrast: false,
  };

  render(<AccessibilityToolbar preferences={preferences} />);

  const toggle = screen.getByRole('switch', { name: /high contrast/i });
  expect(toggle).toHaveAttribute('aria-pressed', 'false');
  expect(toggle).toHaveAttribute('aria-label', 'Toggle high contrast mode');
});
```

---

## Best Practices Summary

1. **Server Components by Default**: Use Server Components for data fetching and static content
2. **Client Components Sparingly**: Only use `'use client'` for interactivity
3. **Database-Shaped Props**: Accept props that mirror database types
4. **Graceful Degradation**: Handle missing metadata and optional fields
5. **Type Safety**: Use drizzle-zod for strict typing throughout
6. **Financial Precision**: Proper rounding and formatting for money
7. **Accessibility**: Support keyboard navigation, screen readers, and preferences
8. **Performance**: Memoization for expensive calculations
9. **Testing**: Comprehensive coverage with deterministic mock factories
10. **Documentation**: Keep patterns updated in this file and RETROSPECTIVE.md

---

For additional context, refer to:
- `docs/RETROSPECTIVE.md` - Project-wide learnings from component migration
- `lib/db/schema.ts` - Database schemas and Zod validators
- `docs/TDD.md` - Testing expectations and workflow
- `.claude/skills/issue-executor/` - SynthesisFlow development workflow
