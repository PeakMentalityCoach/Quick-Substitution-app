import React, { useState } from 'react';
import { Player } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import PlayerCard from './PlayerCard';
import PlayerForm from './PlayerForm';
import NotesModal from './NotesModal';
import Sidebar from './Sidebar';
import { Plus, FileText } from 'lucide-react';

export default function PlayerManager() {
  const { players, addPlayer, updatePlayer, deletePlayer } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | undefined>();
  const [notesPlayer, setNotesPlayer] = useState<Player | undefined>();

  const handleSubmit = (playerData: Omit<Player, 'id'> | Player) => {
    if ('id' in playerData) {
      updatePlayer(playerData.id, playerData);
    } else {
      addPlayer(playerData);
    }
    setIsFormOpen(false);
    setEditingPlayer(undefined);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this player?')) {
      deletePlayer(id);
    }
  };

  const handleOpenNotes = (player: Player) => {
    setNotesPlayer(player);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Player Roster</h2>
          <p className="text-gray-600 mt-1">{players.length} players registered</p>
        </div>
        <button
          onClick={() => {
            setEditingPlayer(undefined);
            setIsFormOpen(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Player
        </button>
      </div>

      {players.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium mb-2">No players yet</p>
          <p className="text-sm text-gray-400">Add your first player to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.map((player) => (
            <div key={player.id} className="relative group">
              <PlayerCard
                player={player}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
              <button
                onClick={() => handleOpenNotes(player)}
                className="absolute top-4 right-16 p-2 bg-white hover:bg-gray-100 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Edit Notes"
              >
                <FileText className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Sidebar
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingPlayer(undefined);
        }}
        title={editingPlayer ? 'Edit Player' : 'Add New Player'}
      >
        <PlayerForm
          player={editingPlayer}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingPlayer(undefined);
          }}
        />
      </Sidebar>

      {notesPlayer && (
        <NotesModal
          player={notesPlayer}
          isOpen={!!notesPlayer}
          onClose={() => setNotesPlayer(undefined)}
          onSave={(playerId, notes) => {
            updatePlayer(playerId, { notes });
          }}
        />
      )}
    </div>
  );
}
