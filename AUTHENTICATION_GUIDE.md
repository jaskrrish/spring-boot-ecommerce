# Authentication & Authorization Update Guide

## Overview
This guide documents the implementation of password-based authentication and role-based authorization in the E-commerce application.

## Changes Summary

### Backend Changes

#### 1. Database Schema Updates
- **Added columns to `users` table:**
  - `password` (VARCHAR(255), NOT NULL) - Stores user passwords
  - `role` (VARCHAR(20), NOT NULL) - Stores user role (USER or ADMIN)

#### 2. New Java Classes
- **`Role.java`** - Enum for user roles (USER, ADMIN)
- **`LoginDTO.java`** - Data Transfer Object for login requests

#### 3. Updated Classes

**User.java (Model)**
- Added `password` field with `@NotBlank` validation
- Added `role` field as Enum with `@Enumerated(EnumType.STRING)`

**UserDTO.java**
- Added `password` field with `@NotBlank` validation
- Added `role` field with `@NotNull` validation

**UserService.java**
- Added `login()` method for authentication
- Updated `createUser()` to set default role as USER
- Updated `updateUser()` to handle password and role updates
- Updated conversion methods to include password and role

**UserController.java**
- Added `POST /api/users/login` endpoint for authentication

### Frontend Changes

#### 1. Type Definitions (types.ts)
- Added `Role` type ('USER' | 'ADMIN')
- Updated `User` interface with `password` and `role` fields
- Updated `CreateUserDTO` with `password` and `role` fields
- Added `LoginDTO` interface

#### 2. API Layer (api.ts)
- Added `login()` method to userApi for authentication

#### 3. Authentication & Authorization
**user-provider.tsx**
- Removed manual admin toggle functionality
- `isAdmin` is now automatically derived from user's role
- Authentication state persists in localStorage

**Navbar Component**
- Replaced "Admin Mode" toggle with "Admin Panel" link
- Admin Panel link only visible to users with ADMIN role

#### 4. Updated Pages

**Login Page (/login)**
- Added password field
- Implements proper authentication via API
- Redirects to admin panel if user is ADMIN, otherwise to products

**Register Page (/register)**
- Added password field with validation (minimum 6 characters)
- Sets default role as USER for new registrations

**Admin Pages (/admin, /admin/products, /admin/orders, /admin/users)**
- Added authentication checks before page load
- Redirect to login if not authenticated
- Redirect to home if not authorized (non-admin users)
- Admin Users page now displays user roles with badges

## Database Migration

### Option 1: Automatic Migration (Recommended for Development)
If you're using `spring.jpa.hibernate.ddl-auto=update`, Hibernate will automatically add the columns when you restart the Spring Boot application.

**Important:** You still need to set default values for existing users.

### Option 2: Manual Migration (Recommended for Production)

Run the provided `migration.sql` script:

```bash
mysql -u root -p ecommerce < migration.sql
```

Or manually execute:

```sql
-- Add columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT 'password123';
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- Update existing users
UPDATE users SET password = 'password123' WHERE password IS NULL OR password = '';
UPDATE users SET role = 'USER' WHERE role IS NULL OR role = '';
```

### Create an Admin User

To create an admin user, either:

1. Register through the app and manually update the role in database:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

2. Or directly insert into database:
```sql
INSERT INTO users (name, email, password, role, address) 
VALUES ('Admin User', 'admin@example.com', 'admin123', 'ADMIN', 'Admin Address');
```

## Testing the Implementation

### 1. Test User Registration
1. Navigate to `/register`
2. Fill in: name, email, password, address
3. Submit - should create user with USER role
4. Should redirect to `/products`

### 2. Test User Login
1. Navigate to `/login`
2. Enter email and password
3. Submit - should authenticate and redirect based on role:
   - USER role → `/products`
   - ADMIN role → `/admin`

### 3. Test Admin Access
1. Login as an ADMIN user
2. You should see "Admin Panel" button in navbar
3. Access admin pages:
   - `/admin` - Dashboard
   - `/admin/products` - Manage Products
   - `/admin/orders` - Manage Orders
   - `/admin/users` - Manage Users

### 4. Test Authorization
1. Login as a regular USER
2. Try accessing `/admin` directly
3. Should be redirected to home with error message
4. Admin Panel link should NOT appear in navbar

## Security Considerations

⚠️ **Important:** This implementation uses plain text passwords for simplicity. 

**For Production, you MUST:**
1. Implement password hashing (BCrypt, Argon2, etc.)
2. Add Spring Security for proper authentication
3. Implement JWT or session-based authentication
4. Add CSRF protection
5. Use HTTPS for all communications
6. Add rate limiting on login attempts
7. Implement password strength requirements
8. Add password reset functionality

## API Endpoints

### Authentication
- `POST /api/users/login` - Authenticate user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### User Management
All existing endpoints remain the same but now require `password` and `role` fields:

- `POST /api/users` - Create user (requires password and role)
- `PUT /api/users/{id}` - Update user (can update password and role)
- `GET /api/users` - Get all users (includes password and role)
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email
- `DELETE /api/users/{id}` - Delete user

## Default Credentials

After running the migration:
- **All existing users** have password: `password123`
- **All existing users** have role: `USER`

You should inform users to change their passwords after first login (once password change functionality is implemented).

## Troubleshooting

### Issue: Can't access admin pages
- **Solution:** Ensure your user has role = 'ADMIN' in database

### Issue: "Invalid email or password" on login
- **Solution:** Verify the password in database is correct (default: 'password123')

### Issue: Getting redirected from admin pages
- **Solution:** Check browser console for error messages. Ensure you're logged in and have ADMIN role

### Issue: Migration script fails
- **Solution:** Check if columns already exist. Drop them first if needed:
  ```sql
  ALTER TABLE users DROP COLUMN password;
  ALTER TABLE users DROP COLUMN role;
  ```

## Next Steps

Consider implementing:
1. Password hashing with BCrypt
2. Spring Security integration
3. JWT-based authentication
4. Password reset functionality
5. Email verification
6. Two-factor authentication
7. Session management
8. Audit logging
9. Role-based permissions (fine-grained access control)
10. Password change functionality

## Files Modified

### Backend
- `src/main/java/com/example/ecommerce/models/User.java`
- `src/main/java/com/example/ecommerce/models/Role.java` (new)
- `src/main/java/com/example/ecommerce/dto/UserDTO.java`
- `src/main/java/com/example/ecommerce/dto/LoginDTO.java` (new)
- `src/main/java/com/example/ecommerce/services/UserService.java`
- `src/main/java/com/example/ecommerce/controllers/UserController.java`

### Frontend
- `frontend/lib/types.ts`
- `frontend/lib/api.ts`
- `frontend/components/providers/user-provider.tsx`
- `frontend/components/navbar.tsx`
- `frontend/app/login/page.tsx`
- `frontend/app/register/page.tsx`
- `frontend/app/admin/page.tsx`
- `frontend/app/admin/products/page.tsx`
- `frontend/app/admin/orders/page.tsx`
- `frontend/app/admin/users/page.tsx`

### Database
- `migration.sql` (new)
