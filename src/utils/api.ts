// API Client for Substitution Optimizer Backend
// This file provides a wrapper around the backend API with authentication,
// caching, and offline support

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const AUTH_TOKEN_KEY = 'sub_optimizer_token';
const USER_DATA_KEY = 'sub_optimizer_user';
const OFFLINE_QUEUE_KEY = 'sub_optimizer_offline_queue';
const LAST_SYNC_KEY = 'sub_optimizer_last_sync';

// Types
interface ApiRequestOptions extends RequestInit {
  skipAuth?: boolean;
}

interface OfflineAction {
  id: string;
  method: string;
  url: string;
  body?: any;
  timestamp: string;
}

// Authentication helpers
export const auth = {
  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  },

  getUser(): any {
    const userData = localStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  setUser(user: any): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add authentication header if not skipped
  if (!skipAuth && auth.isAuthenticated()) {
    const token = auth.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle authentication errors
    if (response.status === 401) {
      auth.removeToken();
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Handle offline errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      // Queue mutation for later if it's a POST/PUT/PATCH/DELETE
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(fetchOptions.method || 'GET')) {
        queueOfflineAction(fetchOptions.method || 'POST', endpoint, fetchOptions.body);
      }
      throw new Error('Offline - action queued for later');
    }
    throw error;
  }
}

// Offline queue management
function queueOfflineAction(method: string, url: string, body?: any): void {
  const queue = getOfflineQueue();
  const action: OfflineAction = {
    id: Date.now().toString(),
    method,
    url,
    body,
    timestamp: new Date().toISOString(),
  };
  queue.push(action);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

function getOfflineQueue(): OfflineAction[] {
  const queue = localStorage.getItem(OFFLINE_QUEUE_KEY);
  return queue ? JSON.parse(queue) : [];
}

async function processOfflineQueue(): Promise<void> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  const processed: string[] = [];

  for (const action of queue) {
    try {
      await apiRequest(action.url, {
        method: action.method,
        body: action.body ? JSON.stringify(action.body) : undefined,
      });
      processed.push(action.id);
    } catch (error) {
      console.error('Failed to process offline action:', error);
      // Stop processing if we're still offline
      break;
    }
  }

  // Remove processed actions from queue
  const remainingQueue = queue.filter(action => !processed.includes(action.id));
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remainingQueue));
}

// Sync helpers
export const sync = {
  async syncData(deviceId: string, data?: any): Promise<any> {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);

    const response = await apiRequest('/sync', {
      method: 'POST',
      body: JSON.stringify({
        deviceId,
        lastSync,
        data,
      }),
    });

    // Update last sync timestamp
    localStorage.setItem(LAST_SYNC_KEY, response.serverTimestamp);

    return response;
  },

  getLastSync(): string | null {
    return localStorage.getItem(LAST_SYNC_KEY);
  },
};

// Authentication API
export const authApi = {
  async requestMagicLink(email: string): Promise<{ message: string }> {
    return apiRequest('/auth/request-magic-link', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email }),
    });
  },

  async verifyMagicLink(token: string): Promise<{ token: string; user: any }> {
    const response = await apiRequest<{ token: string; user: any }>('/auth/verify-magic-link', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ token }),
    });

    auth.setToken(response.token);
    auth.setUser(response.user);

    return response;
  },

  async loginWithAdminCode(email: string, adminCode: string): Promise<{ token: string; user: any }> {
    const response = await apiRequest<{ token: string; user: any }>('/auth/login-admin', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ email, adminCode }),
    });

    auth.setToken(response.token);
    auth.setUser(response.user);

    return response;
  },

  async getCurrentUser(): Promise<any> {
    return apiRequest('/auth/me', { method: 'GET' });
  },

  async updateProfile(data: { name?: string; clubName?: string }): Promise<any> {
    return apiRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  logout(): void {
    auth.removeToken();
  },
};

