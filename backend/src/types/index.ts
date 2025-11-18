export interface PositionRating {
  position: string;
  rating: number;
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  positions: string[];
  ratings: PositionRating[];
  notes?: string;
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
  type:
    | "offensive-corner"
    | "defensive-corner"
    | "free-kick-central"
    | "free-kick-wide"
    | "throw-in-attacking"
    | "throw-in-defending";
  positions: SetPiecePosition[];
}

export interface SetPiecePosition {
  id: string;
  label: string;
  x: number;
  y: number;
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
  playerId?: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

/* -------------------------------------------------------
   OFFICIAL STANDARD POSITIONS (ENGLISH ONLY INTERNALLY)
-------------------------------------------------------- */

export const STANDARD_POSITIONS = [
  "GK",

  "LB",
  "CB",
  "CB1",
  "CB2",
  "RB",

  "DM",
  "CDM",
  "CM",
  "CM1",
  "CM2",
  "AM",
  "CAM",

  "LM",
  "RM",
  "LW",
  "RW",

  "ST",
  "CF",
];

/* -------------------------------------------------------
   NORWEGIAN → ENGLISH NORMALIZATION MAP
-------------------------------------------------------- */

export const POSITION_MAP: Record<string, string> = {
  // Goalkeeper
  "MB": "CB",

  // Centre-backs
  "MS": "CB",

  // Fullbacks
  "VB": "LB",
  "HB": "RB",

  // Midfield
  "DMN": "DM",
  "IM": "CM",
  "MI": "CM",
  "Sentral": "CM",
  "S": "CM",
  "KA": "CAM",

  // Wingers
  "VK": "LW",
  "HK": "RW",

  // Strikers
  "SP": "ST",
  "CS": "ST",
  "PC": "ST",
};
