import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, RotateCcw } from 'lucide-react';
import { Player, PlayerAssignment, STANDARD_POSITIONS } from '../types';
import { loadData, saveLineup, saveGameState } from '../utils/storage';
import { optimizeLineup, calculateLineupScore } from '../utils/optimizer';
import PitchView from '../components/PitchView';

export default function LineupBuilder() {
  const navigate = useNavigate();
  const [squad, setSquad] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [lineup, setLineup] = useState<PlayerAssignment[]>([]);
  const [lineupScore, setLineupScore] = useState(0);

  useEffect(() => {
    const data = loadData();
    setSquad(data.squad);

    // Load existing lineup if available
    if (data.currentLineup && data.currentLineup.length > 0) {
      setLineup(data.currentLineup);
      setSelectedPlayers(data.currentLineup.map((a) => a.playerId));
      setLineupScore(calculateLineupScore(data.currentLineup, data.squad));
    }
  }, []);

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

  const handleOptimize = () => {
    if (selectedPlayers.length !== 11) {
      alert('Please select exactly 11 players');
      return;
    }

    const players = squad.filter((p) => selectedPlayers.includes(p.id));
    const positions = STANDARD_POSITIONS.slice(0, 11); // Use first 11 standard positions

    const optimizedLineup = optimizeLineup(players, positions);
    setLineup(optimizedLineup);

    const score = calculateLineupScore(optimizedLineup, squad);
    setLineupScore(score);

    saveLineup(optimizedLineup);
  };

  const handleStartGame = () => {
    if (lineup.length !== 11) {
      alert('Please optimize the lineup first');
      return;
    }

    // Initialize game state
    const bench = squad.filter((p) => !selectedPlayers.includes(p.id)).map((p) => p.id);

    saveGameState({
      lineup,
      bench,
      substitutions: [],
    });

    navigate('/game');
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the lineup?')) {
      setSelectedPlayers([]);
      setLineup([]);
      setLineupScore(0);
      saveLineup([]);
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
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
