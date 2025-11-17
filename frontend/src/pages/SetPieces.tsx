import { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { SetPieceLayout, Player, PlayerAssignment } from '../types';
import { loadData } from '../utils/storage';
import SetPieceView from '../components/SetPieceView';

export default function SetPieces() {
  const [setPieceLayouts, setSetPieceLayouts] = useState<SetPieceLayout[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<string>('');
  const [squad, setSquad] = useState<Player[]>([]);
  const [gameLineup, setGameLineup] = useState<PlayerAssignment[]>([]);

  useEffect(() => {
    const data = loadData();
    setSquad(data.squad);
    setSetPieceLayouts(data.setPieceLayouts);

    // Load current lineup if in game
    if (data.gameState) {
      setGameLineup(data.gameState.lineup);
    } else if (data.currentLineup) {
      setGameLineup(data.currentLineup);
    }

    // Select first layout by default
    if (data.setPieceLayouts.length > 0) {
      setSelectedLayout(data.setPieceLayouts[0].id);
    }
  }, []);

  const currentLayout = setPieceLayouts.find((l) => l.id === selectedLayout);

  const layoutsByType: Record<string, SetPieceLayout[]> = {
    'Offensive Corners': setPieceLayouts.filter((l) => l.type === 'offensive-corner'),
    'Defensive Corners': setPieceLayouts.filter((l) => l.type === 'defensive-corner'),
    'Free Kicks': setPieceLayouts.filter(
      (l) => l.type === 'free-kick-central' || l.type === 'free-kick-wide'
    ),
    'Throw-Ins': setPieceLayouts.filter(
      (l) => l.type === 'throw-in-attacking' || l.type === 'throw-in-defending'
    ),
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Set Pieces</h2>
          <p className="text-gray-600 mt-1">View tactical layouts for different game situations</p>
        </div>
      </div>

      {setPieceLayouts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Target className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No set pieces configured</h3>
          <p className="text-gray-600">Default set piece layouts will be loaded automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Set Piece Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Select Set Piece</h3>

              {Object.entries(layoutsByType).map(([category, layouts]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">{category}</h4>
                  <div className="space-y-1">
                    {layouts.map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => setSelectedLayout(layout.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedLayout === layout.id
                            ? 'bg-green-600 text-white font-medium'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {layout.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Set Piece View */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-6">
              {currentLayout ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                      {currentLayout.name}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {currentLayout.positions.length} positions defined
                    </p>
                  </div>

                  <SetPieceView layout={currentLayout} lineup={gameLineup} squad={squad} />

                  {/* Position Legend */}
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-bold text-gray-800 mb-3">Position Assignments</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {currentLayout.positions.map((pos) => {
                        const assignment = gameLineup.find((a) => a.position === pos.label);
                        const player = assignment
                          ? squad.find((p) => p.id === assignment.playerId)
                          : null;

                        return (
                          <div
                            key={pos.id}
                            className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                          >
                            <span className="font-bold text-green-700 w-12">{pos.label}:</span>
                            {player ? (
                              <span className="text-sm text-gray-800">
                                #{player.jerseyNumber} {player.name}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Unassigned</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {gameLineup.length === 0 && (
                    <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4">
                      <p className="text-blue-800 text-sm">
                        <strong>Tip:</strong> Build a lineup first to see player assignments in
                        set pieces.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>Select a set piece to view</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
