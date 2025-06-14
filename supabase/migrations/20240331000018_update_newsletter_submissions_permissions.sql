-- First, remove newsletter and form submission permissions from all roles
DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions 
    WHERE name IN (
        'view_newsletter', 'manage_newsletter',
        'view_submissions', 'manage_submissions'
    )
);

-- Then, add newsletter and form submission permissions only to super_admin, admin, and editor roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('super_admin', 'admin', 'editor')
AND p.name IN (
    'view_newsletter', 'manage_newsletter',
    'view_submissions', 'manage_submissions'
)
ON CONFLICT (role_id, permission_id) DO NOTHING; 