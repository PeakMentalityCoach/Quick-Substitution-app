import { useState, useEffect } from 'react';
import { ArrowLeftRight, History, RotateCcw } from 'lucide-react';
import { Player, GameState, SubstitutionPreview } from '../types';
import * as api from '../api/client';
import { calculateLineupScore } from '../utils/optimizer';
import PitchView from '../components/PitchView';
import SubstitutionPreviewModal from '../components/SubstitutionPreviewModal';

export default function InGame() {
  const [squad, setSquad] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerOut, setPlayerOut] = useState<string>('');
  const [playerIn, setPlayerIn] = useState<string>('');
  const [preview, setPreview] = useState<SubstitutionPreview | null>(null);
  const [lineupScore, setLineupScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [players, state] = await Promise.all([
        api.getPlayers(),
        api.getGameState(),
      ]);

      setSquad(players);

      if (state) {
        setGameState(state);
        setLineupScore(calculateLineupScore(state.lineup, players));
      }
    } catch (err) {
      setError('Failed to load game data');
      console.error('Error loading game data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewSubstitution = async () => {
    if (!playerOut || !playerIn) {
      alert('Please select both players for substitution');
      return;
    }

    if (!gameState) {
      alert('No active game state');
      return;
    }

    try {
      const substitutionPreview = await api.getSubstitutionPreview(
        gameState.lineup,
        playerOut,
        playerIn
      );

      setPreview(substitutionPreview);
    } catch (err) {
      console.error('Error previewing substitution:', err);
      alert('Failed to preview substitution. Please try again.');
    }
  };

  const handleConfirmSubstitution = async () => {
    if (!preview || !gameState) return;

    try {
      const newGameState: GameState = {
        lineup: preview.newLineup,
        bench: [...gameState.bench.filter((id) => id !== playerIn), playerOut],
        substitutions: [
          ...gameState.substitutions,
          {
            out: playerOut,
            in: playerIn,
            timestamp: Date.now(),
          },
        ],
      };

      await api.saveGameState(newGameState);
      setGameState(newGameState);
      setLineupScore(calculateLineupScore(newGameState.lineup, squad));

      setPreview(null);
      setPlayerOut('');
      setPlayerIn('');
    } catch (err) {
      console.error('Error confirming substitution:', err);
      alert('Failed to save substitution. Please try again.');
    }
  };

  const handleResetGame = async () => {
    if (confirm('Are you sure you want to reset the game? This will clear all substitutions.')) {
      try {
        const currentLineup = await api.getCurrentLineup();
        const resetGameState: GameState = {
          lineup: currentLineup,
          bench: squad.filter((p) => !currentLineup.find((a) => a.playerId === p.id)).map((p) => p.id),
          substitutions: [],
        };

        await api.saveGameState(resetGameState);
        setGameState(resetGameState);
        setLineupScore(calculateLineupScore(resetGameState.lineup, squad));
        setPlayerOut('');
        setPlayerIn('');
      } catch (err) {
        console.error('Error resetting game:', err);
        alert('Failed to reset game. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-semibold">Error: {error}</p>
        <button
          onClick={loadData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <Play className="mx-auto text-gray-400 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No active game</h3>
        <p className="text-gray-600 mb-4">Please build a lineup first</p>
        <a
          href="/lineup"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Lineup Builder
        </a>
      </div>
    );
  }

  const lineupPlayers = gameState.lineup.map((a) => squad.find((p) => p.id === a.playerId)).filter(Boolean) as Player[];
  const benchPlayers = gameState.bench.map((id) => squad.find((p) => p.id === id)).filter(Boolean) as Player[];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">In-Game Management</h2>
          <p className="text-gray-600 mt-1">Make substitutions and optimize positions</p>
        </div>

        <button
          onClick={handleResetGame}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <RotateCcw size={18} />
          Reset Game
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lineup View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">Current Lineup</h3>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Score</div>
                <div className="text-2xl font-bold text-green-700">{lineupScore}</div>
              </div>
            </div>

            <PitchView
              lineup={gameState.lineup}
              squad={squad}
              highlightedPlayers={playerOut ? [playerOut] : []}
            />
          </div>

          {/* Substitution History */}
          {gameState.substitutions.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                <History size={20} />
                Substitution History
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
                          {pOut?.name} ({pOut?.jerseyNumber})
                        </span>
                        <ArrowLeftRight size={16} className="text-gray-400" />
                        <span className="font-medium text-green-600">
                          {pIn?.name} ({pIn?.jerseyNumber})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Substitution Controls */}
        <div className="lg:col-span-1 space-y-4">
          {/* Player Out */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg text-gray-800 mb-3">Player Out</h3>
            <select
              value={playerOut}
              onChange={(e) => setPlayerOut(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select player to substitute</option>
              {lineupPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  #{player.jerseyNumber} {player.name}
                </option>
              ))}
            </select>
          </div>

          {/* Player In */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg text-gray-800 mb-3">Player In</h3>
            <select
              value={playerIn}
              onChange={(e) => setPlayerIn(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select player to bring on</option>
              {benchPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  #{player.jerseyNumber} {player.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview Button */}
          <button
            onClick={handlePreviewSubstitution}
            disabled={!playerOut || !playerIn}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <ArrowLeftRight size={18} />
            Preview Substitution
          </button>

          {/* Bench */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg text-gray-800 mb-3">
              Bench ({benchPlayers.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {benchPlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                >
                  <span className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {player.jerseyNumber}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{player.name}</div>
                    <div className="text-xs text-gray-600">
                      {player.positions.slice(0, 3).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Substitution Preview Modal */}
      {preview && (
        <SubstitutionPreviewModal
          preview={preview}
          squad={squad}
          onConfirm={handleConfirmSubstitution}
          onCancel={() => setPreview(null)}
        />
      )}
    </div>
  );
}

function Play({ className, size }: { className?: string; size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
