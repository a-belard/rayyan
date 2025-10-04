# User Management Setup Guide

This guide explains how to set up the user management system for the Rayyan platform.

## Overview

The Rayyan platform uses **Supabase Auth** for authentication combined with a custom PostgreSQL schema for user profiles, farms, and chat thread management. This design provides:

- 🔐 Secure authentication via Supabase Auth
- 👤 Rich user profiles with agricultural context
- 🏡 Farm/property management
- 💬 User-assigned chat threads
- 🔒 Row-level security (RLS)
- 🎭 Role-based access control (RBAC)

## Architecture

```
Supabase Auth (auth.users)
    ↓
Users Table (extends auth.users)
    ↓
├── Farms (owned by user)
└── Threads (assigned to user)
        ↓
        Messages (in threads)
```

## Step 1: Run Database Migration

### Option A: Using Supabase Dashboard

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Open the migration file: `backend/migrations/001_user_management.sql`
4. Copy the entire SQL content
5. Paste into SQL Editor
6. Click **Run**
7. Verify all tables are created under **Table Editor**

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migration
supabase db push
```

### Verify Migration

Check that these tables exist:
- ✅ `users`
- ✅ `farms`
- ✅ `threads`
- ✅ `messages`
- ✅ `runs`

## Step 2: Configure Environment Variables

Update your `backend/.env` file:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-public-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here  # For admin operations

# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# JWT Secret (for token validation)
SUPABASE_JWT_SECRET=your-jwt-secret-from-supabase
```

**Where to find these values:**
- Go to: https://app.supabase.com/project/your-project/settings/api
- `SUPABASE_URL`: Project URL
- `SUPABASE_KEY`: `anon` `public` key
- `SUPABASE_SERVICE_KEY`: `service_role` `secret` key
- `DATABASE_URL`: Settings → Database → Connection string (Direct connection)
- `SUPABASE_JWT_SECRET`: Settings → API → JWT Settings → JWT Secret

## Step 3: Create First Admin User

### Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Click **Create user**
5. Copy the **User ID** (UUID)

### Update User to Admin

Run this SQL in SQL Editor (replace `your-user-id`):

```sql
INSERT INTO users (id, email, role, status, full_name)
VALUES (
    'your-user-id-from-auth',  -- Replace with actual UUID
    'admin@rayyan.com',         -- Replace with actual email
    'admin',
    'active',
    'Admin User'
)
ON CONFLICT (id) DO UPDATE 
SET role = 'admin', status = 'active';
```

## Step 4: Test Authentication

### Using cURL

```bash
# 1. Sign in to get JWT token
curl -X POST 'https://your-project-ref.supabase.co/auth/v1/token?grant_type=password' \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rayyan.com",
    "password": "your-password"
  }'

# Response includes: access_token, refresh_token

# 2. Test authenticated endpoint
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer your-access-token"
```

### Using Python

```python
from supabase import create_client

# Initialize client
supabase = create_client(
    "https://your-project-ref.supabase.co",
    "your-anon-key"
)

# Sign in
response = supabase.auth.sign_in_with_password({
    "email": "admin@rayyan.com",
    "password": "your-password"
})

print(f"Access Token: {response.session.access_token}")
print(f"User ID: {response.user.id}")
```

## Step 5: Start Backend Server

```bash
cd backend

# Install dependencies (if not already done)
uv pip install -e .

# Start server
python main.py

# Server starts at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

## Step 6: Test API Endpoints

### Get Current User Profile

```bash
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer your-jwt-token"
```

### Update User Profile

```bash
curl -X PATCH http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Farmer",
    "phone": "+1234567890",
    "organization_name": "Green Valley Farm",
    "farm_location": "California, USA",
    "primary_crops": ["tomatoes", "lettuce"]
  }'
