# Non-Unit Page Audit Notes

## In-Scope Routes and Auth Requirements

| Route | Auth Required | Role | Notes |
|-------|---------------|------|-------|
| `/` | No | Public | Home landing page |
| `/preface` | No | Public | Preface page |
| `/curriculum` | No | Public | Curriculum overview page |
| `/acknowledgments` | No | Public | Acknowledgments page |
| `/capstone` | No | Public | Capstone overview page |
| `/auth/login` | No | Unauthenticated | Login page |
| `/auth/forgot-password` | No | Unauthenticated | Forgot password page |
| `/auth/update-password` | Yes (token) | Unauthenticated → Authenticated | Password reset page |
| `/auth/error` | No | Unauthenticated | Auth error page |
| `/student` | Yes | Student | Student dashboard redirect |
| `/student/dashboard` | Yes | Student | Student dashboard |
| `/teacher` | Yes | Teacher | Teacher dashboard redirect |
| `/teacher/dashboard` | Yes | Teacher | Teacher dashboard |
| `/teacher/gradebook` | Yes | Teacher | Teacher gradebook |
| `/settings` | Yes | Any authenticated | Account settings page |

## Page Audit Findings

### Public Pages
- `/`, `/preface`, `/curriculum`, `/capstone`: Use consistent Digital Ledger theme (hero-gradient, section-label, ledger-bg, etc.)
- `/acknowledgments`: **FIXED** — previously used inconsistent styling (slate/blue gradient, etc.), now matches Digital Ledger theme.

### Auth Pages
- `/auth/login`, `/auth/forgot-password`, `/auth/update-password`, `/auth/error`: All look consistent with no obvious issues.

### Student Pages
- `/student` redirects to `/student/dashboard`; `/student/dashboard` looks good with no obvious issues.

### Teacher Pages
- `/teacher` and `/teacher/dashboard` share the same component; `/teacher/gradebook` looks good with no obvious issues.

### Settings Page
- `/settings` looks good with no obvious issues.


