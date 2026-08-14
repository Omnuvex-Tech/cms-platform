-- Renames the "value" tag and the ProjectAudience "investor" / "end_user" values to the
-- CRM-friendlier vocabulary agreed with the sales team: "cost-performance" and
-- "investment" / "accommodation". Existing rows carry forward unchanged.

-- AlterEnum (Postgres 10+: renames the value in place, every row referencing it follows)
ALTER TYPE "ProjectAudience" RENAME VALUE 'investor' TO 'investment';
ALTER TYPE "ProjectAudience" RENAME VALUE 'end_user' TO 'accommodation';

-- tags is a plain TEXT[] column (DTO-validated, not a DB enum), so its old values need an
-- explicit data fix rather than a type rename.
UPDATE "projects" SET "tags" = array_replace("tags", 'value', 'cost-performance');
