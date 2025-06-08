-- Drop existing policies
DROP POLICY IF EXISTS "Admin profiles are viewable by approved admins" ON admin_profiles;
DROP POLICY IF EXISTS "Super admins can update admin profiles" ON admin_profiles;

-- Create new policies for admin_profiles
CREATE POLICY "Admin profiles are viewable by approved admins"
    ON admin_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles ap
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
        )
    );

CREATE POLICY "Super admins can manage admin profiles"
    ON admin_profiles 
    USING (
        EXISTS (
            SELECT 1
            FROM admin_profiles ap
            INNER JOIN roles r ON ap.role_id = r.id
            WHERE ap.id = auth.uid()
            AND ap.status = 'approved'
            AND r.name = 'super_admin'
        )
    ); 