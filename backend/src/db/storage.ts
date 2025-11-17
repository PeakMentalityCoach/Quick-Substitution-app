import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Player, GameState, PlayerAssignment, SetPieceLayout, AppData, Note } from '../types/index.js';
import { normalizePosition } from '../utils/optimizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default data directory
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

/**
 * Ensures the data directory exists
 */
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

/**
 * Loads the database from JSON file
 */
export async function loadDatabase(): Promise<AppData> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data) as AppData;
  } catch (error) {
    // If file doesn't exist or is invalid, return default data
    return {
      squad: [],
      gameState: null,
      currentLineup: [],
      setPieceLayouts: [],
    };
  }
}

/**
 * Saves the database to JSON file
 */
export async function saveDatabase(data: AppData): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Gets all players
 */
export async function getPlayers(): Promise<Player[]> {
  const data = await loadDatabase();
  return data.squad;
}

/**
 * Gets a single player by ID
 */
export async function getPlayer(id: string): Promise<Player | null> {
  const data = await loadDatabase();
  return data.squad.find(p => p.id === id) || null;
}

/**
 * Creates a new player
 */
export async function createPlayer(player: Player): Promise<Player> {
  const data = await loadDatabase();
  data.squad.push(player);
  await saveDatabase(data);
  return player;
}

/**
 * Updates an existing player
 */
export async function updatePlayer(id: string, updates: Partial<Player>): Promise<Player | null> {
  const data = await loadDatabase();
  const index = data.squad.findIndex(p => p.id === id);

  if (index === -1) {
    return null;
  }

  data.squad[index] = { ...data.squad[index], ...updates, id }; // Preserve ID
  await saveDatabase(data);
  return data.squad[index];
}

/**
 * Deletes a player
 */
export async function deletePlayer(id: string): Promise<boolean> {
  const data = await loadDatabase();
  const initialLength = data.squad.length;
  data.squad = data.squad.filter(p => p.id !== id);

  if (data.squad.length < initialLength) {
    await saveDatabase(data);
    return true;
  }

  return false;
}

/**
 * Gets the current lineup
 */
export async function getCurrentLineup(): Promise<PlayerAssignment[]> {
  const data = await loadDatabase();
  return data.currentLineup.map(a => ({
    ...a,
    position: normalizePosition(a.position)
  }));
}

/**
 * Saves the current lineup
 */
export async function saveCurrentLineup(lineup: PlayerAssignment[]): Promise<void> {
  const data = await loadDatabase();
  data.currentLineup = lineup;
  await saveDatabase(data);
}

/**
 * Gets game state
 */
export async function getGameState(): Promise<GameState | null> {
  const data = await loadDatabase();
  if (!data.gameState) return null;

  return {
    ...data.gameState,
    lineup: data.gameState.lineup.map(a => ({
      ...a,
      position: normalizePosition(a.position)
    }))
  };
}

/**
 * Saves game state
 */
export async function saveGameState(gameState: GameState | null): Promise<void> {
  const data = await loadDatabase();
  data.gameState = gameState;
  await saveDatabase(data);
}

/**
 * Gets all set piece layouts
 */
export async function getSetPieceLayouts(): Promise<SetPieceLayout[]> {
  const data = await loadDatabase();
  return data.setPieceLayouts;
}

/**
 * Gets a single set piece layout by ID
 */
export async function getSetPieceLayout(id: string): Promise<SetPieceLayout | null> {
  const data = await loadDatabase();
  return data.setPieceLayouts.find(l => l.id === id) || null;
}

/**
 * Creates a new set piece layout
 */
export async function createSetPieceLayout(layout: SetPieceLayout): Promise<SetPieceLayout> {
  const data = await loadDatabase();
  data.setPieceLayouts.push(layout);
  await saveDatabase(data);
  return layout;
}

/**
 * Updates an existing set piece layout
 */
export async function updateSetPieceLayout(id: string, updates: Partial<SetPieceLayout>): Promise<SetPieceLayout | null> {
  const data = await loadDatabase();
  const index = data.setPieceLayouts.findIndex(l => l.id === id);

  if (index === -1) {
    return null;
  }

  data.setPieceLayouts[index] = { ...data.setPieceLayouts[index], ...updates, id }; // Preserve ID
  await saveDatabase(data);
  return data.setPieceLayouts[index];
}

/**
 * Deletes a set piece layout
 */
export async function deleteSetPieceLayout(id: string): Promise<boolean> {
  const data = await loadDatabase();
  const initialLength = data.setPieceLayouts.length;
  data.setPieceLayouts = data.setPieceLayouts.filter(l => l.id !== id);

  if (data.setPieceLayouts.length < initialLength) {
    await saveDatabase(data);
    return true;
  }

  return false;
}

/**
 * Updates player notes
 */
export async function updatePlayerNotes(playerId: string, notes: string): Promise<Player | null> {
  return updatePlayer(playerId, { notes });
}

/**
 * Gets player notes
 */
export async function getPlayerNotes(playerId: string): Promise<string | null> {
  const player = await getPlayer(playerId);
  return player?.notes || null;
}
