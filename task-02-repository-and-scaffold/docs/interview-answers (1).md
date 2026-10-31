

1\. **What is the difference between Git Flow and trunk-based development, and why have a lot of teams moved toward trunk-based?**

Git Flow uses several long-lived branches: main for releases, develop for integration, plus feature, release and hotfix branches. Work is merged in batches, and releases are cut deliberately. Trunk-based development has one shared branch, the trunk. Everyone commits to it directly or through short-lived branches that live hours to a couple of days. Unfinished work is hidden behind feature flags, so the trunk is always releasable.

Many teams moved to trunk-based because long-lived branches drift apart, and the longer they drift, the more painful the merge. Small, frequent merges mean small conflicts and fast feedback from tests. Trunk-based also fits continuous delivery, where code can ship many times a day, whereas Git Flow's release branches add ceremony that slows that down.

Git Flow still makes sense when you ship versioned software and must support several releases at once, such as a desktop app or a library.

For Workn, I work close to trunk-based: short feature branches off main, a pull request as the checkpoint, and merge quickly. With one developer, a develop branch would add overhead and no safety.

\---

**2\. What does git push \--force actually do, and why is \--force-with-lease generally safer?**

git push \--force makes the remote branch point at whatever my local branch has, whether or not that history contains the commits already on the remote. Anything on the remote that I don't have locally is discarded from that branch. It does not ask whether someone else pushed in the meantime.

\--force-with-lease adds a condition. It only overwrites if the remote branch is still where my last fetch said it was. If a teammate pushed after that, the lease fails and Git refuses, so I get a chance to fetch and look first. That makes it much safer for the common case of force-pushing my own rebased feature branch.

It is not foolproof. If my editor or tool fetches in the background, my remote-tracking reference updates, the lease then matches, and the push can still overwrite commits I never looked at. Using the explicit form, with the commit hash I expect, closes that gap.

Neither belongs on a shared branch such as main. I'd rather have branch protection block force pushes there entirely. I use force-with-lease only on my own feature branches, after a rebase or an amend.

\---

**3\. Why is rewriting history, through rebase, amend or force push, dangerous on a shared branch?**

A commit is identified by its hash, and the hash includes its parent. Rebase, amend and force push don't edit commits, they create new ones with new hashes and then move the branch to point at them. On my own branch nobody else sees the old ones, so it is harmless.

On a shared branch, teammates still hold the old commits. When they next pull, their history and the remote's have diverged. Best case, they get confusing merges, duplicated commits and conflicts that were already resolved once. Worst case, they push their old commits back, and work I thought I had removed returns. A force push can also silently delete commits a colleague pushed in the meantime, and those changes are lost from the branch.

It also breaks anything that points at the old hashes: open pull requests, review comments, issue links, bisect notes and deploy records. Once a deployment has built from a commit, rewriting that commit makes the record of what is live untrustworthy.

The rule I follow: rewrite only commits nobody else has based work on. Once a branch is shared, I add new commits or use revert, which keeps history honest.

\---

**4\. What is the difference between git merge and git rebase, and when would you actually pick one over the other?**

Merge combines two lines of history. Git creates a merge commit with two parents, and every original commit keeps its hash. It is non-destructive and shows what actually happened, but the history can fill up with merge commits.

Rebase takes my commits and replays them on top of another base. It makes new commits with new hashes and produces a straight line. The history reads cleanly, but it is a rewrite.

I choose by who else has the commits. On my own feature branch, before opening a pull request, I rebase onto main so my work sits on the latest code and the history is tidy. When integrating into a shared branch, I merge, or use the pull request's merge or squash option, because that doesn't rewrite anything others hold.

The rule is that I never rebase commits other people have built on. If I'm unsure whether a branch is shared, I merge. The cost of an extra merge commit is trivial next to the cost of rewriting history under someone else.

In Workn, my branch work is rebased locally and merged through a pull request into main.

\---

**5\. What causes a merge conflict, and what is actually happening in the file when you see the conflict markers?**

A merge conflict happens when Git can't combine two changes automatically. It compares both branches against their common ancestor. If only one side changed a region, Git takes that change. If both sides changed the same lines, or one deleted a file the other edited, Git can't know which is right, so it stops and asks me.

