# Information Design: Head Metadata, Responsive Constraints, and Spatial Sizing

*Technical documentation of Workn's information hierarchy, browser head configuration, and responsive layout decisions.*

---

## 1. Browser Head Architecture

### Dynamic Page Titles
- **Template Configuration**: Implemented in [`src/app/layout.tsx`](file:///c:/Users/man/Desktop/Workn/src/app/layout.tsx#L19-L24) using Next.js `Metadata`:
  ```typescript
  title: {
    default: 'Workn',
    template: '%s | Workn',
  }
  ```
- **Marketing Landing Page**: [`src/app/page.tsx`](file:///c:/Users/man/Desktop/Workn/src/app/page.tsx#L4) sets `title: 'Workn — Coworking & Workspace Management'`.
- **Member Dashboard**: [`src/app/dashboard/page.tsx`](file:///c:/Users/man/Desktop/Workn/src/app/dashboard/page.tsx#L6) sets `title: 'Dashboard'`, resolving automatically to `Dashboard | Workn` in the browser tab.
- **Evidence**: Verified via rendered DOM inspect screenshots on both routes (`16-head-route-one.png` and `17-head-route-two.png`).

### Tagline Specification
- **Tagline**: *"Workspace management made simple"* (4 words, well under the 10-word constraint). Concise, active, and free of marketing hyperbole.

### Search Engine Optimization (SEO) Scoping
- **Marketing Boundary**: Comprehensive SEO tags, meta descriptions, geographical keywords (`coworking space Lagos`, `desk booking Lagos`), authors, and canonical links are scoped strictly to the public landing page (`/`).
- **Private Route Protection**: The authenticated dashboard explicitly injects:
  ```typescript
  robots: { index: false, follow: false }
  ```
  ensuring private member workflows and account information are never indexed by web crawlers.

### Brand Favicon & Open Graph
- **Favicon**: Custom brand mark SVG created by the Builder, served at `/icon.svg` and declared in root metadata across standard icon, shortcut, and Apple touch formats.
- **Open Graph / Twitter Cards**: Configured in [`src/app/page.tsx`](file:///c:/Users/man/Desktop/Workn/src/app/page.tsx#L26-L48) with localized locale `en_NG`, type `website`, 512x512 preview image, and summary cards.

---

## 2. Body Layout & Responsive Architecture

### Removal of Redundant Controls
- On the initial scaffold, a redundant secondary logo and decorative divider were placed directly above the main auth forms. Because the top navigation bar already contains a persistent home-linking brand mark, the nested logo added visual noise without function and was eliminated to streamline cognitive load.

### Collapsing Unnecessary Choices
- Rather than forcing prospective members to navigate across disjointed URLs (`/login`, `/register`, `/forgot-password`), auth states were unified into a single conditional client container (`/auth?view=...`). Users switch instantly without full page reloads or layout shifts.

### Heading Width Constraint & Soft Wrapping
- **The Problem**: Unconstrained display headings stretch horizontally on 1080p and ultrawide viewports, resulting in excessively long lines (>90 characters) that impair readability. On mobile, unconstrained widths without soft breaks force horizontal overflow (`18-heading-wrap-bad.png`).
- **The Solution**: Constrained the hero headline container to `maxWidth: 800px` with `padding: 0 var(--space-6)` and removed rigid `nowrap` rules. Lines break naturally at syntactic clause boundaries across viewports (`19-heading-wrap-good.png`).

### Button Geometry & REM Padding
- **Padding Formula**: Standard buttons use `padding: var(--space-3) var(--space-8);` (12px top/bottom, 32px left/right, equivalent to `0.75rem 2rem`).
- **Corner Radius**: `var(--radius-md)` (10px).
- **Rationale**: 
  1. A generous horizontal padding creates a substantial 48px+ vertical touch target, satisfying WCAG 2.5.5 touch target size recommendations for mobile devices.
  2. Sizing with rem/spacing tokens ensures buttons scale proportionally if users adjust their base browser font size for accessibility.
  3. The 10px radius softens visual hierarchy without entering the casual, pill-shaped aesthetic (`9999px`), reinforcing Workn's professional, architectural brand tone.

### Task 1 Label Typography Applied to Buttons
- Every button strictly consumes the Task 1 Label Large token:
  ```css
  font-family: var(--type-label-large-font-family); /* Manrope */
  font-size: var(--type-label-large-font-size);       /* 14px */
  font-weight: 600;
  line-height: var(--type-label-large-line-height);   /* 21px (1.5x) */
  letter-spacing: var(--type-label-large-letter-spacing); /* -0.7px */
  ```
  Verified by asking the agent and confirmed in CSS class rules.

### Interactive Feedback & Accessibility Signals
- **Clickable Affordance**: All interactive elements (buttons, links, view toggles, brand logo) declare explicit `cursor: pointer`.
- **Hover Transitions**: Primary buttons provide subtle translateY and opacity feedback:
  ```css
  transition: opacity 150ms ease, transform 100ms ease;
  ```
  Outline buttons provide tinted background wash via `color-mix(in srgb, var(--color-primary) 5%, transparent)` on hover.
- **Home Navigation**: The top-left "W" logo button navigates home with an explicit `aria-label="Workn Home"`.

### Fluid Responsive Type with CSS `clamp()`
- Large display headings adapt smoothly across viewports without jarring breakpoint jumps using CSS clamp:
  ```css
  font-size: clamp(1.5rem, 5vw, 3rem);
  ```
  - **Minimum floor (`1.5rem` / 24px)**: Protects small mobile screens (<360px) from text clipping or overflow.
  - **Preferred scaling rate (`5vw`)**: Scales fluidly as the viewport expands.
  - **Maximum ceiling (`3rem` / 48px)**: Prevents headline runaway on large desktop monitors.
- Evidence captured across 3 test widths (mobile 375px, tablet 768px, desktop 1280px) in `20-responsive-three-widths.png`.

