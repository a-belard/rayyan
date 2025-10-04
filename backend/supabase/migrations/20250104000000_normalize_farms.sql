-- Normalize Farms Table Migration
-- This migration extracts JSONB data into proper relational tables
-- Run Date: 2025-10-04

-- ==================== Create New Tables ====================

-- 1. Crops Table (Master list of crop types)
CREATE TABLE IF NOT EXISTS crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    scientific_name VARCHAR(255),
    category VARCHAR(100), -- e.g., vegetables, fruits, grains, legumes
    description TEXT,
    growing_season VARCHAR(100), -- e.g., spring, summer, fall, winter, year-round
    typical_duration_days INTEGER, -- average days from planting to harvest
    water_requirements VARCHAR(50), -- low, moderate, high
    metadata_ JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Farm Zones Table (Individual zones/fields within a farm)
CREATE TABLE IF NOT EXISTS farm_zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES crops(id) ON DELETE SET NULL,
    
    -- Zone Details
    name VARCHAR(255) NOT NULL,
    area_hectares FLOAT CHECK (area_hectares > 0),
    
    -- Geographic Data
    polygon JSONB, -- Array of [lat, lng] points defining the zone boundary
    center_latitude FLOAT CHECK (center_latitude >= -90 AND center_latitude <= 90),
    center_longitude FLOAT CHECK (center_longitude >= -180 AND center_longitude <= 180),
    color VARCHAR(20), -- For map visualization (hex color)
    
    -- Crop-specific Data
    crop_variety VARCHAR(255),
    planting_date DATE,
    expected_harvest_date DATE,
    growth_stage VARCHAR(100), -- e.g., germination, vegetative, flowering, fruiting, harvest
    
    -- Sensors and Equipment
    sensor_ids JSONB DEFAULT '[]'::jsonb, -- Array of sensor IDs in this zone
    
    -- Additional Data
    metadata_ JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Farm Crops Table (Many-to-Many relationship between farms and crops)
-- This table helps track all crops ever planted on a farm for history/analytics
CREATE TABLE IF NOT EXISTS farm_crops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    crop_id UUID NOT NULL REFERENCES crops(id) ON DELETE CASCADE,
    
    -- Crop History
    first_planted_date DATE,
    last_planted_date DATE,
    total_plantings INTEGER DEFAULT 1,
    
    -- Status
    is_currently_planted BOOLEAN DEFAULT TRUE,
    notes TEXT,
    metadata_ JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Prevent duplicate farm-crop combinations
    UNIQUE(farm_id, crop_id)
);

-- ==================== Create Indexes ====================

-- Crops indexes
CREATE INDEX IF NOT EXISTS idx_crops_name ON crops(name);
CREATE INDEX IF NOT EXISTS idx_crops_category ON crops(category);
CREATE INDEX IF NOT EXISTS idx_crops_is_active ON crops(is_active);

