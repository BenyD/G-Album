-- Add 'visitor' to the role_type enum in a separate transaction
ALTER TYPE role_type ADD VALUE IF NOT EXISTS 'visitor'; 