import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, RotateCcw, Settings } from 'lucide-react';
import { PlayerAssignment, STANDARD_POSITIONS } from '../types';
import { optimizeLineup, calculateLineupScore } from '../utils/optimizer';
import PitchView from '../components/PitchView';
import { useApp } from '../contexts/AppContext';
import { PMC_COLORS } from '../constants/brand';

export default function LineupBuilder() {
  const navigate = useNavigate();
  const {
    squad,
    currentLineup,
    setCurrentLineup,
    startGame,
    useNotesInOptimization,
    setUseNotesInOptimization,
  } = useApp();

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [lineup, setLineup] = useState<PlayerAssignment[]>([]);

  useEffect(() => {
    // Load existing lineup if available
    if (currentLineup.length > 0) {
      setLineup(currentLineup);
      setSelectedPlayers(currentLineup.map((a) => a.playerId));
    }
  }, [currentLineup]);

  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter((id) => id !== playerId));
    } else {
      if (selectedPlayers.length < 11) {
        setSelectedPlayers([...selectedPlayers, playerId]);
      } else {
        alert('You can only select 11 players for the lineup');
      }
    }
  };

  const lineupScore = lineup.length > 0 ? calculateLineupScore(lineup, squad) : 0;

  const handleOptimize = () => {
    if (selectedPlayers.length !== 11) {
      alert('Please select exactly 11 players');
      return;
    }

    const players = squad.filter((p) => selectedPlayers.includes(p.id));
    const positions = STANDARD_POSITIONS.slice(0, 11);

    const optimizedLineup = optimizeLineup(players, positions, useNotesInOptimization);
    setLineup(optimizedLineup);
    setCurrentLineup(optimizedLineup);
  };

  const handleStartGame = () => {
    if (lineup.length !== 11) {
      alert('Please optimize the lineup first');
      return;
    }

    startGame(lineup);
    navigate('/game');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the lineup?')) {
      setSelectedPlayers([]);
      setLineup([]);
      setCurrentLineup([]);
    }
  };

  const availablePlayers = squad.filter((p) => !selectedPlayers.includes(p.id));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Build Lineup</h2>
          <p className="text-gray-600 mt-1">Select 11 players and optimize their positions</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            onClick={handleOptimize}
            disabled={selectedPlayers.length !== 11}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            style={{ backgroundColor: PMC_COLORS.primary }}
          >
            <Sparkles size={18} />
            Auto-Optimize
          </button>

          <button
            onClick={handleStartGame}
            disabled={lineup.length !== 11}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Play size={18} />
            Start Game
          </button>
        </div>
      </div>

      {/* Settings Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center gap-3">
          <Settings size={20} style={{ color: PMC_COLORS.primary }} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useNotesInOptimization}
              onChange={(e) => setUseNotesInOptimization(e.target.checked)}
              className="w-5 h-5 rounded"
              style={{ accentColor: PMC_COLORS.primary }}
            />
            <span className="font-medium text-gray-700">
              Use player notes in optimization
            </span>
          </label>
          <span className="text-sm text-gray-500">
            (When enabled, player notes affect position assignments and ratings)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg mb-3 text-gray-800">
              Selected Players ({selectedPlayers.length}/11)
            </h3>

            {selectedPlayers.length === 0 ? (
              <p className="text-gray-500 text-sm">No players selected</p>
            ) : (
              <div className="space-y-2 mb-4">
                {selectedPlayers.map((playerId) => {
                  const player = squad.find((p) => p.id === playerId);
                  if (!player) return null;

                  const assignment = lineup.find((a) => a.playerId === playerId);

                  return (
                    <div
                      key={playerId}
                      className="flex items-center justify-between bg-green-50 p-2 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {player.jerseyNumber}
                        </span>
                        <div>
                          <div className="font-medium text-sm">{player.name}</div>
                          {assignment && (
                            <div className="text-xs text-green-700 font-semibold">
                              {assignment.position}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handlePlayerSelect(playerId)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedPlayers.length < 11 && (
              <>
                <h3 className="font-bold text-lg mb-3 text-gray-800 mt-6">
                  Available Players
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availablePlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {player.jerseyNumber}
                        </span>
                        <div className="font-medium text-sm">{player.name}</div>
                      </div>
                      <button
                        onClick={() => handlePlayerSelect(player.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pitch View */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800">Lineup</h3>
              {lineup.length > 0 && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Score</div>
                  <div className="text-2xl font-bold text-green-700">{lineupScore}</div>
                </div>
              )}
            </div>

            {lineup.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="mb-2">Select 11 players and click Auto-Optimize</p>
                <p className="text-sm">The system will assign optimal positions</p>
              </div>
            ) : (
              <PitchView lineup={lineup} squad={squad} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
