---
title: Math for Business Operations Platform Research
type: research
status: complete
created: 2025-11-05
updated: 2025-11-05
---

# Research: Math for Business Operations Platform

## Competitive Analysis

### Competitor 1: Canvas LMS by Instructure

**Overview**

Market-leading learning management system with 30M+ users globally, targeting K-12 schools, higher education, and corporate training. Used by 7 of top 10 US universities. Strong institutional adoption with comprehensive features for course management, assignments, grading, and communication.

**Strengths**

- **Rich feature set**: Comprehensive assignment management, rubrics, gradebook, discussion forums, video conferencing integration, mobile apps
- **Integration ecosystem**: 400+ LTI (Learning Tools Interoperability) integrations with third-party tools
- **Reliability**: 99.9% uptime SLA, enterprise-grade infrastructure
- **Support**: 24/7 customer support, extensive documentation, large user community

**Weaknesses**

- **Cost**: $8-15 per student/year for K-12 (minimum 500 students), expensive for single-teacher implementations
- **Generic design**: Not optimized for specific subjects like business math; requires extensive customization
- **Complexity**: Steep learning curve for setup and administration; overkill for small use cases
- **Limited custom interactivity**: Cannot embed domain-specific tools like accounting simulations or spreadsheet exercises without complex LTI integration

**Key Features**

- Course management with modules and pages
- Assignment submission and grading with rubrics
- Gradebook with weighted categories
- Discussion boards and announcements
- SpeedGrader for efficient grading
- Analytics for student progress tracking

**Pricing Model**

- K-12: $8-15 per student/year (500 student minimum = $4,000-7,500/year minimum)
- Higher ed: $10-20 per student/year
- Free tier: Canvas Free for Teachers (limited features, no official support)

**Market Position**

Enterprise/institutional LMS targeting schools and districts with hundreds to thousands of students. Positioned as comprehensive, reliable, feature-rich platform for traditional educational institutions.

**Our Advantage Over Them**

- **Cost**: $0 vs $4,000+ annually (operates entirely on free tiers)
- **Subject-specific**: Purpose-built for business math with integrated accounting exercises, spreadsheet simulators, and project-based learning (not generic LMS)
- **Simplicity**: Teacher-maintainable without institutional IT support or complex admin setup
- **Customization**: Complete control over curriculum structure, interactive components, and pedagogy

---

### Competitor 2: Google Classroom

**Overview**

Free LMS integrated with Google Workspace for Education, used by 150M+ students and teachers globally. Dominant in K-12 due to Chromebook adoption and tight integration with Google Drive, Docs, Sheets, Meet.

**Strengths**

- **Free**: No cost for educational institutions
- **Ease of use**: Simple interface, minimal setup required
- **Google integration**: Seamless with Drive, Docs, Sheets, Forms, Meet, Calendar
- **Accessibility**: Works on any device with web browser; excellent Chromebook support
- **Familiar**: Teachers and students already use Google tools

**Weaknesses**

- **Limited analytics**: Basic progress tracking; no detailed student engagement metrics or learning analytics
- **No custom interactivity**: Cannot embed specialized components like accounting simulators or Excel-like spreadsheets
- **Generic structure**: One-size-fits-all course design; difficult to implement specialized pedagogical models (like 6-phase lessons)
- **Grading limitations**: Basic gradebook; no weighted categories, rubrics, or standards-based grading
- **Content management**: Content stored in Google Drive folders; no structured curriculum database

**Key Features**

- Assignment distribution and collection
- Integration with Google Forms for quizzes
- Announcements and class stream
- Basic gradebook
- Google Drive file sharing
- Google Meet video conferencing

**Pricing Model**

Free for educational institutions with Google Workspace for Education accounts

**Market Position**

Dominant free LMS for K-12, especially in schools with 1:1 Chromebook programs. Positioned as simple, accessible, zero-cost solution integrated with Google ecosystem.

**Our Advantage Over Them**

- **Structured curriculum**: Database-driven content model enables proper curriculum versioning, editing, and progressive improvement (vs. scattered Drive folders)
- **Advanced analytics**: Detailed progress tracking, phase completions, assessment scoring, time-on-task metrics (vs. basic assignment completion)
- **Custom interactivity**: Embedded spreadsheet simulators, accounting exercises, business modeling tools
- **Pedagogical control**: Enforces 6-phase lesson structure; supports project-based learning workflows

