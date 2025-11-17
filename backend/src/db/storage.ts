import fs from 'fs/promises';
import path from 'path';
import { Player } from '../types';

/**
 * Simple JSON file-based storage system for players
 */

const DATA_DIR = path.join(__dirname, '../../data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');

/**
 * Ensure the data directory and players file exist
 */
async function ensureDataFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    try {
      await fs.access(PLAYERS_FILE);
    } catch {
      // File doesn't exist, create it with empty array
      await fs.writeFile(PLAYERS_FILE, JSON.stringify([], null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
    throw error;
  }
}

/**
 * Read all players from storage
 */
export async function getAllPlayers(): Promise<Player[]> {
  await ensureDataFile();

  try {
    const data = await fs.readFile(PLAYERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading players:', error);
    return [];
  }
}

/**
 * Get a single player by ID
 */
export async function getPlayerById(id: string): Promise<Player | null> {
  const players = await getAllPlayers();
  return players.find(p => p.id === id) || null;
}

/**
 * Save all players to storage
 */
async function savePlayers(players: Player[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(PLAYERS_FILE, JSON.stringify(players, null, 2));
}

/**
 * Create a new player
 */
export async function createPlayer(player: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>): Promise<Player> {
  const players = await getAllPlayers();

  const newPlayer: Player = {
    ...player,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  players.push(newPlayer);
  await savePlayers(players);

  return newPlayer;
}

/**
 * Update an existing player
 */
export async function updatePlayer(id: string, updates: Partial<Omit<Player, 'id' | 'createdAt'>>): Promise<Player | null> {
  const players = await getAllPlayers();
  const index = players.findIndex(p => p.id === id);

  if (index === -1) {
    return null;
  }

  players[index] = {
    ...players[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await savePlayers(players);
  return players[index];
}

/**
 * Delete a player by ID
 */
export async function deletePlayer(id: string): Promise<boolean> {
  const players = await getAllPlayers();
  const filteredPlayers = players.filter(p => p.id !== id);

  if (filteredPlayers.length === players.length) {
    return false; // Player not found
  }

  await savePlayers(filteredPlayers);
  return true;
}

/**
 * Generate a unique ID for a player
 */
function generateId(): string {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
