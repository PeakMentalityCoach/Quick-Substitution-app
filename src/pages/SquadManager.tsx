import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Upload, Users } from 'lucide-react';
import { Player, PlayerNotes } from '../types';
import { loadData, saveSquad, exportData, importData } from '../utils/storage';
import AddPlayerModal from '../components/AddPlayerModal';
import PlayerCard from '../components/PlayerCard';
import PlayerNotesModal from '../components/PlayerNotesModal';

export default function SquadManager() {
  const [squad, setSquad] = useState<Player[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [notesPlayer, setNotesPlayer] = useState<Player | null>(null);

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

  const handleSaveNotes = (notes: PlayerNotes) => {
    if (notesPlayer) {
      const newSquad = squad.map((p) =>
        p.id === notesPlayer.id ? { ...p, notes } : p
      );
      setSquad(newSquad);
      saveSquad(newSquad);
    }
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
    <div className="animate-fade-in">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-l-4 border-pmc-green-600"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-pmc-gray-800">Squad Manager</h2>
            <p className="text-pmc-gray-600 mt-2">Manage your team roster, player ratings, and notes</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-pmc-green-600 text-white rounded-lg hover:bg-pmc-green-700 transition-colors shadow-md"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </motion.button>

            <motion.label
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-pmc-gold-600 text-white rounded-lg hover:bg-pmc-gold-700 transition-colors cursor-pointer shadow-md"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </motion.label>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingPlayer(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pmc-green-600 to-pmc-green-500 text-white rounded-lg hover:from-pmc-green-700 hover:to-pmc-green-600 transition-all shadow-lg"
            >
              <Plus size={18} />
              Add Player
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Squad Grid or Empty State */}
      {squad.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-12 text-center"
        >
          <Users className="mx-auto text-pmc-gray-400 mb-4" size={64} />
          <h3 className="text-2xl font-semibold text-pmc-gray-700 mb-2">No players yet</h3>
          <p className="text-pmc-gray-600 mb-6">Start building your squad by adding players</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pmc-green-600 to-pmc-green-500 text-white rounded-lg hover:from-pmc-green-700 hover:to-pmc-green-600 transition-all shadow-lg"
          >
            <Plus size={20} />
            Add Your First Player
          </motion.button>
        </motion.div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-pmc-gray-600">
              Total: <span className="font-bold text-pmc-green-700">{squad.length}</span> players
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {squad.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                onEdit={() => handleEditPlayer(player)}
                onDelete={() => handleDeletePlayer(player.id)}
                onNotes={() => setNotesPlayer(player)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
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

      {notesPlayer && (
        <PlayerNotesModal
          player={notesPlayer}
          isOpen={!!notesPlayer}
          onClose={() => setNotesPlayer(null)}
          onSave={handleSaveNotes}
        />
      )}
    </div>
  );
}
