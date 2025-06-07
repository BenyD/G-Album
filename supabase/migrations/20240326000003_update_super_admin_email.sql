-- Update the super admin email
DO $$
DECLARE
    super_admin_role_id UUID;
    old_email TEXT := 'your.email@example.com';
    new_email TEXT := 'admin@galbum.com'; -- Replace this with your actual email
BEGIN
    -- Check if super_admin role exists
    SELECT id INTO super_admin_role_id
    FROM public.roles
    WHERE name = 'super_admin';

    IF super_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Super admin role not found. Please run the initial migration first.';
    END IF;

    -- Update the user's email in auth.users
    UPDATE auth.users
    SET email = new_email,
        email_confirmed_at = NOW()
    WHERE email = old_email;

    -- Ensure the admin profile is approved
    UPDATE public.admin_profiles
    SET status = 'approved',
        approved_at = NOW()
    WHERE id IN (
        SELECT id
        FROM auth.users
        WHERE email = new_email
    );

    RAISE NOTICE 'Successfully updated super admin email to %', new_email;
END;
$$; 