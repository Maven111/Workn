# Database Migrations: Principles, Drift, and Human Control

- 
- **Subject**: Forward-Only Database Migrations, Drift Detection, and the Human Barrier
---

## 1. Why Database Migrations Are Forward-Only

In modern relational software engineering, schema migrations must follow a **forward-only** architecture. When a database modification is needed—whether altering a column type, adding an index, or creating a new table—the change is expressed as a newly sequenced migration file that builds on top of the previous state.

### The Down-Migration Fallacy
Older ORM systems popularized "up" and "down" migration pairs, implying that any schema deployment could be cleanly undone by running a "down" script (e.g. `DROP COLUMN`). In production, down migrations are dangerous and frequently impossible:

1. **Destructive Data Loss**:
   Dropping a column immediately deletes all existing production data stored in that column. Even if the schema is restored by rolling back the code, the underlying member records, transaction references, or phone numbers are gone permanently unless restored from backup dumps.
2. **Transactional Asymmetry**:
   Many DDL operations (such as table rewrites, enum modifications, or foreign key creation) cannot be cleanly rolled back inside a single transaction across all database engines.
3. **Application Version Skew**:
   During rolling deployments, older instances of the application may still be serving active requests while new instances spin up. A forward-only migration allows expanding the schema first (e.g. adding an optional column), deploying the application code, and then contracting (removing unused fields in a subsequent release).

Therefore, in Workn, every change is forward-only. If a column was introduced by mistake or requires alteration, a new migration is authored to adjust or deprecate it. The ledger of past migrations remains an immutable chronological history of the database.

---

## 2. Why an Applied Migration Is Never Edited

Once a migration file has been executed against an environment (especially production or a shared development database), **that migration file must never be edited, renamed, or deleted.**

### The Checksum and Synchronization Mechanism
Prisma Migrate (and similar industrial migration engines like Flyway or Liquibase) maintains an internal tracking table in PostgreSQL: `_prisma_migrations`.

When a migration runs:
1. Prisma computes a cryptographic SHA-256 checksum of the `migration.sql` file.
2. Prisma executes the SQL statements against PostgreSQL.
3. Prisma stores the migration filename, applied timestamp, execution duration, and SHA-256 checksum in `_prisma_migrations`.

### What Breaks When an Applied Migration Is Edited:
If an engineer modifies a previously applied migration file:
- **Checksum Mismatch / Drift Error**: On the next migration run, Prisma recalculates the checksum of the local file and compares it to the checksum recorded in the database. When they differ, Prisma halts execution with a fatal migration drift failure:
  > *"Error: The migration `20261105..._init` was modified after it was applied."*
- **Team Divergence**: Teammates who already applied the old version will have different database structures than someone running the modified version on a fresh clone.
- **Production Divergence**: The deployment pipeline will refuse to apply migrations to production, requiring manual, high-risk manual database surgical intervention (editing `_prisma_migrations` or dropping tables) to restore consensus.

---

## 3. Why Migrations Are Run by Hand and Not by an Agent

Database migrations are executed deliberately by the human Builder rather than automated agents for fundamental safety reasons:

1. **Irreversibility of DDL Commands**:
   Unlike application code that can be tested in ephemeral memory and discarded, database migrations execute Data Definition Language (DDL) commands against persistent storage. An agent running `prisma migrate dev` or `prisma db push` on a live instance could silently wipe a table, drop an index, or trigger an exclusive table lock that freezes production.
2. **Intentional Human Inspection**:
   Database migrations require verifying the generated SQL diff before execution. A human engineer must inspect the generated `migration.sql` to ensure it does not include accidental `DROP COLUMN` statements or lock-inducing `ALTER TABLE` commands on large production datasets.
3. **Accountability and Concurrency Coordination**:
   Applying a migration must be coordinated with active traffic, database connection pool limits, and background workers. Automating migrations through unconstrained coding agents invites catastrophic race conditions during development.

### The Honest Cost of This Choice
Enforcing human-only migration execution is a deliberate trade-off with real operational costs:
- **Slower Velocity**: Development slows down because the agent must pause, draft commands, and await manual human execution and verification.
- **High Friction & Forgetfulness**: Humans are fallible. An engineer may change `schema.prisma`, forget to run the migration by hand, and wonder why the application crashes with runtime database column errors. 
- **Context Switching Overhead**: The Builder must leave their editor, open terminal sessions, run CLI commands, verify database rows, and feed output back to the project evidence repository.

Despite these costs, the risk of automated data corruption on persistent business ledgers far outweighs the temporary convenience of automated migration runs.

---

## 4. The Three-Step Migration for Required Columns

Adding a non-nullable (`NOT NULL`) column to a populated production table without a default value is a classic database anti-pattern that fails immediately:

```sql
-- Fails on populated tables: existing rows have no value for this column!
ALTER TABLE "User" ADD COLUMN "loyaltyTier" VARCHAR(20) NOT NULL;
```

### The Correct Three-Step Migration Pattern:

1. **Step 1: Add as Optional (Nullable)**:
   Add the new column as nullable in `schema.prisma`:
   ```prisma
   loyaltyTier String?
   ```
   Apply the migration. PostgreSQL adds the column metadata instantly without failing, assigning `NULL` to all existing rows.

2. **Step 2: Backfill / Populate Existing Rows**:
   Execute a data migration script or SQL update to populate valid values for all existing rows:
   ```sql
   UPDATE "User" SET "loyaltyTier" = 'STANDARD' WHERE "loyaltyTier" IS NULL;
   ```

3. **Step 3: Make Required (NOT NULL)**:
   Update `schema.prisma` to make the column non-nullable:
   ```prisma
   loyaltyTier String
   ```
   Apply the migration. Because zero rows contain `NULL`, PostgreSQL sets the `NOT NULL` constraint cleanly in milliseconds without error or downtime.

---

## 5. Drift Error Analysis

### Which Two Things Have Gone Out of Step
When schema drift occurs, the application's runtime Object-Relational Mapping (ORM) model layer and the persistent PostgreSQL catalog have diverged out of consensus. Specifically, in our deliberate test, the local `prisma/schema.prisma` file and compiled Prisma Client were configured with a new field (`driftTestField`), causing Prisma's query engine to build SQL statements that request `"User"."driftTestField"` on every fetch. Concurrently, the live PostgreSQL database catalog on Supabase (`public.User`) was never updated because no forward migration was executed to create the column metadata. The moment the application issues a read query, the relational engine aborts with PostgreSQL error `42703 (undefined_column)` and surfaces a fatal Prisma `P2022` client exception (`The column User.driftTestField does not exist in the current database`).

### How It Was Fixed
To restore deterministic consensus between code and database without introducing untracked state, the unmigrated field was removed from `prisma/schema.prisma`, and `npx prisma generate` was executed to recompile the client runtime. Subsequent queries executed cleanly, verifying that the ORM client projection and the physical PostgreSQL schema are identical. The complete runtime failure stack trace and post-fix verification are preserved in `evidence/06-drift-error.txt`.

