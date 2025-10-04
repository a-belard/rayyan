# Dashboard Data Integration Plan

## Frontend Data Requirements Analysis

### Dashboard Page (`/dashboard`)

**Data Needed:**

1. **Field/Zone Data** (from selected farm)

   - Zone ID, name, crop type
   - Crop age (planting date → days)
   - Health status
   - Last sensor update timestamp

2. **Sensor Readings** (real-time per zone)

   - Soil moisture (%)
   - Temperature (°C)
   - Humidity (%)
   - Soil pH
   - Timestamp

3. **Alerts** (per zone)

   - Alert type (info/warning/critical)
   - Message
   - Priority
   - Created timestamp

4. **Recommendations** (AI-generated per zone)
   - Title
   - Description
   - Priority (high/medium/low)
   - Created timestamp

### Farm Dashboard Page (`/farm-dashboard`)

**Data Needed:**

1. **Fields/Zones Summary**

   - Basic info (name, size, crop, status)
   - Soil moisture level
   - Last watered timestamp

2. **Team Members**

   - Name, role, status (active/break)
   - Current location (zone assignment)
   - Active task count

3. **Tasks**

   - Title, description
   - Assigned team member
   - Priority, status (pending/in-progress/completed)
   - Due date/time
   - Associated zone/field

4. **Yield Data** (production tracking)

   - Field/zone ID
   - Crop type
   - Current week harvest
   - Last week harvest
   - Trend analysis

5. **Water Analytics**

   - Total usage (daily/weekly)
   - Usage by field/zone
   - Water storage level and capacity
   - Irrigation schedule

6. **Pesticide Inventory**

   - Product name
   - Current stock
   - Unit (liters/kg)
   - Capacity
   - Last used date
   - Reorder status

7. **Cost Analysis**

   - Water costs
   - Pesticide costs
   - Equipment costs
   - Total and savings

8. **Weather Data** (external API - already implemented)
   - Temperature, humidity, wind
   - Current conditions

## Database Tables to Create

### 1. `sensor_readings` Table

Stores time-series sensor data for each zone.

```sql
CREATE TABLE sensor_readings (
    id UUID PRIMARY KEY,
    zone_id UUID REFERENCES farm_zones(id) ON DELETE CASCADE,
    soil_moisture FLOAT,  -- percentage
    temperature FLOAT,    -- celsius
    humidity FLOAT,       -- percentage
    soil_ph FLOAT,
    reading_timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Index for fast time-range queries
CREATE INDEX idx_sensor_zone_time ON sensor_readings(zone_id, reading_timestamp DESC);
```

### 2. `team_members` Table

Stores farm team/employee information.

```sql
CREATE TABLE team_members (
    id UUID PRIMARY KEY,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,  -- Link to users if they have account
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,  -- Senior Worker, Field Specialist, etc.
    status VARCHAR(50) DEFAULT 'active',  -- active, break, off-duty, vacation
    current_zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    metadata_ JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    hired_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_team_farm ON team_members(farm_id, is_active);
```

### 3. `farm_tasks` Table

Stores tasks assigned to team members.

```sql
CREATE TABLE farm_tasks (
    id UUID PRIMARY KEY,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_tasks_farm ON farm_tasks(farm_id, status, due_date);
CREATE INDEX idx_tasks_assignee ON farm_tasks(assigned_to, status);
```

### 4. `yield_records` Table

Tracks harvest/production data.

```sql
CREATE TABLE yield_records (
    id UUID PRIMARY KEY,
    zone_id UUID REFERENCES farm_zones(id) ON DELETE CASCADE,
    harvest_date DATE NOT NULL,
    amount FLOAT NOT NULL,  -- weight in kg
    unit VARCHAR(20) DEFAULT 'kg',
    quality_grade VARCHAR(50),  -- A, B, C, Premium, etc.
    notes TEXT,
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_yield_zone_date ON yield_records(zone_id, harvest_date DESC);
```

### 5. `water_usage` Table

Tracks irrigation and water consumption.

```sql
CREATE TABLE water_usage (
    id UUID PRIMARY KEY,
    zone_id UUID REFERENCES farm_zones(id) ON DELETE CASCADE,
    usage_date DATE NOT NULL,
    amount FLOAT NOT NULL,  -- liters
    irrigation_method VARCHAR(100),  -- drip, sprinkler, flood, etc.
    duration_minutes INTEGER,
    efficiency_rating FLOAT,  -- percentage
    cost FLOAT,  -- in local currency
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_water_zone_date ON water_usage(zone_id, usage_date DESC);
```

### 6. `water_storage` Table

Tracks water storage tanks/reservoirs.

```sql
CREATE TABLE water_storage (
    id UUID PRIMARY KEY,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    capacity FLOAT NOT NULL,  -- liters
    current_level FLOAT NOT NULL,  -- liters
    critical_level FLOAT,  -- alert threshold
    last_refill_date DATE,
    next_refill_date DATE,
    location VARCHAR(255),
    metadata_ JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_storage_farm ON water_storage(farm_id, is_active);
```

### 7. `irrigation_schedules` Table

Planned irrigation events.

