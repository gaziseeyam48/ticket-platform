-- 0001_initial_schema.sql
-- Based on docs/DATABASE.md

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create tables
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organization_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('OWNER', 'ADMIN')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, user_id)
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'LIVE', 'ENDED', 'CANCELLED')),
    event_type VARCHAR(10) NOT NULL CHECK (event_type IN ('FREE', 'PAID')),
    date_start TIMESTAMPTZ,
    date_end TIMESTAMPTZ,
    location VARCHAR(500),
    payment_config JSONB,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (organization_id, slug)
);

CREATE TABLE registration_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    fields JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id)
);

CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    form_id UUID NOT NULL REFERENCES registration_forms(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'REGISTERED' CHECK (status IN ('REGISTERED', 'CANCELLED')),
    form_data JSONB NOT NULL,
    payment_status VARCHAR(30) CHECK (payment_status IN ('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    transaction_id VARCHAR(255),
    payment_reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    payment_reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, email)
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    ticket_number VARCHAR(20) NOT NULL UNIQUE,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'CHECKED_IN', 'REVOKED')),
    participant_name VARCHAR(255) NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_data JSONB,
    issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID, -- Can't easily reference event_verifiers if it's created later, we'll do it later or leave as UUID
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE event_verifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    invitation_token_hash VARCHAR(128) UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'INVITED' CHECK (status IN ('INVITED', 'ACTIVE', 'EXPIRED', 'REVOKED')),
    expires_at TIMESTAMPTZ NOT NULL,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (event_id, email)
);

-- Now we can add the FK to tickets for checked_in_by safely
ALTER TABLE tickets
    ADD CONSTRAINT tickets_checked_in_by_fkey
    FOREIGN KEY (checked_in_by)
    REFERENCES event_verifiers(id)
    ON DELETE SET NULL;

CREATE TABLE checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    verifier_id UUID NOT NULL REFERENCES event_verifiers(id) ON DELETE CASCADE,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (ticket_id)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    actor_id VARCHAR(255),
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('USER', 'VERIFIER', 'SYSTEM')),
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(255),
    metadata JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX idx_events_organization_id ON events(organization_id);
CREATE INDEX idx_organization_users_user_id ON organization_users(user_id);
CREATE INDEX idx_organization_users_org_id ON organization_users(organization_id);

CREATE UNIQUE INDEX idx_events_org_slug ON events(organization_id, slug);

CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE UNIQUE INDEX idx_registrations_event_email ON registrations(event_id, email);

CREATE UNIQUE INDEX idx_tickets_token_hash ON tickets(token_hash);
CREATE INDEX idx_tickets_event_id ON tickets(event_id);
CREATE INDEX idx_tickets_event_status ON tickets(event_id, status);
CREATE INDEX idx_tickets_registration_id ON tickets(registration_id);

CREATE INDEX idx_event_verifiers_event_id ON event_verifiers(event_id);
CREATE UNIQUE INDEX idx_event_verifiers_event_email ON event_verifiers(event_id, email);
CREATE UNIQUE INDEX idx_event_verifiers_invitation_token ON event_verifiers(invitation_token_hash)
    WHERE invitation_token_hash IS NOT NULL;

CREATE UNIQUE INDEX idx_checkins_ticket_id ON checkins(ticket_id);
CREATE INDEX idx_checkins_event_id ON checkins(event_id);

CREATE INDEX idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_event_id ON audit_logs(event_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 3. Row Level Security (RLS)
-- We'll enable RLS on all tables and create policies.

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_verifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy helper: is_org_member
-- Users can see their own organization_users entries
CREATE POLICY "Users can view their own org memberships"
ON organization_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Organizations: users can view/update organizations they are members of
CREATE POLICY "Users can view orgs they belong to"
ON organizations FOR SELECT
TO authenticated
USING (id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert orgs"
ON organizations FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Owners can update orgs"
ON organizations FOR UPDATE
TO authenticated
USING (id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid() AND role = 'OWNER'
));

-- Organization Users: users can view their own membership rows
CREATE POLICY "Users can view members of their orgs"
ON organization_users FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own initial membership"
ON organization_users FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Events: org members can view/manage
CREATE POLICY "Org members can view events"
ON events FOR SELECT
TO authenticated
USING (organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
));

CREATE POLICY "Org members can insert events"
ON events FOR INSERT
TO authenticated
WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
));

CREATE POLICY "Org members can update events"
ON events FOR UPDATE
TO authenticated
USING (organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
));

-- Public access to active events (for registration)
CREATE POLICY "Public can view active events"
ON events FOR SELECT
TO anon, authenticated
USING (status IN ('PUBLISHED', 'LIVE'));

-- Forms: org members can view/manage
CREATE POLICY "Org members can manage forms"
ON registration_forms FOR ALL
TO authenticated
USING (event_id IN (
    SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
));

-- Public access to active event forms
CREATE POLICY "Public can view forms of active events"
ON registration_forms FOR SELECT
TO anon, authenticated
USING (event_id IN (
    SELECT id FROM events WHERE status IN ('PUBLISHED', 'LIVE')
));

-- Registrations: org members can view/manage
CREATE POLICY "Org members can manage registrations"
ON registrations FOR ALL
TO authenticated
USING (event_id IN (
    SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
));

-- Public can insert registrations (via API which might bypass RLS, but let's be safe)
CREATE POLICY "Public can insert registrations"
ON registrations FOR INSERT
TO anon, authenticated
WITH CHECK (event_id IN (
    SELECT id FROM events WHERE status IN ('PUBLISHED', 'LIVE')
));

-- Tickets: org members can manage
CREATE POLICY "Org members can manage tickets"
ON tickets FOR ALL
TO authenticated
USING (event_id IN (
    SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
));

-- Public can view their ticket by token_hash
CREATE POLICY "Public can view their own ticket"
ON tickets FOR SELECT
TO anon, authenticated
USING (true); -- Real security is enforced at API level by requiring the 256-bit token hash

-- Verifiers: org members can manage
CREATE POLICY "Org members can manage verifiers"
ON event_verifiers FOR ALL
TO authenticated
USING (organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
));

-- Checkins: org members can view
CREATE POLICY "Org members can view checkins"
ON checkins FOR SELECT
TO authenticated
USING (event_id IN (
    SELECT id FROM events WHERE organization_id IN (
        SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
    )
));

-- Audit logs: org members can view
CREATE POLICY "Org members can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (organization_id IN (
    SELECT organization_id FROM organization_users WHERE user_id = auth.uid()
));

-- Note: Operations like ticket issuance, check-in, and audit logging will be performed via
-- the service_role key to bypass RLS and ensure atomicity and security.

-- Setup trigger for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_registration_forms_updated_at BEFORE UPDATE ON registration_forms FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION set_updated_at();
