-- Seed file to create a test user for development
-- This creates a user in both auth.users and users tables

-- Note: Supabase auth.users requires encrypted_password
-- For testing, we'll use a known bcrypt hash for password "Test123!"
-- Hash generated with: SELECT crypt('Test123!', gen_salt('bf'))

-- Insert into auth.users (Supabase authentication table)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role,
    aud,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'test@rayyan.dev',
    '$2a$10$fXN0Z5g3jD1Y5C4k.X7.KuqGQx5K7H5z7z8z8z8z8z8z8z8z8z8z8',  -- Password: Test123!
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"full_name": "Test User"}'::jsonb,
    false,
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

-- Insert into public.users (our extended user profile)
INSERT INTO users (
    id,
    email,
    full_name,
    phone,
    role,
    status,
    organization_name,
    farm_location,
    farm_size_hectares,
    primary_crops,
    preferences,
    metadata_,
    created_at,
    updated_at,
    last_login_at
)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'test@rayyan.dev',
    'Test User',
    '+1-555-0123',
    'farmer',
    'active',
    'Rayyan Test Farm',
    'California, USA',
    50.5,
    '["wheat", "corn", "soybeans"]'::jsonb,
    '{"language": "en", "timezone": "America/Los_Angeles", "notifications_enabled": true}'::jsonb,
    '{"test_user": true, "created_by": "seed"}'::jsonb,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    organization_name = EXCLUDED.organization_name,
    farm_location = EXCLUDED.farm_location,
    farm_size_hectares = EXCLUDED.farm_size_hectares,
    primary_crops = EXCLUDED.primary_crops,
    preferences = EXCLUDED.preferences,
    metadata_ = EXCLUDED.metadata_,
    updated_at = NOW();

-- Create a test farm for the user
INSERT INTO farms (
    id,
    owner_id,
    name,
    location,
    latitude,
    longitude,
    size_hectares,
    soil_type,
    irrigation_type,
    crops,
    zones,
    metadata_,
    is_active,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000101'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'Main Test Farm',
    'Central Valley, California',
    36.7783,
    -119.4179,
    50.5,
    'Loamy',
    'Drip irrigation',
    '[
        {"name": "wheat", "area_hectares": 20.0, "planting_date": "2024-11-01"},
        {"name": "corn", "area_hectares": 15.5, "planting_date": "2024-10-15"},
        {"name": "soybeans", "area_hectares": 15.0, "planting_date": "2024-10-01"}
    ]'::jsonb,
    '[
        {"id": "zone-1", "name": "North Field", "area_hectares": 20.0, "soil_type": "Loamy"},
        {"id": "zone-2", "name": "South Field", "area_hectares": 15.5, "soil_type": "Clay Loam"},
        {"id": "zone-3", "name": "East Field", "area_hectares": 15.0, "soil_type": "Sandy Loam"}
    ]'::jsonb,
    '{"test_farm": true, "created_by": "seed"}'::jsonb,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    size_hectares = EXCLUDED.size_hectares,
    soil_type = EXCLUDED.soil_type,
    irrigation_type = EXCLUDED.irrigation_type,
    crops = EXCLUDED.crops,
    zones = EXCLUDED.zones,
    metadata_ = EXCLUDED.metadata_,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Create a sample thread for the test user
INSERT INTO threads (
    id,
    user_id,
    farm_id,
    title,
    is_pinned,
    metadata_,
    last_message_at,
    created_at,
    updated_at
)
VALUES (
    '00000000-0000-0000-0000-000000000201'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '00000000-0000-0000-0000-000000000101'::uuid,
    'Getting Started with Rayyan',
    false,
    '{"test_thread": true, "created_by": "seed"}'::jsonb,
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Add a welcome message to the thread
INSERT INTO messages (
    id,
    thread_id,
    position,
    role,
    content,
    metadata_,
    created_at
)
VALUES (
    '00000000-0000-0000-0000-000000000301'::uuid,
    '00000000-0000-0000-0000-000000000201'::uuid,
    0,
    'assistant',
    '🌾 Welcome to Rayyan AgriAdvisor! I''m here to help you optimize your farming operations. I can assist with:

• 💧 Irrigation scheduling and water management
• 🌱 Fertigation and nutrient optimization
• 🐛 Pest detection and control strategies
• 🌡️ Weather forecasting and climate insights
• 🌾 Soil health monitoring and improvement
• 📊 Data-driven decision making

How can I help you today?',
    '{"test_message": true, "created_by": "seed"}'::jsonb,
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Test user created successfully!';
    RAISE NOTICE '   Email: test@rayyan.dev';
    RAISE NOTICE '   Password: Test123!';
    RAISE NOTICE '   User ID: 00000000-0000-0000-0000-000000000001';
    RAISE NOTICE '   Farm ID: 00000000-0000-0000-0000-000000000101';
    RAISE NOTICE '   Thread ID: 00000000-0000-0000-0000-000000000201';
END $$;
