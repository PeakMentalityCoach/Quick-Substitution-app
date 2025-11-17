import { useState } from 'react';
import { Target, Save, AlertCircle } from 'lucide-react';
import { SetPieceLayout, PlayerAssignment } from '../types';
import DraggablePitch from '../components/DraggablePitch';
import { useApp } from '../contexts/AppContext';
import { PMC_COLORS } from '../constants/brand';
import { optimizeLineup } from '../utils/optimizer';

export default function SetPieces() {
  const { setPieceLayouts, updateSetPieceLayout, squad, currentLineup, useNotesInOptimization } = useApp();
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>(
    setPieceLayouts[0]?.id || ''
  );

  const currentLayout = setPieceLayouts.find((l) => l.id === selectedLayoutId);
  const [localAssignments, setLocalAssignments] = useState<PlayerAssignment[]>(
    currentLayout?.assignments || []
  );

  const handleLayoutChange = (layoutId: string) => {
    const layout = setPieceLayouts.find((l) => l.id === layoutId);
    setSelectedLayoutId(layoutId);
    setLocalAssignments(layout?.assignments || []);
  };

  const handleSaveAssignments = () => {
    if (!currentLayout) return;

    const updatedLayout: SetPieceLayout = {
      ...currentLayout,
      assignments: localAssignments,
    };

    updateSetPieceLayout(updatedLayout);
    alert('Set piece assignments saved!');
  };

  const handleOptimizeAssignments = () => {
    if (!currentLayout) return;

    const positions = currentLayout.positions.map((p) => p.label);
    const availablePlayers = squad.slice(0, positions.length);

    const optimized = optimizeLineup(availablePlayers, positions, useNotesInOptimization);
    setLocalAssignments(optimized);
  };

  const handleUseCurrentLineup = () => {
    if (!currentLayout) return;

    // Map current lineup to set piece positions (best effort)
    const assignments: PlayerAssignment[] = [];
    const positionLabels = currentLayout.positions.map((p) => p.label);

    currentLineup.forEach((assignment, index) => {
      if (index < positionLabels.length) {
        assignments.push({
          playerId: assignment.playerId,
          position: positionLabels[index],
        });
      }
    });

    setLocalAssignments(assignments);
  };

  const layoutsByType: Record<string, SetPieceLayout[]> = {
    'Offensive Corners': setPieceLayouts.filter((l) => l.type === 'offensive-corner'),
    'Defensive Corners': setPieceLayouts.filter((l) => l.type === 'defensive-corner'),
    'Free Kicks': setPieceLayouts.filter(
      (l) => l.type === 'free-kick-central' || l.type === 'free-kick-wide'
    ),
    'Throw-Ins': setPieceLayouts.filter(
      (l) => l.type === 'throw-in-attacking' || l.type === 'throw-in-defending'
    ),
    'Defensive Walls': setPieceLayouts.filter((l) => l.type === 'shot-wall'),
  };

  const hasUnsavedChanges =
    JSON.stringify(localAssignments) !== JSON.stringify(currentLayout?.assignments || []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Set Pieces</h2>
          <p className="text-gray-600 mt-1">
            Configure tactical layouts for different game situations
          </p>
        </div>

        {currentLayout && (
          <div className="flex gap-2">
            <button
              onClick={handleUseCurrentLineup}
              disabled={currentLineup.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use Current Lineup
            </button>
            <button
              onClick={handleOptimizeAssignments}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Auto-Optimize
            </button>
            <button
              onClick={handleSaveAssignments}
              disabled={!hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: PMC_COLORS.primary }}
            >
              <Save size={18} />
              Save Layout
            </button>
          </div>
        )}
      </div>

      {hasUnsavedChanges && (
        <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-yellow-600" size={20} />
            <p className="text-yellow-800 text-sm">
              You have unsaved changes. Click "Save Layout" to persist your assignments.
            </p>
          </div>
        </div>
      )}

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

              {Object.entries(layoutsByType).map(([category, layouts]) =>
                layouts.length > 0 ? (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">{category}</h4>
                    <div className="space-y-1">
                      {layouts.map((layout) => (
                        <button
                          key={layout.id}
                          onClick={() => handleLayoutChange(layout.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedLayoutId === layout.id
                              ? 'text-white font-medium'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                          style={{
                            backgroundColor:
                              selectedLayoutId === layout.id ? PMC_COLORS.primary : undefined,
                          }}
                        >
                          {layout.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
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
                      {currentLayout.positions.length} positions • Drag players to assign
                    </p>
                  </div>

                  <DraggablePitch
                    positions={currentLayout.positions}
                    assignments={localAssignments}
                    availablePlayers={squad}
                    onAssignmentsChange={setLocalAssignments}
                  />
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
