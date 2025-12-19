# Quick Start Guide - Authentication & Authorization

## What's New?

Your E-commerce application now has:
- ✅ Password-based authentication
- ✅ Role-based authorization (USER and ADMIN roles)
- ✅ Protected admin pages
- ✅ Secure login/registration

## Getting Started

### 1. Run Database Migration

First, apply the database schema changes:

```bash
cd /Users/jaskrrishsingh/jas/fsd-faaltu/ecommerce
mysql -u root -p ecommerce < migration.sql
```

Or execute manually in MySQL:
```sql
ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'password123';
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';
UPDATE users SET password = 'password123', role = 'USER' WHERE password IS NULL;
```

### 2. Create an Admin User

Option A: Update an existing user:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Option B: Create a new admin:
```sql
INSERT INTO users (name, email, password, role, address) 
VALUES ('Admin', 'admin@example.com', 'admin123', 'ADMIN', '123 Admin St');
```

### 3. Start the Backend

```bash
cd /Users/jaskrrishsingh/jas/fsd-faaltu/ecommerce
./mvnw spring-boot:run
```

### 4. Start the Frontend

```bash
cd /Users/jaskrrishsingh/jas/fsd-faaltu/ecommerce/frontend
bun run dev
```

## Testing

### Test Regular User
1. Go to http://localhost:3000/register
2. Create an account
3. You'll be redirected to `/products`
4. You can view products and place orders
5. No admin link in navbar

### Test Admin User
1. Go to http://localhost:3000/login
2. Login with admin credentials
3. You'll be redirected to `/admin`
4. You'll see "Admin Panel" button in navbar
5. Access admin features:
   - Dashboard with stats
   - Manage Products (add/edit/delete)
   - Manage Orders (view/update status)
   - Manage Users (view/delete with role badges)

## Default Login Credentials

After migration, all existing users have:
- **Password:** `password123`
- **Role:** `USER`

Admin users you create will have the password you set.

## Key Features

### Authentication
- Login with email and password
- Registration requires password
- Password minimum length: 6 characters
- Session persists in localStorage

### Authorization
- Regular users can't access `/admin` routes
- Admin users see "Admin Panel" in navbar
- Navigation adapts based on user role
- Automatic redirect on unauthorized access

### User Interface
- Login page with email and password fields
- Register page with password field
- Admin users page shows role badges
- Shield icon for admin users

## API Endpoints

```
POST /api/users/login        - Login (email, password)
POST /api/users              - Register (name, email, password, role, address)
GET  /api/users              - Get all users
GET  /api/users/{id}         - Get user by ID
GET  /api/users/email/{email} - Get user by email
PUT  /api/users/{id}         - Update user
DELETE /api/users/{id}       - Delete user
```

## Important Notes

⚠️ **Security Warning:** This implementation uses plain text passwords for simplicity.

**For production, implement:**
- Password hashing (BCrypt)
- Spring Security
- JWT tokens
- HTTPS
- Rate limiting
- CSRF protection

## Need Help?

See [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) for detailed documentation.

## Troubleshooting

**Can't login?**
- Check database password is 'password123'
- Verify user exists in database

**Can't access admin?**
- Ensure role is 'ADMIN' in database
- Check browser console for errors

**Backend errors?**
- Ensure database migration ran successfully
- Check application logs for errors
