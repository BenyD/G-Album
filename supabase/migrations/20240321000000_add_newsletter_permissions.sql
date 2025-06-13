-- Add newsletter-related permissions
INSERT INTO permissions (name, description)
VALUES 
  ('send_newsletters', 'Can create and send newsletters'),
  ('manage_subscribers', 'Can manage newsletter subscribers')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin'
  AND p.name IN ('send_newsletters', 'manage_subscribers')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
  AND p.name IN ('send_newsletters', 'manage_subscribers')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign permissions to editor role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  r.id as role_id,
  p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'editor'
  AND p.name IN ('send_newsletters', 'manage_subscribers')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Add RLS policies for newsletter tables
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_logs ENABLE ROW LEVEL SECURITY;

-- Policies for newsletter_subscribers
CREATE POLICY "Newsletter subscribers are viewable by approved admins"
    ON newsletter_subscribers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
        )
    );

CREATE POLICY "Approved admins can manage subscribers"
    ON newsletter_subscribers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            INNER JOIN role_permissions rp ON r.id = rp.role_id
            INNER JOIN permissions p ON rp.permission_id = p.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND p.name = 'manage_subscribers'
        )
    );

-- Policies for newsletter_logs
CREATE POLICY "Newsletter logs are viewable by approved admins"
    ON newsletter_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
        )
    );

CREATE POLICY "Approved admins can manage newsletters"
    ON newsletter_logs FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            INNER JOIN role_permissions rp ON r.id = rp.role_id
            INNER JOIN permissions p ON rp.permission_id = p.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND p.name = 'send_newsletters'
        )
    ); 