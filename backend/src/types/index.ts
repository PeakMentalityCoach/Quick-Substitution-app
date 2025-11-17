export interface PositionRating {
  position: string;
  rating: number; // 1–10
}

export interface Note {
  id: string;
  playerId: string;
  text: string;
  type: 'injury' | 'restriction' | 'general';
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  positions: string[];
  ratings: PositionRating[];
  notes?: Note[];
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

export interface LineupData {
  lineup: PlayerAssignment[];
  bench: string[];
  updatedAt: string;
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
  'KA',   // Custom position
  'PC',   // Custom position
];
