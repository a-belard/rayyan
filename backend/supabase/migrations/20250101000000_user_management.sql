-- Database Migration for User Management System
-- Run this SQL in Supabase SQL Editor
-- This creates all tables, indexes, triggers, and RLS policies

-- ==================== Enable Required Extensions ====================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geographic queries (optional)

-- ==================== Create Enums ====================

CREATE TYPE user_role AS ENUM ('admin', 'farmer', 'agronomist', 'viewer');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE message_role AS ENUM ('user', 'assistant', 'system');
CREATE TYPE run_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

-- ==================== Create Tables ====================

-- 1. Users Table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'farmer',
    status user_status NOT NULL DEFAULT 'active',
    avatar_url VARCHAR(500),
    bio TEXT,
    organization_name VARCHAR(255),
    farm_location VARCHAR(500),
    farm_size_hectares FLOAT,
    primary_crops JSONB DEFAULT '[]'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    subscription_tier VARCHAR(50),
    subscription_expires_at TIMESTAMPTZ,
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- 2. Farms Table
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(500),
    latitude FLOAT CHECK (latitude >= -90 AND latitude <= 90),
    longitude FLOAT CHECK (longitude >= -180 AND longitude <= 180),
    size_hectares FLOAT CHECK (size_hectares > 0),
    soil_type VARCHAR(100),
    irrigation_type VARCHAR(100),
    crops JSONB DEFAULT '[]'::jsonb,
    zones JSONB DEFAULT '[]'::jsonb,
    metadata_ JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Threads Table (updated with farm_id)
CREATE TABLE IF NOT EXISTS threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES farms(id) ON DELETE SET NULL,
    title VARCHAR(255),
    is_pinned BOOLEAN DEFAULT FALSE,
    metadata_ JSONB DEFAULT '{}'::jsonb,
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Runs Table
CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    status run_status NOT NULL DEFAULT 'pending',
    metadata_ JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    completed_at TIMESTAMPTZ
);

-- ==================== Create Indexes ====================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- Farms indexes
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_farms_is_active ON farms(is_active);
CREATE INDEX IF NOT EXISTS idx_farms_owner_active ON farms(owner_id, is_active);

-- Threads indexes
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_farm_id ON threads(farm_id);
CREATE INDEX IF NOT EXISTS idx_threads_last_message_at ON threads(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_user_pinned ON threads(user_id, is_pinned, last_message_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_position ON messages(thread_id, position);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Runs indexes
CREATE INDEX IF NOT EXISTS idx_runs_thread_id ON runs(thread_id);
CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_started_at ON runs(started_at DESC);

-- ==================== Create Functions ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync new auth users to users table
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, created_at)
    VALUES (NEW.id, NEW.email, NEW.created_at)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update thread last_message_at
CREATE OR REPLACE FUNCTION update_thread_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE threads 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.thread_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate thread title from first message
CREATE OR REPLACE FUNCTION generate_thread_title()
RETURNS TRIGGER AS $$
DECLARE
    first_message TEXT;
BEGIN
    IF NEW.title IS NULL OR NEW.title = '' THEN
        -- Get first user message
        SELECT content INTO first_message
        FROM messages
        WHERE thread_id = NEW.id 
          AND role = 'user'
        ORDER BY position
        LIMIT 1;
        
        IF first_message IS NOT NULL THEN
            -- Truncate to 50 characters and add ellipsis
            NEW.title := SUBSTRING(first_message FROM 1 FOR 50);
            IF LENGTH(first_message) > 50 THEN
                NEW.title := NEW.title || '...';
            END IF;
        ELSE
            NEW.title := 'New Conversation';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================== Create Triggers ====================

-- Trigger: Update updated_at on users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on farms
CREATE TRIGGER update_farms_updated_at
    BEFORE UPDATE ON farms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on threads
CREATE TRIGGER update_threads_updated_at
    BEFORE UPDATE ON threads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Sync new auth users to users table
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger: Update thread last_message_at when message is created
CREATE TRIGGER update_thread_timestamp
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_thread_last_message();

-- ==================== Enable Row Level Security ====================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE runs ENABLE ROW LEVEL SECURITY;

-- ==================== Create RLS Policies ====================

-- Users Policies
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all users"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Farms Policies
CREATE POLICY "Users can view own farms"
    ON farms FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own farms"
    ON farms FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own farms"
    ON farms FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own farms"
    ON farms FOR DELETE
    USING (auth.uid() = owner_id);

CREATE POLICY "Admins can view all farms"
    ON farms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Threads Policies
CREATE POLICY "Users can view own threads"
    ON threads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own threads"
    ON threads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads"
    ON threads FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own threads"
    ON threads FOR DELETE
    USING (auth.uid() = user_id);

-- Messages Policies
CREATE POLICY "Users can view messages in own threads"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in own threads"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.id = messages.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

-- Runs Policies
CREATE POLICY "Users can view runs in own threads"
    ON runs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.id = runs.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert runs in own threads"
    ON runs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.id = runs.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update runs in own threads"
    ON runs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM threads 
            WHERE threads.id = runs.thread_id 
            AND threads.user_id = auth.uid()
        )
    );

-- ==================== Create Views (Optional) ====================

-- View: User with statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.role,
    u.status,
    COUNT(DISTINCT t.id) as thread_count,
    COUNT(DISTINCT f.id) as farm_count,
    COUNT(DISTINCT m.id) as message_count,
    MAX(u.last_login_at) as last_activity,
    u.created_at as member_since
FROM users u
LEFT JOIN threads t ON t.user_id = u.id
LEFT JOIN farms f ON f.owner_id = u.id
LEFT JOIN messages m ON m.thread_id = t.id
GROUP BY u.id;

-- View: Thread with message count
CREATE OR REPLACE VIEW threads_with_stats AS
SELECT 
    t.*,
    COUNT(m.id) as message_count,
    f.name as farm_name
FROM threads t
LEFT JOIN messages m ON m.thread_id = t.id
LEFT JOIN farms f ON f.id = t.farm_id
GROUP BY t.id, f.name;

-- ==================== Insert Default Admin (Optional) ====================

-- Uncomment and modify with your admin user ID from Supabase Auth
-- INSERT INTO users (id, email, role, status, full_name)
-- VALUES (
--     'your-admin-user-id-from-auth',
--     'admin@rayyan.com',
--     'admin',
--     'active',
--     'Admin User'
-- )
-- ON CONFLICT (id) DO UPDATE 
-- SET role = 'admin', status = 'active';

-- ==================== Grant Permissions ====================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==================== Complete! ====================

-- Migration complete!
-- Next steps:
-- 1. Create your first admin user via Supabase Auth
-- 2. Update the INSERT statement above with admin user ID
-- 3. Test authentication and user creation
-- 4. Start using the API endpoints

SELECT 'Database migration completed successfully!' as status;
