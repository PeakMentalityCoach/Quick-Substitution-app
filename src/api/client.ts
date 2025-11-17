import { Player, GameState, PlayerAssignment, SetPieceLayout, SubstitutionPreview } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Generic API request wrapper
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ===== Players API =====

export async function getPlayers(): Promise<Player[]> {
  return apiRequest<Player[]>('/api/players');
}

export async function getPlayer(id: string): Promise<Player> {
  return apiRequest<Player>(`/api/players/${id}`);
}

export async function createPlayer(player: Player): Promise<Player> {
  return apiRequest<Player>('/api/players', {
    method: 'POST',
    body: JSON.stringify(player),
  });
}

export async function updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
  return apiRequest<Player>(`/api/players/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deletePlayer(id: string): Promise<void> {
  return apiRequest<void>(`/api/players/${id}`, {
    method: 'DELETE',
  });
}

// ===== Lineups API =====

export async function getCurrentLineup(): Promise<PlayerAssignment[]> {
  return apiRequest<PlayerAssignment[]>('/api/lineups/current');
}

export async function saveCurrentLineup(lineup: PlayerAssignment[]): Promise<void> {
  await apiRequest('/api/lineups/current', {
    method: 'POST',
    body: JSON.stringify(lineup),
  });
}

export async function optimizeLineup(
  playerIds: string[],
  positions: string[]
): Promise<{ lineup: PlayerAssignment[]; score: number }> {
  return apiRequest('/api/lineups/optimize', {
    method: 'POST',
    body: JSON.stringify({ playerIds, positions }),
  });
}

export async function getGameState(): Promise<GameState | null> {
  return apiRequest<GameState | null>('/api/lineups/game-state');
}

export async function saveGameState(gameState: GameState | null): Promise<void> {
  await apiRequest('/api/lineups/game-state', {
    method: 'POST',
    body: JSON.stringify(gameState),
  });
}

export async function getSubstitutionPreview(
  currentLineup: PlayerAssignment[],
  playerOutId: string,
  playerInId: string
): Promise<SubstitutionPreview> {
  return apiRequest<SubstitutionPreview>('/api/lineups/substitution-preview', {
    method: 'POST',
    body: JSON.stringify({ currentLineup, playerOutId, playerInId }),
  });
}

// ===== Set Pieces API =====

export async function getSetPieceLayouts(): Promise<SetPieceLayout[]> {
  return apiRequest<SetPieceLayout[]>('/api/set-pieces');
}

export async function getDefaultSetPieceLayouts(): Promise<SetPieceLayout[]> {
  return apiRequest<SetPieceLayout[]>('/api/set-pieces/defaults');
}

export async function getSetPieceLayout(id: string): Promise<SetPieceLayout> {
  return apiRequest<SetPieceLayout>(`/api/set-pieces/${id}`);
}

export async function createSetPieceLayout(layout: SetPieceLayout): Promise<SetPieceLayout> {
  return apiRequest<SetPieceLayout>('/api/set-pieces', {
    method: 'POST',
    body: JSON.stringify(layout),
  });
}

export async function updateSetPieceLayout(id: string, updates: Partial<SetPieceLayout>): Promise<SetPieceLayout> {
  return apiRequest<SetPieceLayout>(`/api/set-pieces/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteSetPieceLayout(id: string): Promise<void> {
  return apiRequest<void>(`/api/set-pieces/${id}`, {
    method: 'DELETE',
  });
}

// ===== Notes API =====

export async function getPlayerNotes(playerId: string): Promise<string | null> {
  const response = await apiRequest<{ notes: string | null }>(`/api/notes/player/${playerId}`);
  return response.notes;
}

export async function updatePlayerNotes(playerId: string, notes: string): Promise<void> {
  await apiRequest(`/api/notes/player/${playerId}`, {
    method: 'PUT',
    body: JSON.stringify({ notes }),
  });
}
