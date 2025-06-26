-- Create the jest_results table
CREATE TABLE jest_results (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT NOW(),
    total_tests INT NOT NULL,
    passed_tests INT NOT NULL,
    failed_tests INT NOT NULL,
    skipped_tests INT NOT NULL,
    results JSONB NOT NULL
);

-- Grant insert permissions to authenticated users
ALTER TABLE jest_results
ENABLE ROW LEVEL SECURITY;

-- Correct the policy to use WITH CHECK instead of USING for INSERT
CREATE POLICY "Allow insert for authenticated users"
ON jest_results
FOR INSERT
TO authenticated
WITH CHECK (true);
