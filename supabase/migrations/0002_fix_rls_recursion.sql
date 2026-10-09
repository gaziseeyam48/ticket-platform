-- Migration: Fix infinite recursion in organization_users RLS policy
-- Error 42P17 was caused by a self-referencing subquery on organization_users table.

DROP POLICY IF EXISTS "Users can view members of their orgs" ON organization_users;

CREATE POLICY "Users can view members of their orgs"
ON organization_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());