```sql
CREATE TABLE irrigation_schedules (
    id UUID PRIMARY KEY,
    zone_id UUID REFERENCES farm_zones(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMPTZ NOT NULL,
    estimated_amount FLOAT,  -- liters
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'scheduled',  -- scheduled, in-progress, completed, skipped
    completed_at TIMESTAMPTZ,
    actual_amount FLOAT,  -- liters actually used
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_irrigation_zone_time ON irrigation_schedules(zone_id, scheduled_time);
```

### 8. `pesticide_inventory` Table

Tracks pesticide/chemical stock.

```sql
CREATE TABLE pesticide_inventory (
    id UUID PRIMARY KEY,
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    product_type VARCHAR(100),  -- insecticide, fungicide, herbicide, etc.
    current_stock FLOAT NOT NULL,
    unit VARCHAR(20) NOT NULL,  -- liters, kg, gallons
    capacity FLOAT,  -- storage capacity
    reorder_threshold FLOAT,
    last_used_date DATE,
    next_order_date DATE,
    cost_per_unit FLOAT,
    supplier VARCHAR(255),
    metadata_ JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_pesticide_farm ON pesticide_inventory(farm_id, is_active);
```

### 9. `zone_alerts` Table

Real-time alerts for zones.

```sql
CREATE TABLE zone_alerts (
    id UUID PRIMARY KEY,
    zone_id UUID REFERENCES farm_zones(id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,  -- info, warning, critical
    message TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_alerts_zone_status ON zone_alerts(zone_id, is_resolved, created_at DESC);
```

### 10. `zone_recommendations` Table

AI-generated recommendations.

```sql
CREATE TABLE zone_recommendations (
    id UUID PRIMARY KEY,
    zone_id UUID REFERENCES farm_zones(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',  -- high, medium, low
    category VARCHAR(100),  -- irrigation, pest-control, fertilization, harvesting
    is_active BOOLEAN DEFAULT TRUE,
    applied_at TIMESTAMPTZ,
    applied_by UUID REFERENCES users(id),
    effectiveness_rating INTEGER,  -- 1-5 stars
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_recommendations_zone ON zone_recommendations(zone_id, is_active, created_at DESC);
```

## API Endpoints to Create

### Sensor Readings

- `GET /api/v1/zones/{zone_id}/sensors/latest` - Get latest reading
- `GET /api/v1/zones/{zone_id}/sensors` - Get readings (with time range)
- `POST /api/v1/zones/{zone_id}/sensors` - Add reading (IoT devices)

### Team Management

- `GET /api/v1/farms/{farm_id}/team` - List all team members
- `POST /api/v1/farms/{farm_id}/team` - Add team member
- `PATCH /api/v1/team/{member_id}` - Update member (status, location)
- `DELETE /api/v1/team/{member_id}` - Remove member

### Tasks

- `GET /api/v1/farms/{farm_id}/tasks` - List tasks (filter by status, assignee)
- `POST /api/v1/farms/{farm_id}/tasks` - Create task
- `PATCH /api/v1/tasks/{task_id}` - Update task
- `DELETE /api/v1/tasks/{task_id}` - Delete task

### Yield Tracking

- `GET /api/v1/zones/{zone_id}/yields` - Get yield records
- `GET /api/v1/zones/{zone_id}/yields/summary` - Weekly/monthly summary
- `POST /api/v1/zones/{zone_id}/yields` - Record harvest

### Water Management

- `GET /api/v1/farms/{farm_id}/water/usage` - Water usage stats
- `GET /api/v1/farms/{farm_id}/water/storage` - Storage levels
- `GET /api/v1/farms/{farm_id}/water/schedule` - Irrigation schedule
- `POST /api/v1/zones/{zone_id}/water` - Log water usage

### Pesticides

- `GET /api/v1/farms/{farm_id}/pesticides` - Inventory list
- `POST /api/v1/farms/{farm_id}/pesticides` - Add product
- `PATCH /api/v1/pesticides/{pesticide_id}` - Update stock
- `GET /api/v1/farms/{farm_id}/pesticides/usage` - Usage history

### Alerts & Recommendations

- `GET /api/v1/zones/{zone_id}/alerts` - Get active alerts
- `POST /api/v1/zones/{zone_id}/alerts` - Create alert
- `PATCH /api/v1/alerts/{alert_id}/resolve` - Resolve alert
- `GET /api/v1/zones/{zone_id}/recommendations` - Get recommendations
- `POST /api/v1/zones/{zone_id}/recommendations` - Add recommendation

## Implementation Steps

1. ✅ Analyze requirements (this document)
2. Create database migration file
3. Create SQLAlchemy models
4. Create Pydantic schemas
5. Create API routers and endpoints
6. Update frontend API client (api.ts)
7. Update dashboard page
8. Update farm-dashboard page
9. Run migrations and seed test data
10. Test complete integration

## Seed Data Strategy

For realistic testing, we'll seed:

- 3 zones per farm (matching existing)
- 5-10 sensor readings per zone (last 24 hours)
- 5 team members per farm
- 7-10 active tasks
- Yield records for last 4 weeks
- Water usage for last week
- 4-5 pesticide products
- 2-3 alerts per zone
- 2-3 recommendations per zone
