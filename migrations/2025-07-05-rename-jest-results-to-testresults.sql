-- Rename jest_results table to testresults
ALTER TABLE jest_results RENAME TO testresults;

-- Update the RLS policy name to reflect the new table name
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON testresults;
CREATE POLICY "Allow insert for authenticated users"
ON testresults
FOR INSERT
TO authenticated
WITH CHECK (true);
