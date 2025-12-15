-- RLS Policies for repositories table
-- Users can see repositories from their installations

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view repositories from their installations" ON repositories;
DROP POLICY IF EXISTS "Users can insert repositories for their installations" ON repositories;
DROP POLICY IF EXISTS "Users can update repositories from their installations" ON repositories;
DROP POLICY IF EXISTS "Users can delete repositories from their installations" ON repositories;

-- Enable RLS on repositories if not already enabled
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;

-- SELECT policy: Users can view repositories from their installations
CREATE POLICY "Users can view repositories from their installations"
    ON repositories FOR SELECT
    USING (
        installation_id IN (
            SELECT installation_id 
            FROM installations 
            WHERE user_id = auth.uid()
        )
    );

-- INSERT policy: Users can insert repositories for their installations
CREATE POLICY "Users can insert repositories for their installations"
    ON repositories FOR INSERT
    WITH CHECK (
        installation_id IN (
            SELECT installation_id 
            FROM installations 
            WHERE user_id = auth.uid()
        )
    );

-- UPDATE policy: Users can update repositories from their installations
CREATE POLICY "Users can update repositories from their installations"
    ON repositories FOR UPDATE
    USING (
        installation_id IN (
            SELECT installation_id 
            FROM installations 
            WHERE user_id = auth.uid()
        )
    );

-- DELETE policy: Users can delete repositories from their installations
CREATE POLICY "Users can delete repositories from their installations"
    ON repositories FOR DELETE
    USING (
        installation_id IN (
            SELECT installation_id 
            FROM installations 
            WHERE user_id = auth.uid()
        )
    );

-- Also ensure installations table has proper RLS policies
ALTER TABLE installations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own installations" ON installations;
DROP POLICY IF EXISTS "Users can insert their own installations" ON installations;
DROP POLICY IF EXISTS "Users can update their own installations" ON installations;
DROP POLICY IF EXISTS "Users can delete their own installations" ON installations;

CREATE POLICY "Users can view their own installations"
    ON installations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own installations"
    ON installations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installations"
    ON installations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installations"
    ON installations FOR DELETE
    USING (auth.uid() = user_id);
