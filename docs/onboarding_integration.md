# Farm Onboarding Integration - Implementation Summary

## Overview

Converted the standalone `/maps` page into an integrated onboarding flow that guides new users through farm setup immediately after registration.

## What Was Changed

### 1. Backend Updates ✅

#### Farm Model & Schema (`backend/src/schemas/farm.py`)

- **Enhanced `FarmZone`** to support polygon coordinates:
  - Added `points: List[Tuple[float, float]]` field for storing crop region boundaries
  - Added `color` field for map visualization
  - Made `name` optional (defaults to crop type)

#### Existing Infrastructure Leveraged

- ✅ Farm model already had `zones` (JSONB) field for storing crop regions
- ✅ POST `/api/v1/farms` endpoint already exists for creating farms
- ✅ Authentication system ready with JWT tokens

### 2. Frontend Updates ✅

#### New Onboarding Page (`frontend/src/app/onboarding/page.tsx`)

- **Two-step wizard interface**:
  - **Step 1**: Basic farm information (name, size, soil type, irrigation)
  - **Step 2**: Interactive map for marking crop regions
- **Features**:
  - GPS location detection for centering map
  - Interactive polygon drawing (Ctrl/Cmd + Click)
  - Multiple crop region selection
  - Visual region summary with colors
  - Form validation
  - Skip option for users who want to configure later

#### API Client Updates (`frontend/src/lib/api.ts`)

- Enhanced `FarmZone` interface with `points` and `color` fields
- Added convenience exports for common operations
- Already had `farmsApi.create()` method ready

#### Registration Flow (`frontend/src/app/register/page.tsx`)

- **Changed**: After successful registration → redirects to `/onboarding` (was `/farm-dashboard`)
- Auto-login after registration maintained

#### Login Flow (`frontend/src/app/login/page.tsx`)

- **Added**: Check for farm setup completion

  ```typescript
  const farms = await farmsApi.list();
  const hasCompletedOnboarding =
    farms.length > 0 &&
    farms.some((farm) => farm.metadata?.onboarding_completed === true);

  if (!hasCompletedOnboarding) {
    router.push("/onboarding"); // Complete setup first
  } else {
    router.push("/dashboard"); // Go to main app
  }
  ```

## User Flow

### New User Journey:

```
1. Register (/register)
   ↓
2. Auto-login
   ↓
3. Onboarding (/onboarding)
   - Step 1: Enter farm details
   - Step 2: Map crop regions on interactive map
   ↓
4. Save farm configuration
   ↓
5. Redirect to Dashboard (/dashboard)
```

### Returning User Journey:

```
1. Login (/login)
   ↓
2. Check farms
   ↓
3a. Has farms → Dashboard (/dashboard)
3b. No farms → Onboarding (/onboarding)
```

## Data Structure

### Farm Creation Payload:

```typescript
{
  name: "Green Valley Farm",
  location: "34.052235, -118.243683",  // GPS coordinates as string
  latitude: 34.052235,
  longitude: -118.243683,
  size_hectares: 50.5,
  soil_type: "loamy",
  irrigation_type: "drip",
  crops: ["Wheat", "Corn", "Rice"],  // Unique crop types
  zones: [
    {
      id: "1704067200000",
      name: "Wheat",
      crop: "Wheat",
      points: [[34.052, -118.243], [34.053, -118.244], ...],  // Polygon coordinates
      color: "#ff6b6b"
    },
    // ... more zones
  ],
  metadata: {
    onboarding_completed: true,
    onboarding_date: "2025-01-04T10:00:00.000Z"
  }
}
```

## Maps Feature Integration

### Interactive Map Component (`components/Maps.tsx`)

- **Already existed** - integrated seamlessly
- Supports:
  - GPS-based centering
  - Polygon drawing with Ctrl/Cmd + Click
  - Multiple crop regions
  - Crop type selection modal
  - Region visualization with colors
  - Delete region functionality

### Usage in Onboarding:

```tsx
<Maps
  center={mapCenter}
  zoom={15}
  showUserLocation={true}
  userLocation={{ lat: latitude, lng: longitude }}
  onRegionSelect={handleRegionSelect}
/>
```

## Testing the Flow

### 1. Test New User Registration:

```bash
# Start backend
cd backend && docker compose up backend -d

# Start frontend
cd frontend && pnpm dev

# Navigate to http://localhost:3000/register
```

### 2. Register a New User:

- Fill in registration form
- Submit → Should auto-redirect to `/onboarding`

### 3. Complete Onboarding:

- **Step 1**: Enter farm name (required), optional: size, soil type, irrigation
- Click "Next: Map Your Farm"
- **Step 2**:
  - Click "Enable Location" to get GPS coordinates
  - On map, click "Draw Region" button
  - Hold Ctrl (or Cmd on Mac) and click on map to add points (min 3)
  - Click "Finish" and select crop type
  - Repeat for multiple regions
- Click "Complete Setup" → Should redirect to `/dashboard`

### 4. Test Returning User:

- Logout
- Login again → Should go directly to `/dashboard`

### 5. Test Incomplete Onboarding:

- Register new user
- Skip onboarding
- Logout
- Login → Should redirect to `/onboarding` again

## Database Schema

### Farm Table (already exists):

```sql
CREATE TABLE farms (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  location VARCHAR(500),
  latitude FLOAT,
  longitude FLOAT,
  size_hectares FLOAT,
  soil_type VARCHAR(100),
  irrigation_type VARCHAR(100),
  crops JSONB DEFAULT '[]',           -- Array of crop types
  zones JSONB DEFAULT '[]',           -- Array of zone objects with polygons
  metadata_ JSONB DEFAULT '{}',       -- Stores onboarding_completed flag
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints Used

### Authentication:

- `POST /api/v1/auth/register` - Create new user
- `POST /api/v1/auth/login` - Authenticate user
- `GET /api/v1/auth/me` - Get current user profile

### Farms:

- `GET /api/v1/farms` - List user's farms (used to check onboarding status)
- `POST /api/v1/farms` - Create farm (used in onboarding)

## Environment Configuration

### Backend (`.env`):

```env
SUPABASE_URL=http://host.docker.internal:54321
SUPABASE_KEY=your-anon-key
DATABASE_URL=postgresql+asyncpg://postgres:postgres@host.docker.internal:54322/postgres
```

### Frontend (`.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Key Features

### Onboarding Page:

- ✅ Two-step wizard with progress indicator
- ✅ GPS location detection
- ✅ Interactive map with polygon drawing
- ✅ Multiple crop region support
- ✅ Visual feedback (region summary, colors)
- ✅ Form validation
- ✅ Skip option
- ✅ Responsive design
- ✅ Error handling

### Smart Routing:

- ✅ New users → Onboarding
- ✅ Incomplete setup → Onboarding on next login
- ✅ Completed setup → Dashboard
- ✅ Auto-login after registration

## Next Steps (Optional Enhancements)

1. **Add farm editing** - Allow users to update crop regions later
2. **Multi-farm support** - Let users manage multiple farms
3. **Area calculation** - Calculate zone areas from polygons
4. **Satellite imagery** - Integrate satellite view for better visualization
5. **Offline support** - Cache map tiles for offline use
6. **Export/Import** - Allow exporting farm data as GeoJSON

## Files Modified

### Backend:

- `src/schemas/farm.py` - Enhanced FarmZone with points and color

### Frontend:

- `src/app/onboarding/page.tsx` - NEW: Onboarding wizard
- `src/app/register/page.tsx` - Updated redirect to /onboarding
- `src/app/login/page.tsx` - Added farm setup check
- `src/lib/api.ts` - Enhanced FarmZone type, added convenience exports

### No Changes Needed:

- `src/models/farm.py` - Already had zones field
- `src/routers/farms.py` - POST /farms endpoint already exists
- `src/components/Maps.tsx` - Already had all needed features

## Summary

The maps feature has been successfully integrated into the onboarding flow! Users now go through a guided setup process after registration, where they can:

1. Enter basic farm information
2. Mark their crop regions on an interactive map
3. Have their farm configuration saved to the database
4. Be automatically redirected based on setup completion status

The implementation leverages existing backend infrastructure (Farm model, API endpoints) and integrates seamlessly with the authentication system. The onboarding page provides a polished, user-friendly experience with GPS support, visual feedback, and proper error handling.
