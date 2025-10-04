# User Management System - Design Summary

## ✅ What Was Created

### 1. Database Models (`backend/models.py`)

**New Models Added:**
- ✅ `User` - User profiles with agricultural context
- ✅ `UserRole` - Enum (admin, farmer, agronomist, viewer)
- ✅ `UserStatus` - Enum (active, inactive, suspended, pending)
- ✅ `Farm` - Agricultural properties/fields
- ✅ Updated `Thread` - Now linked to users and farms

**Key Features:**
- UUID primary keys
- Foreign key relationships with CASCADE
- JSONB for flexible metadata
- Soft delete support (deleted_at)
- Timestamps (created_at, updated_at, last_login_at)
- Row-level security ready

### 2. Authentication Utilities (`backend/auth.py`)

**Functions:**
- ✅ `get_current_user()` - Extract user from JWT token
- ✅ `get_optional_user()` - Optional authentication
- ✅ `require_role()` - Role-based access control
- ✅ `require_active()` - Status-based access control
- ✅ `verify_thread_ownership()` - Check thread ownership
- ✅ `verify_farm_ownership()` - Check farm ownership

**Classes:**
- ✅ `AuthUser` - Authenticated user with helper methods

### 3. API Schemas (`backend/schemas.py`)

**User Schemas:**
- `UserCreate`, `UserUpdate`, `UserAdminUpdate`
- `UserResponse`, `UserListResponse`
- `UserStatsResponse`

**Farm Schemas:**
- `FarmCreate`, `FarmUpdate`, `FarmResponse`
- `FarmZone` (embedded schema)
- `FarmListResponse`

**Updated Thread Schemas:**
- `ThreadCreate` (with farm_id)
- `ThreadUpdate`, `ThreadResponse`

**Utility Schemas:**
- `PreferencesUpdate`, `ErrorResponse`

### 4. SQL Migration (`backend/migrations/001_user_management.sql`)

**What It Creates:**
- ✅ All tables (users, farms, threads, messages, runs)
- ✅ Enums (user_role, user_status, message_role, run_status)
- ✅ Indexes for performance
- ✅ Triggers (auto-sync auth users, update timestamps)
- ✅ Functions (update_updated_at, handle_new_user, etc.)
- ✅ RLS policies (row-level security)
- ✅ Views (user_stats, threads_with_stats)

### 5. Documentation

- ✅ `DATABASE_SCHEMA.md` - Complete schema documentation
- ✅ `USER_MANAGEMENT_SETUP.md` - Setup guide

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────┐
│              Supabase Auth                      │
│            (auth.users - managed)               │
└─────────────────┬───────────────────────────────┘
                  │
                  │ id (UUID)
                  ↓
┌────────────────────────────────────────────────────┐
│                    Users                           │
│  • id (PK, FK → auth.users.id)                    │
│  • email, full_name, phone                        │
│  • role (admin/farmer/agronomist/viewer)          │
│  • status (active/inactive/suspended/pending)     │
│  • organization_name, farm_location               │
│  • primary_crops (JSONB)                          │
│  • preferences (JSONB)                            │
│  • subscription info                              │
└───────┬──────────────────────┬─────────────────────┘
        │                      │
        │ owner_id             │ user_id
        ↓                      ↓
┌──────────────────┐    ┌────────────────────────┐
│      Farms       │    │       Threads          │
│  • id (PK)       │    │  • id (PK)            │
│  • owner_id (FK) │    │  • user_id (FK)       │
│  • name          │◄───┤  • farm_id (FK) opt   │
│  • location      │    │  • title              │
│  • lat/long      │    │  • is_pinned          │
│  • size          │    │  • metadata (JSONB)   │
│  • crops (JSONB) │    └────────┬───────────────┘
│  • zones (JSONB) │             │
└──────────────────┘             │ thread_id
                                 ↓
                          ┌──────────────────┐
                          │    Messages      │
                          │  • id (PK)       │
                          │  • thread_id(FK) │
                          │  • position      │
                          │  • role          │
                          │  • content       │
                          └──────────────────┘
```

### Relationships

1. **User → Farms** (1:N)
   - One user owns multiple farms
   - CASCADE delete

2. **User → Threads** (1:N)
   - One user has multiple chat threads
   - CASCADE delete

3. **Farm → Threads** (1:N, Optional)
   - Threads can be linked to specific farms
   - SET NULL on delete

4. **Thread → Messages** (1:N)
   - One thread contains multiple messages
   - CASCADE delete

## 🔐 Security Model

### Authentication Flow

```
1. User signs up → Supabase Auth creates auth.users entry
                ↓
2. Trigger fires → Auto-creates users table entry
                ↓
3. User logs in → Receives JWT token
                ↓
4. API request → FastAPI validates JWT
                ↓
5. get_current_user() → Extracts user from token
                ↓