In the file, Git writes both versions in place with markers. The line \`\<\<\<\<\<\<\< HEAD\` begins my side, the current branch. The \`=======\` line separates the two versions. The \`\>\>\>\>\>\>\> branch-name\` line ends the incoming side. Behind the scenes, Git's index holds three versions of the file: the ancestor, mine and theirs.

Resolving means editing the file to the final content I want, which may be one side, the other or a mix. I delete all three marker lines, save, run the tests if there are any, stage the file with \`git add\`, and finish the merge or rebase with a commit or \`git rebase \--continue\`.

The common mistake is committing with markers still inside, so I search for \`\<\<\<\<\<\<\<\` before staging. Small, frequent merges are the best prevention.

\---

**6\. What is the difference between the working directory, the staging area and the repository?**

They are three places a change passes through.

The working directory is the files on disk that I edit. Git sees changes there but hasn't recorded them.

The staging area, also called the index, is a draft of my next commit. \`git add\` copies the current state of chosen files, or even chosen lines, into it. This lets me build a commit deliberately: if I've fixed a bug and tidied a file, I can stage and commit them separately.

The repository is the permanent history in the \`.git\` folder. \`git commit\` takes what is staged and records it as a commit with a hash, an author and a message.

I can see the gaps with commands. \`git status\` lists what is changed, what is staged and what is untracked. \`git diff\` shows working directory against staging, and \`git diff \--staged\` shows staging against the last commit.

The flow is edit, \`git add\`, \`git commit\`, then \`git push\` to share the commit with GitHub. Staging exists so commits are intentional units, which makes history readable and makes reverting a single change possible.

\---

**7\. What is branch protection, and what does it typically enforce?**

Branch protection is a set of rules on GitHub that limits what can happen to an important branch, usually main. It matters because main is what gets deployed, so it needs a gate.

Typical rules: require a pull request before merging, so nobody pushes straight to main; require a number of approving reviews; require status checks, such as tests, a build or a linter, to pass; require the branch to be up to date with main before merging; require review conversations to be resolved; block force pushes and deletion of the branch; optionally require a linear history or signed commits; and choose whether administrators are exempt.

The value is that it turns good habits into enforcement. A tired developer can't force-push over main, and a failing test blocks the merge instead of relying on someone noticing.

It has limits. It can't judge whether the code is good, and a weak review or weak checks make the gate weak. On a solo project it can't give me a second reviewer, but I can still require pull requests and passing checks, which keeps the discipline I'd want in a team.

\---

**8\. Walk me through a technical project you built end to end.**

Workn is the application I built across these tasks, in stages that each fed the next.

I started with a business brief so every later choice had a reason. Then I built the design system in Figma: a brand colour pinned as primary 40, tonal palettes, light and dark colour roles with contrast ratios, 15 type styles and three shadows. I exported the tokens as JSON. My first export lacked every colour variable, so I fixed it and kept both files.

Next I wrote a scaffolding prompt telling an agent to read my context and design files, summarise, and wait for approval. I captured its plan before approving. It built the foundation only: setup, folders, layout and a tokenised home screen. The dev server ran on port 3000, with a first load of 8,740 ms, mostly compilation.

Then I built a form that writes to a database and proved it with logs, status codes and stored rows. I broke the connection on purpose to see the false success a user would get. I tested my README on a stranger, worked through branches and a pull request, and added the page head and responsive text.

\---

**9\. Tell me about a time when something you built broke in production.**

Nothing I have built has served real users yet, so my nearest example is a failure during development, and I'll say so plainly. The dev server failed while I was building Workn, and I couldn't test anything until it was fixed.

I handled it in a fixed order. First, I read the exact error in the terminal and saved it as a text file. Second, I diagnosed it before asking the agent for help, because a vague description invites a guess, while the exact error text points to the cause. Third, I fixed it and saved the clean startup output beside the failing one, so the problem and the fix can be compared.

What I took from it is that the error text is the evidence. I would rather hand an agent the exact failure than my interpretation of it.

In production, I'd want monitoring and an alert, so I find out in seconds and not from a user, plus a short note on the cause and fix so the next person recognises it quickly. I practise that discipline in development because that is where habits form.

\---

**10\. How do you approach learning a new technical platform or codebase quickly when starting a new engagement?**

I go from the outside in, and I make the system prove things to me instead of trusting descriptions.

First I read what exists: the README, the context files, the folder structure and the commit history, which shows how it grew. Then I run it. A project I can't start is a project I don't understand, and the startup output and logs teach me a lot. Next I trace one real flow end to end, such as a signup from the form to the database row, reading the status codes and the schema. Finally I make one small change and ship it, because that exercises the whole path.

With agents, I use them to map the codebase quickly, but I check their claims against the code and against running behaviour. In Workn I made the agent read all the context files, summarise them and wait for approval, so I could catch wrong assumptions before any code existed. When I diagnosed the app, I read logs and the database, not the interface.

I keep notes of what I learn and what I don't understand yet, and I ask specific questions of people who know the system.

\---

**11\. What is the difference between code that is correct and code that is complete?**

Correct means the code does what it claims for the cases it was written to handle. Complete means it handles the cases the customer actually needs, including the ones nobody wrote down.

A signup form can be correct: given valid input, it creates a row. It is not complete if the database is down and the user still sees a success screen, if there is no way to verify the email, if two people can register the same address, if there is no way to delete the account, or if nobody can tell from logs what happened.

Completeness is mostly the unhappy paths: failure states, empty states, bad input, retries, and what happens when a dependency is slow or unavailable. It also covers the operational side: logging, configuration, documentation, deployment and handover.

Agents are very good at correct and weak on complete, because they build the visible happy path and stop. An interface can look finished while storing nothing, which is why I test by breaking the database connection on purpose and checking what the user sees.

I measure completeness against the customer's real workflow, not against the feature list.

\---

**12\. How do you design software for a customer who will need to maintain it after you are gone?**

I design for the person who inherits it, assuming they weren't in any of my conversations.

Technically, I choose boring, widely understood tools over clever ones, keep modules small and named by purpose, and put all configuration in environment variables with an example file that lists every name and no values. No secrets live in the repository. Database changes are versioned migrations. The design system lives in tokens, so a brand change is a single edit.

For operations, I log meaningful events with start and finish lines and counts, so a stopped job is distinguishable from an idle one. I write down how to restore a backup, rotate a key and redeploy.

For knowledge, I write a README that someone has actually followed from a fresh clone, a decision log that says why and not only what, and a list of known defects and things deliberately left out. Workn's README has those sections, and I tested it on a stranger.

I also run a handover session, where the customer drives and I watch. If they can't do a task without me, the design isn't finished.

\---

**13\. Your first page load took a specific number of milliseconds. Where did that time go? Name the parts you can measure and the parts you are guessing about.**

My first load was \`GET / 200 in 8740ms\` on port 3000, against a reference point of about 10 ms in the task.

What I can measure from the log: the dev server compiled \`/\` in 8.1 seconds across 482 modules, which is about 93% of the 8,740 ms. That leaves roughly 640 ms for serving and rendering. That 640 is arithmetic, not a measurement, because I haven't shown that the compile time and the request time cover exactly the same interval.

What I'm guessing about is why compilation took so long. Candidates are a cold cache on the first run, fonts fetched during the first compile, my machine's disk speed or antivirus scanning many small files, and which bundler is running. I haven't isolated any of them, so I treat them as hypotheses. Each is testable: delete the \`.next\` folder and run again, check how the fonts load, and compare a production build.

The key point is that a dev server compiles routes on demand, so the first request pays for work later requests skip. The figure describes development tooling more than the speed users would see, so I would not quote it as the app's performance.

\---

**14\. Your application reported success to the user while writing nothing to the database. Explain the mechanism that allowed that, and name the one check that would have caught it in thirty seconds.**

The mechanism is that the interface decided "success" without confirming it. Common causes: the browser's fetch only rejects on a network failure, not on an HTTP error, so a 500 still resolves and the handler carries on; a try/catch that swallows the error and returns 200; or code that shows the success screen the moment the button is clicked. With the database connection broken, nothing was stored, yet the user saw a confirmation.

The signal is in the logs. A write that creates a record should produce a 201, and a missing 201 means nothing was created.

The one check that would have caught it in thirty seconds: submit the form once, then open the database inspector and look for the new row. If the row isn't there, the app isn't storing anything, whatever the screen says.

The fix is to check the response status before showing success, show a real error on failure, and make that database check a habit.

\---

**15\. Wrong-answer analysis:** "I always check my app is working by signing up a test user and confirming I get taken to the dashboard. If the dashboard loads, the backend is working."

This confirms the interface works and the user reached a route, not that the backend worked. A dashboard can load for reasons unrelated to a stored account: the redirect may fire whatever the server answered, the page may render from local state or placeholder data, the test user may already exist, or a session may be faked in the browser. A success screen can appear even when nothing was written.

It would miss a write that never happened, a 401 or 500 hiding behind a success screen, a missing 201, an email that never sent, a password stored unhashed, duplicate handling, and every failure path, because the test covers only a cooperative user on a good day.

What I would do instead: submit the form and read the log for status codes, looking for a 201\. Open the database inspector and confirm a row with an ID and timestamp. Submit again with different values and see two rows. Then run the negative test: break the database connection on purpose, submit, and confirm the user sees an error and the logs show the failure.

I'd then automate those steps.