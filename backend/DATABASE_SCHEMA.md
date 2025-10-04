# Database Schema Design - User Management

## Overview

The Rayyan platform uses **Supabase Auth** for authentication and a custom PostgreSQL schema for user profiles, farm management, and chat threads. This design ensures secure user management with the ability to assign chat threads to specific users.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Auth                            │
│              (auth.users table - managed)                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ id (UUID)
                   ↓
┌─────────────────────────────────────────────────────────────┐
│                 Users Table (public.users)                   │
│         Extends auth.users with profile data                 │
└──────────┬──────────────────────────────┬───────────────────┘
           │                               │
           │ user_id (FK)                  │ owner_id (FK)
           ↓                               ↓
    ┌──────────────┐              ┌──────────────────┐
    │   Threads    │              │      Farms       │
    │  (Chats)     │              │   (Properties)   │
    └──────┬───────┘              └────────┬─────────┘
           │                               │
           │ thread_id (FK)                │ farm_id (FK)
           ↓                               ↓
    ┌──────────────┐                    (Link)
    │   Messages   │                      ↓
    └──────────────┘                  Threads (optional)
```

## Tables

### 1. Users (`users`)

Extends Supabase Auth users with profile and agricultural context.

**Purpose**: Store user profile, preferences, and farm-related information.

**Columns**:
```sql
id                      VARCHAR(36)    PRIMARY KEY    -- Matches auth.users.id
email                   VARCHAR(255)   UNIQUE NOT NULL
full_name               VARCHAR(255)
phone                   VARCHAR(20)
role                    ENUM           NOT NULL       -- admin, farmer, agronomist, viewer
status                  ENUM           NOT NULL       -- active, inactive, suspended, pending
avatar_url              VARCHAR(500)
bio                     TEXT
organization_name       VARCHAR(255)
farm_location           VARCHAR(500)
farm_size_hectares      FLOAT
primary_crops           JSONB          DEFAULT []
preferences             JSONB          DEFAULT {}
subscription_tier       VARCHAR(50)
subscription_expires_at TIMESTAMP WITH TIME ZONE
metadata_               JSONB          DEFAULT {}
created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
last_login_at           TIMESTAMP WITH TIME ZONE
deleted_at              TIMESTAMP WITH TIME ZONE  -- Soft delete
```

**Indexes**:
- `idx_users_email` on `email`
- `idx_users_role` on `role`
- `idx_users_status` on `status`
- `idx_users_deleted_at` on `deleted_at` (for soft delete queries)

**User Roles**:
- `admin`: Full system access, user management
- `farmer`: Regular user with farm management
- `agronomist`: Agricultural expert, can view multiple farms
- `viewer`: Read-only access

**User Status**:
- `active`: Can use the system
- `inactive`: Account disabled temporarily
- `suspended`: Account suspended by admin
- `pending`: Awaiting approval/verification

**Preferences Structure**:
```json
{
  "language": "en",
  "timezone": "America/New_York",
  "notifications_enabled": true,
  "email_notifications": true,
  "sms_notifications": false,
  "default_units": "metric",
  "theme": "light",
  "default_farm_id": "farm-uuid"
}
```

### 2. Farms (`farms`)

Agricultural properties/fields owned by users.

**Purpose**: Store farm/field information for contextual recommendations.

**Columns**:
```sql
id                VARCHAR(36)    PRIMARY KEY
owner_id          VARCHAR(36)    FK(users.id) ON DELETE CASCADE
name              VARCHAR(255)   NOT NULL
location          VARCHAR(500)
latitude          FLOAT
longitude         FLOAT
size_hectares     FLOAT
soil_type         VARCHAR(100)
irrigation_type   VARCHAR(100)
crops             JSONB          DEFAULT []
zones             JSONB          DEFAULT []
metadata_         JSONB          DEFAULT {}
is_active         BOOLEAN        DEFAULT TRUE
created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Indexes**:
- `idx_farms_owner_id` on `owner_id`
- `idx_farms_is_active` on `is_active`
- `idx_farms_location` (GiST index on geography for spatial queries)

