# Farm Database Normalization

## Overview

The farms table has been normalized to follow database best practices by extracting JSONB data into proper relational tables. This improves data integrity, query performance, and enables better relationships between entities.

## New Database Structure

### Previous Structure (Denormalized)

```sql
farms
├── id
├── owner_id
├── name
├── location
├── latitude/longitude
├── size_hectares
├── soil_type
├── irrigation_type
├── crops (JSONB array)          -- ❌ Denormalized
├── zones (JSONB array)          -- ❌ Denormalized
└── metadata_
```

### New Structure (Normalized)

```
┌─────────────────────────────────────────────────────────┐
│                    farms (Main Table)                    │
│  Core farm information: name, location, size, etc.      │
└──────────────┬─────────────────┬────────────────────────┘
               │                 │
               │                 │ (One-to-Many)
               ↓                 ↓
    ┌──────────────────┐  ┌──────────────────────┐
    │   farm_zones     │  │     farm_crops       │
    │  (Fields/Areas)  │  │  (Crop History)      │
    └────────┬─────────┘  └──────────┬───────────┘
             │                       │
             │ (Many-to-One)         │ (Many-to-One)
             ↓                       ↓
    ┌────────────────────────────────────────────┐
    │              crops (Master List)            │
    │  Tomato, Wheat, Corn, etc.                 │
    └────────────────────────────────────────────┘
```

## Tables

### 1. `crops` - Master Crop List

**Purpose**: Central repository of all crop types with agricultural metadata.

**Columns**:

- `id` (UUID) - Primary key
- `name` (VARCHAR) - Crop name (unique)
- `scientific_name` (VARCHAR) - Scientific/Latin name
- `category` (VARCHAR) - vegetables, fruits, grains, legumes
- `description` (TEXT) - Detailed description
- `growing_season` (VARCHAR) - spring, summer, fall, winter, year-round
- `typical_duration_days` (INTEGER) - Average growing period
- `water_requirements` (VARCHAR) - low, moderate, high
- `metadata_` (JSONB) - Additional flexible data
- `is_active` (BOOLEAN) - Active status
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Benefits**:

- ✅ Single source of truth for crop information
- ✅ Consistent naming across the system
- ✅ Easy to add new crops globally
- ✅ Can store detailed agricultural data per crop

**Example Data**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Tomato",
  "scientific_name": "Solanum lycopersicum",
  "category": "vegetables",
  "growing_season": "spring-summer",
  "typical_duration_days": 85,
  "water_requirements": "moderate"
}
```

### 2. `farm_zones` - Field Zones

**Purpose**: Represents individual fields/zones within a farm with geographic boundaries.

**Columns**:

- `id` (UUID) - Primary key
- `farm_id` (UUID) - Foreign key to farms
- `crop_id` (UUID) - Foreign key to crops (nullable)
- `name` (VARCHAR) - Zone name (e.g., "North Field")
- `area_hectares` (FLOAT) - Zone area
- `polygon` (JSONB) - Array of [lat, lng] coordinates defining boundaries
- `center_latitude`, `center_longitude` (FLOAT) - Zone center point
- `color` (VARCHAR) - Hex color for map visualization
- `crop_variety` (VARCHAR) - Specific variety (e.g., "Roma Tomato")
- `planting_date`, `expected_harvest_date` (DATE)
- `growth_stage` (VARCHAR) - germination, vegetative, flowering, etc.
- `sensor_ids` (JSONB) - Array of IoT sensor IDs
- `metadata_` (JSONB) - Additional flexible data
- `is_active` (BOOLEAN) - Active status
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Benefits**:

- ✅ Proper geographic data structure
- ✅ One zone = one crop = one record
- ✅ Easy to query zones by crop, farm, or date
- ✅ Supports complex polygon boundaries
- ✅ Links to IoT sensors per zone

**Example Data**:

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "farm_id": "770e8400-e29b-41d4-a716-446655440002",
  "crop_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "North Field",
  "area_hectares": 2.5,
  "polygon": [
    [34.0522, -118.2437],
    [34.0523, -118.2437],
    [34.0523, -118.2436],
    [34.0522, -118.2436]
  ],
  "color": "#FF5733",
  "planting_date": "2025-03-15",
  "growth_stage": "vegetative"
}
```

### 3. `farm_crops` - Farm-Crop History

**Purpose**: Many-to-many relationship tracking which crops have been planted on which farms (historical record).

**Columns**:

- `id` (UUID) - Primary key
- `farm_id` (UUID) - Foreign key to farms
- `crop_id` (UUID) - Foreign key to crops
- `first_planted_date` (DATE) - First time this crop was planted
- `last_planted_date` (DATE) - Most recent planting
- `total_plantings` (INTEGER) - Number of times planted
- `is_currently_planted` (BOOLEAN) - Currently growing?
- `notes` (TEXT) - Notes about this crop on this farm
- `metadata_` (JSONB) - Additional flexible data
- `created_at`, `updated_at` (TIMESTAMPTZ)

**Benefits**:

- ✅ Historical tracking of crop rotation
- ✅ Easy to find all crops on a farm
- ✅ Easy to find all farms growing a specific crop
- ✅ Supports analytics and recommendations

