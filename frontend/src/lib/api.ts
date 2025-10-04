/**
 * API Client for Rayyan Backend
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('authToken');
  }
  return authToken;
};

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post<LoginResponse>(
            `${API_BASE}${API_PREFIX}/auth/refresh`,
            null,
            {
              params: { refresh_token: refreshToken },
            }
          );

          if (response.data.access_token) {
            setAuthToken(response.data.access_token);
            if (response.data.refresh_token) {
              localStorage.setItem('refreshToken', response.data.refresh_token);
            }

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        setAuthToken(null);
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface Thread {
  id: string;
  user_id: string;
  title: string | null;
  is_pinned: boolean;
  metadata: Record<string, any>;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface Message {
  id: string;
  thread_id: string;
  position: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CreateThreadPayload {
  title?: string;
  metadata?: Record<string, any>;
}

export interface SendMessagePayload {
  content: string;
  user_id: string;
}

// ==================== Auth & User Types ====================

export interface RegisterPayload {
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
  role?: 'admin' | 'farmer' | 'agronomist' | 'viewer';
  organization_name?: string;
  farm_location?: string;
  farm_size_hectares?: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: {
    id: string;
    email: string;
  };
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'farmer' | 'agronomist' | 'viewer';
  avatar_url: string | null;
  organization_name: string | null;
  farm_location: string | null;
  farm_size_hectares: number | null;
  preferences: Record<string, any>;
  subscription_tier: string | null;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  thread_count?: number;
  farm_count?: number;
}

export interface UpdateUserPayload {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  organization_name?: string;
  farm_location?: string;
  farm_size_hectares?: number;
  preferences?: Record<string, any>;
}

// ==================== Farm Types ====================

export interface FarmZone {
  id: string;
  name?: string;
  crop?: string;
  crop_variety?: string;
  area_hectares?: number;
  points?: [number, number][];  // Polygon coordinates [(lat, lng), ...]
  planting_date?: string;
  growth_stage?: string;
  sensors?: string[];
  color?: string;  // For map visualization
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  size_hectares: number | null;
  soil_type: string | null;
  irrigation_type: string | null;
  crops: string[];
  zones: FarmZone[];
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFarmPayload {
  name: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  size_hectares?: number;
  soil_type?: string;
  irrigation_type?: string;
  crops?: string[];
  zones?: FarmZone[];
  metadata?: Record<string, any>;
}

export interface UpdateFarmPayload {
  name?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  size_hectares?: number;
  soil_type?: string;
  irrigation_type?: string;
  crops?: string[];
  zones?: FarmZone[];
  metadata?: Record<string, any>;
  is_active?: boolean;
}

/**
 * Authentication API
 */
export const authApi = {
  /**
   * Register a new user
   */
  async register(payload: RegisterPayload): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', payload);
    return response.data;
  },

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    
    // Store token and refresh token
    if (response.data.access_token) {
      setAuthToken(response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refreshToken', response.data.refresh_token);
      }
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAuthToken(null);
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', null, {
      params: { refresh_token: refreshToken },
    });
    
    // Update stored token
    if (response.data.access_token) {
      setAuthToken(response.data.access_token);
    }
    
    return response.data;
  },
};

/**
 * Users API
 */