// Players API
export const playersApi = {
  async getAll(): Promise<any[]> {
    return apiRequest('/players', { method: 'GET' });
  },

  async getById(id: string): Promise<any> {
    return apiRequest(`/players/${id}`, { method: 'GET' });
  },

  async create(player: any): Promise<any> {
    return apiRequest('/players', {
      method: 'POST',
      body: JSON.stringify(player),
    });
  },

  async update(id: string, player: any): Promise<any> {
    return apiRequest(`/players/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(player),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/players/${id}`, { method: 'DELETE' });
  },
};

// Matches API
export const matchesApi = {
  async getAll(status?: string): Promise<any[]> {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/matches${query}`, { method: 'GET' });
  },

  async getById(id: string): Promise<any> {
    return apiRequest(`/matches/${id}`, { method: 'GET' });
  },

  async create(match: any): Promise<any> {
    return apiRequest('/matches', {
      method: 'POST',
      body: JSON.stringify(match),
    });
  },

  async update(id: string, match: any): Promise<any> {
    return apiRequest(`/matches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(match),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/matches/${id}`, { method: 'DELETE' });
  },
};

// Lineups API
export const lineupsApi = {
  async getByMatch(matchId: string): Promise<any[]> {
    return apiRequest(`/lineups/match/${matchId}`, { method: 'GET' });
  },

  async create(lineup: any): Promise<any> {
    return apiRequest('/lineups', {
      method: 'POST',
      body: JSON.stringify(lineup),
    });
  },

  async update(id: string, lineup: any): Promise<any> {
    return apiRequest(`/lineups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(lineup),
    });
  },
};

// Substitutions API
export const substitutionsApi = {
  async getByMatch(matchId: string): Promise<any[]> {
    return apiRequest(`/lineups/substitutions/match/${matchId}`, { method: 'GET' });
  },

  async create(substitution: any): Promise<any> {
    return apiRequest('/lineups/substitutions', {
      method: 'POST',
      body: JSON.stringify(substitution),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/lineups/substitutions/${id}`, { method: 'DELETE' });
  },
};

// Notes API
export const notesApi = {
  async getByMatch(matchId: string, type?: string): Promise<any[]> {
    const query = type ? `?type=${type}` : '';
    return apiRequest(`/notes/match/${matchId}${query}`, { method: 'GET' });
  },

  async getById(id: string): Promise<any> {
    return apiRequest(`/notes/${id}`, { method: 'GET' });
  },

  async create(note: any): Promise<any> {
    return apiRequest('/notes', {
      method: 'POST',
      body: JSON.stringify(note),
    });
  },

  async update(id: string, note: any): Promise<any> {
    return apiRequest(`/notes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(note),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/notes/${id}`, { method: 'DELETE' });
  },
};

// Set Pieces API
export const setpiecesApi = {
  async getAll(matchId?: string, type?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (matchId) params.append('matchId', matchId);
    if (type) params.append('type', type);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/setpieces${query}`, { method: 'GET' });
  },

  async getById(id: string): Promise<any> {
    return apiRequest(`/setpieces/${id}`, { method: 'GET' });
  },

  async create(setPiece: any): Promise<any> {
    return apiRequest('/setpieces', {
      method: 'POST',
      body: JSON.stringify(setPiece),
    });
  },

  async update(id: string, setPiece: any): Promise<any> {
    return apiRequest(`/setpieces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(setPiece),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest(`/setpieces/${id}`, { method: 'DELETE' });
  },
};

// Initialize - process offline queue on startup
export function initializeApi(): void {
  if (auth.isAuthenticated()) {
    processOfflineQueue().catch(console.error);
  }
}

// Export utility to check online status
export function isOnline(): boolean {
  return navigator.onLine;
}

// Export utility to listen for online/offline events
export function addOnlineListener(callback: () => void): void {
  window.addEventListener('online', callback);
}

export function addOfflineListener(callback: () => void): void {
  window.addEventListener('offline', callback);
}

// Default export with all APIs
export default {
  auth,
  authApi,
  playersApi,
  matchesApi,
  lineupsApi,
  substitutionsApi,
  notesApi,
  setpiecesApi,
  sync,
  initializeApi,
  isOnline,
  addOnlineListener,
  addOfflineListener,
};
