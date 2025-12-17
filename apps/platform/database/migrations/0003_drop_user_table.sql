-- drop dependent objects first if you prefer explicit steps
-- DROP CONSTRAINT IF EXISTS <constraint_name> ON "<table_with_fk>";
DROP TABLE IF EXISTS "User" CASCADE;