```

### Create a Farm

```bash
curl -X POST http://localhost:8000/api/v1/farms \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "North Field",
    "location": "Green Valley, CA",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "size_hectares": 5.5,
    "soil_type": "loamy",
    "irrigation_type": "drip",
    "crops": ["tomatoes", "peppers"],
    "zones": [
      {
        "id": "zone-1",
        "name": "Tomato Section",
        "crop": "tomatoes",
        "area_hectares": 2.5
      }
    ]
  }'
```

### Create a Thread (with Farm Context)

```bash
curl -X POST http://localhost:8000/api/v1/threads \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Irrigation Help",
    "farm_id": "your-farm-id",
    "metadata": {
      "context": {
        "zone": "zone-1",
        "crop": "tomatoes"
      }
    }
  }'
```

## User Roles and Permissions

### Role Hierarchy

1. **Admin** - Full system access
   - Manage all users
   - View all farms and threads
   - System configuration

2. **Agronomist** - Agricultural expert
   - Can view multiple farms (with permission)
   - Provide expert advice
   - Cannot manage users

3. **Farmer** - Regular user
   - Manage own farms
   - Create threads
   - Chat with AI agent

4. **Viewer** - Read-only access
   - View shared content only
   - Cannot create or modify

### User Status

- **Active**: Can use the system normally
- **Pending**: Awaiting approval (new registrations)
- **Inactive**: Temporarily disabled
- **Suspended**: Blocked by admin

## Common Operations

### Change User Role (Admin Only)

```sql
UPDATE users 
SET role = 'agronomist' 
WHERE email = 'expert@example.com';
```

### Suspend User (Admin Only)

```sql
UPDATE users 
SET status = 'suspended' 
WHERE email = 'user@example.com';
```

### Get User Statistics

```sql
SELECT * FROM user_stats 
WHERE id = 'user-uuid';
```

### Find All Threads for a Farm

```sql
SELECT t.*, COUNT(m.id) as message_count
FROM threads t
LEFT JOIN messages m ON m.thread_id = t.id
WHERE t.farm_id = 'farm-uuid'
GROUP BY t.id
ORDER BY t.last_message_at DESC;
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Never expose `SUPABASE_SERVICE_KEY` in frontend**
3. **Enable RLS on all tables** (done in migration)
4. **Validate JWT tokens** on every request
5. **Use environment variables** for secrets
6. **Implement rate limiting** for API endpoints
7. **Log authentication attempts**
8. **Regular security audits**

## Troubleshooting

### Issue: "User not found in database"

**Cause**: Auth user exists but not in `users` table.

**Solution**: Check that the trigger is working:
```sql
-- Test trigger
SELECT handle_new_user();

-- Or manually insert
INSERT INTO users (id, email, role, status)
VALUES ('auth-user-id', 'user@example.com', 'farmer', 'active');
```

### Issue: "Token expired"

**Cause**: JWT token has expired (default: 1 hour).

**Solution**: Refresh the token:
```python
response = supabase.auth.refresh_session()
new_token = response.session.access_token
```

### Issue: "Permission denied"

**Cause**: User doesn't have required role.

**Solution**: Check user role:
```sql
SELECT id, email, role, status FROM users WHERE id = 'user-id';
```

Update role if needed (as admin).

### Issue: "RLS policy violation"

**Cause**: Row Level Security preventing access.

**Solution**: Verify RLS policies:
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'threads';

-- Temporarily disable RLS for debugging (NOT for production!)
ALTER TABLE threads DISABLE ROW LEVEL SECURITY;
```

## Next Steps

1. ✅ Set up user management system
2. ✅ Create admin user
3. ✅ Test authentication
4. 📱 Implement frontend authentication
5. 🔗 Connect chat UI to user system
6. 🌾 Create farm management UI
7. 📊 Add user analytics dashboard
8. 📧 Implement email notifications
9. 🔔 Add push notifications
10. 📱 Mobile app integration

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Complete schema documentation
- [Supabase Dashboard](https://app.supabase.com)

---

Your user management system is now ready! 🎉
