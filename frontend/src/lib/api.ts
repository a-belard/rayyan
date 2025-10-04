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
};
