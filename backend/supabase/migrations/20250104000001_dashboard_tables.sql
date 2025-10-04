-- Dashboard Data Tables Migration
-- Creates all tables needed for dashboard and farm-dashboard pages
-- Run Date: 2025-10-04

-- ==================== 1. Sensor Readings Table ====================

CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID NOT NULL REFERENCES farm_zones(id) ON DELETE CASCADE,
    soil_moisture FLOAT CHECK (soil_moisture >= 0 AND soil_moisture <= 100),  -- percentage
    temperature FLOAT,    -- celsius
    humidity FLOAT CHECK (humidity >= 0 AND humidity <= 100),  -- percentage
    soil_ph FLOAT CHECK (soil_ph >= 0 AND soil_ph <= 14),
    reading_timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sensor_zone_time ON sensor_readings(zone_id, reading_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_timestamp ON sensor_readings(reading_timestamp DESC);

COMMENT ON TABLE sensor_readings IS 'Time-series sensor data from IoT devices for each farm zone';
COMMENT ON COLUMN sensor_readings.soil_moisture IS 'Soil moisture percentage (0-100%)';
COMMENT ON COLUMN sensor_readings.soil_ph IS 'Soil pH level (0-14)';

-- ==================== 2. Team Members Table ====================

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Link to users if they have account
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,  -- Senior Worker, Field Specialist, Equipment Operator, etc.
    status VARCHAR(50) DEFAULT 'active',  -- active, break, off-duty, vacation
    current_zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    metadata_ JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    hired_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_team_farm ON team_members(farm_id, is_active);
CREATE INDEX IF NOT EXISTS idx_team_status ON team_members(farm_id, status) WHERE is_active = true;

COMMENT ON TABLE team_members IS 'Farm employees and team members with their current assignments';
COMMENT ON COLUMN team_members.status IS 'Current status: active, break, off-duty, vacation';

-- ==================== 3. Farm Tasks Table ====================

CREATE TABLE IF NOT EXISTS farm_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium',  -- high, medium, low
    status VARCHAR(50) DEFAULT 'pending',  -- pending, in-progress, completed, cancelled
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_farm ON farm_tasks(farm_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON farm_tasks(assigned_to, status) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_tasks_zone ON farm_tasks(zone_id, status);

COMMENT ON TABLE farm_tasks IS 'Tasks assigned to team members for farm operations';
COMMENT ON COLUMN farm_tasks.priority IS 'Task priority: high, medium, low';
COMMENT ON COLUMN farm_tasks.status IS 'Task status: pending, in-progress, completed, cancelled';

-- ==================== 4. Yield Records Table ====================

CREATE TABLE IF NOT EXISTS yield_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID NOT NULL REFERENCES farm_zones(id) ON DELETE CASCADE,
    harvest_date DATE NOT NULL,
    amount FLOAT NOT NULL CHECK (amount > 0),  -- weight
    unit VARCHAR(20) DEFAULT 'kg',  -- kg, lbs, tons
    quality_grade VARCHAR(50),  -- A, B, C, Premium, etc.
    notes TEXT,
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_yield_zone_date ON yield_records(zone_id, harvest_date DESC);
CREATE INDEX IF NOT EXISTS idx_yield_date ON yield_records(harvest_date DESC);

COMMENT ON TABLE yield_records IS 'Harvest and production tracking for each zone';
COMMENT ON COLUMN yield_records.amount IS 'Harvest amount in specified unit';

-- ==================== 5. Water Usage Table ====================

CREATE TABLE IF NOT EXISTS water_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID NOT NULL REFERENCES farm_zones(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    amount FLOAT NOT NULL CHECK (amount >= 0),  -- liters
    irrigation_method VARCHAR(100),  -- drip, sprinkler, flood, manual
    duration_minutes INTEGER CHECK (duration_minutes >= 0),
    efficiency_rating FLOAT CHECK (efficiency_rating >= 0 AND efficiency_rating <= 100),  -- percentage
    cost FLOAT CHECK (cost >= 0),  -- in local currency
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_water_zone_date ON water_usage(zone_id, usage_date DESC);

COMMENT ON TABLE water_usage IS 'Daily water consumption tracking by zone';
COMMENT ON COLUMN water_usage.amount IS 'Water used in liters';

-- ==================== 6. Water Storage Table ====================

CREATE TABLE IF NOT EXISTS water_storage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    capacity FLOAT NOT NULL CHECK (capacity > 0),  -- liters
    current_level FLOAT NOT NULL CHECK (current_level >= 0),  -- liters
    critical_level FLOAT CHECK (critical_level >= 0),  -- alert threshold
    last_refill_date DATE,
    next_refill_date DATE,
    location VARCHAR(255),
    metadata_ JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CHECK (current_level <= capacity)
);

CREATE INDEX IF NOT EXISTS idx_storage_farm ON water_storage(farm_id, is_active);

COMMENT ON TABLE water_storage IS 'Water storage tanks and reservoirs for the farm';
COMMENT ON COLUMN water_storage.critical_level IS 'Alert threshold when level drops below this';

-- ==================== 7. Irrigation Schedules Table ====================

CREATE TABLE IF NOT EXISTS irrigation_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID NOT NULL REFERENCES farm_zones(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    estimated_amount FLOAT CHECK (estimated_amount > 0),  -- liters
    priority VARCHAR(20) DEFAULT 'medium',  -- high, medium, low
    status VARCHAR(50) DEFAULT 'scheduled',  -- scheduled, in-progress, completed, skipped
    completed_at TIMESTAMPTZ,
    actual_amount FLOAT CHECK (actual_amount >= 0),  -- liters actually used
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_irrigation_zone_time ON irrigation_schedules(zone_id, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_irrigation_status ON irrigation_schedules(status, scheduled_time) WHERE status IN ('scheduled', 'in-progress');

COMMENT ON TABLE irrigation_schedules IS 'Planned and executed irrigation events';
COMMENT ON COLUMN irrigation_schedules.status IS 'Event status: scheduled, in-progress, completed, skipped';

-- ==================== 8. Pesticide Inventory Table ====================

CREATE TABLE IF NOT EXISTS pesticide_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100),  -- insecticide, fungicide, herbicide, fertilizer
    current_stock FLOAT NOT NULL CHECK (current_stock >= 0),
    unit VARCHAR(20) NOT NULL,  -- liters, kg, gallons
    capacity FLOAT CHECK (capacity >= 0),  -- storage capacity
    reorder_threshold FLOAT CHECK (reorder_threshold >= 0),
    last_used_date DATE,
    next_order_date DATE,
    cost_per_unit FLOAT CHECK (cost_per_unit >= 0),
    supplier VARCHAR(255),
    metadata_ JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pesticide_farm ON pesticide_inventory(farm_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pesticide_reorder ON pesticide_inventory(farm_id) WHERE current_stock <= reorder_threshold AND is_active = true;

COMMENT ON TABLE pesticide_inventory IS 'Pesticide, fertilizer, and chemical inventory management';
COMMENT ON COLUMN pesticide_inventory.reorder_threshold IS 'Alert when stock drops below this level';

-- ==================== 9. Zone Alerts Table ====================

CREATE TABLE IF NOT EXISTS zone_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID NOT NULL REFERENCES farm_zones(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,  -- info, warning, critical
    message TEXT NOT NULL,
    priority INTEGER DEFAULT 1 CHECK (priority >= 1 AND priority <= 10),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_alerts_zone_status ON zone_alerts(zone_id, is_resolved, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON zone_alerts(alert_type, is_resolved) WHERE is_resolved = false;

COMMENT ON TABLE zone_alerts IS 'Real-time alerts and notifications for farm zones';
COMMENT ON COLUMN zone_alerts.alert_type IS 'Alert severity: info, warning, critical';
COMMENT ON COLUMN zone_alerts.priority IS 'Display priority (1 = highest, 10 = lowest)';

-- ==================== 10. Zone Recommendations Table ====================

CREATE TABLE IF NOT EXISTS zone_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    zone_id UUID NOT NULL REFERENCES farm_zones(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',  -- high, medium, low
    category VARCHAR(100),  -- irrigation, pest-control, fertilization, harvesting, pruning
    is_active BOOLEAN DEFAULT TRUE,
    applied_at TIMESTAMPTZ,
    applied_by UUID REFERENCES users(id),
    effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),  -- 1-5 stars
    feedback TEXT,
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recommendations_zone ON zone_recommendations(zone_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_category ON zone_recommendations(category, is_active);

COMMENT ON TABLE zone_recommendations IS 'AI-generated recommendations and best practices for zones';
COMMENT ON COLUMN zone_recommendations.effectiveness_rating IS 'User feedback rating (1-5 stars)';

-- ==================== Create Triggers ====================

-- Trigger: Update updated_at on team_members
CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on farm_tasks
CREATE TRIGGER update_farm_tasks_updated_at
    BEFORE UPDATE ON farm_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on water_storage
CREATE TRIGGER update_water_storage_updated_at
    BEFORE UPDATE ON water_storage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on irrigation_schedules
CREATE TRIGGER update_irrigation_schedules_updated_at
    BEFORE UPDATE ON irrigation_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on pesticide_inventory
CREATE TRIGGER update_pesticide_inventory_updated_at
    BEFORE UPDATE ON pesticide_inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== Seed Test Data ====================

-- This seed data assumes you already have farms and farm_zones from previous migrations
-- Adjust the UUIDs based on your actual data

-- Get existing farm and zone IDs for seeding
DO $$
DECLARE
    v_farm_id UUID;
    v_zone1_id UUID;
    v_zone2_id UUID;
    v_zone3_id UUID;
    v_user_id UUID;
    v_member1_id UUID;
    v_member2_id UUID;
    v_member3_id UUID;
BEGIN
    -- Get first farm and its zones
    SELECT id INTO v_farm_id FROM farms LIMIT 1;
    SELECT id INTO v_zone1_id FROM farm_zones WHERE farm_id = v_farm_id ORDER BY created_at LIMIT 1;
    SELECT id INTO v_zone2_id FROM farm_zones WHERE farm_id = v_farm_id ORDER BY created_at OFFSET 1 LIMIT 1;
    SELECT id INTO v_zone3_id FROM farm_zones WHERE farm_id = v_farm_id ORDER BY created_at OFFSET 2 LIMIT 1;
    SELECT owner_id INTO v_user_id FROM farms WHERE id = v_farm_id;

    -- Skip seeding if no farm exists
    IF v_farm_id IS NULL THEN
        RAISE NOTICE 'No farms found - skipping seed data';
        RETURN;
    END IF;

    -- Seed team members
    INSERT INTO team_members (id, farm_id, name, role, status, current_zone_id, phone, hired_date) VALUES
    (uuid_generate_v4(), v_farm_id, 'Ahmed Hassan', 'Senior Worker', 'active', v_zone1_id, '+974-1234-5678', '2024-01-15'),
    (uuid_generate_v4(), v_farm_id, 'Maria Rodriguez', 'Field Specialist', 'active', v_zone2_id, '+974-1234-5679', '2024-02-01'),
    (uuid_generate_v4(), v_farm_id, 'John Smith', 'Equipment Operator', 'break', NULL, '+974-1234-5680', '2024-03-10'),
    (uuid_generate_v4(), v_farm_id, 'Sarah Johnson', 'Quality Inspector', 'active', v_zone3_id, '+974-1234-5681', '2024-04-05'),
    (uuid_generate_v4(), v_farm_id, 'Carlos Miguel', 'Irrigation Specialist', 'active', NULL, '+974-1234-5682', '2024-01-20');

    -- Get member IDs for task assignment
    SELECT id INTO v_member1_id FROM team_members WHERE farm_id = v_farm_id AND name = 'Ahmed Hassan';
    SELECT id INTO v_member2_id FROM team_members WHERE farm_id = v_farm_id AND name = 'Maria Rodriguez';
    SELECT id INTO v_member3_id FROM team_members WHERE farm_id = v_farm_id AND name = 'John Smith';

    -- Seed farm tasks
    IF v_member1_id IS NOT NULL THEN
        INSERT INTO farm_tasks (farm_id, zone_id, assigned_to, title, description, priority, status, due_date, created_by) VALUES
        (v_farm_id, v_zone1_id, v_member1_id, 'Water North Field', 'Increase irrigation due to dry conditions', 'high', 'in-progress', NOW() + INTERVAL '2 hours', v_user_id),
        (v_farm_id, v_zone2_id, v_member2_id, 'Pest Inspection - South Field', 'Check for signs of common pests', 'medium', 'pending', NOW() + INTERVAL '4 hours', v_user_id),
        (v_farm_id, v_zone3_id, v_member3_id, 'Harvest East Section', 'Begin harvesting mature crops', 'high', 'in-progress', NOW() + INTERVAL '1 hour', v_user_id),
        (v_farm_id, NULL, v_member1_id, 'Equipment Maintenance', 'Service irrigation pumps', 'low', 'pending', NOW() + INTERVAL '6 hours', v_user_id),
        (v_farm_id, v_zone1_id, v_member2_id, 'Soil Testing', 'Collect samples for pH analysis', 'medium', 'in-progress', NOW() + INTERVAL '3 hours', v_user_id);
    END IF;

    -- Seed sensor readings (last 24 hours)
    IF v_zone1_id IS NOT NULL THEN
        INSERT INTO sensor_readings (zone_id, soil_moisture, temperature, humidity, soil_ph, reading_timestamp) VALUES
        (v_zone1_id, 78, 24, 65, 6.8, NOW() - INTERVAL '2 minutes'),
        (v_zone1_id, 77, 24, 64, 6.8, NOW() - INTERVAL '1 hour'),
        (v_zone1_id, 75, 23, 66, 6.9, NOW() - INTERVAL '2 hours'),
        (v_zone1_id, 73, 22, 68, 6.8, NOW() - INTERVAL '4 hours');
    END IF;

    IF v_zone2_id IS NOT NULL THEN
        INSERT INTO sensor_readings (zone_id, soil_moisture, temperature, humidity, soil_ph, reading_timestamp) VALUES
        (v_zone2_id, 45, 28, 40, 7.2, NOW() - INTERVAL '5 minutes'),
        (v_zone2_id, 46, 27, 42, 7.1, NOW() - INTERVAL '1 hour'),
        (v_zone2_id, 48, 26, 43, 7.2, NOW() - INTERVAL '2 hours');
    END IF;

    IF v_zone3_id IS NOT NULL THEN
        INSERT INTO sensor_readings (zone_id, soil_moisture, temperature, humidity, soil_ph, reading_timestamp) VALUES
        (v_zone3_id, 25, 32, 30, 8.1, NOW() - INTERVAL '1 minute'),
        (v_zone3_id, 27, 31, 32, 8.0, NOW() - INTERVAL '1 hour'),
        (v_zone3_id, 30, 30, 35, 7.9, NOW() - INTERVAL '2 hours');
    END IF;

    -- Seed yield records (last 4 weeks)
    IF v_zone1_id IS NOT NULL THEN
        INSERT INTO yield_records (zone_id, harvest_date, amount, unit, quality_grade) VALUES
        (v_zone1_id, CURRENT_DATE - 7, 450, 'lbs', 'A'),
        (v_zone1_id, CURRENT_DATE - 14, 420, 'lbs', 'A'),
        (v_zone1_id, CURRENT_DATE - 21, 390, 'lbs', 'B'),
        (v_zone1_id, CURRENT_DATE - 28, 410, 'lbs', 'A');
    END IF;

    -- Seed water usage (last week)
    IF v_zone1_id IS NOT NULL THEN
        INSERT INTO water_usage (zone_id, usage_date, amount, irrigation_method, duration_minutes, cost) VALUES
        (v_zone1_id, CURRENT_DATE, 460, 'drip', 45, 25.50),
        (v_zone1_id, CURRENT_DATE - 1, 450, 'drip', 43, 25.00),
        (v_zone1_id, CURRENT_DATE - 2, 470, 'drip', 47, 26.00);
    END IF;

    -- Seed water storage
    INSERT INTO water_storage (farm_id, name, capacity, current_level, critical_level, last_refill_date, next_refill_date, location) VALUES
    (v_farm_id, 'Main Tank', 45425, 32175, 11356, CURRENT_DATE - 5, CURRENT_DATE + 3, 'Central');

    -- Seed irrigation schedule
    IF v_zone1_id IS NOT NULL THEN
        INSERT INTO irrigation_schedules (zone_id, scheduled_time, estimated_amount, priority, status) VALUES
        (v_zone1_id, NOW() + INTERVAL '2 hours', 1703, 'high', 'scheduled'),
        (v_zone2_id, NOW() + INTERVAL '6 hours', 1438, 'critical', 'scheduled'),
        (v_zone3_id, NOW() + INTERVAL '12 hours', 1968, 'medium', 'scheduled');
    END IF;

    -- Seed pesticide inventory
    INSERT INTO pesticide_inventory (farm_id, name, product_type, current_stock, unit, capacity, reorder_threshold, last_used_date, cost_per_unit) VALUES
    (v_farm_id, 'Desert-Grade Neem Oil', 'insecticide', 15, 'liters', 25, 10, CURRENT_DATE - 6, 55.50),
    (v_farm_id, 'Heat-Resistant Fungicide', 'fungicide', 8, 'kg', 20, 5, CURRENT_DATE - 4, 72.00),
    (v_farm_id, 'Arid Climate Bt Spray', 'insecticide', 22, 'liters', 30, 12, CURRENT_DATE - 3, 48.25),
    (v_farm_id, 'Sand Fly Deterrent', 'insecticide', 12, 'kg', 15, 8, CURRENT_DATE - 9, 38.75);

    -- Seed zone alerts
    IF v_zone1_id IS NOT NULL THEN
        INSERT INTO zone_alerts (zone_id, alert_type, message, priority) VALUES
        (v_zone1_id, 'info', 'Optimal growing conditions detected', 1),
        (v_zone1_id, 'warning', 'Consider pruning for better air circulation', 2);
    END IF;

    IF v_zone2_id IS NOT NULL THEN
        INSERT INTO zone_alerts (zone_id, alert_type, message, priority) VALUES
        (v_zone2_id, 'warning', 'Low soil moisture detected', 1),
        (v_zone2_id, 'info', 'Temperature within acceptable range', 2);
    END IF;

    IF v_zone3_id IS NOT NULL THEN
        INSERT INTO zone_alerts (zone_id, alert_type, message, priority) VALUES
        (v_zone3_id, 'critical', 'Critical soil moisture - immediate action required', 1),
        (v_zone3_id, 'warning', 'High temperature stress', 2),
        (v_zone3_id, 'warning', 'pH levels too high', 3);
    END IF;

    -- Seed zone recommendations
    IF v_zone1_id IS NOT NULL THEN
        INSERT INTO zone_recommendations (zone_id, title, description, priority, category) VALUES
        (v_zone1_id, 'Maintain Current Irrigation', 'Soil moisture levels are optimal. Continue current watering schedule.', 'high', 'irrigation'),
        (v_zone1_id, 'Monitor for Pests', 'Warm, humid conditions favor pest development. Inspect regularly.', 'medium', 'pest-control');
    END IF;

    IF v_zone2_id IS NOT NULL THEN
        INSERT INTO zone_recommendations (zone_id, title, description, priority, category) VALUES
        (v_zone2_id, 'Increase Irrigation', 'Soil moisture is below optimal. Increase watering frequency.', 'high', 'irrigation'),
        (v_zone2_id, 'Check Irrigation System', 'Verify all sprinklers are functioning properly in this zone.', 'high', 'irrigation');
    END IF;

    IF v_zone3_id IS NOT NULL THEN
        INSERT INTO zone_recommendations (zone_id, title, description, priority, category) VALUES
        (v_zone3_id, 'Emergency Irrigation', 'Immediately increase watering. Consider shade cloth installation.', 'high', 'irrigation'),
        (v_zone3_id, 'pH Adjustment', 'Apply sulfur or organic matter to lower soil pH to 6.0-7.0 range.', 'high', 'fertilization'),
        (v_zone3_id, 'Heat Stress Management', 'Install temporary shade structures and increase misting frequency.', 'medium', 'irrigation');
    END IF;

    RAISE NOTICE 'Dashboard tables seed data completed successfully';
END$$;
