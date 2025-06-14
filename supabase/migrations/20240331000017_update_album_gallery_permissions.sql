-- First, remove album and gallery permissions from all roles
DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions 
    WHERE name IN (
        'view_albums', 'manage_albums',
        'view_gallery', 'manage_gallery'
    )
);

-- Then, add album and gallery permissions only to super_admin and admin roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('super_admin', 'admin')
AND p.name IN (
    'view_albums', 'manage_albums',
    'view_gallery', 'manage_gallery'
)
ON CONFLICT (role_id, permission_id) DO NOTHING; 