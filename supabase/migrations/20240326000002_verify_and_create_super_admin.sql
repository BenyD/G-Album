-- First, verify the roles table exists and has the super_admin role
DO $$
DECLARE
    super_admin_role_id UUID;
    admin_email TEXT := 'your.email@example.com'; -- Replace this with your email
BEGIN
    -- Check if super_admin role exists
    SELECT id INTO super_admin_role_id
    FROM public.roles
    WHERE name = 'super_admin';

    IF super_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Super admin role not found. Please run the initial migration first.';
    END IF;

    -- Get the user ID from auth.users
    DECLARE
        user_id UUID;
    BEGIN
        SELECT id INTO user_id
        FROM auth.users
        WHERE email = admin_email;

        IF user_id IS NULL THEN
            RAISE EXCEPTION 'User with email % not found in auth.users. Please create the user first.', admin_email;
        END IF;

        -- Create or update admin profile
        INSERT INTO public.admin_profiles (
            id,
            role_id,
            status,
            full_name,
            approved_at,
            approved_by
        )
        VALUES (
            user_id,
            super_admin_role_id,
            'approved',
            'Super Administrator',
            NOW(),
            user_id
        )
        ON CONFLICT (id) DO UPDATE
        SET
            role_id = super_admin_role_id,
            status = 'approved',
            approved_at = NOW(),
            approved_by = user_id;

        RAISE NOTICE 'Successfully created/updated super admin profile for %', admin_email;
    END;
END;
$$; 