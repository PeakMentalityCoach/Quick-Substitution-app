import fs from 'fs';
import path from 'path';
import { LineupData } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const LINEUPS_FILE = path.join(DATA_DIR, 'lineups.json');

/**
 * Ensures the data directory exists
 */
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Load lineup data from lineups.json
 * Returns null if file doesn't exist
 */
export function loadLineups(): LineupData | null {
  ensureDataDir();

  if (!fs.existsSync(LINEUPS_FILE)) {
    return null;
  }

  try {
    const data = fs.readFileSync(LINEUPS_FILE, 'utf-8');
    return JSON.parse(data) as LineupData;
  } catch (error) {
    console.error('Error reading lineups.json:', error);
    return null;
  }
}

/**
 * Save lineup data to lineups.json
 */
export function saveLineups(data: LineupData): void {
  ensureDataDir();

  try {
    fs.writeFileSync(LINEUPS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing lineups.json:', error);
    throw new Error('Failed to save lineup data');
  }
}