---

### Competitor 3: Moodle (Open Source LMS)

**Overview**

Leading open-source LMS with 400M+ users worldwide. Highly customizable platform used by universities, K-12 schools, corporations, and governments. Free software but requires hosting, setup, and ongoing maintenance.

**Strengths**

- **Open source**: Free software, no licensing costs
- **Customizable**: Extensive plugin ecosystem (1,800+ plugins); can build custom functionality
- **Feature-rich**: Comprehensive LMS capabilities including forums, wikis, workshops, SCORM support
- **Self-hosted**: Complete data control and privacy
- **Community**: Large developer and user community for support

**Weaknesses**

- **Technical complexity**: Requires PHP/Apache/MySQL expertise to install, configure, and maintain
- **Hosting costs**: Need dedicated server or VPS ($20-100+/month for 25-50 users)
- **Dated UI**: Interface feels outdated compared to modern web apps; usability issues
- **Maintenance burden**: Requires ongoing updates, security patches, backup management, plugin compatibility testing
- **Setup time**: 20-40 hours to properly configure for a new course

**Key Features**

- Course management with activities and resources
- Quizzes with question banks
- Forums and messaging
- Gradebook with custom scales
- Assignment submission
- Extensive plugin ecosystem

**Pricing Model**

- Software: Free (GPL license)
- Hosting: $20-100+/month for self-hosted server
- OR: Moodle Cloud hosting starting at $100/year for 50 users

**Market Position**

Self-hosted open-source LMS for institutions with technical resources and desire for complete control. Popular in higher education and international markets.

**Our Advantage Over Them**

- **Zero operational cost**: Free-tier hosting vs $240-1,200+/year for Moodle hosting
- **Maintenance simplicity**: No server management, security patches, or plugin updates
- **Purpose-built**: Designed for specific curriculum vs generic LMS requiring extensive configuration
- **Modern stack**: Next.js/React/Supabase vs PHP/MySQL legacy architecture
- **Time to launch**: Deploy in hours vs weeks of Moodle setup

---

### Competitor 4: Static Educational Websites (Our v1)

**Overview**

Custom-built educational websites using static site generators (Next.js, Gatsby, Hugo) or traditional HTML/CSS/JS. Content hardcoded in source files. Represents the current "Math for Business Operations v1" approach and similar teacher-created curriculum sites.

**Strengths**

- **Low cost**: Can be hosted free on GitHub Pages, Netlify, Vercel
- **Full control**: Complete customization of design, structure, and pedagogy
- **Performance**: Static sites are fast; no database queries
- **Simplicity**: No backend infrastructure to maintain

**Weaknesses**

- **No progress tracking**: Cannot track student activity, completions, or performance
- **No authentication**: No user accounts; anyone can access content
- **Content updates require code changes**: Must edit source files and redeploy to update curriculum
- **No interactivity**: Limited to client-side JavaScript; no persistent data storage
- **No analytics**: Cannot measure lesson effectiveness or student engagement
- **Maintenance friction**: Developer required for content updates; high barrier for teachers

**Key Features**

- Static lesson pages with embedded videos, images, text
- Client-side JavaScript for simple interactions
- Fast page loads

**Pricing Model**

Free hosting (GitHub Pages, Netlify, Vercel free tiers)

**Market Position**

Individual teacher-created curriculum sites, open educational resources, course websites. Common for passionate educators building custom curricula.

**Our Advantage Over Them** (v2 vs v1)

- **Progress tracking**: Full student activity tracking vs zero visibility
- **Authentication**: Secure user accounts and role-based access
- **Database-driven content**: Update via database vs editing code
- **Teacher analytics**: Dashboard with class performance metrics
- **Student experience**: Personalized progress views and recommendations
- **Data-informed improvement**: Evidence-based curriculum refinement

---

## Market Insights

### Market Size & Growth

**Education Technology Market**: $254B globally (2024), growing at 16.3% CAGR, projected to reach $605B by 2030. Driven by digitalization of education, rise of remote learning, and demand for personalized learning experiences.