**Zones Structure**:
```json
[
  {
    "id": "zone-1",
    "name": "North Field",
    "crop": "tomatoes",
    "crop_variety": "Roma",
    "area_hectares": 2.5,
    "planting_date": "2025-03-15",
    "growth_stage": "vegetative",
    "sensors": ["sensor-1", "sensor-2"]
  }
]
```

### 3. Threads (`threads`)

Chat conversations between users and the AI agent.

**Purpose**: Organize user conversations with chat history.

**Columns**:
```sql
id               VARCHAR(36)    PRIMARY KEY
user_id          VARCHAR(36)    FK(users.id) ON DELETE CASCADE    -- Thread owner
farm_id          VARCHAR(36)    FK(farms.id) ON DELETE SET NULL   -- Optional farm context
title            VARCHAR(255)
is_pinned        BOOLEAN        DEFAULT FALSE
metadata_        JSONB          DEFAULT {}
last_message_at  TIMESTAMP WITH TIME ZONE
created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Indexes**:
- `idx_threads_user_id` on `user_id`
- `idx_threads_farm_id` on `farm_id`
- `idx_threads_last_message_at` on `last_message_at` (for sorting)
- `idx_threads_user_pinned` on `(user_id, is_pinned, last_message_at)`

**Metadata Structure**:
```json
{
  "context": {
    "farm_name": "Green Valley Farm",
    "zone": "North Field",
    "crop": "tomatoes"
  },
  "tags": ["irrigation", "pest-control"],
  "shared_with": []
}
```

### 4. Messages (`messages`)

Individual messages within threads.

**Purpose**: Store conversation history with role and metadata.

**Columns**:
```sql
id          VARCHAR(36)    PRIMARY KEY
thread_id   VARCHAR(36)    FK(threads.id) ON DELETE CASCADE
position    INTEGER        NOT NULL
role        ENUM           NOT NULL    -- user, assistant, system
content     TEXT           NOT NULL
metadata_   JSONB          DEFAULT {}
created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

**Indexes**:
- `idx_messages_thread_id` on `thread_id`
- `idx_messages_thread_position` on `(thread_id, position)`

**Message Roles**:
- `user`: Messages from the user
- `assistant`: Messages from the AI agent
- `system`: System messages (context, instructions)

**Metadata Structure**:
```json
{
  "tool_calls": [
    {
      "tool": "analyze_soil_conditions",
      "args": {"zone_id": "zone-1"},
      "result": {...}
    }
  ],
  "reasoning": "Checking soil moisture before irrigation",
  "confidence": 0.95,
  "sources": ["sensor-data", "weather-api"]
}
```

### 5. Runs (`runs`)

Agent execution runs (tool calls and LLM interactions).

**Purpose**: Track agent execution history for debugging and analytics.

**Columns**:
```sql
id            VARCHAR(36)    PRIMARY KEY
thread_id     VARCHAR(36)    FK(threads.id) ON DELETE CASCADE
status        ENUM           NOT NULL    -- pending, running, completed, failed, cancelled
metadata_     JSONB          DEFAULT {}
started_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
completed_at  TIMESTAMP WITH TIME ZONE
```

**Indexes**:
- `idx_runs_thread_id` on `thread_id`
- `idx_runs_status` on `status`

## Relationships

### User → Threads (One-to-Many)
- A user can have multiple chat threads
- When a user is deleted, all their threads are deleted (CASCADE)

### User → Farms (One-to-Many)
- A user can own multiple farms
- When a user is deleted, all their farms are deleted (CASCADE)

### Farm → Threads (One-to-Many, Optional)
- A thread can optionally be linked to a specific farm for context
- When a farm is deleted, threads are unlinked (SET NULL)

### Thread → Messages (One-to-Many)
- A thread contains multiple messages
- Messages are ordered by position
- When a thread is deleted, all messages are deleted (CASCADE)

### Thread → Runs (One-to-Many)
- A thread can have multiple agent runs
- When a thread is deleted, all runs are deleted (CASCADE)

## Security with Supabase

### Row Level Security (RLS)

**Enable RLS on all tables:**
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;
```

**RLS Policies:**

#### Users Table
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### Farms Table
```sql
-- Users can view their own farms
CREATE POLICY "Users can view own farms"
  ON farms FOR SELECT
  USING (auth.uid() = owner_id);

