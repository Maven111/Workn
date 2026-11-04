# Workn: Five-Task Build Brief

*For the coding agent working on Workn in Antigravity IDE, and for the Builder who owns the project. Read all of it before writing any code.*

## 1. How to use this brief

Workn is being built across five ordered tasks. Each task builds on the one before. The end result is one application, one repository, one commit history that spans several weeks, and a documentation set that covers everything from the design system to account deletion.

This brief says what each task must produce, which parts only the Builder can do, and what makes the work fail. It does not replace the context files.

**Terms.** The Builder is the person who owns Workn and is being assessed. The agent is the coding agent reading this. A business owner is a real person the Builder interviews in Task 5.

**Order of authority.**

1. The context files in this workspace: what Workn is, who it serves, the stack and the folder rules.
2. The design system files and tokens in this workspace.
3. This brief.

If any two of these disagree, stop and ask the Builder. Do not pick one and carry on. If something you need is in none of them, ask. Do not describe what Workn does from memory or guesswork. Read the context files and work from them.

**Current position.** Tasks 1 and 2 are treated as complete( you might want to identify undone asks in task 1 and task 2). The Builder is currently working on Task 3. Tasks 4 and 5 have not started. On your first pass, audit the Task 1 and Task 2 deliverables against the checklists in sections 6 and 7, report anything missing or inconsistent, and do not recreate, overwrite or tidy existing evidence.

## 2. Rules the agent must follow at all times

1. **Never fabricate evidence.** Terminal output, port numbers, process IDs, timestamps, timings, database row IDs and screenshots must come from the Builder's machine during real work. You may write the commands and scripts that produce evidence and tell the Builder exactly where to save the output. You may not invent, paste in or edit output to look real. If a command fails or you cannot run it, say so.
2. **Keep failure and fix separate.** When a step needs a deliberate break, capture the broken state in one file and the fix in another, named so the pair is obvious. Never overwrite a 'before' or 'incomplete' file once saved.
3. **Derive, do not copy.** Every validation rule, limit, expiry, retention decision, table and number must be derived from Workn's business and context files. Do not reuse example values from any assessment text, such as six-digit identifiers, seven-day grace periods, two-minute expiries or a two-word name rule. Do not introduce gym-style concepts such as member numbers unless Workn's context files define them. When a value is needed, propose two or three options with trade-offs and wait for the Builder to choose. The Builder must be able to defend every number.
4. **Style only with tokens.** Use colour roles on the interface, never primitive palette colours. No hard-coded colours, font sizes, font families, shadows, radii or spacing. If a value is not in the design system, ask.
5. **Propose and stop on migrations.** Never run a database migration. Never edit a migration that has already run. Give the command and its expected effect, then wait for the Builder to run it.
6. **Protect secrets.** Never commit a secret, including in a commit that is later reverted, because history is searched. Real values live in an ignored .env file. Keep an .env.example listing names and purposes with no values. Check every staged diff for secrets before a push. If a secret was ever committed, stop, tell the Builder, and treat it as compromised.
7. **We will commit as we go but not automatically.** Small commits with messages that say what changed. No messages like 'updates' or 'fixes'. Never back-date commits, squash history to reach a count, or force-push a shared branch. Commit counts and their spread across days are evidence of process.
8. **Be honest in documents.** Never claim in a README or doc something that does not exist or work. Every task has a defects.md naming at least one real defect by file and line, with what it would cost in production. Never leave it empty.
9. **Write code the Builder can explain.** The Builder is questioned live on their own code. Keep code small, conventional and readable. No speculative features, no unused or duplicate functions, no cleverness. Comment non-obvious decisions.
10. **Build only what the current step asks.** Do not build ahead into later tasks.
11. **Verify, do not trust the interface.** A screen that looks right proves nothing. Check status codes (a created record should return 201), database rows and logs.
12. **Break things only when asked.** Deliberate breakage happens when the Builder requests it, with the capture steps agreed first.
13. **Report after every unit of work.** List every file you created or changed and every assumption you made. Audit your work against this brief and say 'complied' or 'not complied' with evidence for each rule.
14. **Write decisions down as you go.** Keep a short decision log in docs, written at the time. A log rebuilt at the end is visibly weaker.
15. **Keep a numbers register.** Maintain docs/numbers-register.md listing every number the Builder chooses (for example the display large line height, hashing timings, rate limit threshold and window, code expiry, password minimum, grace period), the task it came from and the file that evidences it. Task 5 requires citing these exactly, and any mismatch fails the task.

## 3. What only the Builder can do

Do not do these for the Builder or fake them.

| Item | Task | The agent's role |
| --- | --- | --- |
| Palette, roles, type scale and shadows built in Figma, and the token export from Figma | 1 | Explain, check and consume the export. Do not generate the system in code. |
| Choosing the brand colour source, letter spacing by eye, and where each divergence would fail | 1 | Offer options. Do not decide. |
| Running commands and saving terminal output | 1 to 5 | Supply the commands and where to save. |
| Hand-drawn working tree, with today's date in handwriting | 2 | None. |
| Testing the README on a real person who has never seen Workn | 2 | Fix the README afterwards from the Builder's notes. |
| Screen reader test and transcript | 3 | Supply a checklist of what to listen for. |
| Choosing every number and defending it | 3 to 5 | Propose options with trade-offs. |
| Real conversation with a real business owner | 5 | Suggest questions only. |
| Publishing a public written piece | 5 | Review a draft the Builder wrote. |
| The handbook's 'what I got wrong' entries and the list of what the Builder does not know | 5 | None. These must be real. |
| Interview answers in the Builder's own voice | 1 to 5 | May draft from the Builder's actual work, for the Builder to rewrite and be able to explain. |
| Optional recordings and the live viva | 1 to 5 | None. |

## 4. Repository structure

Either one repository with five top-level folders or one repository per task. The main README states which.

```
workn/
  README.md
  task-01-design-system/            README.md  docs/  evidence/
  task-02-repository-and-scaffold/  README.md  docs/  evidence/
  task-03-client-validation/        README.md  docs/  evidence/
  task-04-server-security/          README.md  docs/  evidence/
  task-05-sessions-compliance-defence/  README.md  docs/  evidence/
```