-- Farm Zones indexes
CREATE INDEX IF NOT EXISTS idx_farm_zones_farm_id ON farm_zones(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_zones_crop_id ON farm_zones(crop_id);
CREATE INDEX IF NOT EXISTS idx_farm_zones_farm_active ON farm_zones(farm_id, is_active);
CREATE INDEX IF NOT EXISTS idx_farm_zones_growth_stage ON farm_zones(growth_stage);
CREATE INDEX IF NOT EXISTS idx_farm_zones_planting_date ON farm_zones(planting_date);

-- Farm Crops indexes
CREATE INDEX IF NOT EXISTS idx_farm_crops_farm_id ON farm_crops(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_crops_crop_id ON farm_crops(crop_id);
CREATE INDEX IF NOT EXISTS idx_farm_crops_currently_planted ON farm_crops(farm_id, is_currently_planted);

-- ==================== Create Triggers ====================

-- Trigger: Update updated_at on crops
CREATE TRIGGER update_crops_updated_at
    BEFORE UPDATE ON crops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on farm_zones
CREATE TRIGGER update_farm_zones_updated_at
    BEFORE UPDATE ON farm_zones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on farm_crops
CREATE TRIGGER update_farm_crops_updated_at
    BEFORE UPDATE ON farm_crops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== Seed Common Crops ====================

INSERT INTO crops (name, scientific_name, category, growing_season, typical_duration_days, water_requirements) VALUES
-- Vegetables
('Tomato', 'Solanum lycopersicum', 'vegetables', 'spring-summer', 85, 'moderate'),
('Potato', 'Solanum tuberosum', 'vegetables', 'spring-fall', 100, 'moderate'),
('Carrot', 'Daucus carota', 'vegetables', 'spring-fall', 75, 'moderate'),
('Lettuce', 'Lactuca sativa', 'vegetables', 'spring-fall', 50, 'moderate'),
('Cucumber', 'Cucumis sativus', 'vegetables', 'spring-summer', 60, 'high'),
('Pepper', 'Capsicum annuum', 'vegetables', 'spring-summer', 80, 'moderate'),
('Onion', 'Allium cepa', 'vegetables', 'spring-fall', 120, 'moderate'),
('Cabbage', 'Brassica oleracea', 'vegetables', 'spring-fall', 90, 'moderate'),

-- Fruits
('Strawberry', 'Fragaria × ananassa', 'fruits', 'spring-summer', 100, 'high'),
('Watermelon', 'Citrullus lanatus', 'fruits', 'summer', 90, 'high'),
('Apple', 'Malus domestica', 'fruits', 'year-round', 180, 'moderate'),
('Orange', 'Citrus × sinensis', 'fruits', 'year-round', 270, 'moderate'),

-- Grains
('Wheat', 'Triticum aestivum', 'grains', 'fall-spring', 120, 'moderate'),
('Corn', 'Zea mays', 'grains', 'spring-summer', 90, 'moderate'),
('Rice', 'Oryza sativa', 'grains', 'spring-summer', 120, 'high'),
('Barley', 'Hordeum vulgare', 'grains', 'fall-spring', 110, 'low'),

-- Legumes
('Soybean', 'Glycine max', 'legumes', 'spring-summer', 100, 'moderate'),
('Peanut', 'Arachis hypogaea', 'legumes', 'spring-summer', 140, 'low'),
('Bean', 'Phaseolus vulgaris', 'legumes', 'spring-summer', 65, 'moderate'),
('Lentil', 'Lens culinaris', 'legumes', 'spring-fall', 110, 'low')

ON CONFLICT (name) DO NOTHING;

-- ==================== Data Migration Function ====================

-- Function to migrate existing JSONB data to normalized tables
CREATE OR REPLACE FUNCTION migrate_farm_data()
RETURNS void AS $$
DECLARE
    farm_record RECORD;
    zone_record JSONB;
    crop_name TEXT;
    crop_id_var UUID;
    zone_id_var UUID;
BEGIN
    -- Loop through all farms
    FOR farm_record IN SELECT * FROM farms WHERE crops IS NOT NULL OR zones IS NOT NULL LOOP
        
        -- Migrate crops array to farm_crops
        IF farm_record.crops IS NOT NULL THEN
            FOR crop_name IN SELECT jsonb_array_elements_text(farm_record.crops) LOOP
                -- Get or create crop
                SELECT id INTO crop_id_var FROM crops WHERE LOWER(name) = LOWER(crop_name);
                
                IF crop_id_var IS NULL THEN
                    -- Create new crop if it doesn't exist
                    INSERT INTO crops (name, category)
                    VALUES (crop_name, 'other')
                    RETURNING id INTO crop_id_var;
                END IF;
                
                -- Link farm to crop
                INSERT INTO farm_crops (farm_id, crop_id, is_currently_planted)
                VALUES (farm_record.id, crop_id_var, TRUE)
                ON CONFLICT (farm_id, crop_id) DO NOTHING;
            END LOOP;
        END IF;
        
        -- Migrate zones array to farm_zones
        IF farm_record.zones IS NOT NULL THEN
            FOR zone_record IN SELECT * FROM jsonb_array_elements(farm_record.zones) LOOP
                -- Get crop_id if crop is specified
                crop_id_var := NULL;
                IF zone_record->>'crop' IS NOT NULL THEN
                    SELECT id INTO crop_id_var 
                    FROM crops 
                    WHERE LOWER(name) = LOWER(zone_record->>'crop');
                    
                    IF crop_id_var IS NULL THEN
                        -- Create new crop if it doesn't exist
                        INSERT INTO crops (name, category)
                        VALUES (zone_record->>'crop', 'other')
                        RETURNING id INTO crop_id_var;
                    END IF;
                END IF;
                
                -- Insert zone
                INSERT INTO farm_zones (
                    farm_id,
                    crop_id,
                    name,
                    area_hectares,
                    polygon,
                    color,
                    crop_variety,
                    planting_date,
                    growth_stage,
                    sensor_ids
                ) VALUES (
                    farm_record.id,
                    crop_id_var,
                    COALESCE(zone_record->>'name', zone_record->>'crop', 'Unnamed Zone'),
                    NULLIF(zone_record->>'area_hectares', '')::FLOAT,
                    zone_record->'points', -- polygon coordinates
                    zone_record->>'color',
                    zone_record->>'crop_variety',
                    NULLIF(zone_record->>'planting_date', '')::DATE,
                    zone_record->>'growth_stage',
                    COALESCE(zone_record->'sensors', '[]'::jsonb)
                );
            END LOOP;
        END IF;
        
    END LOOP;
    
    RAISE NOTICE 'Farm data migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- ==================== Execute Migration ====================

-- Uncomment the line below to run the migration
-- SELECT migrate_farm_data();

-- ==================== Add Comments ====================

COMMENT ON TABLE crops IS 'Master list of crop types with agricultural metadata';
COMMENT ON TABLE farm_zones IS 'Individual zones/fields within farms with geographic boundaries';
COMMENT ON TABLE farm_crops IS 'Many-to-many relationship tracking crop history on farms';

COMMENT ON COLUMN farm_zones.polygon IS 'JSONB array of [latitude, longitude] coordinate pairs defining zone boundary';
COMMENT ON COLUMN farm_zones.color IS 'Hex color code for map visualization (e.g., #FF5733)';
COMMENT ON COLUMN farm_zones.growth_stage IS 'Current growth stage: germination, vegetative, flowering, fruiting, harvest';

-- ==================== Optional: Drop Old Columns ====================

-- After verifying the migration is successful, you can drop the old JSONB columns:
-- ALTER TABLE farms DROP COLUMN IF EXISTS crops;
-- ALTER TABLE farms DROP COLUMN IF EXISTS zones;

-- Or keep them for backward compatibility and mark as deprecated:
COMMENT ON COLUMN farms.crops IS 'DEPRECATED: Use farm_crops table instead. Will be removed in future version.';
COMMENT ON COLUMN farms.zones IS 'DEPRECATED: Use farm_zones table instead. Will be removed in future version.';