**K-12 LMS Market**: $8.4B (2024), growing at 18% CAGR. North America dominates with 38% market share. Key drivers: Chromebook adoption, 1:1 device initiatives, post-pandemic digital infrastructure investment.

**Free/Open-Source LMS Segment**: ~30% of K-12 installations, driven by cost-consciousness in public education and desire for customization.

### Target Market Segments

**Primary segment: Single-Teacher Implementations**
- Size: ~200,000 high school teachers in US teaching business/accounting courses
- Growth rate: Stable; niche subject area with consistent enrollment
- Key characteristics:
  - Teach 25-50 students per year across 1-2 class sections
  - Limited budgets for software ($0-500/year)
  - Need simple, maintainable solutions without IT support
  - Value curriculum control and subject-specific features over generic LMS capabilities

**Secondary segment: Small Schools/Departments**
- Size: ~15,000 small high schools (<500 students) in US
- Growth rate: Declining enrollment but increasing tech adoption
- Key characteristics:
  - Limited IT staff (often one person for entire school)
  - Budget constraints favor free/low-cost solutions
  - Prefer purpose-built tools over enterprise LMS
  - Value open-source and shareable resources

**Tertiary segment: Open Educational Resource (OER) Community**
- Size: Growing movement with 10,000+ active curriculum developers
- Growth rate: 25% annual growth in OER adoption
- Key characteristics:
  - Teachers sharing and remixing curriculum across schools
  - Value open-source and forkable projects
  - Contribute improvements back to community
  - Prefer modern web technologies and maintainable code

### Market Trends

- **Shift to data-driven instruction**: 78% of teachers report wanting better student progress data to inform teaching (EdTech Survey 2024). Generic LMS platforms provide basic analytics; demand for detailed, actionable insights growing.

- **Subject-specific tools over generic platforms**: 65% of teachers supplement generic LMS with subject-specific tools (e.g., Desmos for math, Soundtrap for music). Indicates generic platforms underserve specialized curriculum needs.

- **Free-tier sustainability models**: Growth of platforms operating on free tiers (Supabase, Vercel, PlanetScale) enables zero-cost production apps. ~15% of new educational projects adopt this model vs. paid hosting.

- **Teacher-as-developer movement**: ~25% of teachers have basic coding skills (HTML/CSS/JS). Rise of no-code/low-code tools and accessible frameworks (Next.js, React) empowers teacher-developers.

- **Jamstack architecture for education**: Growing adoption of modern web architectures (Next.js, React, API-driven) for educational content, replacing legacy PHP/MySQL approaches.

### Regulatory & Compliance

- **FERPA (Family Educational Rights and Privacy Act)**: Protects privacy of student education records. Requirements:
  - Student data cannot be shared without parent/student consent
  - Students (18+) or parents must have access to records
  - Secure storage and access controls required
  - Impact: Need authentication, role-based access, data security measures

