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
  note?: string;
  noteAffectsOptimization: boolean;
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
  type: 'offensive-corner' | 'defensive-corner' | 'free-kick-central' | 'free-kick-wide' | 'throw-in-attacking' | 'throw-in-defending' | 'shot-wall';
  positions: SetPiecePosition[];
  assignments?: PlayerAssignment[];
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

// Note interpretation results
export interface PlayerNoteInterpretation {
  forbiddenPositions: string[];
  ratingPenalty: number; // 0-10, subtracted from all ratings
  mustSubOutAtMinute?: number;
  warningMessage?: string;
}

// Match-day mode structures
export interface MatchContext {
  currentMinute: number;
  score: { home: number; away: number };
  isHome: boolean;
  substitutionsRemaining: number;
}

export interface SetPieceScenario {
  id: string;
  layoutId: string;
  description: string;
  timestamp: number;
}

// Drag and drop types
export interface DragItem {
  playerId: string;
  sourcePosition?: string;
}

// Standard positions used across the app
export const STANDARD_POSITIONS = [
  'GK',   // Goalkeeper
  'CB1',  // Center Back 1
  'CB2',  // Center Back 2
  'LB',   // Left Back
  'RB',   // Right Back
  'CDM',  // Defensive Midfielder
  'CM',   // Central Midfielder
  'LM',   // Left Midfielder
  'RM',   // Right Midfielder
  'CAM',  // Attacking Midfielder
  'LW',   // Left Winger
  'RW',   // Right Winger
  'ST',   // Striker
  'CF',   // Center Forward
  'KA',   // Custom position (from coach's diagram)
  'PC',   // Custom position (from coach's diagram)
];
