import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import PMCLogo from '../components/PMCLogo';
import Navigation from '../components/Navigation';
import { Plus, Trash2, Flag } from 'lucide-react';

export default function SetPiecesPage() {
  const { setPieces, addSetPiece, deleteSetPiece } = useAppContext();
  const [newSetPieceName, setNewSetPieceName] = useState('');
  const [newSetPieceType, setNewSetPieceType] = useState<'corner' | 'free-kick' | 'throw-in'>('corner');

  const handleCreate = () => {
    if (!newSetPieceName.trim()) return;
    
    addSetPiece({
      name: newSetPieceName,
      type: newSetPieceType,
      positions: [],
    });
    
    setNewSetPieceName('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this set piece layout?')) {
      deleteSetPiece(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pmc-primary to-pmc-secondary text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <PMCLogo className="mb-4" />
          <h1 className="text-3xl font-bold">Set Pieces</h1>
        </div>
      </div>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Create New Set Piece */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Create New Set Piece</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newSetPieceName}
              onChange={(e) => setNewSetPieceName(e.target.value)}
              placeholder="Set piece name..."
              className="input-field flex-1"
            />
            <select
              value={newSetPieceType}
              onChange={(e) => setNewSetPieceType(e.target.value as any)}
              className="input-field"
            >
              <option value="corner">Corner Kick</option>
              <option value="free-kick">Free Kick</option>
              <option value="throw-in">Throw In</option>
            </select>
            <button
              onClick={handleCreate}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create
            </button>
          </div>
        </div>

        {/* Set Pieces List */}
        {setPieces.length === 0 ? (
          <div className="card text-center py-12">
            <Flag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">No set pieces yet</p>
            <p className="text-sm text-gray-400">Create your first set piece layout above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {setPieces.map(setPiece => (
              <div key={setPiece.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{setPiece.name}</h3>
                    <span className="inline-block mt-1 px-2 py-1 bg-pmc-light text-pmc-primary text-xs rounded">
                      {setPiece.type}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(setPiece.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                
                <div className="bg-gradient-to-b from-green-600 to-green-700 rounded-lg aspect-video relative">
                  <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                    {setPiece.positions.length} positions
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
