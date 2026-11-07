# Task 1: Design System & Token Architecture

*Four-minute technical overview for engineering interviewers and assessors.*

---

## 1. What the Task Was

The goal of Task 1 was to establish Workn's design foundation from its core brand colour, structure it into a multi-tiered token system in Figma, export machine-readable tokens, transform them into CSS custom properties, and prove that code strictly consumes semantic tokens rather than raw values or primitive palettes.

Workn is a coworking membership and workspace platform designed for remote workers, freelancers, and small business operators in Lagos, Nigeria. The interface requires a dependable, modern, and high-clarity visual language capable of performing well across mobile screens under high ambient glare.

---

## 2. What Was Built

1. **Three-Tier Token Architecture**:
   - **Tier 1 (Primitives)**: Raw values and 14-step tonal scales (tones 0–100, including 95, 98, 99) generated using HCT (Hue, Chroma, Tone) colour science for Primary, Secondary, Tertiary, Neutral, Neutral Variant, Error, Warning, and Success.
   - **Tier 2 (Semantic Roles)**: Contextual UI roles (`--color-primary`, `--color-surface`, `--color-on-surface`, `--color-outline-variant`, etc.) mapping intent directly to primitive tones.
   - **Tier 3 (Components)**: Application components consuming only Tier 2 roles.
2. **Typography System**:
   - 15 composite styles across 5 roles (Display, Headline, Title, Body, Label) in 3 sizes each (Large, Medium, Small).
   - Paired typefaces: **Space Grotesk** for display and headline impact; **Manrope** for high-legibility body, titles, tables, and form controls.
   - Deliberate 1.5 line-height multiplier for comfortable vertical rhythm and AAA paragraph readability.
3. **Primary-Tinted Shadows**:
   - Three elevation steps (`soft`, `medium`, `hard`) built with primary chroma (`#16a34a` with low opacity) rather than muddy black, creating natural physical depth that reinforces brand tone.
4. **Token Pipeline**:
   - Complete JSON token export from Figma transformed into CSS variables via automated prompt scripts in [`tokens.css`](file:///c:/Users/man/Desktop/Workn/tokens.css).

---

## 3. What Was Decided

1. **Role-Only Interface Consumption**:
   - Components and layouts are strictly prohibited from consuming raw hex values or Tier 1 primitive variables. All styles must point to semantic roles so themes and palettes can change at a single source.
2. **Pinned Primary Tone 40 (`#16a34a`)**:
   - The brand green was pinned at primary tone 40. This preserved brand equity while generating mathematically balanced tonal companion scales for light and dark modes.
3. **Deliberate Typography Tracking Divergences**:
   - Display Large tracking was eye-tuned to `-3.5px` (approx. -5%) to prevent loose, fragmented headlines at large scales.
   - Body Large was set to neutral tracking (`0px`) with a 1.5 line height (24px) to optimize reading speed on dense workspace booking tables.
4. **Contrast Guardrails**:
   - Every foreground/background role pair was evaluated against WCAG 2.1 AA. Role pairings failing normal text thresholds (such as Primary on Light Surface at 3.1:1) were restricted to large containers and icons, not body copy.

---

## 4. What Went Wrong & What Was Learned

1. **Incomplete First Token Export (Omitted Variables)**:
   - *Problem*: The initial Figma JSON export contained only typography and shadow styles; colour groups were entirely absent (`05-tokens-incomplete.json.json`).
   - *Root Cause*: Figma Variables require explicit inclusion during export; style-only exports ignore variable collections.
   - *Fix*: Audited top-level keys before running the CSS conversion script, re-exported with variables enabled (`06-tokens-complete.json`), and documented the diff.
2. **Contrast Defect on Pinned `On Primary`**:
   - *Problem*: Pinned `#16a34a` with standard white text (`Primary99`) achieves only 3.24:1 contrast, failing WCAG AA (4.5:1) for standard text.
   - *Learning*: Design tokens store values faithfully, including inaccessible ones. Contrast belongs to pairs, not individual tokens. Documented as a known defect in [`Docs/defects.md`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/defects.md) and governed by UI rules.
3. **Deliberate Regression Test (The Argument for Token Referencing)**:
   - *Experiment*: On branch `test/deliberate-token-regression`, one semantic role was hardcoded to a raw hex value while the source primary was shifted to purple (`#7c3aed`).
   - *Result*: Referenced tokens cleanly adapted to purple across surfaces and containers, while the hardcoded element remained stranded on green.
   - *Evidence*: Documented in [`Doc/Evidence/11-broken-referencing-rationale.txt`](file:///c:/Users/man/Desktop/Workn/Design%20system/Doc/Evidence/11-broken-referencing-rationale.txt) and [`Doc/Evidence/12-git-log-branch-unmerged.txt`](file:///c:/Users/man/Desktop/Workn/Design%20system/Doc/Evidence/12-git-log-branch-unmerged.txt) after deleting the branch unmerged.

---

## 5. Verification & Evidence Index

All deliverables and proofs are archived within this folder:
- **Brief & Foundations**: [`Docs/Workn Business brief.md`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/Workn%20Business%20brief.md), [`Docs/Colour roles.md`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/Colour%20roles.md), [`Docs/SHADOW SYSTEM.md`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/SHADOW%20SYSTEM.md).
- **Scale & Divergences**: [`Doc/Evidence/type-scale.md`](file:///c:/Users/man/Desktop/Workn/Design%20system/Doc/Evidence/type-scale.md), [`Docs/\`Divergences.md`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/%60Divergences.md).
- **Ratios & Defects**: [`Docs/Pair _ Contrast ratio.md`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/Pair%20_%20Contrast%20ratio.md), [`Docs/defects.md`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/defects.md).
- **Viva Preparation**: [`Docs/interview-answers.md`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/interview-answers.md) (12 technical questions answered under 200 words each).
- **Raw Value Search & Agent Proof**: [`Docs/_07-raw-value-search.txt`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/_07-raw-value-search.txt), [`Docs/08-agent-typography-answer.txt`](file:///c:/Users/man/Desktop/Workn/Design%20system/Docs/08-agent-typography-answer.txt).
- **Deliberate Regression Proof**: [`Doc/Evidence/11-broken-referencing-rationale.txt`](file:///c:/Users/man/Desktop/Workn/Design%20system/Doc/Evidence/11-broken-referencing-rationale.txt), [`Doc/Evidence/12-git-log-branch-unmerged.txt`](file:///c:/Users/man/Desktop/Workn/Design%20system/Doc/Evidence/12-git-log-branch-unmerged.txt).

