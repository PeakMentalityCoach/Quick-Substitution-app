export interface PositionRating {
  position: string;
  rating: number; // 1–10
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  positions: string[];
  ratings: PositionRating[];
  notes?: string; // Player-specific notes
}

export interface PlayerAssignment {
  playerId: string;
  position: string;
}

export interface GameState {
  lineup: PlayerAssignment[];
  bench: string[];
  substitutions: {
    out: string;
    in: string;
    timestamp: number;
  }[];
}

export interface SetPieceLayout {
  id: string;
  name: string;
  type: 'offensive-corner' | 'defensive-corner' | 'free-kick-central' | 'free-kick-wide' | 'throw-in-attacking' | 'throw-in-defending';
  positions: SetPiecePosition[];
}

export interface SetPiecePosition {
  id: string;
  label: string; // CB1, CB2, RM, LM, ST, KA, PC, etc.
  x: number; // 0-100 (percentage of pitch width)
  y: number; // 0-100 (percentage of pitch height)
}

export interface SubstitutionPreview {
  playerOut: Player;
  playerIn: Player;
  oldLineup: PlayerAssignment[];
  newLineup: PlayerAssignment[];
  changes: {
    playerId: string;
    oldPosition: string | null;
    newPosition: string;
  }[];
  oldScore: number;
  newScore: number;
  scoreDelta: number;
}

export interface AppData {
  squad: Player[];
  gameState: GameState | null;
  currentLineup: PlayerAssignment[];
  setPieceLayouts: SetPieceLayout[];
}

// Standard positions used across the app (12 official roles)
export const STANDARD_POSITIONS = [
  // Defensive Line
  'GK',

  'LB',
  'CB',
  'CB1',
  'CB2',
  'RB',

  // Midfield
  'DM',   // Defensive Midfielder
  'CDM',
  'CM',
  'CM1',
  'CM2',
  'AM',   // Attacking Midfielder
  'CAM',

  // Wide Midfield / Wing
  'LM',
  'RM',
  'LW',
  'RW',

  // Strikers
  'ST',
  'CF',

  // Norwegian equivalents (mapped to English automatically)
  'VB',  // LB
  'HB',  // RB
  'MS',  // CB
  'MB',  // CB
  'DMN', // DM
  'IM',  // CM
  'KA',  // CAM / AM
  'VK',  // LW
  'HK',  // RW
  'SP',  // ST
  'CS',  // ST
  'PC',  // Set piece special role
];
