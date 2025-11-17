import { useState } from 'react';
import {
  ArrowLeftRight,
  History,
  Play as PlayIcon,
  Clock,
  AlertTriangle,
  Target,
  Users,
  TrendingUp,
  StopCircle,
} from 'lucide-react';
import { SubstitutionPreview as SubPreviewType, Player } from '../types';
import { optimizeSubstitution, calculateLineupScore } from '../utils/optimizer';
import PitchView from '../components/PitchView';
import SubstitutionPreview from '../components/SubstitutionPreview';
import DraggablePitch from '../components/DraggablePitch';
import { useApp } from '../contexts/AppContext';
import {
  shouldSubstitutePlayer,
  getNoteSeverity,
  interpretPlayerNote,
} from '../utils/noteInterpreter';
import { PMC_COLORS } from '../constants/brand';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function InGameEnhanced() {
  const {
    squad,
    gameState,
    currentLineup,
    makeSubstitution,
    startGame,
    endGame,
    matchContext,
    updateMatchContext,
    setPieceLayouts,
    useNotesInOptimization,
  } = useApp();

  const [playerOut, setPlayerOut] = useState<string>('');
  const [playerIn, setPlayerIn] = useState<string>('');
  const [preview, setPreview] = useState<SubPreviewType | null>(null);
  const [selectedSetPiece, setSelectedSetPiece] = useState<string | null>(null);
  const [showSetPieces, setShowSetPieces] = useState(false);

  const lineupScore = gameState ? calculateLineupScore(gameState.lineup, squad) : 0;

  const handlePreviewSubstitution = () => {
    if (!playerOut || !playerIn || !gameState) {
      alert('Please select both players for substitution');
      return;
    }

    const pOut = squad.find((p) => p.id === playerOut);
    const pIn = squad.find((p) => p.id === playerIn);

    if (!pOut || !pIn) return;

    const substitutionPreview = optimizeSubstitution(
      gameState.lineup,
      pOut,
      pIn,
      squad,
      useNotesInOptimization
    );

    setPreview(substitutionPreview);
  };

  const handleConfirmSubstitution = () => {
    if (!preview) return;
    makeSubstitution(playerOut, playerIn);
    setPreview(null);
    setPlayerOut('');
    setPlayerIn('');
  };

  const handleStartGame = () => {
    if (currentLineup.length === 0) {
      alert('Please build a lineup first');
      return;
    }
    startGame(currentLineup);
  };

  const handleEndGame = () => {
    if (confirm('Are you sure you want to end the game?')) {
      endGame();
    }
  };

  // Get players with warnings
  const playersNeedingSub = gameState
    ? gameState.lineup
        .map((a) => squad.find((p) => p.id === a.playerId))
        .filter((p) => p && shouldSubstitutePlayer(p.note, matchContext.currentMinute))
    : [];

  const playersWithWarnings = gameState
    ? gameState.lineup
        .map((a) => squad.find((p) => p.id === a.playerId))
        .filter((p) => {
          if (!p) return false;
          return getNoteSeverity(p.note) !== 'none' && p.noteAffectsOptimization;
        })
    : [];

  if (!gameState) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <PlayIcon className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No active match</h3>
        <p className="text-gray-600 mb-4">
          {currentLineup.length > 0
            ? 'Start a match with your current lineup'
            : 'Please build a lineup first'}
        </p>
        {currentLineup.length > 0 ? (
          <button
            onClick={handleStartGame}
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: PMC_COLORS.primary }}
          >
            <PlayIcon size={20} />
            Start Match
          </button>
        ) : (
          <Link
            to="/lineup"
            className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: PMC_COLORS.primary }}
          >
            Go to Lineup Builder
          </Link>
        )}
      </div>
    );
  }

  const lineupPlayers = gameState.lineup
    .map((a) => squad.find((p) => p.id === a.playerId))
    .filter(Boolean) as Player[];
  const benchPlayers = gameState.bench
    .map((id) => squad.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const selectedLayout = selectedSetPiece
    ? setPieceLayouts.find((l) => l.id === selectedSetPiece)
    : null;

  return (
    <div className="space-y-6">
      {/* Match Context Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Match Minute</label>
            <div className="flex items-center gap-2">
              <Clock size={20} style={{ color: PMC_COLORS.primary }} />
              <input
                type="number"
                min="0"
                max="120"
                value={matchContext.currentMinute}
                onChange={(e) =>
                  updateMatchContext({ currentMinute: parseInt(e.target.value) || 0 })
                }
                className="w-20 px-2 py-1 border rounded"
                style={{ accentColor: PMC_COLORS.primary }}
              />
              <span className="text-sm text-gray-600">min</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Score</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                value={matchContext.score.home}
                onChange={(e) =>
                  updateMatchContext({
                    score: {
                      ...matchContext.score,
                      home: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-12 px-2 py-1 border rounded text-center"
              />
              <span>-</span>
              <input
                type="number"
                min="0"
                value={matchContext.score.away}
                onChange={(e) =>
                  updateMatchContext({
                    score: {
                      ...matchContext.score,
                      away: parseInt(e.target.value) || 0,
                    },
                  })
                }
                className="w-12 px-2 py-1 border rounded text-center"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Subs Remaining</label>
            <div className="flex items-center gap-2">
              <Users size={20} className="text-gray-500" />
              <span className="text-2xl font-bold" style={{ color: PMC_COLORS.primary }}>
                {matchContext.substitutionsRemaining}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">Team Score</label>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-gray-500" />
              <span className="text-2xl font-bold" style={{ color: PMC_COLORS.primary }}>
                {lineupScore.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleEndGame}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <StopCircle size={18} />
              End Match
            </button>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {(playersNeedingSub.length > 0 || playersWithWarnings.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 mb-2">Player Warnings:</h4>
              <ul className="space-y-1 text-sm text-yellow-800">
                {playersNeedingSub.map((p) => (
                  <li key={p!.id}>
                    • #{p!.jerseyNumber} {p!.name} should be substituted (
                    {interpretPlayerNote(p!.note).warningMessage})
                  </li>
                ))}
                {playersWithWarnings
                  .filter((p) => !playersNeedingSub.includes(p))
                  .map((p) => (
                    <li key={p!.id}>
                      • #{p!.jerseyNumber} {p!.name}:{' '}
                      {interpretPlayerNote(p!.note).warningMessage}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main View */}
        <div className="lg:col-span-2 space-y-6">
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowSetPieces(false)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                !showSetPieces
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: !showSetPieces ? PMC_COLORS.primary : undefined,
              }}
            >
              Current Lineup
            </button>
            <button
              onClick={() => setShowSetPieces(true)}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                showSetPieces
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: showSetPieces ? PMC_COLORS.primary : undefined,
              }}
            >
              <Target className="inline mr-2" size={18} />
              Set Pieces
            </button>
          </div>

          {/* Lineup/Set Piece View */}
          <div className="bg-white rounded-lg shadow-md p-4">
            {!showSetPieces ? (
              <PitchView
                lineup={gameState.lineup}
                squad={squad}
                highlightedPlayers={playerOut ? [playerOut] : []}
              />
            ) : (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Quick Select Set Piece:</label>
                  <select
                    value={selectedSetPiece || ''}
                    onChange={(e) => setSelectedSetPiece(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select a set piece...</option>
                    {setPieceLayouts.map((layout) => (
                      <option key={layout.id} value={layout.id}>
                        {layout.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedLayout ? (
                  <DraggablePitch
                    positions={selectedLayout.positions}
                    assignments={selectedLayout.assignments || []}
                    availablePlayers={lineupPlayers}
                    onAssignmentsChange={() => {}}
                    readonly
                  />
                ) : (
                  <p className="text-gray-500 text-center py-12">
                    Select a set piece to view
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Substitution History */}
          {gameState.substitutions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <History size={20} />
                Substitution History ({gameState.substitutions.length})
              </h3>
              <div className="space-y-2">
                {gameState.substitutions.map((sub, index) => {
                  const pOut = squad.find((p) => p.id === sub.out);
                  const pIn = squad.find((p) => p.id === sub.in);
                  return (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                      <span className="text-sm text-gray-600">
                        {new Date(sub.timestamp).toLocaleTimeString()}
                      </span>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-medium text-red-600">
                          {pOut?.name} (#{pOut?.jerseyNumber})
                        </span>
                        <ArrowLeftRight size={16} className="text-gray-400" />
                        <span className="font-medium text-green-600">
                          {pIn?.name} (#{pIn?.jerseyNumber})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Substitution Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg mb-3">Make Substitution</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2 text-red-700">
                  Player Out
                </label>
                <select
                  value={playerOut}
                  onChange={(e) => setPlayerOut(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select player...</option>
                  {lineupPlayers.map((player) => (
                    <option key={player!.id} value={player!.id}>
                      #{player!.jerseyNumber} {player!.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-green-700">
                  Player In
                </label>
                <select
                  value={playerIn}
                  onChange={(e) => setPlayerIn(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select player...</option>
                  {benchPlayers.map((player) => (
                    <option key={player!.id} value={player!.id}>
                      #{player!.jerseyNumber} {player!.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handlePreviewSubstitution}
                disabled={!playerOut || !playerIn || matchContext.substitutionsRemaining === 0}
                className="w-full px-4 py-3 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: PMC_COLORS.primary }}
              >
                <ArrowLeftRight className="inline mr-2" size={18} />
                Preview Substitution
              </button>
            </div>
          </div>

          {/* Bench */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg mb-3">Bench ({benchPlayers.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {benchPlayers.map((player) => {
                const severity = getNoteSeverity(player!.note);
                return (
                  <div
                    key={player!.id}
                    className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                  >
                    <span
                      className="w-8 h-8 text-white rounded-full flex items-center justify-center text-sm font-bold"
                      style={{ backgroundColor: PMC_COLORS.primary }}
                    >
                      {player!.jerseyNumber}
                    </span>
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        {player!.name}
                        {severity !== 'none' && (
                          <AlertTriangle
                            size={14}
                            className={
                              severity === 'critical' ? 'text-red-500' : 'text-yellow-500'
                            }
                          />
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {player!.positions.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Substitution Preview Modal */}
      {preview && (
        <SubstitutionPreview
          preview={preview}
          onConfirm={handleConfirmSubstitution}
          onCancel={() => setPreview(null)}
        />
      )}
    </div>
  );
}
