/**
 * Shared TypeScript interfaces for the Football Optimizer backend
 */

export type Position = 'GK' | 'DEF' | 'MID' | 'ATT';

export interface Player {
  id: string;
  name: string;
  positions: Position[];
  rating: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlayerDto {
  name: string;
  positions: Position[];
  rating: number;
  notes?: string;
}

export interface UpdatePlayerDto {
  name?: string;
  positions?: Position[];
  rating?: number;
  notes?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
