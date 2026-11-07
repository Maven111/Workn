# Model Choices: Strategy, Observations, and Switching Analysis

*Deliberate model selection across Workn's repository setup, token consumption, and frontend implementation.*

---

## 1. Model Selection Matrix

To avoid defaulting to a single model out of habit, models were chosen deliberately based on task risk, reasoning requirements, and adherence to negative constraints.

| Job / Feature | Model Selected | Core Reasoning |
| :--- | :--- | :--- |
| **Workspace Scaffolding & Architecture** | **Antigravity Primary Agent** | Required deep contextual reasoning across multiple workspace documents (PRD, folder structure rules, schema specs), strict adherence to directory constraints, and zero speculative code generation. |
| **JSON Token Transformation Scripting** | **Antigravity Primary Agent** | Required recursive parsing of complex nested Figma token JSON trees into a strict 3-tier CSS custom property structure without hardcoded values. |
| **Single-Page Auth View Switching** | **Gemini (Fast / Iterative)** | High-speed component rendering, conditional UI state toggling based on URL query parameters (`?view=login`), and rapid JSX layout styling. |
| **Responsive Typography & Clamp Tuning** | **Gemini (Fast / Iterative)** | Rapid calculation and testing of CSS `clamp()` curves across multiple simulated mobile and desktop breakpoint widths. |

---

## 2. What Was Observed Across Models

### Antigravity Primary Agent (Foundational Scaffolding & System Architecture)
- **Strengths**: Exceptional adherence to negative constraints (*"do not create duplicate files"*, *"never use primitive colours directly"*). It thoroughly inspected existing files before writing code, accurately preserved established directory structures, and asked clarifying questions when context files contradicted each other.
- **Trade-offs**: Higher latency per turn. For trivial mechanical edits or simple one-line CSS tweaks, running a heavy architectural reasoning agent introduces unnecessary delay.

### Gemini Fast Model (Iterative Frontend & Layout Refinement)
- **Strengths**: Near-instantaneous response times and strong fluency in modern React/Next.js client component syntax (`useSearchParams`, `useTransition`, `Suspense` boundaries).
- **Trade-offs**: Susceptible to "convenience creep." When asked to style a component quickly, it frequently reached for convenient Tailwind utility classes or default CSS values (e.g., standard `#16a34a` or default blue focus rings) rather than rigorously looking up the corresponding semantic token variable (`var(--color-primary)`). It required explicit negative prompting on every turn.

---

## 3. The Wrong Choice and the Switch

### The Task: Complex Figma JSON-to-CSS Token Generation
- **Initial Model**: Selected a lightweight, fast model to write the script and generate `tokens.css` from `design-tokens.tokens.json`. The rationale was that converting a JSON object to CSS variables was essentially a text formatting task.
- **What Went Wrong**:
  1. The fast model completely flattened the critical 3-tier hierarchy. Instead of preserving **Primitives -> Semantic Roles -> Components**, it collapsed the output into a single flat list of CSS variables.
  2. It omitted the dark mode media query overrides entirely.
  3. When encountering the HCT tonal scales (tones 0 to 100), it hallucinated simplified 50-step increments (50, 100, 200... 900) borrowed from Tailwind conventions rather than respecting Workn's 14-tone specification (which included critical intermediate tones: 4, 6, 12, 17, 22, 24, 87, 92, 94, 96).
  4. It attempted to create utility classes that consumed primitive variables directly, violating Rule 4 of the project specification.
- **The Switch**:
  - The generated output was immediately rejected and scrapped.
  - The task was transferred back to the **Antigravity Primary Agent** with a structured prompt containing the exact tiering constraints and the requirement to output semantic `--color-*` roles.
  - The primary agent successfully produced the clean, fully-referenced 517-line [`tokens.css`](file:///c:/Users/man/Desktop/Workn/tokens.css) file with full light/dark mappings, proper line-height multipliers, and zero raw hex values on UI roles.
- **Lesson Learned**:
  Structural code that defines the foundational layer for all future work is never just a "formatting task." It carries architectural debt. Saving thirty seconds on model inference cost thirty minutes of debugging and re-prompting. High-reasoning models must guard system boundaries; fast models should be reserved for bounded component iterations inside an established framework.