6. RLS policies → Filters data by user_id
```

### Row-Level Security (RLS)

**Users Table:**
- Users can view/update own profile
- Admins can view/update all users

**Farms Table:**
- Users can CRUD own farms
- Admins can view all farms

**Threads Table:**
- Users can CRUD own threads
- No cross-user access

**Messages Table:**
- Users can view/create messages in own threads
- Automatic filtering by thread ownership

## 🎯 User Roles & Permissions

### Role Hierarchy

```
Admin (Level 3)
    ↓
Agronomist (Level 2)
    ↓
Farmer (Level 1)
    ↓
Viewer (Level 0)
```

### Permissions Matrix

| Action                  | Viewer | Farmer | Agronomist | Admin |
|------------------------|--------|--------|------------|-------|
| View own profile       | ✅     | ✅     | ✅         | ✅    |
| Update own profile     | ✅     | ✅     | ✅         | ✅    |
| Create farms           | ❌     | ✅     | ✅         | ✅    |
| Manage own farms       | ❌     | ✅     | ✅         | ✅    |
| Create threads         | ❌     | ✅     | ✅         | ✅    |
| Chat with AI           | ❌     | ✅     | ✅         | ✅    |
| View other users       | ❌     | ❌     | ❌         | ✅    |
| Manage users           | ❌     | ❌     | ❌         | ✅    |
| System settings        | ❌     | ❌     | ❌         | ✅    |

## 📋 Data Models

### User Preferences Structure

```json
{
  "language": "en",
  "timezone": "America/New_York",
  "notifications_enabled": true,
  "email_notifications": true,
  "sms_notifications": false,
  "default_units": "metric",
  "theme": "light",
  "default_farm_id": "uuid"
}
```

### Farm Zones Structure

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

### Thread Metadata Structure

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

## 🚀 API Endpoints (To Implement)

### Users
- `GET /api/v1/users/me` - Get current user
- `PATCH /api/v1/users/me` - Update profile
- `GET /api/v1/users/me/stats` - Get user statistics
- `PATCH /api/v1/users/me/preferences` - Update preferences
- `GET /api/v1/users` - List users (admin)
- `GET /api/v1/users/{id}` - Get user by ID (admin)
- `PATCH /api/v1/users/{id}` - Update user (admin)

### Farms
- `GET /api/v1/farms` - List own farms
- `POST /api/v1/farms` - Create farm
- `GET /api/v1/farms/{id}` - Get farm details
- `PATCH /api/v1/farms/{id}` - Update farm
- `DELETE /api/v1/farms/{id}` - Delete farm

### Threads (Updated)
- `GET /api/v1/threads` - List own threads (with farm filter)
- `POST /api/v1/threads` - Create thread (with farm context)
- `GET /api/v1/threads/{id}` - Get thread with messages
- `PATCH /api/v1/threads/{id}` - Update thread
- `DELETE /api/v1/threads/{id}` - Delete thread

## 📝 Setup Checklist

### Database Setup
- [ ] Run SQL migration in Supabase
- [ ] Verify all tables created
- [ ] Check RLS policies enabled
- [ ] Test triggers working

### Backend Configuration
- [ ] Update `.env` with Supabase credentials
- [ ] Install PyJWT for token validation
- [ ] Update `main.py` to include auth
- [ ] Create user/farm router files

### First User Setup
- [ ] Create admin user in Supabase Auth
- [ ] Insert admin into users table
- [ ] Test login and get JWT token
- [ ] Verify API authentication works

### Frontend Integration
- [ ] Install Supabase JS client
- [ ] Implement login/signup UI
- [ ] Store JWT token (localStorage/cookies)
- [ ] Add auth header to API calls
- [ ] Create user profile page
- [ ] Create farm management UI

## 🔧 Next Steps

### Immediate
1. Run the SQL migration
2. Configure environment variables
3. Create first admin user
4. Test authentication flow

### Short-term
1. Implement user/farm API endpoints
2. Update thread endpoints with user context
3. Add authentication to agent endpoint
4. Create frontend login page

### Long-term
1. User registration flow
2. Email verification
3. Password reset
4. Multi-farm management UI
5. User analytics dashboard
6. Notification system
7. Sharing/collaboration features

## 📚 Key Files

```
backend/
├── models.py                           # ✅ Database models
├── auth.py                             # ✅ Authentication utilities
├── schemas.py                          # ✅ Pydantic schemas
├── DATABASE_SCHEMA.md                  # ✅ Schema documentation
├── USER_MANAGEMENT_SETUP.md            # ✅ Setup guide
├── migrations/
│   └── 001_user_management.sql        # ✅ SQL migration
└── routers/                           # 🔜 To implement
    ├── users.py                       # User endpoints
    └── farms.py                       # Farm endpoints
```

## 🎉 Benefits

1. **Secure** - Supabase Auth + RLS + JWT validation
2. **Scalable** - UUID keys, indexes, JSONB flexibility
3. **User-centric** - All data tied to authenticated users
4. **Context-aware** - Threads linked to farms for better AI responses
5. **Role-based** - Different permissions for different user types
6. **Auditable** - Timestamps and metadata tracking
7. **Extensible** - JSONB fields for future features

---

The user management system is fully designed and ready to deploy! 🚀
