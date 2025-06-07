-- Update the existing admin account
DO $$
DECLARE
    super_admin_role_id UUID;
    admin_email TEXT := 'benydishon@gmail.com';
BEGIN
    -- Get the super_admin role ID
    SELECT id INTO super_admin_role_id
    FROM public.roles
    WHERE name = 'super_admin';

    IF super_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Super admin role not found. Please run the initial migration first.';
    END IF;

    -- Get or create admin profile for the existing user
    INSERT INTO public.admin_profiles (
        id,
        role_id,
        status,
        full_name,
        approved_at,
        approved_by
    )
    SELECT 
        u.id,
        super_admin_role_id,
        'approved'::user_status,
        'Super Administrator',
        NOW(),
        u.id
    FROM auth.users u
    WHERE u.email = admin_email
    ON CONFLICT (id) DO UPDATE
    SET
        role_id = super_admin_role_id,
        status = 'approved',
        approved_at = NOW();

    -- Ensure email is confirmed
    UPDATE auth.users
    SET email_confirmed_at = NOW()
    WHERE email = admin_email;

    RAISE NOTICE 'Successfully updated admin profile for %', admin_email;
END;
$$; 