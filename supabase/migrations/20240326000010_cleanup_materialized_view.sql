-- Drop the materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS user_roles;

-- Drop any related triggers
DROP TRIGGER IF EXISTS refresh_user_roles_on_profile_change ON admin_profiles;
DROP TRIGGER IF EXISTS refresh_user_roles_on_role_change ON roles;

-- Drop the refresh function
DROP FUNCTION IF EXISTS refresh_user_roles(); 