Inside every task folder:

- **README.md**: what the task was, what was built, what was decided, what went wrong. Written for a technical interviewer with four minutes.
- **evidence/**: screenshots, terminal output saved as text files (never screenshots of text), recordings, photographs of hand-drawn work. Name files so the name says what they show, for example 03-port-conflict-before-kill.txt.
- **docs/**: the written work.

**The main README is assessed.** It must contain, in this order:

1. **What this is.** One sentence: the business, the person it serves, the one thing that must work.
2. **The stack, with reasons.** Each choice and one line on why it, rather than the alternative considered.
3. **Getting started.** The exact commands, in order, from a fresh clone to a running app, followable by a stranger.
4. **Environment variables.** Names and what each is for. Never values.
5. **What this deliberately does not do.** The scope boundary, with reasons.
6. **Known defects.** The real ones, with file references.

## 5. Marking and automatic failure

Every task is marked on the same four-part split: working software 30 percent, evidence 20, reasoning 35, defence (the live viva) 15. Up to five bonus marks for an optional recorded walkthrough, so a task is out of 105. Across the five tasks the weights are: Task 1 is 15, Task 2 is 20, Task 3 is 15, Task 4 is 30 and Task 5 is 20.

**Automatic fail on any task:**

- Any value lifted from an example without being derived for Workn.
- Terminal output that does not come from the Builder's machine.
- A README claiming functionality that does not exist.
- A secret committed at any point in history, including a reverted commit.
- No defects named.
- The Builder cannot explain their own code line by line in the viva.

**Five documents carry disproportionate weight:**

1. task-01 docs/divergences.md
2. task-03 docs/client-side-is-not-security.md
3. task-04 docs/not-implemented.md
4. task-05 docs/retention-matrix.md
5. task-05 docs/what-i-do-not-know.md

## 6. Task 1: The design system, and proving the agent used it


**Goal.** Build Workn's design system from its brand colour, export it as tokens the agent consumes, and prove the agent used it instead of assuming it did.

**Steps**

1. **Business brief** (Builder; the agent may tighten). docs/business-brief.md, at most 400 words: the business, the user (age range, device, connection quality, technical level), the one thing that must work, three questions the business is asked repeatedly that only it can answer, and why the interface must feel a particular way. That last point drives typography.
2. **Colour system in Figma** (Builder). State where the brand colour came from. Pin it as primary 40 and capture the primary palette before and after pinning, with one paragraph on the visible difference. Generate the tonal palettes and state how many tones and why that is enough for light and dark from one source (14 tones: 0 to 100 in steps of 10, plus 95, 98 and 99; extra neutral tones only where surface roles need them). Add error, warning and success. Define colour roles (a role is a job, not a colour). Record a contrast ratio for every role pair actually used. Any pair below threshold is fixed or documented as not used for text, with a reason.
3. **Typography** (Builder). Five roles (display, headline, title, body, label), three sizes each: 15 styles. Record family, weight, size, letter spacing and line height for each. Line height is font size times 1.4, 1.5 or 1.6, with the multiplier per role and the reason stated. Letter spacing is judged by eye: two screenshots of display large, default spacing and chosen spacing, plus one paragraph. Diverge from the baseline at least twice. For each divergence write the default, the choice, why, and where the choice would be wrong.
4. **Shadows** (Builder). Soft, medium and hard, built from the primary colour, not black. Record x offset, y offset, blur, spread and opacity. Two sentences on why a brand-coloured shadow reads differently from a black one.
5. **Export and catch the omission** (Builder). Export colours, typography and effects as JSON. Colour variables are omitted unless Figma variables are explicitly included. Keep both the incomplete and the complete file, plus a one-line diff: what was missing and how it was noticed.
6. **JSON to CSS variables** (Builder instructs, agent writes the script). The instruction must say colour roles are used on the interface and primitive colours are not. docs/prompts.md holds the prompt verbatim, including attempts that failed and what changed.
7. **Prove the agent consumed it** (agent and Builder). Search the whole codebase for raw colour values and save the command and its full output, even if empty. If empty, also show the search catches a planted value so the empty result is meaningful. Ask the agent in writing which typography style it used for a named element and save the answer. Save before and after screenshots of one screen, built without and with the system.
8. **Deliberate regression** (agent executes when the Builder approves). On a branch, point one colour role at a raw hex value. Change the brand colour at the source. Screenshot the inconsistent interface. Write three sentences on why this is the whole argument for token referencing. Delete the branch without merging and save a git log proving it was never merged.

**Deliverables**

```
task-01-design-system/
  README.md
  docs/  business-brief.md  type-scale.md  colour-roles.md  shadows.md
         divergences.md  prompts.md  defects.md  interview-answers.md
  evidence/
    01-palette-before-pin.png      02-palette-after-pin.png
    03-spacing-default.png         04-spacing-chosen.png
    05-tokens-incomplete.json      06-tokens-complete.json
    07-raw-value-search.txt         08-agent-typography-answer.txt
    09-screen-without-system.png   10-screen-with-system.png
    11-broken-referencing.png      12-git-log-branch-unmerged.txt
    13-walkthrough.mp4 (optional)
```

- type-scale.md: all 15 styles, every value.
- colour-roles.md: the tone count and reasoning, each role, what it points at, and a contrast ratio for each pair.
- divergences.md: each divergence, why, and where it fails.

**Automatic fail:** a palette from a tool the Builder cannot explain; only the correct JSON export submitted; an empty raw-value search with no command shown; contrast ratios asserted without numbers.

**Interview questions** (docs/interview-answers.md, 200 words maximum each)

1. How would you structure design tokens?
2. When is a token change breaking?
3. How would you support multiple brands and themes?
4. Can tokens guarantee accessible contrast?
5. How do you ensure colour contrast guidelines are met within a website or application's design?
6. Can you discuss the differences between WCAG levels A, AA and AAA?
7. Discuss the importance of semantic HTML in the context of accessibility.
8. How do you handle design handoff to developers using Figma?
9. Why do AI-generated interfaces tend to look generic, and what specifically do you hand an agent to stop it?
10. Your line height for display large is a specific number. Why that number and not one step either side? What would you lose with each?
11. Point at one place in your own token structure you would build differently if you started again. Say what you would do instead and what it would cost.
12. Wrong-answer analysis: a candidate says they exported hex values from Figma into a CSS file so every colour comes from one place, which makes it a single source of truth. Say precisely what is missing and what goes wrong in month four.

## 7. Task 2: Scaffold it, ship the repository, find out what is actually running


**Goal.** Take Workn from nothing to a repository a hiring manager can assess in four minutes, then diagnose what is really running instead of trusting the interface.

**Steps**

1. **Scaffolding prompt** (Builder writes the first draft; the agent may tighten; both are submitted). It must instruct the coding agent to read all context and design files before any code, summarise and wait for approval, treat those files as the only source of truth, ask when two files disagree, use tokens with no hard-coded styling, build only project setup and a minimal home screen, list every file created and every assumption made, and audit itself against the instructions. docs/scaffold-prompt.md holds the first draft, the final version and a paragraph on what changed and why.
2. **Scaffold** (agent). Capture the agent's plan and stated assumptions before approval. If it lists zero assumptions, say whether that is believable and what was checked.
3. **Choose models deliberately.** Antigravity for the scaffold, a different model for at least one later feature. docs/model-choices.md covers which model for which job, what was observed, and one task where the wrong model was chosen and then switched.
4. **Get it running and read the logs.** Save the server start output with the port number, and the first page load with HTTP status and load time in milliseconds. docs/performance-note.md: first load time, distance from a sensible target, and what accounts for the gap.
5. **Break the server three ways and recover.** The nested folder (fix it by re-scaffolding in place and by changing directory). The port conflict (start a second process on the same port, find the process ID, save the command used to find it, end it, capture a clean start). A 404 or blank page (capture status and time, diagnose before prompting the agent, write what was checked in order). Six files: three failures and three recoveries.
6. **Find out whether anything is stored.** Add a form that writes to a database. Capture full logs for a submission, name the status codes (note whether a 201 appears), capture the database table with the row ID and timestamp, then submit again with different values and capture the second row. Then break the database connection on purpose, submit, and capture what the user sees and the logs. docs/false-success.md: what the user saw, what really happened, and how a demo reviewer would be fooled.
7. **The repository.** Commit and push. Write the README to the seven-section specification in section 4. Give it to someone who has never seen Workn, ask them to get it running, record where they got stuck verbatim in docs/readme-test.md, then fix the README.
8. **The working tree, drawn by hand.** On paper. Label your computer, the local Git store, GitHub, production, the main branch and two feature branches. Mark where code becomes visible to users and the point past which a mistake can no longer be undone quietly. Photograph it with today's date in handwriting. docs/working-tree.md: what breaks with one branch and why that matters more after first deployment.
9. **Branch properly.** After the first push, leave main. Create a named branch, do all of step 10 on it, push without merging, open a pull request with a real description, merge it. Then create a second branch, make a change you decide against, and delete it unmerged. The commit history must show at least twelve commits across at least three different days, with messages that say what changed. The pull request URL goes in the README.
10. **Information design.** The head: a page title that changes with navigation, a tagline under ten words, SEO tags on the marketing page only, a favicon the Builder made, and Open Graph tags, each verified with a screenshot of the rendered head on two routes. The body on one screen: remove something that should not be there, collapse a choice the user should not have to make, set a maximum width on the main heading (capture good and bad wrapping), size buttons with rem padding (state padding and corner radius and why), apply the Task 1 label style to every button and verify by asking the agent, give every clickable element pointer cursor and visible hover feedback with the logo linking home, and make large text responsive with clamp (capture it broken, then working at three widths).

**Deliverables**

```
task-02-repository-and-scaffold/
  README.md
  docs/  scaffold-prompt.md  model-choices.md  performance-note.md  false-success.md
         readme-test.md  working-tree.md  information-design.md  defects.md
         interview-answers.md
  evidence/
    01-agent-plan.txt            02-files-created.txt
    03-server-start.txt          04-first-load.txt
    05-nested-folder-error.txt   06-nested-folder-fixed.txt
    07-port-conflict.txt         08-port-conflict-resolved.txt
    09-404-error.txt             10-404-resolved.txt
    11-write-succeeded-logs.txt  12-database-rows.png
    13-write-failed-logs.txt     14-working-tree-drawing.jpg
    15-git-log-graph.txt         16-head-route-one.png
    17-head-route-two.png        18-heading-wrap-bad.png
    19-heading-wrap-good.png     20-responsive-three-widths.png
    21-walkthrough.mp4 (optional)
```

**Automatic fail:** fewer than twelve commits or commits on fewer than three days; a process ID matching another student's; no captured failure state for the database break; a README never tested on anyone; any secret in git history.

**Interview questions** (200 words maximum each)

1. What is the difference between Git Flow and trunk-based development, and why have many teams moved toward trunk-based?
2. What does git push --force do, and why is --force-with-lease generally safer?
3. Why is rewriting history through rebase, amend or force push dangerous on a shared branch?
4. What is the difference between git merge and git rebase, and when would you pick one over the other?
5. What causes a merge conflict, and what is happening in the file when you see the conflict markers?
6. What is the difference between the working directory, the staging area and the repository?
7. What is branch protection, and what does it typically enforce?
8. Walk me through a technical project you built end to end.
9. Tell me about a time when something you built broke in production.
10. How do you approach learning a new technical platform or codebase quickly when starting a new engagement?
11. What is the difference between code that is correct and code that is complete?
12. How do you design software for a customer who will need to maintain it after you are gone?
13. Your first page load took a specific number of milliseconds. Where did that time go? Name the parts you can measure and the parts you are guessing about.
14. Your application reported success while writing nothing to the database. Explain the mechanism and name the one check that would have caught it in thirty seconds.
15. Wrong-answer analysis: a candidate says they check the app works by signing up a test user and confirming they reach the dashboard. Say what is wrong, what it would miss, and what to do instead.

Also prepare for the viva: how would you handle accidentally committing sensitive information to a public repository?

## 8. Task 3: The form, attacked from both sides

Window: five days. Status: in progress.

**Goal.** Build a registration form that collects correct data, works for someone who cannot see colour or use a mouse, and whose client-side checks are understood as a convenience and not a security control.

**Agent cautions for this task**

- Do not add server-side validation to the endpoint before the direct-request capture in step 8 is saved. The endpoint accepting the bad request is the expected evidence at this stage. Report it and do not quietly fix it. Task 4 closes it.
- Report only accessibility problems that really exist in Workn's form. Do not list problems the Builder did not find.
- The wording of errors, hints and messages is the Builder's. Propose it and do not decide it.

**Steps**

1. **Collapse the authentication pages** (agent builds; the Builder chooses the query parameter name). Signup, login and password reset become one page using conditional rendering, with the active form held in a URL query parameter. Prove it. Ask the agent to list the application's pages before and after, and save both answers. Capture the address bar on each form state showing the same route with a different parameter. Capture the server log while switching, showing no new session and no page reload. docs/spa-rationale.md covers why instant form switching matters, what the experience was before, and one case where separate pages would be better. The last part is required, because someone who cannot name the cost of a single-page approach has learned a rule and not a trade-off.
2. **Information design on the form** (Builder decides). List every field. For each one record why it is needed, what the business does with it, and what happens if the user gets it wrong. Any field that fails all three comes out. Add terms and conditions acceptance. docs/terms-note.md states where the wording came from: an adapted template or a legal check, never text the agent wrote from scratch. Remove decoration that is not functional, for example a logo inside the form that does nothing when clicked.
3. **Client-side validation in four categories.** Capture each one working.
   - **Empty fields.** An inline error when a user focuses a field and leaves without typing, in the Builder's own wording.
   - **Length and structure.** For every field with a shape, enforce it. For each rule record what the rule is, what goes wrong without it, and which legitimate user it wrongly blocks. Every rule blocks someone. The cost is accepted knowingly or designed around, never ignored.
   - **Format in real time.** Enforce as the user types on registration, and on submit only on login. Implement both and capture both. Check email format, not whether the email exists. Write two sentences on why checking existence would be pointless even if it were possible.
   - **ARIA labels and accessible errors.** Covered in step 6.
4. **One field where the obvious input type is wrong.** Find Workn's equivalent of a numeric identifier. Implement a text input that accepts digits only, converted with the Number constructor in one line before it reaches the server. Capture the number input being annoying (a default zero appears, correcting 400 gives 0400, and the cursor has to go back to delete the zero) as a 30-second recording or three screenshots. Then capture the text input behaving properly. Write two sentences on where a number input is the correct choice.
5. **Do not leak the shape of sensitive data.** Identify at least one field whose length or format is itself sensitive. Remove the placeholder or hint that reveals it. docs/enumeration.md covers which field and why its shape is sensitive, what an attacker gains from knowing it, and the trade-off accepted, including how much harder the form becomes for legitimate users and whether that is worth it.
6. **Accessibility audit** (Builder). Add a caution icon beside every inline error, alongside colour. Write an audit by hand, field by field, against five criteria: colour independence, keyboard reachability, focus visibility, screen reader announcement and error association. Find at least four real problems and fix all of them. Examples of the kind of problem to look for, reported only if present: a disabled submit button that drops out of the tab order with no programmatic explanation; an acceptance signal that works only with a mouse; a required checkbox with no aria-required; password requirements not linked with aria-describedby. Test with a real screen reader and write exactly what it announced, field by field, before and after the fixes, in docs/accessibility-audit.md. The written transcript is mandatory. Audio is an optional bonus.
7. **Password rules and the button.** Password: length beats complexity. Set a minimum and justify the number. Show the hint only once typing begins. Offer a confirm field or a visibility toggle, and say which was chosen and why the other would be better in a stricter industry. Button: implement hidden until valid first and capture it, then visible but disabled until valid and capture it. Write two sentences on why the second is better even though the first looks tidier. Add a message that fires when someone clicks the disabled button without accepting terms, so the disabled state explains itself.
8. **Attack your own form, then skip it.** Through the form, try to defeat every rule: single-character names, a password of spaces, an email like a@b, trailing whitespace, every field at maximum length. Record what got through. Around the form, send a request straight to the endpoint with a command-line tool. Save the exact command and exact response as text. docs/client-side-is-not-security.md covers the request and what the server did, which client rules were enforced on it (probably none), what this proves about client validation and security, and what will be done in Task 4. If the server accepted the request, say so plainly.
9. **Roll back without hallucination.** Make a change the Builder regrets. List the commits, identify the specific commit ID and roll back to that ID. Do not ask the agent to undo the last two versions, which invites it to guess. Save the commit list, the ID, the command, and two sentences on why naming the ID is safer than describing the change in words.

**Deliverables**

```
task-03-client-validation/
  README.md
  docs/  spa-rationale.md  field-justification.md  validation-rules.md  terms-note.md
         enumeration.md  accessibility-audit.md  client-side-is-not-security.md
         rollback.md  defects.md  interview-answers.md
  evidence/
    01-page-count-before.txt        02-page-count-after.txt
    03-url-states.png               04-form-switch-logs.txt
    05-empty-field-error.png        06-length-rule-blocking.png
    07-email-realtime-signup.png    08-email-on-submit-login.png
    09-number-input-annoying (mp4 or three screenshots)
    10-text-input-working (mp4 or three screenshots)
    11-screenreader-before.mp3 (optional)   12-screenreader-after.mp3 (optional)
    13-button-hidden-version.png    14-button-disabled-version.png
    15-form-attack-results.txt      16-direct-request-command-and-response.txt
    17-commit-list-and-rollback.txt 18-walkthrough.mp4 (optional)
```

- field-justification.md: every field with the three questions answered.
- validation-rules.md: each rule, what breaks without it, who it wrongly blocks.
- accessibility-audit.md: field by field against the five criteria, with before and after screen reader transcripts.

**Automatic fail:** no screen reader transcript, before and after; validation rules copied from an example instead of derived from Workn; no direct request to the endpoint or no output from it; a rule with no stated cost to legitimate users.

**Interview questions** (200 words maximum each)

1. Why is client-side validation not enough?
2. What security checks belong in the frontend, and what must the server enforce regardless?
3. The interface hides the delete button for non-administrators. Is that enough?
4. What is the difference between validation, encoding and sanitisation?
5. Why should you validate route parameters and query strings, not just the body?
6. Explain what a single page application is, and how you make one discoverable by search engines.
7. What are the advantages and disadvantages of a single page application against a multi-page application?
8. Explain the four principles of the Web Content Accessibility Guidelines, with examples from your own work.
9. Discuss the importance of semantic HTML in the context of accessibility.
10. Tell me about a time when you disagreed with what a customer wanted to build.
11. How would you explain to a non-technical executive why their AI implementation is not performing as expected?
12. One of your validation rules wrongly blocks a category of legitimate user. Name the rule, name the users, and defend the trade-off or say you got it wrong.
13. You sent a request directly to your own endpoint. Say exactly what happened and what it tells you about the rules you spent days writing.
14. Wrong-answer analysis: a candidate says they use strong client-side regex on every field, disable the submit button until valid, and sanitise all inputs in the browser, which covers the main injection and bad-data risks. Say which parts are useless, which are actively misleading, and what the candidate has confused with what.

Also prepare: what is user enumeration, and how do error messages contribute to it?

## 9. Task 4: The server is the source of truth

Window: eight days. This is the largest task and carries the most weight. Status: not started.

**Goal.** Design a schema, run migrations under control, send email without blocking the request, and build server-side defences that hold when someone ignores the form completely.

**Agent cautions for this task**

- Never run migrations. Propose the command and stop.
- Never use SHA-256, SHA-512 or MD5 for passwords. This is an automatic fail.
- Write scripts that produce timings and evidence, but the Builder runs them so the numbers come from the Builder's machine.
- Do not disable the rate limiter to simulate defeating it.
- The six-digit verification code in step 10 is part of the task specification, not an example value. The expiry, thresholds, windows and every other number are the Builder's own.
- Record every chosen number in docs/numbers-register.md.

**Steps**

1. **Design the schema before writing it.** On paper first (the Builder photographs it), then in code. At least five tables, including: the people who use the system; their sessions; a money table and, separately, a money-attempts table; and the chunks for a retrieval system, whether or not retrieval is built. docs/schema.md covers, for each table, every column with its type and whether it can be empty, every relationship marked one to many or many to many, every index with why that column and what it costs on writes, and any fact stored twice and why that was accepted. The money-attempts table records attempts that failed, were abandoned or died on a bad network. Give two reasons in writing: drop-off data shows where the business loses people, and payment logs are the source of truth for litigation, government inquiries and annual tax filing. Add one paragraph on what would be done if a tax authority asked for an account of a specific transaction from fourteen months ago.
2. **Discover the database's actual state.** Open the database inspector before running anything. Capture what is found. If the database is already correct, capture that and say how it was verified.
3. **Migrations, run deliberately** (the agent proposes, the Builder runs). Run the initial migration and capture the command and full output. Add a required column to a populated table, capture the failure, then do it in three steps (add as optional, fill, make required) and capture all three. Hit the drift error on purpose: change the schema file without migrating, run the application, capture the client error, write one paragraph on which two things have gone out of step, then fix it. docs/migrations.md covers why migrations are forward-only, why a migration that has run is never edited, why they are run by hand and not by an agent, and the honest cost of that choice (slower, and easy to forget).
4. **Hashing, and why fast is wrong.** Choose Argon2id or bcrypt. Hash the same password twice and save both outputs, which differ, with one line on why. Time the chosen algorithm hashing one password, then time SHA-256 hashing the same password, on the Builder's machine. From those two numbers calculate attacker guesses per second for each, showing the arithmetic. Write the inversion in the Builder's own words: you hash once per login, an attacker hashes billions of times, so slowing it costs you nothing measurable and costs them everything. Record what salting does, whether the chosen algorithm handles it, and what an attacker could do if it were skipped. docs/hashing.md holds the two timing numbers and the arithmetic.
5. **Normalisation and trimming.** Lowercase email on every form that takes one: registration, login and reset. Never normalise passwords. Trim leading and trailing whitespace from passwords. Prove all three: register with a capital in the email and log in with it lowercase; register with a password with a trailing space and log in without it. Write two sentences on why passwords are trimmed but not lowercased.
6. **Schema validation at the boundary.** Install Zod or another validation library and record the reason. Apply it to registration, login and reset. Time a request before and after and record the number. If it is high, say what is causing it. docs/validation-placement.md covers where in the request lifecycle validation sits, what runs before it, what must never run before it, and why a schema beats hand-written checks in the route handler.
7. **Every client-side rule, enforced again on the server.** Take every Task 3 rule and enforce it on the server. Repeat the Task 3 direct request and capture the refusal. Submit one side-by-side file: the request, the Task 3 response and the Task 4 response.
8. **Rate limiting, and its limits.** Implement it on registration, login and reset. Choose a threshold and a window and justify both. Trigger it and capture the lockout message and status code. Then defeat it by changing IP address through any legitimate means and capture getting past the limit. docs/rate-limiting.md covers why IP alone is insufficient, what else serious applications key on (including the email address and hardware identifiers), where the counters are stored and the trade-off of that choice, and what the limit does to a legitimate user on a shared office or campus connection.
9. **Breached password check** on registration only. Check against a breached-password service by sending only a short prefix of the password's hash and comparing the returned range locally. Test with a password known to be in the corpus and capture the rejection. docs/breach-check.md explains the mechanism in the Builder's own words and why the naive version, sending the password or full hash, would be unacceptable.
10. **Email verification.** Generate a six-digit code with the platform's cryptographic random function, not the ordinary pseudorandom one. Write one paragraph on what an attacker could do against predictable codes given the expiry window and rate limit. Choose an expiry, justified against how long real users need and what the window costs in attack surface (the task suggests five, seven or ten minutes as realistic; two is too short). Configure SMTP, record host and port, and expect the first attempt to fail; capture the failure and the fix. Send the verification and any welcome email from a background job, not inside the registration request, and capture registration response time both ways. Test the flow: register, retrieve the code from the database and capture the row, enter it and capture the verified state, then capture three failures: an expired code, a wrong code and the same valid code used twice. If verification is not retry-safe after success, document that defect and do not quietly fix it. docs/verification-design.md holds code generation, expiry justification and the attack note.
11. **The email looks like the product.** The email uses the Task 1 tokens. Capture the rendered email. If it comes out wrong, capture the wrong version too and say what it was traced to. docs/email-copy.md is one honest note: the agent wrote the copy, and in a real business a developer or marketer would, so say what would change in the wording for real customers.
12. **What was decided not to do.** List at least four security controls that were considered and not implemented. For each: what it is, why it was not worth it for Workn at this stage, and what would have to change to add it. docs/not-implemented.md. This section is weighted.

**Deliverables**

```
task-04-server-security/
  README.md
  docs/  schema.md  migrations.md  hashing.md  validation-placement.md
         rate-limiting.md  breach-check.md  verification-design.md
         email-copy.md  not-implemented.md  defects.md  interview-answers.md
  evidence/
    01-schema-drawing.jpg           02-database-state-before.png
    03-initial-migration.txt        04-required-column-failure.txt
    05-required-column-three-steps.txt   06-drift-error.txt
    07-hash-twice-different.txt     08-timing-argon-vs-sha.txt
    09-email-case-normalised.png    10-password-trim-working.png
    11-validation-timing.txt        12-direct-request-before-and-after.txt
    13-rate-limit-triggered.png     14-rate-limit-defeated.txt
    15-breach-check-rejection.png   16-smtp-failure.txt
    17-smtp-success.txt             18-registration-timing-sync-vs-job.txt
    19-verification-row.png         20-verification-expired.png
    21-verification-wrong-code.png  22-verification-code-reused.png
    23-rendered-email.png           24-walkthrough.mp4 (optional)
```

**Automatic fail:** SHA-256, SHA-512 or MD5 used for passwords; timing numbers not from the Builder's machine or no arithmetic shown; rate limiting implemented but never defeated; no captured migration failure; fewer than four controls in the not-implemented list.

**Interview questions** (200 words maximum each)

1. Why should you hash passwords?
2. Why use bcrypt instead of SHA-256 for passwords?
3. What is a salt and why do you need it?
4. What salt rounds or work factor should you use? Give a number and defend it.
5. You store user passwords. Of plain text, SHA-256, AES-256 encryption and adaptive hashing, which is correct and why are the other three wrong? One of the three is wrong for a different reason from the other two.
6. Why is client-side validation not enough?
7. What security checks belong in the frontend, and what must the server enforce regardless?
8. The interface hides the delete button for non-administrators. Is that enough? If not, what does an attacker do instead?
9. What is the difference between validation, encoding and sanitisation?
10. Why replace the incoming request body with the parsed and validated data rather than leaving both available?
11. Why validate route parameters and query strings, not just the body?
12. How do you rate limit unauthenticated requests, and what is the problem with the header you would reach for first?
13. Which rate limiting algorithm would you choose for a production API, and what is the boundary burst problem?
14. Why use a shared store for counters rather than in-memory counters on each server?
15. What HTTP status code should a rate limiter return, and why is 403 the wrong choice?
16. When your rate limit store is unavailable, do you fail open or fail closed? Answer for Workn specifically.
17. You have two hashing timing numbers from your own machine. What do they mean for an attacker who has stolen your user table?
18. How does a breached password check avoid sending the password anywhere? Explain the mechanism, then say what the naive version would leak.
19. Wrong-answer analysis: a candidate says they hash passwords with SHA-256 plus a random salt per user, so a stolen database cannot be reversed because hashing is one-way, and they rate limit login by IP so brute force is not possible. Say what is wrong, in order of severity, and what the candidate has misunderstood about the threat model.

**Also prepare for the viva** (no written answers needed).

- Databases: a query that ran in ten milliseconds now takes thirty seconds, so how do you debug it; indexing for one column and for that column plus a second; why composite index column order matters; why not index every frequently filtered column; the N plus one problem; migrating a large database with minimal downtime.
- Queues and email: at-least-once against exactly-once execution; making a queue job handler idempotent; a queue backing up; dead-letter queues; the problem with sending email synchronously in a registration flow.
- Migrations: what a forward-only migration is and why one that has run is never edited; what happens when a migration fails halfway; the difference between generating the ORM client and running a migration.

## 10. Task 5: Sessions, deletion and the defence

Window: nine days. Start the written work on day one, not day seven. Status: not started.

**Goal.** Hold a session securely and end it properly, delete a user's account lawfully, and explain all of the work to someone deciding whether to hire the Builder.

**Agent cautions for this task**

- Account deletion is a process, never a manual wipe. Never delete a user's row by hand, even to test.
- On retention and legal questions, state assumptions, name the regime the Builder cites (for example GDPR in Europe or the NDPA in Nigeria), and flag questions for a lawyer. Do not present legal conclusions as settled.
- Items marked Builder-only in section 3 stay with the Builder: the business owner interview, the published piece, the handbook's mistakes and the list of what the Builder does not know.
- Handbook scenarios must be the Builder's own, with named people and a specific problem. Never reuse a scenario from any example in these materials.
- Numbers cited from earlier tasks must match docs/numbers-register.md exactly.
- Ask the Builder who Workn's second kind of user is. Take the answer from the context files, not from a guess.

**Steps**

1. **Sessions, built and understood.** On login, generate a unique random session identifier with the platform's cryptographic random function and send it to the browser. Evidence for each: a fresh token on every sign-in (log in twice and capture two different identifiers); the session record stored server side in the sessions table; the session cookie hashed (read this as: the browser holds the raw random value and the sessions table stores only its hash; if unsure of the intended reading, ask the Builder); and cookie flags set correctly, recording which flags were set and what each prevents. docs/sessions.md covers what session hijacking is, how a stolen identifier is used, what logging out does to it, and what Workn does to limit the damage if one is stolen.
2. **Soft gating or hard gating, decided.** Soft gating creates and logs in the user immediately with no verification first. Hard gating stops the user after account creation, requires email verification, and then requires a manual login. The Builder chooses for Workn. Then implement the one not chosen, on a branch, and capture both flows. docs/gating.md covers which was shipped and why, what the other costs in completed registrations, and the specific regulatory or trust condition that would make the Builder switch.
3. **The login flow, to specification.** Implement and evidence every item: schema validation on the login payload; email normalised, trimmed and lowercased; database lookup by the identifying field and not by name; password verified with the same algorithm that hashed it; rate limiting applied; generic error messages that never name which half failed; a verification status check with the Builder's chosen behaviour for unverified users; a fresh session token issued. Prove the generic errors: try a correct email with a wrong password, then a wrong email entirely, capture both responses, and show they are indistinguishable. Write two sentences on what an attacker learns if they are not. State the choice for unverified users and the consequence accepted.
4. **Middleware, and logout done properly.** Middleware reads the session cookie, redirects anyone unauthenticated to the login page, checks the user is still valid and not banned, and attaches the user's details to the request. Test two people sharing one browser: log in as one user, then another, capture what happens, and fix it if wrong. Logout deletes the session row on the server and clears the cookie. Prove it: log in, capture the session row, log out, capture the row gone. Then the edge case: a network failure makes the logout request fail on the server while the interface shows the user as logged out. Reproduce it by throttling or blocking the request, capture the interface claiming success while the session row remains, then fix it and capture the fix.
5. **Password reset kills everything.** On reset, every previous session and cookie is wiped. Prove it: log in on two browsers, reset the password from one, and capture the other being logged out. Write two sentences on why this differs from an ordinary password change and which industries would treat both the same way.
6. **Account deletion, as a legal process.** Implement four things. Soft delete: mark the account as scheduled for deletion. Grace period: a window where the account is locked and inactive but still in the database, with a length the Builder chooses and justifies. Hard delete: purge the data once the grace period ends. Scheduled job: a background task on a timer that finds expired requests. Requirements: the account locks immediately on request and revokes all active sessions; identity is anonymised; the job runs on the chosen interval and purges in a single transaction; the job logs a start line and a finish line with counts, because a job that stopped running looks exactly like a job with nothing to do. Prove it works and is safe to run twice: run it twice on the same data and capture that the second run changes nothing.
7. **The retention matrix.** docs/retention-matrix.md lists every table and every significant column in Workn's schema, with: purged or retained; the reason; the legal or business basis for retaining it if retained; and how long if retained for a fixed period. Money records commonly carry retention obligations, but the position is the Builder's to derive for Workn. Then three harder items. Backups: they must sync with the live database to drop deleted rows, or the retention is itself illegal unless a government mandate or the terms permit it. State the sync interval and where backups live. The conflict: find at least one case where the right to erasure and a retention obligation point in opposite directions, name it, and say which wins and on what basis. Anonymisation against deletion: say where anonymising is used instead of deleting, and why anonymised data can be kept when identifiable data cannot.
8. **The privacy document and the promise to remove.** Write privacy.md in plain language, not borrowed legal text the Builder cannot explain. It states the grace period, what is purged, what is retained and why, and how a user requests deletion. Find one promise in the draft that the system cannot keep and remove it. Keep both versions (privacy-draft-with-broken-promise.md and privacy.md) and write two sentences on how a promise like that gets written in the first place.
9. **Front-end state management, and whether it was needed.** Ask the agent which state management library the application uses. Then implement one with a real use, for example a forgot-password form that carries the typed email so a failed login pre-fills the reset form with no server request. Capture it working. docs/state-management.md answers honestly: was a library needed or added because it is expected, and at what point would Workn genuinely require one.
10. **The protected route and the second kind of user.** Build an administrative view behind a protected route. Requirements: a separate role stored on the user record; a route that checks the role and not just whether someone is logged in; one action only that role can perform; and the copied-link test, where an ordinary user pastes the administrative URL and the attempt and refusal are captured. If the page loads, the route checks authentication and not authorisation.
11. **Primary research** (Builder only). One twenty-minute conversation with one real person who runs a business of the kind Workn serves. A named person with a business that could be visited, not a persona. Ask: what customers ask repeatedly that only they can answer; what records they keep and where they live now; whether a customer ever asked them to delete information and what they did; what they would do if their records were lost tomorrow; and what would make them not use software like this. docs/interview-with-owner.md records who they are, their business, the date, and what they actually said, including answers that contradict the design. Add one paragraph on what the Builder got wrong in the Task 1 brief. If every answer confirmed the design, the questions were leading. Say so.
12. **The handbook** (Builder writes; the agent may review structure only). docs/handbook.md has seven sections, written for someone one cohort behind. Each section contains: the concept in plain words, defined before use; why it exists (the failure it prevents); a real scenario with named people and a specific problem, the Builder's own; how it is done; where it goes wrong and what that costs; and what the Builder got wrong, specific enough to verify against the commit history. The sections are: (1) typography, shadows and the design system export; (2) scaffolding, the development server and database diagnostics; (3) information design, the browser head and responsive type; (4) the working tree, branching and client-side validation; (5) migrations, schema design and email delivery; (6) server-side validation, hashing, rate limiting and verification; (7) sessions, logout, account deletion and compliance. Padding is marked down, and so is a section that defines a term without a scenario.
13. **Publish it** (Builder only). One written piece, public, on Substack, Medium, LinkedIn or a personal site. It tells one decision made during these tasks as a story: the problem, what was tried, what went wrong, what changed, what happened. It shows the Builder's prompts as evidence and includes at least one thing that went wrong. About 1,500 words. The live URL goes in the README.
14. **What I do not know** (Builder only). docs/what-i-do-not-know.md lists at least eight items. For each: what it is, how the Builder knows they do not understand it, and what they would need to learn it. Honest examples: how the session cookie is actually encrypted, what the ORM does when a migration fails halfway, whether rate limit storage survives a restart, what happens to the scheduled job if the server is down when it should fire, and whether the retention matrix would survive a lawyer reading it.

**Deliverables**

```
task-05-sessions-compliance-defence/
  README.md
  privacy.md
  privacy-draft-with-broken-promise.md
  docs/  sessions.md  gating.md  retention-matrix.md  state-management.md
         interview-with-owner.md  handbook.md  what-i-do-not-know.md
         defects.md  interview-answers.md
  evidence/
    01-two-session-ids.txt           02-cookie-flags.png
    03-soft-gating-flow (mp4 or screenshot sequence)
    04-hard-gating-flow (mp4 or screenshot sequence)
    05-generic-errors-both-cases.png 06-two-users-one-browser.txt
    07-session-row-present.png       08-session-row-deleted.png
    09-logout-network-failure.txt    10-logout-edge-case-fixed.txt
    11-reset-kills-other-session (mp4 or two screenshots, both browsers)
    12-deletion-request-locks-account.png
    13-scheduled-job-run-one.txt     14-scheduled-job-run-two.txt
    15-state-management-working (mp4 or screenshot sequence)
    16-admin-route-refused.png       17-published-article-screenshot.png
    18-walkthrough.mp4 (optional)
```

**Automatic fail:** a retention matrix with no conflict identified; a handbook section with no scenario, or one reusing an example scenario; primary research with no contradicting answer; fewer than eight items in what the Builder does not know; numbers cited in interview question 20 that contradict earlier tasks; an administrative route reachable by a logged-in ordinary user.

**Interview questions** (200 words maximum each)

1. What should a secure browser session look like? Name every property and what each one prevents.
2. What is session fixation, and what prevents it?
3. Are tokens better than server-side sessions? Answer for Workn, not in general.
4. How would you implement log out of all devices?
5. How do you invalidate existing sessions on a password change?
6. What do the HttpOnly, Secure and SameSite cookie flags protect against, and what does each one fail to protect against?
7. What is the difference between a 401 and a 403, and how should the interface treat them differently?
8. Why must logout be handled on the server rather than the front end, and what exactly stays alive if it is not?
9. What is the difference between authentication and authorisation, and which one does a protected route need?
10. A user asks you to delete their account. Walk me through what happens, from the request to the data being gone.
11. Which data would you refuse to delete on a deletion request, and on what basis?
12. What happens to your backups when a user is deleted?
13. What is the difference between anonymising and deleting, and when is anonymising sufficient?
14. Why do you want to work as a forward deployed engineer specifically, rather than as a software engineer?
15. A customer says they want to use AI to improve their operations. How do you respond?
16. What is the difference between a RAG system and a fine-tuned model for an enterprise deployment?
17. How do you evaluate whether an AI agent is working correctly in production?
18. How do you decide between local component state, context and an external state manager?
19. How do you handle server state, as distinct from client state?
20. Cite three specific numbers from your own Tasks 1 to 4: one from your type scale, one timing figure from your hashing comparison, and one from your rate limit configuration. Explain what each means and why you chose it. These must match docs/numbers-register.md exactly.
21. Across all five tasks, name the decision you are least confident about. Say what you would need to find out to settle it, and what you would do if the answer went against you.
22. Wrong-answer analysis: a candidate says that for GDPR compliance they added a delete account button that removes the user's row from the database immediately, so they are fully compliant with the right to be forgotten, and that they also keep backups for a year in case anyone needs their data restored. Identify each problem, say which is a legal exposure rather than a technical one, and say what the correct design is.

**Also prepare for the viva** if retrieval is built into Workn: RAG against fine-tuning and when to use each; chunking and choosing chunk size; why a RAG system can still hallucinate and how to reduce it; evaluating RAG quality; telling a retrieval failure from a generation failure using only the logs; when a dedicated vector store makes sense against pgvector inside Postgres; whether structured records belong in vector search; access control in a RAG system; keeping a knowledge base current when source documents change.

## 11. The viva

Every task is defended out loud in a live session with an assessor. It is not the optional recording. It counts for 15 percent of every task.

**Format.** Twenty minutes per task for Tasks 1 to 3 and thirty for Tasks 4 and 5, in three parts.

1. **Five minutes, the Builder drives.** Open the application and the code and walk through the thing the Builder is proudest of.
2. **The bulk, the assessor drives.** Questions written after reading the submission, about the Builder's decisions, numbers and defects, not the topic in general.
3. **Five minutes, the unexpected.** One small request to change something live, such as adding a validation rule, adjusting a value or writing a query. It must work before the session ends.

**The four signals, in order.** Can the Builder find their own code. Do their explanations match the code. Do they say when they do not know, and how they would find out. Can they defend a decision under pressure, including a correct one.

**What ends a viva early.** Not finding a file the Builder wrote. Describing a mechanism the code does not contain. Terminal output the Builder cannot reproduce live. A defect list that matches nothing in the code.

**What this means for the agent.**

- Keep code simple, named plainly and organised so the Builder knows where things live. Maintain a short docs/code-map.md saying where each feature lives.
- Every command that produced evidence must be documented so the Builder can reproduce it live.
- When writing defects.md, check that the file and line referenced exist right now and describe a real flaw.
- Never leave a mechanism in a document that the code does not implement.

## 12. Final audit before a task is declared done

Run this audit at the end of every task and report the result to the Builder.

1. Every deliverable file for the task exists under the exact name given, and none is empty.
2. Evidence came from the Builder's machine, terminal output is saved as text, failure and fix files are separate, and none has been edited or regenerated.
3. defects.md names real defects by file and line, and those lines exist now.
4. The task README and the main README claim only what exists, the main README has all seven sections in order, and environment variables are listed by name only.
5. No secret exists anywhere in history. Scan the full history across all branches, not just the current files, and confirm .env is ignored.
6. Commit messages say what changed and are spread across days. Task 2 meets its floor of twelve commits on at least three different days. Nothing is back-dated or squashed to reach a count.
7. No raw colour or styling values exist outside the token files. Re-run the Task 1 search and save the output.
8. docs/numbers-register.md is up to date and every number matches what earlier submissions say.
9. Every value, rule and number was derived from Workn and none was copied from an example.
10. Interview answers exist, are 200 words or fewer each, are in the Builder's voice, and the Builder can explain each one.
11. Report to the Builder: every file created or changed, every assumption made, a complied or not complied verdict with evidence for each rule in section 2, and every open question.
