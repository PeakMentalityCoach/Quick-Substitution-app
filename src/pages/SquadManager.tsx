import { useState, useEffect } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Player } from '../types';
import { loadData, saveSquad, exportData, importData } from '../utils/storage';
import AddPlayerModal from '../components/AddPlayerModal';
import PlayerCard from '../components/PlayerCard';

export default function SquadManager() {
  const [squad, setSquad] = useState<Player[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  useEffect(() => {
    const data = loadData();
    setSquad(data.squad);
  }, []);

  const handleSavePlayer = (player: Player) => {
    let newSquad: Player[];

    if (editingPlayer) {
      // Update existing player
      newSquad = squad.map((p) => (p.id === player.id ? player : p));
    } else {
      // Add new player
      newSquad = [...squad, player];
    }

    setSquad(newSquad);
    saveSquad(newSquad);
    setIsModalOpen(false);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = (playerId: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      const newSquad = squad.filter((p) => p.id !== playerId);
      setSquad(newSquad);
      saveSquad(newSquad);
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
        const data = loadData();
        setSquad(data.squad);
        alert('Data imported successfully!');
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
          <Users className="mx-auto text-gray-400 mb-4" size={64} />
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
        <AddPlayerModal
          player={editingPlayer}
          onSave={handleSavePlayer}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPlayer(null);
          }}
          existingPlayers={squad}
        />
      )}
    </div>
  );
}

function Users({ className, size }: { className?: string; size: number }) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
