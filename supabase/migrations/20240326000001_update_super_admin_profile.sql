-- Update the super admin's profile with a proper name
UPDATE admin_profiles
SET full_name = 'Beny Dishon',
    status = 'approved'
WHERE id IN (
    SELECT ap.id
    FROM admin_profiles ap
    INNER JOIN roles r ON ap.role_id = r.id
    WHERE r.name = 'super_admin'
); 