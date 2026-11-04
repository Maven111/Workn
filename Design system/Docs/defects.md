# Task 1: Known Defects & Token Deficiencies

This document records real defects identified in the Workn design token system and export artifacts. Each defect cites the exact file and line, the underlying technical flaw, and what it would cost in production.

---

### Defect 1: Contrast Ratio Failure on Pinned Primary Role Pair
- **File Reference**: [`tokens.css` Lines 169–170](file:///c:/Users/man/Desktop/Workn/tokens.css#L169-L170)
  ```css
  --color-primary: var(--primitive-primary-40);
  --color-on-primary: var(--primitive-primary-99);
  ```
- **Underlying Flaw**:  
  When the brand colour was pinned as primary tone 40 (`#16a34a`), pairing it with the default Material `On Primary` tone 99 (`#f9fff5`) yielded a contrast ratio of **3.24:1**. This fails the **WCAG 2.1 AA** minimum required ratio of **4.5:1** for standard body text.
- **Production Cost**:  
  If developers place standard text or small informational labels over `--color-primary` surfaces (e.g., promotional banner copy, button subtext, or toast alerts), low-vision users and users viewing mobile screens in bright outdoor ambient light will experience severe illegibility. It leaves the product exposed to automated accessibility compliance failures (ADA/WCAG AA legal audits) and forces emergency hotfixes to repoint `--color-on-primary` to a darker tone (`Primary10` / `#002c0e`) or restrict `--color-primary` strictly to large button containers and graphical elements.

---

### Defect 2: Contrast Ratio Failure on Dimmed Fixed Primary Pair
- **File Reference**: [`tokens.css` Lines 202–203](file:///c:/Users/man/Desktop/Workn/tokens.css#L202-L203)
  ```css
  --color-primary-fixed-dim: var(--primitive-primary-80);
  --color-on-primary-fixed-dim: var(--primitive-primary-30);
  ```
- **Underlying Flaw**:  
  `--color-on-primary-fixed-dim` (`#007933`) placed against `--color-primary-fixed-dim` (`#74f18d`) produces a contrast ratio of **3.89:1**, falling below the mandatory **4.5:1** threshold.
- **Production Cost**:  
  Dimmed chips, active filter tags, and subtle metadata badges using this pair will fail accessibility scans. On lower-end IPS panels commonly found on budget Android devices across West Africa, the subtle green text bleeds into the tinted background, reducing comprehension for users scanning booking statuses or room amenities.

---

### Defect 3: Surface Container Elevation Tint Inconsistency
- **File Reference**: [`tokens.css` Lines 189–193](file:///c:/Users/man/Desktop/Workn/tokens.css#L189-L193)
  ```css
  --color-surface-container-highest: var(--primitive-neutral-90);
  --color-surface-container-high: var(--primitive-neutral-variant-92);
  --color-surface-container: var(--primitive-neutral-variant-94);
  --color-surface-container-low: var(--primitive-neutral-variant-96);
  --color-surface-container-lowest: var(--primitive-neutral-100);
  ```
- **Underlying Flaw**:  
  The surface elevation hierarchy splits its sources across two distinct tonal palettes: `Lowest` and `Highest` point to the `Neutral` palette (`#5a685e` base), whereas `Low`, `Container`, and `High` point to `Neutral Variant` (`#53665a` base). Because Neutral and Neutral Variant have slightly different chroma and hue undertones, containers at different elevation steps do not share a single cohesive tint.
- **Production Cost**:  
  In complex views (such as modal sheets nested over card grids on a dashboard), stacked surfaces exhibit discordant warm/cool color temperatures. While functionally operational, the interface looks subtly unaligned and disjointed, undermining user trust in a premium coworking platform. Remediating it requires consolidating all 10 surface tones into a single neutral palette and repointing 5 semantic roles.

---

### Defect 4: Incomplete Token Export Omitting Figma Variables
- **File Reference**: [`Design system/Doc/Evidence/05-tokens-incomplete.json.json`](file:///c:/Users/man/Desktop/Workn/Design%20system/Doc/Evidence/05-tokens-incomplete.json.json)
- **Underlying Flaw**:  
  The initial Figma token export captured only composite typography and effect styles, omitting the entire colour palette and semantic role collection because Figma Variables were not explicitly selected in the export dialogue.
- **Production Cost**:  
  In an automated CI/CD token synchronization pipeline, an incomplete export committed without verification will break downstream token generation scripts, wipe out CSS custom properties, and cause catastrophic style regressions (unstyled surfaces and broken text rendering across the entire application).

