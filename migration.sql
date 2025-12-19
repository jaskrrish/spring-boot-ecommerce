-- SQL Migration Script to add password and role columns to existing users table
-- Run this script to update your database schema

-- Add password column with default value for existing users
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT 'password123';

-- Add role column with default value for existing users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- Update existing users to have the default password (if needed)
UPDATE users SET password = 'password123' WHERE password IS NULL OR password = '';

-- Update existing users to have USER role (if needed)
UPDATE users SET role = 'USER' WHERE role IS NULL OR role = '';

-- Optional: Create an admin user if you want one
-- Uncomment and modify as needed
-- INSERT INTO users (name, email, password, role, address) 
-- VALUES ('Admin User', 'admin@example.com', 'password123', 'ADMIN', 'Admin Address')
-- ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';
