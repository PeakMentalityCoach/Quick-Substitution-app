export type Position = 
  | 'GK' 
  | 'CB' | 'LB' | 'RB' | 'LWB' | 'RWB'
  | 'CDM' | 'CM' | 'CAM' | 'LM' | 'RM'
  | 'LW' | 'RW' | 'ST' | 'CF';

export type PlayerStatus = 'available' | 'injured' | 'suspended';

export interface PlayerNote {
  isInjured: boolean;
  minutesLimit?: number;
  safePositions?: Position[];
  excludeFromOptimizer?: boolean;
  notes?: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  preferredPosition: Position;
  alternativePositions: Position[];
  skillLevel: number; // 1-10
  status: PlayerStatus;
  minutesPlayed: number;
  notes?: PlayerNote;
}

export interface LineupPlayer {
  playerId: string;
  position: Position;
  x: number;
  y: number;
}

export interface Formation {
  name: string;
  positions: {
    position: Position;
    x: number;
    y: number;
  }[];
}

export interface SetPieceLayout {
  id: string;
  name: string;
  type: 'corner' | 'free-kick' | 'throw-in';
  positions: {
    playerId: string;
    x: number;
    y: number;
    role: string;
  }[];
}

export interface SubstitutionSuggestion {
  playerOut: Player;
  playerIn: Player;
  position: Position;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  score: number;
}

export interface GameState {
  currentMinute: number;
  score: { home: number; away: number };
  substitutionsUsed: number;
  maxSubstitutions: number;
}

export interface AppSettings {
  teamName: string;
  coachName: string;
  maxSubstitutions: number;
  gameDuration: number;
  defaultFormation: string;
}

export interface AppContextType {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  
  lineup: LineupPlayer[];
  setLineup: (lineup: LineupPlayer[]) => void;
  
  formation: Formation | null;
  setFormation: (formation: Formation) => void;
  
  setPieces: SetPieceLayout[];
  addSetPiece: (setPiece: Omit<SetPieceLayout, 'id'>) => void;
  updateSetPiece: (id: string, updates: Partial<SetPieceLayout>) => void;
  deleteSetPiece: (id: string) => void;
  
  gameState: GameState;
  setGameState: (state: Partial<GameState>) => void;
  
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  getPlayerById: (id: string) => Player | undefined;
  getAvailablePlayers: () => Player[];
  getSubstitutionSuggestions: () => SubstitutionSuggestion[];
}
