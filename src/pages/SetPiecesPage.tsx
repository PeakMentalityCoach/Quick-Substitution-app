import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SetPieceSelector } from '../components/SetPieceSelector';
import { SetPieceEditor } from '../components/SetPieceEditor';
import { useSetPieces } from '../hooks/useSetPieces';
import { usePlayers } from '../hooks/usePlayers';
import type { SetPieceType, SetPiece } from '../types';

export function SetPiecesPage() {
  const { setPieces, getSetPiecesByType, updateSetPiecePositions, addSetPiece } = useSetPieces();
  const { players } = usePlayers();
  const [selectedType, setSelectedType] = useState<SetPieceType | null>('offensive_corner');
  const [selectedSetPiece, setSelectedSetPiece] = useState<SetPiece | null>(null);

  const filteredSetPieces = selectedType ? getSetPiecesByType(selectedType) : [];

  const handleSelectSetPiece = (setPiece: SetPiece) => {
    setSelectedSetPiece(setPiece);
  };

  const handleUpdatePositions = (positions: SetPiece['positions']) => {
    if (selectedSetPiece) {
      updateSetPiecePositions(selectedSetPiece.id, positions);
    }
  };

  const handleCreateNew = () => {
    if (!selectedType) return;

    const newSetPiece: SetPiece = {
      id: `custom-${Date.now()}`,
      type: selectedType,
      name: `Custom ${selectedType.replace('_', ' ')}`,
      description: 'Custom set piece layout',
      isDefault: false,
      positions: []
    };

    addSetPiece(newSetPiece);
    setSelectedSetPiece(newSetPiece);
  };

  // Auto-select first set piece when type changes
  React.useEffect(() => {
    if (filteredSetPieces.length > 0 && !selectedSetPiece) {
      setSelectedSetPiece(filteredSetPieces[0]);
    }
  }, [selectedType, filteredSetPieces, selectedSetPiece]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Set Pieces
        </h1>
        <button
          onClick={handleCreateNew}
          disabled={!selectedType}
          className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          <span>Create Custom</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Select Set Piece Type
        </h2>
        <SetPieceSelector selectedType={selectedType} onTypeSelect={setSelectedType} />
      </div>

      {selectedType && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Set Piece List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Available Layouts
              </h3>
              <div className="space-y-2">
                {filteredSetPieces.map((setPiece) => (
                  <button
                    key={setPiece.id}
                    onClick={() => handleSelectSetPiece(setPiece)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedSetPiece?.id === setPiece.id
                        ? 'bg-blue-50 dark:bg-blue-900 border-2 border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-blue-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {setPiece.name}
                    </p>
                    {setPiece.isDefault && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Default
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Set Piece Editor */}
          <div className="lg:col-span-3">
            {selectedSetPiece ? (
              <SetPieceEditor
                setPiece={selectedSetPiece}
                availablePlayers={players}
                onUpdatePositions={handleUpdatePositions}
              />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Select a set piece layout to edit
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
