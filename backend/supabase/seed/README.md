# Supabase Seeds

This directory contains seed data for populating the database with test data.

## Available Seeds

### `test_user.sql`
Creates a test user with a farm and sample thread for development.

**Test User Credentials:**
- Email: `test@rayyan.dev`
- Password: `Test123!`
- User ID: `00000000-0000-0000-0000-000000000001`
- Farm ID: `00000000-0000-0000-0000-000000000101`
- Thread ID: `00000000-0000-0000-0000-000000000201`

**What it creates:**
- Test user in `auth.users` and `users` tables
- Main Test Farm with 50.5 hectares
- Sample thread "Getting Started with Rayyan"
- Welcome message from the assistant

## Running Seeds

### Option 1: Using Supabase CLI (Recommended)

```bash
cd backend
supabase db seed test_user.sql
```

### Option 2: Using psql

```bash
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/seed/test_user.sql
```

### Option 3: Supabase Dashboard

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `test_user.sql`
3. Paste and execute

### Option 4: One-liner from project root

```bash
docker exec -i supabase_db_rayyan psql -U postgres -d postgres < backend/supabase/seed/test_user.sql
```

## Notes

- Seeds use `ON CONFLICT DO NOTHING` or `ON CONFLICT DO UPDATE` to avoid duplicates
- Can be run multiple times safely (idempotent)
- Password hash is a valid bcrypt hash for "Test123!"
- All test data uses predictable UUIDs starting with `00000000-0000-0000-0000-...`

## Creating New Seeds

1. Create a new `.sql` file in this directory
2. Use the same pattern with `ON CONFLICT` clauses
3. Add documentation in this README
4. Test with a fresh database to ensure it works

## Security Warning

⚠️ **Never use these credentials in production!** These seeds are for local development only.
