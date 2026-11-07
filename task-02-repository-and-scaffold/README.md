# Task 2: Repository Scaffolding, Server Diagnostics & Layout

*Four-minute technical overview for engineering interviewers and assessors.*

---

## 1. What the Task Was

The goal of Task 2 was to take Workn from a design concept to a fully operational, version-controlled application repository that a technical reviewer can assess in four minutes. Beyond mere scaffolding, the task required verifying server runtime behavior through deliberate break-and-recovery cycles, testing database write persistence under failure conditions, establishing proper git branching hygiene, and applying information design principles across the browser head and responsive layout.

---

## 2. What Was Built

1. **Application Foundation**:
   - Next.js (App Router) project with TypeScript, Tailwind CSS, and Prisma ORM mapped to PostgreSQL.
   - Clean, token-driven minimal landing screen and authentication shell without speculative features or unused dependencies.
2. **Database Integration & Verification**:
   - Comprehensive Prisma schema (`prisma/schema.prisma`) defining core models for `User`, `Membership`, `Booking`, `Payment`, and `Resource`.
   - Verified end-to-end database writes with logged timestamps, row IDs, and database table snapshots (`evidence/write-succeeded-logs.txt`, `evidence/12-database-rows.png`).
3. **Information Design & Accessibility**:
   - Dynamic browser head metadata with route-based title templating (`%s | Workn`), a 4-word tagline (*"Workspace management made simple"*), custom brand SVG favicon (`/icon.svg`), Open Graph tags, and SEO tags scoped strictly to marketing pages.
   - Fluid typography with CSS `clamp(1.5rem, 5vw, 3rem)` across three test viewport widths (375px, 768px, 1280px).
   - Generous button geometries sized with rem/spacing tokens (`0.75rem 2rem`) and 10px radius for touch accessibility.
4. **Git Discipline & Branching Workflow**:
   - Trunk-based branching model. Features developed on dedicated branches (`User-interaction`, `Authentication`), pushed to GitHub, reviewed, and merged via Pull Request.
   - Commit history spanning over 7 distinct days with more than 20 recorded commits.

---

## 3. What Was Decided

1. **Verified Server Actions over Client Optimism**:
   - Replaced naive client-side success assumptions with server-side validation. Demonstrated why an interface that renders success while the database is down is a dangerous illusion.
2. **Fluid Responsive Curves over Rigid Breakpoints**:
   - Used CSS `clamp()` for display typography to prevent jarring layout shifts between phone, tablet, and desktop viewports.
3. **Strict Touch Target Sizing**:
   - Sized buttons with rem units and generous horizontal padding (`var(--space-8)` / 32px) to ensure touch targets exceed the WCAG 44x44px minimum for mobile usability in Lagos coworking spaces.
4. **Trunk-Based Branching with Protection**:
   - Maintained `main` as deployable truth. Isolated information design changes to `User-interaction` and merged via PR #1 after review.

---

## 4. What Went Wrong & What Was Learned

1. **Three Deliberate Server Breaks & Recoveries**:
   - *Nested Folder*: Diagnosed and resolved folder path misalignments during initial workspace scaffolding.
   - *Port Conflict*: Port 3000 occupied by a stray Node process; diagnosed using PID inspection commands and killed cleanly.
   - *404 Route Failure*: Verified route handler resolution and diagnostic ordering before prompting the agent.
2. **False Success on Disconnected Database**:
   - *Problem*: The application reported success when the database connection string was broken, because the auth action acknowledged the user without confirming a committed PostgreSQL transaction.
   - *Learning*: Screen states prove nothing. Database integrity requires direct table queries or confirmed 201 status codes. Documented in [`docs/false-success.md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/false-success.md).
3. **Display Heading Text Overflow**:
   - *Problem*: Combining `whiteSpace: 'nowrap'` with large display text caused horizontal scrollbar clipping on mobile viewports under 360px (`evidence/18-heading-wrap-bad.png`).
   - *Fix*: Removed `nowrap`, bounded the heading container to `800px`, and allowed soft wrapping at natural clause boundaries (`evidence/19-heading-wrap-good.png`). Documented in [`docs/defects.md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/defects.md).

---

## 5. Verification & Deliverable Index

- **Prompts & Strategy**: [`docs/Scaffold-Prompt.md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/Scaffold-Prompt.md), [`docs/model-choices.md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/model-choices.md).
- **Diagnostics & Persistence**: [`docs/performance-note..md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/performance-note..md), [`docs/false-success.md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/false-success.md).
- **Architecture & Design**: [`docs/working-tree (2).md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/working-tree%20(2).md), [`docs/information-design.md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/information-design.md), [`docs/defects.md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/defects.md).
- **Viva Preparation**: [`docs/interview-answers (1).md`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/docs/interview-answers%20(1).md) (15 technical viva questions answered).
- **Evidence Files**: Archived in [`Evidence/`](file:///c:/Users/man/Desktop/Workn/task-02-repository-and-scaffold/Evidence) including server starts, database row captures, hand-drawn working tree, and responsive layout proofs.

