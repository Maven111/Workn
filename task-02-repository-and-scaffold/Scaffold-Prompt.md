  
**FIRST DRAFT:**

You are scaffolding Workn from scratch. Work in two phases.

PHASE 1: READ AND CONFIRM (no code yet)

1\. Find and read every context file and every design system file in this workspace. List the files you found.  
2\. Summarise what you understood: what Workn is, who it serves, the stack, the folder rules, and the design system tokens (colour roles, typography, shadows).  
3\. Then STOP. Write nothing and install nothing until I reply "go ahead".

RULES (apply to everything)

\- The context files and design system are your only source of truth. Do not use outside defaults or your own preferences.  
\- If two files disagree, or something is missing or unclear, ask me. Do not assume.  
\- Style only with design system tokens. No hard-coded colours, font sizes, font families, shadows or other styling values.  
\- Use colour roles on the interface. Never use primitive palette colours directly.  
\- If you need a value the design system does not define (for example spacing or radius), ask me. Do not invent one.

PHASE 2: BUILD (only after I say "go ahead")

Build the foundation only. Not the product.

\- Project setup  
\- Folder structure  
\- Base layout  
\- A minimalistic home screen that is exactly 100vh, using only design system tokens

Do not build features, forms, auth, database or any other pages.

WHEN FINISHED

1\. List every file you created.  
2\. List every assumption you made.  
3\. Audit your own work against every instruction above and tell me where you did not comply.

**FINAL**:

You are scaffolding Workn from scratch. Work in two phases.

**PHASE** 1: READ, SUMMARISE, WAIT (write no code)

1\. Find and read every context file and design system file in this workspace. List the files you read.  
2\. Summarise your understanding: what Workn is, who it serves, the stack, the folder rules, and the design tokens (colour roles, typography, shadows).  
3\. List any conflicts between files, anything missing, and any assumptions you would otherwise have to make.  
4\. Stop. Do not create or install anything until I reply "go ahead".

RULES (apply throughout)

\- The context and design system files are your only source of truth. Use no outside defaults.  
\- If two files disagree, or anything is unclear or missing, ask me. Do not assume.  
\- Style only with design system tokens: no hard-coded colours, font sizes, font families, shadows or other values.  
\- Use colour roles in the interface, never primitive palette colours.  
\- If you need a value the design system doesn't define (for example spacing or radius), ask me. Do not invent one.

**PHASE** 2: BUILD (only after "go ahead")

Build the foundation only, not the product:  
\- project setup  
\- folder structure  
\- base layout  
\- a minimal home screen, exactly 100vh

No features, forms, auth, database or extra pages.

FINAL REPORT (required)

1\. Files created: every file, with its path and a one-line purpose.  
2\. Assumptions: every assumption you made, and where you made it.  
3\. Self-audit: check your work against each instruction above, including a search for hard-coded colours or other styling values. For each instruction, say "complied" or "not complied" with evidence. Report failures plainly.

**WHAT CHANGED AND WHY?**  
My first draft was a list of five requirements:

Read the context and design system files first and wait for my approval, treat those files as the only source of truth and ask when they disagree, style only with design system tokens, build only the foundation (setup, folder structure, base layout and a 100vh home screen), and list the files and assumptions at the end. I used an AI assistant to turn that list into a prompt, then asked it to tighten the result. Four things changed.

First, Phase 1 now asks the agent to list conflicts, gaps and assumptions before I approve, so the plan I capture already shows what it would have guessed. Second, the scope limit now names what the agent must not build (features, forms, auth, database, extra pages), because agents tend to overbuild when told only what to include.  
Third, I added a rule to ask when a value is missing from the design system, such as spacing or radius, since my system defines colours, type and shadows but not those, and otherwise the agent would invent numbers. Fourth, the self-audit now requires “complied” or “not complied” with evidence for each instruction, including a search for hard-coded styling values, because a bare claim of compliance costs the agent nothing.

I also removed repeated wording so each rule appears once. 