# Rollback Without Hallucination

- **Task**: Task 3 Step 9 Deliverable
- **Subject**: Git State Recovery, Cryptographic Precision vs Verbal Description, and Reflog Mechanics
- **Evidence Reference**: [`evidence/17-commit-list-and-rollback.txt`](../Evidence/17-commit-list-and-rollback.txt)
- **Author**: Builder Assessment Team

---

## 1. Why Naming the Commit ID is Safer Than Describing Changes in Words

When rolling back unwanted or broken software changes, teams frequently attempt to describe the rollback in words:
> *"Undo the auto-bypass changes we added to the auth client yesterday."*  
> *"Revert the experimental styling on the login button and remove the extra state hook."*

Describing changes in words is fragile, dangerous, and prone to hallucination for three technical reasons:

1. **Semantic Ambiguity and Memory Degradation**:
   Human memory and natural language are inherently imprecise. A verbal instruction leaves critical questions open: *Did that change touch only one component, or did it introduce a utility function, modify package dependencies, or tweak design tokens?* Describing a change verbally forces the developer—or an AI coding assistant—to guess which lines belonged to the regretted change and which lines belonged to valid work committed around the same time.

2. **Risk of Orphaned Code and Partial Reversals**:
   Manual line-by-line deletions often remove the visible symptom while leaving orphaned imports, unused state variables, broken type definitions, or silent memory leaks. Conversely, an overzealous manual cleanup might accidentally delete valid bug fixes committed in the same editing session.

3. **Cryptographic Invariance of the Commit Object**:
   A Git commit ID (such as `a87dfd3b931ffea9bcc88a69522a5cea3416e440`) is a 40-character SHA-1 hash computed directly from the repository's tree object, parent hashes, committer metadata, and exact diff contents. It is a mathematically unambiguous pointer to an immutable state.
   
   When an engineer runs:
   ```bash
   git revert a87dfd3b931ffea9bcc88a69522a5cea3416e440
   ```
   Git does not rely on interpretation. It reads the exact tree diff associated with that hash, calculates the precise inverse patch, applies it atomically across all affected files, and creates an auditable revert commit referencing the target hash. There is zero possibility of human hallucination.

---

## 2. What Happens to Unstaged Changes on a Hard Reset

The command `git reset --hard <commit-id>` is one of the few genuinely destructive commands in Git. To understand its danger, consider Git's three operational trees:

1. **HEAD**: The pointer to the current commit snapshot.
2. **Index (Staging Area)**: The prepared snapshot for the next commit.
3. **Working Directory**: The actual files on your local filesystem.

When executing `git reset --hard`:
- Git moves `HEAD` to point to the designated `<commit-id>`.
- Git updates the **Index** to match that commit.
- Git overwrites the **Working Directory** to match that commit.

### The Fate of Unstaged Modifications
If you have uncommitted, unstaged modifications in your working directory when running `git reset --hard`:

> [!CAUTION]
> **Unstaged changes are permanently and irreversibly destroyed.**

Because unstaged changes were never registered via `git add`, Git never generated blob objects for them in `.git/objects`. They existed solely in volatile filesystem memory. Once the working directory is overwritten with the target commit snapshot, **those unstaged files cannot be recovered via Git commands, reflogs, or history searches**. 

*Engineering Rule*: Never run a hard reset with a dirty working tree. Always run `git status` or `git stash` first to safeguard ephemeral work.

---

## 3. How to Recover from a Reset Run by Mistake

If a developer executes `git reset --hard` by mistake and loses their position in the branch history, the commit they were on appears to have vanished. Standard `git log` commands will no longer show the commits that were "reset away."

However, because those commits were previously committed, **they are not lost.** Git preserves orphaned commit objects in its database until the garbage collector runs (typically 30 to 90 days).

### The Recovery Mechanism: `git reflog`

The Reference Log (`reflog`) is Git's safety net. It records every single movement of the `HEAD` pointer on your local machine, including commits, checkouts, merges, rebases, and resets.

#### Step-by-Step Recovery Procedure:

1. **Inspect the Reference Log**:
   ```bash
   git reflog -n 10
   ```
   *Example Real Output from Workn Repository*:
   ```text
   9b2c7c5 HEAD@{0}: revert: Revert "experiment: add speculative client auto-bypass test"
   a87dfd3 HEAD@{1}: commit: experiment: add speculative client auto-bypass test
   9908c25 HEAD@{2}: commit: feat: implement accessible auth form validation
   ```

2. **Identify the Mistaken Reset Point**:
   Locate the commit hash or `HEAD@{n}` position immediately prior to the reset command (e.g., `HEAD@{1}`).

3. **Restore the Exact State**:
   You can immediately restore the branch to the pre-reset position using the reflog pointer:
   ```bash
   # Option A: Move current branch pointer back safely
   git reset --hard HEAD@{1}

   # Option B: Spin off a dedicated recovery branch to inspect first
   git checkout -b recovery-branch HEAD@{1}
   ```

4. **Verify Working Tree Integrity**:
   Run `git log` and `git status` to verify that all committed files, commit messages, and tree structures are fully restored.

By relying on cryptographic commit hashes and the reflog rather than speculative manual edits, software engineering workflows remain deterministic, auditable, and resilient against accidental deletion.