**Example Data**:

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "farm_id": "770e8400-e29b-41d4-a716-446655440002",
  "crop_id": "550e8400-e29b-41d4-a716-446655440000",
  "first_planted_date": "2023-03-15",
  "last_planted_date": "2025-03-15",
  "total_plantings": 3,
  "is_currently_planted": true,
  "notes": "Good yield, resistant to pests"
}
```

## Migration Process

### Step 1: Run Migration SQL

```bash
# Apply the migration to your Supabase database
psql $DATABASE_URL -f backend/supabase/migrations/20250104000000_normalize_farms.sql
```

Or in Supabase Dashboard:

1. Go to SQL Editor
2. Paste the migration SQL
3. Execute

### Step 2: Migrate Existing Data

The migration includes a `migrate_farm_data()` function that automatically:

1. Extracts crops from `farms.crops` JSONB → `farm_crops` table
2. Extracts zones from `farms.zones` JSONB → `farm_zones` table
3. Creates crop records in `crops` table if they don't exist

To run the migration:

```sql
SELECT migrate_farm_data();
```

### Step 3: Verify Data

```sql
-- Check crops were created
SELECT COUNT(*) FROM crops;

-- Check zones were migrated
SELECT COUNT(*) FROM farm_zones;

-- Check farm-crop associations
SELECT COUNT(*) FROM farm_crops;

-- Verify a specific farm's data
SELECT
  f.name as farm_name,
  c.name as crop_name,
  fz.name as zone_name,
  fz.area_hectares
FROM farms f
LEFT JOIN farm_zones fz ON f.id = fz.farm_id
LEFT JOIN crops c ON fz.crop_id = c.id
WHERE f.id = 'your-farm-id';
```

### Step 4: Update Application Code

The new SQLAlchemy models and Pydantic schemas are already created:

- `src/models/crop.py`
- `src/models/farm_zone.py`
- `src/models/farm_crop.py`
- `src/schemas/crop.py`
- `src/schemas/farm_zone.py`
- `src/schemas/farm_crop.py`

### Step 5: (Optional) Remove Old Columns

After verifying everything works, you can drop the old JSONB columns:

```sql
ALTER TABLE farms DROP COLUMN IF EXISTS crops;
ALTER TABLE farms DROP COLUMN IF EXISTS zones;
```

## API Changes

### Before (Denormalized):

```python
# POST /api/v1/farms
{
  "name": "Green Valley Farm",
  "crops": ["tomato", "wheat"],  # Simple array
  "zones": [                     # Complex JSONB
    {
      "name": "North Field",
      "crop": "tomato",
      "points": [[lat, lng], ...]
    }
  ]
}
```

### After (Normalized):

```python
# 1. Create farm
POST /api/v1/farms
{
  "name": "Green Valley Farm"
}

# 2. Add zones
POST /api/v1/farm-zones
{
  "farm_id": "farm-uuid",
  "name": "North Field",
  "crop_id": "tomato-uuid",
  "polygon": [[lat, lng], ...],
  "area_hectares": 2.5
}

# 3. Track crop association (auto-created)
# farm_crops entry automatically created when zone is added
```

## Query Examples

### Get all zones for a farm with crop details:

```sql
SELECT
  fz.id,
  fz.name as zone_name,
  fz.area_hectares,
  c.name as crop_name,
  c.category as crop_category,
  fz.planting_date,
  fz.growth_stage
FROM farm_zones fz
LEFT JOIN crops c ON fz.crop_id = c.id
WHERE fz.farm_id = $1 AND fz.is_active = true
ORDER BY fz.created_at DESC;
```

### Get all farms growing a specific crop:

```sql
SELECT DISTINCT
  f.id,
  f.name as farm_name,
  f.location,
  COUNT(fz.id) as zone_count,
  SUM(fz.area_hectares) as total_area
FROM farms f
JOIN farm_zones fz ON f.id = fz.farm_id
JOIN crops c ON fz.crop_id = c.id
WHERE c.name = 'Tomato'
  AND fz.is_active = true
GROUP BY f.id, f.name, f.location;
```

### Get crop rotation history for a farm:

```sql
SELECT
  c.name as crop_name,
  fc.first_planted_date,
  fc.last_planted_date,
  fc.total_plantings,
  fc.is_currently_planted
FROM farm_crops fc
JOIN crops c ON fc.crop_id = c.id
WHERE fc.farm_id = $1
ORDER BY fc.last_planted_date DESC;
```

## Benefits of Normalization

### ✅ Data Integrity

- Foreign key constraints ensure valid references
- No duplicate crop names (enforced by unique constraint)
- Type safety (dates are dates, not strings in JSON)

### ✅ Query Performance

- Indexed relationships for fast lookups
- Can query by crop, farm, date range efficiently
- No need to scan JSONB arrays

### ✅ Maintainability

- Clear relationships between entities
- Easy to add new fields (just ALTER TABLE)
- Standard SQL joins instead of JSONB operators

### ✅ Flexibility

- Easy to add new crops globally
- Can track crop history and rotation
- Support complex analytics queries

### ✅ Scalability

- Each zone is a separate row (better for large farms)
- Can partition tables by date for archiving
- Better for reporting and analytics

## Backward Compatibility

The old `crops` and `zones` JSONB columns are marked as deprecated but NOT removed immediately. This allows:

- Gradual migration of client code
- Testing of new structure
- Rollback if needed

To maintain backward compatibility, you can create database views that mimic the old structure while using the new tables.

## Next Steps

1. ✅ Run migration SQL
2. ✅ Execute data migration function
3. ✅ Verify data integrity
4. 🔲 Update API endpoints (if needed)
5. 🔲 Update frontend to use new structure
6. 🔲 Update agent tools to query new tables
7. 🔲 Remove old JSONB columns (after verification)

## Rollback Plan

If issues arise, you can rollback by:

```sql
-- 1. Drop new tables
DROP TABLE IF EXISTS farm_crops CASCADE;
DROP TABLE IF EXISTS farm_zones CASCADE;
DROP TABLE IF EXISTS crops CASCADE;

-- 2. Old columns still exist in farms table
-- No data loss!
```
