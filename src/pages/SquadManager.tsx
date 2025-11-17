import { useState } from 'react';
import { Plus, Download, Upload, Users as UsersIcon } from 'lucide-react';
import { Player } from '../types';
import { exportData, importData } from '../utils/storage';
import PlayerEditor from '../components/PlayerEditor';
import PlayerCard from '../components/PlayerCard';
import { useApp } from '../contexts/AppContext';

export default function SquadManager() {
  const { squad, addPlayer, updatePlayer, deletePlayer } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const handleSavePlayer = (player: Player) => {
    if (editingPlayer) {
      updatePlayer(player);
    } else {
      addPlayer(player);
    }
    setIsModalOpen(false);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      deletePlayer(playerId);
    }
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setIsModalOpen(true);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await importData(file);
        alert('Data imported successfully! Please refresh the page.');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Squad Manager</h2>
          <p className="text-gray-600 mt-1">Manage your team roster and player ratings</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            Export
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer">
            <Upload size={18} />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              setEditingPlayer(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={18} />
            Add Player
          </button>
        </div>
      </div>

      {squad.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <UsersIcon className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No players yet</h3>
          <p className="text-gray-600 mb-4">Start building your squad by adding players</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} />
            Add Your First Player
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {squad.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onEdit={() => handleEditPlayer(player)}
              onDelete={() => handleDeletePlayer(player.id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <PlayerEditor
          player={editingPlayer || undefined}
          onSave={handleSavePlayer}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPlayer(null);
          }}
        />
      )}
    </div>
  );
}