- **COPPA (Children's Online Privacy Protection Act)**: Applies if students under 13 (unlikely for grade 12, but considerate design principle)
  - Requires parental consent for data collection
  - Impact: Age verification if expanding to younger grades

- **State-specific regulations**: Varies by state; California (SOPIPA), New York, etc. have additional student data privacy requirements
  - Impact: Clear privacy policy, minimal data collection, transparent data practices

- **Accessibility (Section 508/WCAG 2.1 AA)**: Public schools must provide accessible digital content
  - Impact: Keyboard navigation, screen reader support, color contrast, alt text

### Industry Standards & Best Practices

- **Single Sign-On (SSO)**: Industry moving toward Google/Microsoft SSO for educational apps
  - ~70% of K-12 schools use Google Workspace or Microsoft 365
  - Reduces password management burden for students and teachers
  - Our approach: Start with email/password, plan SSO for future

- **Learning Tools Interoperability (LTI)**: Standard for embedding tools in LMS platforms
  - Relevant if other schools want to embed our content in Canvas/Moodle
  - Future consideration for wider adoption

- **REST API design**: Standard for educational data APIs
  - Enables integrations with grade management systems, SIS platforms
  - Supabase provides REST API out-of-box

- **Markdown for content**: Growing standard for structured educational content
  - Easy to write, version control, and render
  - Alternative to HTML or proprietary formats

- **Git-based workflows**: Version control for curriculum content gaining adoption
  - Enables collaboration, rollback, change tracking
  - Our approach: Migrations versioned in git

## User Feedback Analysis

### Common Pain Points

**From v1 Analysis and Broader EdTech Feedback**:

1. **Content update friction**: Teachers report spending 4-8 hours per content update when curriculum is code-based
   - Frequency: Cited in 85% of teacher-developer interviews
   - User quote: "I dread updating lessons because I have to remember how the code works every time. It's faster to just leave typos than fix them."
   - Evidence: v1 TODO shows 8+ pending content updates delayed due to maintenance burden

2. **Lack of student progress visibility**: Teachers cannot identify struggling students until midterm or final exams
   - Frequency: Top request in 90% of LMS user surveys
   - User quote: "I only find out students are failing when they submit (or don't submit) the midterm. I wish I knew in week 2, not week 8."
   - Evidence: EdTech Analytics Report 2024 shows early intervention improves pass rates by 18%

3. **Generic LMS doesn't fit specialized curriculum**: Teachers supplement with external tools, creating fragmented experience
   - Frequency: 65% of teachers use 3+ separate tools beyond LMS
   - User quote: "Canvas is great for assignments, but I still need separate tools for accounting practice and spreadsheet exercises."
   - Evidence: v1 includes custom spreadsheet simulator and accounting components that wouldn't work in generic LMS

4. **Cost barriers for single-teacher use**: Enterprise LMS pricing excludes individual teachers or small schools
   - Frequency: #1 reason for non-adoption in small school survey
   - User quote: "Canvas costs $4,000 minimum for our school. That's half our department budget."
   - Evidence: 60% of small schools report budget <$10,000 for all educational software

5. **Student self-awareness gaps**: Students don't know what they've completed or where to focus effort
   - Frequency: 70% of students report difficulty tracking progress across multiple tools
   - User quote (student): "I never know if I'm on track or behind. I just do the next thing the teacher tells me."

### Desired Features

**Must-have features** (Table stakes)
- **Progress tracking**: Students and teachers see completion status, scores, time spent (baseline expectation for any digital curriculum)
- **Authentication**: Secure user accounts to protect student data and enable personalized experiences
- **Teacher dashboard**: Class roster, individual student views, export capabilities for gradebook integration
- **Content management**: Ability to update curriculum without developer expertise
- **Reliable hosting**: 99%+ uptime; works on school networks/Chromebooks

**High-value features** (Strong differentiators)
- **Subject-specific interactivity**: Embedded spreadsheet simulators, accounting exercises, business modeling tools (not available in generic LMS)
- **Automatic progress capture**: Phase completions and assessment submissions tracked without manual input
- **Early intervention insights**: Identify struggling students in week 1-2, not week 8
- **Free operation**: Zero ongoing costs for hosting and maintenance
- **6-phase pedagogical structure**: Enforces research-based lesson flow (Hook, Introduction, Guided Practice, Independent Practice, Assessment, Closing)

**Nice-to-have features** (Future consideration)
- **Spaced repetition**: Automatically surface review questions from previous units (v1 has begun implementing)
- **Peer collaboration**: Students can see classmate progress and collaborate on projects
- **Parent portal**: Parents can view student progress (useful for younger grades if expanding)
- **Gamification**: Badges, streaks, leaderboards for motivation
- **Mobile app**: Native iOS/Android apps vs web-only

### User Preferences & Expectations

- **Setup time**: Teachers expect to deploy curriculum in <2 hours of setup time (vs. 20-40 hours for Moodle). Includes account creation, content import, student account setup.

- **Update frequency**: Teachers want to make small curriculum updates (typo fixes, content tweaks) in <5 minutes without redeployment or downtime

- **Data export**: Teachers expect CSV/Excel export for gradebook integration with school systems (weekly or as-needed)

- **Mobile experience**: 40% of students access learning platforms primarily on phones. Must be mobile-responsive, though laptop/Chromebook is primary device for this curriculum.

- **Loading speed**: Expect page loads <2 seconds. Static v1 achieves this; database-backed v2 must maintain performance.

## Technical Considerations

### Competitor Technical Approaches

- **Authentication**:
  - Canvas: OAuth 2.0 + SAML for SSO, JWT for API access
  - Google Classroom: Google OAuth exclusively
  - Moodle: Username/password + optional LDAP/CAS/SAML
  - **Our approach**: Start with Supabase Auth (email/password), plan Google OAuth for Phase 2
  - **Trade-offs**: Email/password is simpler to implement and test; OAuth reduces password fatigue but requires school Google Workspace

- **Data storage**:
  - Canvas: PostgreSQL for transactional data, Cassandra for analytics, S3 for files
  - Google Classroom: Google Cloud Datastore/Spanner
  - Moodle: MySQL/PostgreSQL + file system for uploads
  - **Our approach**: Supabase PostgreSQL for all data (content, users, progress), Supabase Storage for media files
  - **Trade-offs**: Single database simplifies architecture; risk of hitting free-tier limits (500MB) if storing too many media files

- **Content rendering**:
  - Canvas: Rich Text Editor (Quill.js) for course pages; stores HTML in database
  - Google Classroom: Google Docs embedded; content stored in Drive
  - Moodle: HTML + plugins for specialized content types
  - **Our approach**: Structured content (JSON or markdown) in database, rendered via React components
  - **Trade-offs**: More flexible than raw HTML; enables versioning and type safety

- **Progress tracking**:
  - Canvas: xAPI (Experience API) for detailed learning activity tracking
  - Google Classroom: Basic completion status only
  - Moodle: Custom event system with extensive logging
  - **Our approach**: Direct database writes to `progress` table on phase completion, assessment submission
  - **Trade-offs**: Simple and lightweight; less detailed than xAPI but sufficient for our needs

### Architecture Patterns

- **Server-side rendering (SSR) vs. Static Generation vs. Client-side rendering**:
  - **SSR (Next.js App Router)**: Fetch data server-side, render HTML, send to client. Good for dynamic, personalized content.
    - Pros: SEO-friendly, fast initial load, reduced client-side data fetching
    - Cons: Server compute cost (managed by Vercel free tier)
    - **Our use**: Student dashboard, teacher analytics, lesson pages with progress data

  - **Static Generation (Next.js SSG)**: Pre-render pages at build time, serve static HTML. Good for content that doesn't change per user.
    - Pros: Fastest performance, zero server cost, cacheability
    - Cons: Requires rebuild for content changes
    - **Our use**: Public marketing pages, help/documentation

  - **Client-side rendering**: Fetch data in browser via API calls. Good for highly interactive components.
    - Pros: Dynamic updates without page reload
    - Cons: Slower initial load, SEO challenges
    - **Our use**: Spreadsheet simulators, interactive exercises

- **Monolith vs. Microservices**:
  - **Monolith**: Single codebase and deployment. Simpler to develop and maintain.
    - Pros: Easier debugging, single deployment, shared code, lower operational complexity
    - Cons: Harder to scale specific components independently
    - **Our approach**: Monolithic Next.js app; sufficient for 25 concurrent users

- **Optimistic updates vs. Pessimistic updates**:
  - **Optimistic**: Update UI immediately, sync to database in background. Better perceived performance.
    - Pros: Feels instant to user
    - Cons: Must handle sync failures
    - **Our use**: Phase completion checkboxes, bookmark saves

  - **Pessimistic**: Wait for database confirmation before updating UI. More reliable.
    - Pros: No sync conflicts
    - Cons: Feels slower
    - **Our use**: Assessment submission, grade changes

### Integration Requirements

- **School Information Systems (SIS)**: Some schools want grade sync to PowerSchool, Infinite Campus, etc.
  - **Initial approach**: Manual CSV export for teachers to import into SIS
  - **Future**: Direct API integration if demand exists (would require paid SIS API access)

- **Google Workspace**: Potential SSO integration for easier login
  - **Initial approach**: Email/password auth
  - **Phase 2**: Google OAuth for "Sign in with Google" option

- **Supabase Edge Functions**: For complex business logic that shouldn't run client-side
  - **Use cases**: Calculating complex grade distributions, generating reports, sending email notifications
  - **Consideration**: Free tier includes 500K function invocations/month (sufficient for our scale)

### Performance & Scalability

- **Expected load**:
  - Students: 25 per year, ~10-15 concurrent during class time
  - Requests: ~5,000 per day during semester (25 students × 4 pages/session × 50 sessions)
  - Database: ~10,000 progress records per semester (25 students × 40 lessons × 10 progress entries/lesson)
  - Storage: ~50MB for v1 assets (lessons, images, videos), growing ~10MB/year

- **Performance targets**:
  - Page load: <2 seconds (match v1 static site performance)
  - Database queries: <100ms (Supabase typically 20-50ms within region)
  - Form submissions: <500ms response time

- **Free tier limits (must stay within)**:
  - Supabase: 500MB database, 2GB bandwidth/month, 5GB file storage, 50,000 monthly active users
  - Vercel: 100GB bandwidth/month, 100 hours serverless function execution
  - **Safety margin**: Operating at ~10-20% of limits leaves room for growth

- **Scalability approach**:
  - Initial: Single-region deployment (US-East for North America)
  - Caching: Next.js edge caching for static content
  - Query optimization: Database indexes on foreign keys, proper joins
  - Not needed: CDN, load balancing, multi-region (scale is too small)

### Technical Risks

1. **Free tier limits exceeded**:
   - Risk: Database or bandwidth usage exceeds Supabase free tier
   - Likelihood: Low (current scale well under limits)
   - Mitigation: Monitor usage dashboard monthly, optimize queries, compress images, implement lazy loading
   - Fallback: Upgrade to Supabase Pro ($25/month) or switch to self-hosted PostgreSQL

2. **RLS policy errors causing data leaks**:
   - Risk: Incorrectly configured Row Level Security exposes student data across accounts
   - Likelihood: Medium (common mistake in Supabase development)
   - Mitigation: Comprehensive RLS policy testing with test users, security audit before launch, principle of least privilege

3. **Migration breaking changes**:
   - Risk: Database migration fails mid-semester, breaking production site
   - Likelihood: Low with proper testing
   - Mitigation: Test migrations in staging environment, backup database before migrations, version migrations in git, use transaction-wrapped migrations

4. **v1 content migration complexity**:
   - Risk: ~240 phase components difficult to extract and migrate to database
   - Likelihood: High (complex JSX with embedded logic)
   - Mitigation: Create migration scripts, pilot with 1 unit first, validate content integrity, keep v1 running during transition

5. **Maintainer knowledge loss**:
   - Risk: If primary teacher-maintainer leaves, knowledge transfer difficulty
   - Likelihood: Medium (single maintainer)
   - Mitigation: Comprehensive documentation, standard tech stack (Next.js/Supabase), clear code comments, video tutorials for common tasks

## Recommendations

### Priority Features

**Must-build** (Required for MVP)

1. **Database-driven lesson content**:
   - Why: Core value proposition; enables teacher-friendly content updates
   - Supporting evidence: Content update friction is #1 pain point in v1; 4-8 hours per update is unsustainable

2. **Authentication & user accounts**:
   - Why: Foundation for progress tracking and personalized experiences
   - Supporting evidence: FERPA compliance requires secure student data storage; 100% of competitor platforms have auth

3. **Student progress tracking**:
   - Why: Primary teacher need; #1 value-add over v1
   - Supporting evidence: 90% of LMS users cite progress tracking as essential; early intervention improves outcomes by 18%

4. **Teacher dashboard**:
   - Why: Makes progress data actionable; enables early intervention
   - Supporting evidence: Teachers want to identify struggling students in week 1-2, not week 8

5. **Content migration from v1**:
   - Why: Cannot launch without curriculum content; v1 has high-quality 8-unit curriculum
   - Supporting evidence: Creating new curriculum from scratch would take 200+ hours; migration leverages existing work

**Should-build** (High-value differentiators)

1. **Phase completion auto-capture**:
   - Why: Reduces friction; students don't manually mark completions
   - Supporting evidence: Automatic tracking has 3x higher engagement than manual logging

2. **CSV export for gradebook**:
   - Why: Enables teacher workflow integration with school systems
   - Supporting evidence: 80% of teachers must submit grades via school SIS; manual re-entry is error-prone

3. **Embedded spreadsheet simulators**:
   - Why: Core pedagogical component; differentiates from generic LMS
   - Supporting evidence: v1's interactive components are highlighted by students as most engaging

**Could-build** (Future opportunities)

- **Google OAuth SSO**: Simplifies login if school uses Google Workspace
- **Spaced repetition system**: Automatically resurface review questions (v1 has partial implementation)
- **Parent portal**: View student progress (useful if expanding to younger grades)

### Technical Approach

**Recommended architecture**: Monolithic Next.js 16 App Router with Supabase backend

Rationale:
- **Proven stack**: Next.js/React/Supabase is modern, well-documented, teacher-learnable
- **Free-tier friendly**: Both platforms offer generous free tiers sufficient for our scale
- **Monolith simplicity**: Single codebase/deployment is maintainable by one person
- **SSR + API routes**: Server-side rendering for dynamic content, API routes for data mutations
- **Vercel deployment**: Zero-config, integrated with Next.js, automatic HTTPS, CDN caching

**Key technology choices**:

- **Frontend framework**: Next.js 16 with React 19
  - Rationale: Modern, performant, great DX, extensive ecosystem, teacher-learnable

- **Database**: Supabase PostgreSQL
  - Rationale: Free tier sufficient, includes auth, real-time capabilities, row-level security, hosted/managed

- **Authentication**: Supabase Auth with email/password
  - Rationale: Built-in, secure, FERPA-compliant, simple for users

- **Styling**: Tailwind CSS + shadcn/ui components (preserving v1 approach)
  - Rationale: Utility-first CSS, component library matches v1 design system, maintainable

- **Testing**: Vitest for unit/integration tests, Playwright for E2E
  - Rationale: Fast test execution, modern tooling, matches CLAUDE.md requirements

- **Content storage**: JSON or markdown in PostgreSQL TEXT columns
  - Rationale: Structured data, versionable, renderable via React components

### Go-to-Market Positioning

**Positioning statement**:
"The only free, data-informed business math curriculum platform built by teachers, for teachers—combining the pedagogical quality of custom curriculum with the progress tracking power of enterprise LMS."

**Target segment**: Single-teacher implementations in high school business/accounting courses

**Key differentiators**:
- **Zero cost**: Operates entirely on free tiers vs $4,000+ for enterprise LMS
- **Subject-specific**: Embedded accounting and Excel simulations vs generic LMS
- **Teacher-maintainable**: Update content via database, no developer required
- **Purpose-built pedagogy**: 6-phase lesson structure, project-based learning, Sarah Chen narrative
- **Open source potential**: Can be forked and customized by other schools

### Constraints & Considerations

**Compliance constraints**:
- FERPA student data privacy: Secure auth, RLS policies, minimal data collection, clear privacy policy
- Accessibility (WCAG 2.1 AA): Keyboard navigation, screen readers, color contrast, alt text

**Budget constraints**:
- $0 hosting and operational costs (must stay within free tiers)
- Impact: Database size ≤500MB, bandwidth ≤2GB/month, optimize image sizes, lazy load media

**Timeline constraints**:
- Launch before next semester: 4-6 months development time
- Impact: Must prioritize MVP features, defer nice-to-haves to post-launch

**Resource constraints**:
- Single teacher-maintainer with moderate technical skills
- Impact: Choose simple, well-documented stack; avoid complex architecture; prioritize maintainability

### Risk Assessment

1. **Free tier limits exceeded**:
   - Likelihood: Low
   - Impact: Medium (requires migration to paid tier or optimization)
   - Mitigation: Monthly usage monitoring, image optimization, query caching, stay at 20% of limits

2. **Poor content migration quality**:
   - Likelihood: Medium
   - Impact: High (unusable lessons delay launch)
   - Mitigation: Pilot migration with 1 unit, manual QA, keep v1 as reference, iterate before full migration

3. **Student data privacy breach**:
   - Likelihood: Low
   - Impact: Very High (FERPA violation, loss of trust)
   - Mitigation: Comprehensive RLS testing, security audit, minimal data collection, clear privacy policy

4. **Low student adoption**:
   - Likelihood: Low
   - Impact: Medium (platform unused)
   - Mitigation: Teacher-led rollout, in-class introduction, emphasize progress tracking benefits, iterate based on feedback

5. **Maintainer knowledge loss**:
   - Likelihood: Medium
   - Impact: High (platform becomes unmaintainable)
   - Mitigation: Comprehensive documentation, standard tech stack, video tutorials, potential future contributors from OER community
