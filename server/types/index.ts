import { Request } from 'express';

// Extend Express Request to include user data from JWT
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Sync request payload
export interface SyncRequest {
  deviceId: string;
  lastSync?: string; // ISO timestamp
  data?: {
    players?: any[];
    matches?: any[];
    lineups?: any[];
    substitutions?: any[];
    notes?: any[];
    setPieces?: any[];
  };
}

// Sync response payload
export interface SyncResponse {
  updates: {
    players?: any[];
    matches?: any[];
    lineups?: any[];
    substitutions?: any[];
    notes?: any[];
    setPieces?: any[];
  };
  serverTimestamp: string;
  conflicts?: ConflictItem[];
}

// Conflict item
export interface ConflictItem {
  entityType: string;
  entityId: string;
  clientVersion: any;
  serverVersion: any;
  resolution: 'server-wins' | 'client-wins';
}

// Event log entry
export interface EventLogEntry {
  eventType: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  deviceId?: string;
}