-- Users can manage their own farms
CREATE POLICY "Users can manage own farms"
  ON farms FOR ALL
  USING (auth.uid() = owner_id);
```

#### Threads Table
```sql
-- Users can view their own threads
CREATE POLICY "Users can view own threads"
  ON threads FOR SELECT
  USING (auth.uid() = user_id);

-- Users can manage their own threads
CREATE POLICY "Users can manage own threads"
  ON threads FOR ALL
  USING (auth.uid() = user_id);
```

#### Messages Table
```sql
-- Users can view messages in their threads
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );

-- Users can create messages in their threads
CREATE POLICY "Users can create own messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM threads 
      WHERE threads.id = messages.thread_id 
      AND threads.user_id = auth.uid()
    )
  );
```

## Database Triggers

### Update user last_login_at
```sql
CREATE OR REPLACE FUNCTION update_user_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET last_login_at = NOW() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach to auth.users (if accessible)
-- Or update via API on login
```

### Update thread last_message_at
```sql
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE threads 
  SET last_message_at = NEW.created_at 
  WHERE id = NEW.thread_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_thread_last_message();
```

### Auto-generate thread title
```sql
CREATE OR REPLACE FUNCTION generate_thread_title()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.title IS NULL THEN
    -- Set title from first user message (to be implemented in application)
    NEW.title := 'New Conversation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_default_thread_title
BEFORE INSERT ON threads
FOR EACH ROW
EXECUTE FUNCTION generate_thread_title();
```

## Migration Strategy

### 1. Initial Setup
```bash
# Create tables in order (respecting foreign keys)
1. users
2. farms
3. threads
4. messages
5. runs
```

### 2. Sync with Supabase Auth
```sql
-- Create function to sync new auth users to users table
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## Queries Examples

### Get user with thread count
```sql
SELECT 
  u.*,
  COUNT(DISTINCT t.id) as thread_count,
  COUNT(DISTINCT f.id) as farm_count
FROM users u
LEFT JOIN threads t ON t.user_id = u.id
LEFT JOIN farms f ON f.owner_id = u.id
WHERE u.id = 'user-uuid'
GROUP BY u.id;
```

### Get user's recent threads
```sql
SELECT 
  t.*,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_message_at
FROM threads t
LEFT JOIN messages m ON m.thread_id = t.id
WHERE t.user_id = 'user-uuid'
  AND t.deleted_at IS NULL
GROUP BY t.id
ORDER BY t.is_pinned DESC, t.last_message_at DESC
LIMIT 20;
```

### Get thread with messages and farm context
```sql
SELECT 
  t.*,
  f.name as farm_name,
  f.location as farm_location,
  json_agg(
    json_build_object(
      'id', m.id,
      'role', m.role,
      'content', m.content,
      'created_at', m.created_at
    ) ORDER BY m.position
  ) as messages
FROM threads t
LEFT JOIN farms f ON f.id = t.farm_id
LEFT JOIN messages m ON m.thread_id = t.id
WHERE t.id = 'thread-uuid'
  AND t.user_id = 'user-uuid'
GROUP BY t.id, f.id;
```

## Best Practices

1. **Always use Supabase Auth for authentication**
2. **Sync auth.users.id with users.id** (use trigger)
3. **Enable RLS on all tables** for security
4. **Use UUIDs for primary keys** (better for distributed systems)
5. **Use JSONB for flexible metadata** (farm zones, preferences, etc.)
6. **Index foreign keys** for performance
7. **Use CASCADE delete** where appropriate
8. **Soft delete users** (deleted_at) to preserve data integrity
9. **Store timestamps with timezone** (TIMESTAMP WITH TIME ZONE)
10. **Validate data at application level** (Pydantic models)

## Future Enhancements

1. **User Groups/Teams**: Allow multiple users to collaborate on farms
2. **Shared Threads**: Share conversations with other users
3. **Thread Templates**: Pre-configured threads for common tasks
4. **Message Attachments**: Store images, PDFs (using Supabase Storage)
5. **Thread Tags/Categories**: Organize threads by topic
6. **User Activity Log**: Track user actions for audit
7. **Notifications**: In-app and push notifications
8. **API Keys**: For programmatic access (IoT devices)

---

This schema design provides a solid foundation for user management with chat thread assignment while maintaining security and scalability.
