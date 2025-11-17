// Player Types
export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  attributes: PlayerAttributes;
  notes: string;
  isAvailable: boolean;
  minutesPlayed: number;
  fatigueLevel: number; // 0-100
}

export type Position =
  | 'GK'
  | 'LB' | 'LCB' | 'CB' | 'RCB' | 'RB'
  | 'LWB' | 'RWB'
  | 'LDM' | 'CDM' | 'RDM'
  | 'LCM' | 'CM' | 'RCM'
  | 'LAM' | 'CAM' | 'RAM'
  | 'LW' | 'RW'
  | 'LF' | 'CF' | 'RF'
  | 'ST';

export interface PlayerAttributes {
  pace: number; // 1-20
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  tactical: number;
  mental: number;
}

// Formation Types
export type Formation =
  | '4-4-2'
  | '4-3-3'
  | '4-2-3-1'
  | '3-5-2'
  | '3-4-3'
  | '5-3-2'
  | '4-1-4-1'
  | '4-5-1';

export interface FormationPosition {
  position: Position;
  x: number; // 0-100 (percentage of pitch width)
  y: number; // 0-100 (percentage of pitch height)
  role: string; // e.g., "Playmaker", "Box-to-Box", "Target Man"
}

export interface FormationTemplate {
  name: Formation;
  positions: FormationPosition[];
}

// Game State Types
export interface GameState {
  formation: Formation;
  startingLineup: LineupPosition[];
  substitutes: Player[];
  currentScore: Score;
  matchTime: number; // minutes
  isMatchActive: boolean;
  substitutionsUsed: number;
  maxSubstitutions: number;
  matchEvents: MatchEvent[];
}

export interface LineupPosition {
  position: Position;
  player: Player | null;
  x: number;
  y: number;
}

export interface Score {
  home: number;
  away: number;
}

export interface MatchEvent {
  id: string;
  type: 'goal' | 'substitution' | 'yellow_card' | 'red_card' | 'injury';
  minute: number;
  playerId: string;
  description: string;
  timestamp: Date;
}

export interface Substitution {
  playerOut: Player;
  playerIn: Player;
  minute: number;
  reason: string;
}

// Set Piece Types
export type SetPieceType =
  | 'defensive_corner'
  | 'offensive_corner'
  | 'corridor_free_kick'
  | 'central_free_kick'
  | 'long_throw'
  | 'defensive_wall';

export interface SetPiece {
  id: string;
  type: SetPieceType;
  name: string;
  description: string;
  positions: SetPiecePosition[];
  isDefault: boolean;
}

export interface SetPiecePosition {
  playerId: string | null;
  role: string; // e.g., "Near Post", "Far Post", "Short Option"
  x: number;
  y: number;
  instructions: string;
}

// Optimization Types
export interface OptimizationConfig {
  useNotes: boolean;
  prioritizePositions: Position[];
  considerFatigue: boolean;
  formationWeights: FormationWeights;
}

export interface FormationWeights {
  positionMatch: number; // How much to weight exact position match
  attributeMatch: number; // How much to weight attribute fit
  chemistry: number; // How much to weight player chemistry
  fatigue: number; // How much to weight fatigue
  notes: number; // How much to weight notes interpretation
}

export interface OptimizationResult {
  lineup: LineupPosition[];
  score: number;
  reasoning: string[];
  warnings: string[];
}

export interface PositionScore {
  player: Player;
  position: Position;
  score: number;
  breakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  positionFit: number;
  attributeFit: number;
  chemistryFit: number;
  fatiguePenalty: number;
  notesModifier: number;
  total: number;
}

// Notes Interpretation Types
export interface NotesInterpretation {
  playerId: string;
  modifiers: NoteModifier[];
  warnings: string[];
}

export interface NoteModifier {
  type: 'boost' | 'penalty' | 'restriction' | 'preference';
  position?: Position;
  value: number;
  reason: string;
}

// Settings Types
export interface AppSettings {
  theme: 'light' | 'dark';
  useNotesForOptimization: boolean;
  defaultFormation: Formation;
  maxSubstitutions: number;
  enableAnimations: boolean;
  autoSave: boolean;
}

// Drag and Drop Types
export interface DraggablePlayer {
  id: string;
  player: Player;
  currentPosition: Position | null;
}

export interface DroppableZone {
  id: string;
  position: Position;
  accepts: Position[];
}

// Persistence Types
export interface SavedData {
  players: Player[];
  gameState: GameState;
  setPieces: SetPiece[];
  settings: AppSettings;
  lastUpdated: Date;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
