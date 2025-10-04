/**
 * API Client for Rayyan Backend
 */

import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if you need cookies/auth
});

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
