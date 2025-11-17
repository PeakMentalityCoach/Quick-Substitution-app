import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Player,
  PlayerAssignment,
  GameState,
  SetPieceLayout,
  AppData,
  MatchContext,
} from '../types';
import { loadData, saveData } from '../utils/storage';
import { getDefaultSetPieceLayouts } from '../utils/setPieces';

interface AppContextType {
  // Squad management
  squad: Player[];
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;

  // Lineup management
  currentLineup: PlayerAssignment[];
  setCurrentLineup: (lineup: PlayerAssignment[]) => void;

  // Game state
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;
  startGame: (lineup: PlayerAssignment[]) => void;
  endGame: () => void;
  makeSubstitution: (playerOutId: string, playerInId: string) => void;

  // Set pieces
  setPieceLayouts: SetPieceLayout[];
  updateSetPieceLayout: (layout: SetPieceLayout) => void;
  addSetPieceLayout: (layout: SetPieceLayout) => void;
  deleteSetPieceLayout: (layoutId: string) => void;

  // Match context
  matchContext: MatchContext;
  updateMatchContext: (context: Partial<MatchContext>) => void;

  // Settings
  useNotesInOptimization: boolean;
  setUseNotesInOptimization: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Load initial data
  const initialData = loadData();

  const [squad, setSquad] = useState<Player[]>(initialData.squad);
  const [currentLineup, setCurrentLineup] = useState<PlayerAssignment[]>(
    initialData.currentLineup
  );
  const [gameState, setGameState] = useState<GameState | null>(initialData.gameState);
  const [setPieceLayouts, setSetPieceLayouts] = useState<SetPieceLayout[]>(
    initialData.setPieceLayouts.length > 0
      ? initialData.setPieceLayouts
      : getDefaultSetPieceLayouts()
  );
  const [useNotesInOptimization, setUseNotesInOptimization] = useState(true);

  const [matchContext, setMatchContext] = useState<MatchContext>({
    currentMinute: 0,
    score: { home: 0, away: 0 },
    isHome: true,
    substitutionsRemaining: 5,
  });

  // Save data whenever state changes
  useEffect(() => {
    const data: AppData = {
      squad,
      gameState,
      currentLineup,
      setPieceLayouts,
    };
    saveData(data);
  }, [squad, gameState, currentLineup, setPieceLayouts]);

  // Squad management functions
  const addPlayer = (player: Player) => {
    setSquad((prev) => [...prev, player]);
  };

  const updatePlayer = (player: Player) => {
    setSquad((prev) => prev.map((p) => (p.id === player.id ? player : p)));
  };

  const deletePlayer = (playerId: string) => {
    setSquad((prev) => prev.filter((p) => p.id !== playerId));
    setCurrentLineup((prev) => prev.filter((a) => a.playerId !== playerId));
    if (gameState) {
      setGameState({
        ...gameState,
        lineup: gameState.lineup.filter((a) => a.playerId !== playerId),
        bench: gameState.bench.filter((id) => id !== playerId),
      });
    }
  };

  // Game state functions
  const startGame = (lineup: PlayerAssignment[]) => {
    const benchPlayerIds = squad
      .filter((p) => !lineup.find((a) => a.playerId === p.id))
      .map((p) => p.id);

    setGameState({
      lineup,
      bench: benchPlayerIds,
      substitutions: [],
    });
    setCurrentLineup(lineup);
  };

  const endGame = () => {
    setGameState(null);
    setMatchContext({
      currentMinute: 0,
      score: { home: 0, away: 0 },
      isHome: true,
      substitutionsRemaining: 5,
    });
  };

  const makeSubstitution = (playerOutId: string, playerInId: string) => {
    if (!gameState) return;

    const timestamp = Date.now();

    // Update game state
    setGameState({
      ...gameState,
      bench: [...gameState.bench.filter((id) => id !== playerInId), playerOutId],
      substitutions: [
        ...gameState.substitutions,
        { out: playerOutId, in: playerInId, timestamp },
      ],
    });

    // Update match context
    setMatchContext((prev) => ({
      ...prev,
      substitutionsRemaining: Math.max(0, prev.substitutionsRemaining - 1),
    }));
  };

  // Set piece functions
  const updateSetPieceLayout = (layout: SetPieceLayout) => {
    setSetPieceLayouts((prev) => prev.map((l) => (l.id === layout.id ? layout : l)));
  };

  const addSetPieceLayout = (layout: SetPieceLayout) => {
    setSetPieceLayouts((prev) => [...prev, layout]);
  };

  const deleteSetPieceLayout = (layoutId: string) => {
    setSetPieceLayouts((prev) => prev.filter((l) => l.id !== layoutId));
  };

  const updateMatchContext = (updates: Partial<MatchContext>) => {
    setMatchContext((prev) => ({ ...prev, ...updates }));
  };

  const value: AppContextType = {
    squad,
    addPlayer,
    updatePlayer,
    deletePlayer,
    currentLineup,
    setCurrentLineup,
    gameState,
    setGameState,
    startGame,
    endGame,
    makeSubstitution,
    setPieceLayouts,
    updateSetPieceLayout,
    addSetPieceLayout,
    deleteSetPieceLayout,
    matchContext,
    updateMatchContext,
    useNotesInOptimization,
    setUseNotesInOptimization,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