export const usersApi = {
  /**
   * Get current user profile
   */
  async getMe(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Update current user profile
   */
  async updateMe(payload: UpdateUserPayload): Promise<User> {
    const response = await apiClient.patch<User>('/me', payload);
    return response.data;
  },

  /**
   * Get user by ID (agronomist/admin only)
   */
  async getById(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },
};

/**
 * Farms API
 */
export const farmsApi = {
  /**
   * List all farms for current user
   */
  async list(): Promise<Farm[]> {
    const response = await apiClient.get<Farm[]>('/farms');
    return response.data;
  },

  /**
   * Create a new farm
   */
  async create(payload: CreateFarmPayload): Promise<Farm> {
    const response = await apiClient.post<Farm>('/farms', payload);
    return response.data;
  },

  /**
   * Get a specific farm
   */
  async get(farmId: string): Promise<Farm> {
    const response = await apiClient.get<Farm>(`/farms/${farmId}`);
    return response.data;
  },

  /**
   * Update a farm
   */
  async update(farmId: string, payload: UpdateFarmPayload): Promise<Farm> {
    const response = await apiClient.patch<Farm>(`/farms/${farmId}`, payload);
    return response.data;
  },

  /**
   * Delete a farm (soft delete)
   */
  async delete(farmId: string): Promise<void> {
    await apiClient.delete(`/farms/${farmId}`);
  },
};

/**
 * Threads API
 */
export const threadsApi = {
  /**
   * List all threads for a user
   */
  async list(userId: string): Promise<Thread[]> {
    const response = await apiClient.get<Thread[]>('/threads/', {
      params: { user_id: userId },
    });
    return response.data;
  },

  /**
   * Create a new thread
   */
  async create(userId: string, payload: CreateThreadPayload): Promise<Thread> {
    const response = await apiClient.post<Thread>('/threads/', payload, {
      params: { user_id: userId },
    });
    return response.data;
  },

  /**
   * Get a specific thread
   */
  async get(threadId: string, userId: string): Promise<Thread> {
    const response = await apiClient.get<Thread>(`/threads/${threadId}`, {
      params: { user_id: userId },
    });
    return response.data;
  },

  /**
   * Update a thread
   */
  async update(
    threadId: string,
    userId: string,
    payload: Partial<CreateThreadPayload>
  ): Promise<Thread> {
    const response = await apiClient.patch<Thread>(
      `/threads/${threadId}`,
      payload,
      {
        params: { user_id: userId },
      }
    );
    return response.data;
  },

  /**
   * Delete a thread
   */
  async delete(threadId: string, userId: string): Promise<void> {
    await apiClient.delete(`/threads/${threadId}`, {
      params: { user_id: userId },
    });
  },
};

/**
 * Agent/Messages API
 */
export const agentApi = {
  /**
   * Get messages for a thread
   */
  async getMessages(threadId: string, userId: string): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(
      `/agent/threads/${threadId}/messages`,
      {
        params: { user_id: userId },
      }
    );
    return response.data;
  },

  /**
   * Send a message and stream the response
   * Returns a ReadableStreamDefaultReader for SSE events
   * 
   * Note: Uses fetch instead of axios because axios doesn't support
   * ReadableStream in browsers (needed for SSE streaming).
   * Axios streams are designed for Node.js, not browser environments.
   */
  async sendMessage(
    threadId: string,
    payload: SendMessagePayload
  ): Promise<ReadableStreamDefaultReader<Uint8Array>> {
    const response = await fetch(
      `${API_BASE}${API_PREFIX}/agent/threads/${threadId}/run`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    return response.body.getReader();
  },
};

export { API_BASE, API_PREFIX, apiClient };

// ==================== Dashboard Data Types ====================

export interface SensorReading {
  id: string;
  zone_id: string;
  soil_moisture: number | null;
  temperature: number | null;
  humidity: number | null;
  soil_ph: number | null;
  reading_timestamp: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  farm_id: string;
  user_id: string | null;
  name: string;
  role: string;
  status: 'active' | 'break' | 'off-duty' | 'vacation';
  current_zone_id: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  hired_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmTask {
  id: string;
  farm_id: string;
  zone_id: string | null;
  assigned_to: string | null;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  due_date: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface YieldRecord {
  id: string;
  zone_id: string;
  harvest_date: string;
  amount: number;
  unit: string;
  quality_grade: string | null;
  notes: string | null;
  created_at: string;
}

export interface WaterUsage {
  id: string;
  zone_id: string;
  usage_date: string;
  amount: number;
  irrigation_method: string | null;
  duration_minutes: number | null;
  efficiency_rating: number | null;
  cost: number | null;
  created_at: string;
}

export interface WaterStorage {
  id: string;
  farm_id: string;
  name: string;
  capacity: number;
  current_level: number;
  critical_level: number | null;
  last_refill_date: string | null;
  next_refill_date: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IrrigationSchedule {
  id: string;
  zone_id: string;
  scheduled_time: string;
  estimated_amount: number | null;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed' | 'skipped';
  completed_at: string | null;
  actual_amount: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PesticideInventory {
  id: string;
  farm_id: string;
  name: string;
  product_type: string | null;
  current_stock: number;
  unit: string;
  capacity: number | null;
  reorder_threshold: number | null;
  last_used_date: string | null;
  next_order_date: string | null;
  cost_per_unit: number | null;
  supplier: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ZoneAlert {
  id: string;
  zone_id: string;
  alert_type: 'info' | 'warning' | 'critical';
  message: string;
  priority: number;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface ZoneRecommendation {
  id: string;
  zone_id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string | null;
  is_active: boolean;
  applied_at: string | null;
  applied_by: string | null;
  effectiveness_rating: number | null;
  feedback: string | null;
  created_at: string;
}

// ==================== Dashboard API Namespaces ====================

/**
 * Sensors API - Zone sensor readings
 */
export const sensorsApi = {
  /**
   * Get sensor readings for a zone
   */
  async getByZone(zoneId: string, limit?: number): Promise<SensorReading[]> {
    const response = await apiClient.get<SensorReading[]>(`/zones/${zoneId}/sensors`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get latest sensor reading for a zone
   */
  async getLatest(zoneId: string): Promise<SensorReading | null> {
    const response = await apiClient.get<SensorReading>(`/zones/${zoneId}/sensors/latest`);
    return response.data;
  },

  /**
   * Create a sensor reading
   */
  async create(data: Omit<SensorReading, 'id' | 'created_at'>): Promise<SensorReading> {
    const response = await apiClient.post<SensorReading>('/sensors', data);
    return response.data;
  },
};

/**
 * Team API - Team member management
 */
export const teamApi = {
  /**
   * List all team members for a farm
   */
  async list(farmId: string): Promise<TeamMember[]> {
    const response = await apiClient.get<TeamMember[]>(`/farms/${farmId}/team`);
    return response.data;
  },

  /**
   * Get a specific team member
   */
  async get(memberId: string): Promise<TeamMember> {
    const response = await apiClient.get<TeamMember>(`/team/${memberId}`);
    return response.data;
  },

  /**
   * Create a team member
   */
  async create(data: Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>): Promise<TeamMember> {
    const response = await apiClient.post<TeamMember>('/team', data);
    return response.data;
  },

  /**
   * Update a team member
   */
  async update(memberId: string, data: Partial<TeamMember>): Promise<TeamMember> {
    const response = await apiClient.patch<TeamMember>(`/team/${memberId}`, data);
    return response.data;
  },

  /**
   * Update team member status
   */
  async updateStatus(memberId: string, status: string): Promise<TeamMember> {
    return teamApi.update(memberId, { status } as Partial<TeamMember>);
  },

  /**
   * Update team member location
   */
  async updateLocation(memberId: string, zoneId: string | null): Promise<TeamMember> {
    return teamApi.update(memberId, { current_zone_id: zoneId } as Partial<TeamMember>);
  },

  /**
   * Delete a team member
   */
  async delete(memberId: string): Promise<void> {
    await apiClient.delete(`/team/${memberId}`);
  },
};

/**
 * Tasks API - Farm task management
 */
export const tasksApi = {
  /**
   * List all tasks for a farm
   */
  async list(farmId: string, status?: string): Promise<FarmTask[]> {
    const response = await apiClient.get<FarmTask[]>(`/farms/${farmId}/tasks`, {
      params: { status },
    });
    return response.data;
  },

  /**
   * Get tasks by assignee
   */
  async getByAssignee(assigneeId: string, status?: string): Promise<FarmTask[]> {
    const response = await apiClient.get<FarmTask[]>(`/team/${assigneeId}/tasks`, {
      params: { status },
    });
    return response.data;
  },

  /**
   * Get a specific task
   */
  async get(taskId: string): Promise<FarmTask> {
    const response = await apiClient.get<FarmTask>(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Create a task
   */
  async create(data: Omit<FarmTask, 'id' | 'created_at' | 'updated_at'>): Promise<FarmTask> {
    const response = await apiClient.post<FarmTask>('/tasks', data);
    return response.data;
  },

  /**
   * Update a task
   */
  async update(taskId: string, data: Partial<FarmTask>): Promise<FarmTask> {
    const response = await apiClient.patch<FarmTask>(`/tasks/${taskId}`, data);
    return response.data;
  },

  /**
   * Complete a task
   */
  async complete(taskId: string): Promise<FarmTask> {
    return tasksApi.update(taskId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  },

  /**
   * Delete a task
   */
  async delete(taskId: string): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};

/**
 * Yields API - Harvest tracking
 */
export const yieldsApi = {
  /**
   * Get yield records for a zone
   */
  async getByZone(zoneId: string, limit?: number): Promise<YieldRecord[]> {
    const response = await apiClient.get<YieldRecord[]>(`/zones/${zoneId}/yields`, {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get yield summary for a farm
   */
  async getSummary(farmId: string, startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.get(`/farms/${farmId}/yields/summary`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  /**
   * Create a yield record
   */
  async create(data: Omit<YieldRecord, 'id' | 'created_at'>): Promise<YieldRecord> {
    const response = await apiClient.post<YieldRecord>('/yields', data);
    return response.data;
  },

  /**
   * Update a yield record
   */
  async update(yieldId: string, data: Partial<YieldRecord>): Promise<YieldRecord> {
    const response = await apiClient.patch<YieldRecord>(`/yields/${yieldId}`, data);
    return response.data;
  },

  /**
   * Delete a yield record
   */
  async delete(yieldId: string): Promise<void> {
    await apiClient.delete(`/yields/${yieldId}`);
  },
};

/**
 * Water API - Water management (usage, storage, schedules)
 */
export const waterApi = {
  // Water Usage
  async getUsageByZone(zoneId: string, days?: number): Promise<WaterUsage[]> {
    const response = await apiClient.get<WaterUsage[]>(`/zones/${zoneId}/water-usage`, {
      params: { days },
    });
    return response.data;
  },

  async getUsageStats(farmId: string, startDate?: string, endDate?: string): Promise<any> {
    const response = await apiClient.get(`/farms/${farmId}/water-usage/stats`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  async recordUsage(data: Omit<WaterUsage, 'id' | 'created_at'>): Promise<WaterUsage> {
    const response = await apiClient.post<WaterUsage>('/water-usage', data);
    return response.data;
  },

  // Water Storage
  async getStorage(farmId: string): Promise<WaterStorage[]> {
    const response = await apiClient.get<WaterStorage[]>(`/farms/${farmId}/water-storage`);
    return response.data;
  },

  async updateStorageLevel(storageId: string, level: number): Promise<WaterStorage> {
    const response = await apiClient.patch<WaterStorage>(`/water-storage/${storageId}`, {
      current_level: level,
    });
    return response.data;
  },

  // Irrigation Schedules
  async getSchedules(zoneId: string, status?: string): Promise<IrrigationSchedule[]> {
    const response = await apiClient.get<IrrigationSchedule[]>(`/zones/${zoneId}/irrigation`, {
      params: { status },
    });
    return response.data;
  },

  async createSchedule(
    data: Omit<IrrigationSchedule, 'id' | 'created_at' | 'updated_at'>
  ): Promise<IrrigationSchedule> {
    const response = await apiClient.post<IrrigationSchedule>('/irrigation', data);
    return response.data;
  },

  async updateSchedule(scheduleId: string, data: Partial<IrrigationSchedule>): Promise<IrrigationSchedule> {
    const response = await apiClient.patch<IrrigationSchedule>(`/irrigation/${scheduleId}`, data);
    return response.data;
  },

  async completeSchedule(scheduleId: string, actualAmount: number): Promise<IrrigationSchedule> {
    return waterApi.updateSchedule(scheduleId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      actual_amount: actualAmount,
    });
  },
};

/**
 * Pesticides API - Chemical inventory management
 */
export const pesticidesApi = {
  /**
   * List all pesticides for a farm
   */
  async list(farmId: string): Promise<PesticideInventory[]> {
    const response = await apiClient.get<PesticideInventory[]>(`/farms/${farmId}/pesticides`);
    return response.data;
  },

  /**
   * Get pesticides needing reorder
   */
  async getNeedingReorder(farmId: string): Promise<PesticideInventory[]> {
    const response = await apiClient.get<PesticideInventory[]>(`/farms/${farmId}/pesticides/reorder`);
    return response.data;
  },

  /**
   * Get a specific pesticide
   */
  async get(pesticideId: string): Promise<PesticideInventory> {
    const response = await apiClient.get<PesticideInventory>(`/pesticides/${pesticideId}`);
    return response.data;
  },

  /**
   * Create a pesticide inventory item
   */
  async create(
    data: Omit<PesticideInventory, 'id' | 'created_at' | 'updated_at'>
  ): Promise<PesticideInventory> {
    const response = await apiClient.post<PesticideInventory>('/pesticides', data);
    return response.data;
  },

  /**
   * Update a pesticide inventory item
   */
  async update(pesticideId: string, data: Partial<PesticideInventory>): Promise<PesticideInventory> {
    const response = await apiClient.patch<PesticideInventory>(`/pesticides/${pesticideId}`, data);
    return response.data;
  },

  /**
   * Update stock level
   */
  async updateStock(pesticideId: string, stock: number): Promise<PesticideInventory> {
    return pesticidesApi.update(pesticideId, { current_stock: stock } as Partial<PesticideInventory>);
  },

  /**
   * Delete a pesticide
   */
  async delete(pesticideId: string): Promise<void> {
    await apiClient.delete(`/pesticides/${pesticideId}`);
  },
};

/**
 * Alerts API - Zone alerts management
 */
export const alertsApi = {
  /**
   * Get alerts for a zone
   */
  async getByZone(zoneId: string, resolved?: boolean): Promise<ZoneAlert[]> {
    const response = await apiClient.get<ZoneAlert[]>(`/zones/${zoneId}/alerts`, {
      params: { resolved },
    });
    return response.data;
  },

  /**
   * Get all alerts for a farm
   */
  async getByFarm(farmId: string, resolved?: boolean): Promise<ZoneAlert[]> {
    const response = await apiClient.get<ZoneAlert[]>(`/farms/${farmId}/alerts`, {
      params: { resolved },
    });
    return response.data;
  },

  /**
   * Create an alert
   */
  async create(data: Omit<ZoneAlert, 'id' | 'created_at'>): Promise<ZoneAlert> {
    const response = await apiClient.post<ZoneAlert>('/alerts', data);
    return response.data;
  },

  /**
   * Resolve an alert
   */
  async resolve(alertId: string, userId: string): Promise<ZoneAlert> {
    const response = await apiClient.patch<ZoneAlert>(`/alerts/${alertId}`, {
      is_resolved: true,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
    });
    return response.data;
  },

  /**
   * Delete an alert
   */
  async delete(alertId: string): Promise<void> {
    await apiClient.delete(`/alerts/${alertId}`);
  },
};

/**
 * Recommendations API - Zone recommendations
 */
export const recommendationsApi = {
  /**
   * Get recommendations for a zone
   */
  async getByZone(zoneId: string, active?: boolean): Promise<ZoneRecommendation[]> {
    const response = await apiClient.get<ZoneRecommendation[]>(`/zones/${zoneId}/recommendations`, {
      params: { active },
    });
    return response.data;
  },

  /**
   * Get recommendations by category
   */
  async getByCategory(zoneId: string, category: string): Promise<ZoneRecommendation[]> {
    const response = await apiClient.get<ZoneRecommendation[]>(`/zones/${zoneId}/recommendations`, {
      params: { category },
    });
    return response.data;
  },

  /**
   * Create a recommendation
   */
  async create(data: Omit<ZoneRecommendation, 'id' | 'created_at'>): Promise<ZoneRecommendation> {
    const response = await apiClient.post<ZoneRecommendation>('/recommendations', data);
    return response.data;
  },

  /**
   * Mark recommendation as applied
   */
  async apply(recommendationId: string, userId: string): Promise<ZoneRecommendation> {
    const response = await apiClient.patch<ZoneRecommendation>(`/recommendations/${recommendationId}`, {
      applied_at: new Date().toISOString(),
      applied_by: userId,
    });
    return response.data;
  },

  /**
   * Rate recommendation effectiveness
   */
  async rate(recommendationId: string, rating: number, feedback?: string): Promise<ZoneRecommendation> {
    const response = await apiClient.patch<ZoneRecommendation>(`/recommendations/${recommendationId}`, {
      effectiveness_rating: rating,
      feedback,
    });
    return response.data;
  },

  /**
   * Delete a recommendation
   */
  async delete(recommendationId: string): Promise<void> {
    await apiClient.delete(`/recommendations/${recommendationId}`);
  },
};

// Convenience exports for common operations
export default {
  // Auth
  register: authApi.register,
  login: authApi.login,
  logout: authApi.logout,
  getMe: usersApi.getMe,
  
  // Farms
  createFarm: farmsApi.create,
  listFarms: farmsApi.list,
  getFarm: farmsApi.get,
  
  // Threads
  createThread: threadsApi.create,
  listThreads: threadsApi.list,
  getThread: threadsApi.get,
  deleteThread: threadsApi.delete,
  
  // Messages
  getMessages: agentApi.getMessages,
  sendMessage: agentApi.sendMessage,
  
  // Dashboard Data
  sensors: sensorsApi,
  team: teamApi,
  tasks: tasksApi,
  yields: yieldsApi,
  water: waterApi,
  pesticides: pesticidesApi,
  alerts: alertsApi,
  recommendations: recommendationsApi,
};
