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

export interface Note {
  id: string;
  playerId?: string; // Optional: if note is player-specific
  content: string;
  createdAt: number;
  updatedAt: number;
}

// English & Norwegian shorthand support
export const STANDARD_POSITIONS = [
  // Goalkeeper
  "GK", "MB",

  // Center backs
  "CB", "CB1", "CB2", "MS", "VMS", "HMS",

  // Fullbacks / wingbacks
  "LB", "RB", "VB", "HB",

  // Defensive midfield
  "CDM", "DMF", "DMC",
  "DM", "DMB",
  "ADMF", "ADM", // Norwegian "anker"

  // Central midfield
  "CM", "CMF", "MC",
  "IM", "MI", "Sentral", "S",

  // Attacking midfield
  "CAM", "AM", "OffMF", "OMF",

  // Wingers
  "LW", "RW", "VK", "HK",

  // Strikers
  "ST", "CF", "CS", "SP"
];

// Mapping Norwegian → English internally
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
