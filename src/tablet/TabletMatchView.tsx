import { useState } from 'react';
import { Player, GameState } from '../types';
import { useMatchMode } from './hooks/useMatchMode';
import TabletNavigation, { TabletTab } from './TabletNavigation';
import TabletLineupView from './TabletLineupView';
import TabletBenchView from './TabletBenchView';
import TabletSetPieceView from './TabletSetPieceView';
import TabletNotesDrawer from './TabletNotesDrawer';
import TabletSubstitutionFlow from './TabletSubstitutionFlow';
import {
  Play,
  Pause,
  RotateCcw,
  StickyNote,
  Settings,
  AlertCircle,
} from 'lucide-react';
import './styles/tablet.css';

interface TabletMatchViewProps {
  gameState: GameState;
  allPlayers: Player[];
}

export default function TabletMatchView({ gameState, allPlayers }: TabletMatchViewProps) {
  const [activeTab, setActiveTab] = useState<TabletTab>('lineup');
  const [isNotesDrawerOpen, setIsNotesDrawerOpen] = useState(false);
  const [selectedPlayerForNotes, setSelectedPlayerForNotes] = useState<string | null>(null);

  const {
    matchState,
    substitutionFlow,
    isTimerRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    toggleCoachOverride,
    selectPlayerOut,
    selectPlayerIn,
    confirmSubstitution,
    cancelSubstitution,
    updatePlayerMetadata,
    addBooking,
    adjustLineup,
    getCurrentScore,
  } = useMatchMode(gameState, allPlayers);

  const handlePlayerClick = (player: Player) => {
    // If we're in substitution flow
    if (substitutionFlow.step === 'idle') {
      // Check if player is in lineup (can be substituted out)
      const isInLineup = matchState.lineup.some((a) => a.playerId === player.id);
      if (isInLineup) {
        selectPlayerOut(player);
        setActiveTab('bench'); // Automatically switch to bench view
      }
    } else if (substitutionFlow.step === 'selecting-in') {
      // Check if player is on bench
      const isOnBench = matchState.bench.includes(player.id);
      if (isOnBench) {
        selectPlayerIn(player);
      }
    }
  };

  const handleOpenNotes = (playerId?: string) => {
    if (playerId) {
      setSelectedPlayerForNotes(playerId);
    }
    setIsNotesDrawerOpen(true);
  };

  const currentScore = getCurrentScore();

  // Format time as MM:SS
  const formatTime = (minutes: number): string => {
    return `${Math.floor(minutes)}'`;
  };

  return (
    <div className="tablet-mode tablet-container bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Match info */}
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold text-green-600">Coach Match Mode</h1>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 font-semibold">Match Time</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatTime(matchState.currentTime)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 font-semibold">Team Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {currentScore.toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 font-semibold">Subs Left</p>
                <p className="text-2xl font-bold text-blue-600">
                  {matchState.substitutionsRemaining}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Timer controls */}
            {!isTimerRunning ? (
              <button
                onClick={startTimer}
                className="tablet-button tablet-button-primary flex items-center gap-2"
                title="Start match timer"
              >
                <Play size={20} />
                Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="tablet-button tablet-button-secondary flex items-center gap-2"
                title="Pause match timer"
              >
                <Pause size={20} />
                Pause
              </button>
            )}

            <button
              onClick={resetTimer}
              className="tablet-button tablet-button-outline"
              title="Reset timer"
            >
              <RotateCcw size={20} />
            </button>

            {/* Coach override toggle */}
            <button
              onClick={toggleCoachOverride}
              className={`tablet-button flex items-center gap-2 ${matchState.coachOverrideMode
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'tablet-button-outline'
                }`}
              title="Toggle coach override mode"
            >
              <Settings size={20} />
              {matchState.coachOverrideMode ? 'Override ON' : 'Auto-Optimize'}
            </button>

            {/* Notes drawer toggle */}
            <button
              onClick={() => handleOpenNotes()}
              className="tablet-button tablet-button-outline"
              title="Open notes drawer"
            >
              <StickyNote size={20} />
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="mt-4">
          <TabletNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      {/* Main content */}
      <main className="tablet-main-content">
        {activeTab === 'lineup' && (
          <TabletLineupView
            lineup={matchState.lineup}
            players={allPlayers}
            metadata={matchState.metadata}
            onPlayerClick={handlePlayerClick}
            onPositionSwap={(player1Id, player2Id) => {
              // Swap positions of two players
              const newLineup = matchState.lineup.map((a) => {
                if (a.playerId === player1Id) {
                  const player2Pos = matchState.lineup.find(
                    (x) => x.playerId === player2Id
                  )?.position;
                  return { ...a, position: player2Pos || a.position };
                } else if (a.playerId === player2Id) {
                  const player1Pos = matchState.lineup.find(
                    (x) => x.playerId === player1Id
                  )?.position;
                  return { ...a, position: player1Pos || a.position };
                }
                return a;
              });
              adjustLineup(newLineup);
            }}
            selectedPlayerOut={substitutionFlow.playerOut}
            coachOverrideMode={matchState.coachOverrideMode}
            currentScore={currentScore}
            currentTime={matchState.currentTime}
          />
        )}

        {activeTab === 'bench' && (
          <TabletBenchView
            bench={matchState.bench}
            players={allPlayers}
            metadata={matchState.metadata}
            onPlayerClick={handlePlayerClick}
            selectedPlayerIn={substitutionFlow.playerIn}
            substitutionStep={substitutionFlow.step}
            playerOut={substitutionFlow.playerOut}
          />
        )}

        {activeTab === 'set-pieces' && (
          <TabletSetPieceView
            lineup={matchState.lineup}
            players={allPlayers}
          />
        )}
      </main>

      {/* Substitution flow overlay */}
      <TabletSubstitutionFlow
        playerOut={substitutionFlow.playerOut}
        playerIn={substitutionFlow.playerIn}
        preview={substitutionFlow.preview}
        step={substitutionFlow.step}
        onConfirm={confirmSubstitution}
        onCancel={cancelSubstitution}
        coachOverrideMode={matchState.coachOverrideMode}
        substitutionsRemaining={matchState.substitutionsRemaining}
        allPlayers={allPlayers}
      />

      {/* Notes drawer */}
      <TabletNotesDrawer
        isOpen={isNotesDrawerOpen}
        onClose={() => {
          setIsNotesDrawerOpen(false);
          setSelectedPlayerForNotes(null);
        }}
        players={allPlayers}
        metadata={matchState.metadata}
        onUpdateMetadata={updatePlayerMetadata}
        onAddBooking={addBooking}
        selectedPlayerId={selectedPlayerForNotes}
      />

      {/* Warning when no subs remaining */}
      {matchState.substitutionsRemaining === 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-pulse">
            <AlertCircle size={24} />
            <p className="font-bold">No substitutions remaining!</p>
          </div>
        </div>
      )}
    </div>
  );
}
