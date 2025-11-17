import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, FileText, User } from 'lucide-react';
import { Player } from '../types';
import { PlayerMetadata } from './hooks/useMatchMode';

interface TabletNotesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  metadata: Map<string, PlayerMetadata>;
  onUpdateMetadata: (playerId: string, updates: Partial<PlayerMetadata>) => void;
  onAddBooking: (playerId: string, cardType: 'yellow' | 'red') => void;
  selectedPlayerId?: string | null;
}

export default function TabletNotesDrawer({
  isOpen,
  onClose,
  players,
  metadata,
  onUpdateMetadata,
  onAddBooking,
  selectedPlayerId,
}: TabletNotesDrawerProps) {
  const [activePlayerId, setActivePlayerId] = useState<string | null>(
    selectedPlayerId || null
  );
  const [noteText, setNoteText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update active player when prop changes
  useEffect(() => {
    if (selectedPlayerId) {
      setActivePlayerId(selectedPlayerId);
    }
  }, [selectedPlayerId]);

  // Load notes when active player changes
  useEffect(() => {
    if (activePlayerId) {
      const meta = metadata.get(activePlayerId);
      setNoteText(meta?.notes || '');
      setHasUnsavedChanges(false);
    }
  }, [activePlayerId, metadata]);

  const handleNotesChange = (value: string) => {
    setNoteText(value);
    setHasUnsavedChanges(true);
  };

  const handleSaveNotes = () => {
    if (activePlayerId) {
      onUpdateMetadata(activePlayerId, { notes: noteText });
      setHasUnsavedChanges(false);
    }
  };

  const handleAddYellowCard = () => {
    if (activePlayerId) {
      onAddBooking(activePlayerId, 'yellow');
    }
  };

  const handleAddRedCard = () => {
    if (activePlayerId) {
      onAddBooking(activePlayerId, 'red');
    }
  };

  const handleRemoveBooking = (index: number) => {
    if (!activePlayerId) return;

    const meta = metadata.get(activePlayerId);
    if (meta) {
      const newBookings = [...meta.bookings];
      newBookings.splice(index, 1);
      onUpdateMetadata(activePlayerId, { bookings: newBookings });
    }
  };

  const activePlayer = activePlayerId
    ? players.find((p) => p.id === activePlayerId)
    : null;
  const activeMeta = activePlayerId ? metadata.get(activePlayerId) : null;

  // Filter players by search
  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jerseyNumber.toString().includes(searchTerm)
  );

  return (
    <>
      {/* Overlay */}
      <div
        className={`tablet-drawer-overlay ${isOpen ? 'tablet-drawer-overlay-visible' : ''
          }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`tablet-drawer ${isOpen ? 'tablet-drawer-open' : ''}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white">
            <div className="flex items-center gap-2">
              <FileText size={24} />
              <h2 className="text-xl font-bold">Match Notes</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              aria-label="Close drawer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            {/* Player selector */}
            <div className="p-4 border-b bg-gray-50">
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 text-sm"
              />

              <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                {filteredPlayers.map((player) => {
                  const meta = metadata.get(player.id);
                  const hasNotes = meta?.notes && meta.notes.length > 0;
                  const hasBookings = meta?.bookings && meta.bookings.length > 0;

                  return (
                    <button
                      key={player.id}
                      onClick={() => setActivePlayerId(player.id)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors ${activePlayerId === player.id
                          ? 'bg-green-100 border-2 border-green-500'
                          : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                        {player.jerseyNumber}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {player.name}
                        </p>
                      </div>
                      {(hasNotes || hasBookings) && (
                        <div className="flex items-center gap-1">
                          {hasNotes && <FileText size={14} className="text-blue-600" />}
                          {hasBookings && (
                            <AlertCircle size={14} className="text-yellow-600" />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player details and notes */}
            {activePlayer && activeMeta ? (
              <div className="p-4">
                {/* Player info */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="tablet-jersey-badge">{activePlayer.jerseyNumber}</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {activePlayer.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {activePlayer.positions.join(', ')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Minutes Played</p>
                      <p className="font-bold text-lg">{activeMeta.minutesPlayed}'</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Fatigue</p>
                      <p className="font-bold text-lg">{activeMeta.fatigueLevel.toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* Fatigue bar */}
                  <div className="tablet-fatigue-bar mt-3">
                    <div
                      className="tablet-fatigue-fill"
                      style={{ width: `${activeMeta.fatigueLevel}%` }}
                    />
                  </div>
                </div>

                {/* Bookings */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <h4 className="font-bold text-gray-800 mb-3">Bookings</h4>
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={handleAddYellowCard}
                      className="flex-1 tablet-button bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
                    >
                      ⚠️ Yellow Card
                    </button>
                    <button
                      onClick={handleAddRedCard}
                      className="flex-1 tablet-button tablet-button-danger"
                    >
                      ⛔ Red Card
                    </button>
                  </div>

                  {activeMeta.bookings.length > 0 ? (
                    <div className="space-y-2">
                      {activeMeta.bookings.map((card, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-lg ${card === 'yellow'
                              ? 'bg-yellow-100 text-yellow-900'
                              : 'bg-red-100 text-red-900'
                            }`}
                        >
                          <span className="font-semibold">
                            {card === 'yellow' ? '⚠️ Yellow Card' : '⛔ Red Card'}
                          </span>
                          <button
                            onClick={() => handleRemoveBooking(index)}
                            className="text-xs px-2 py-1 bg-white rounded hover:bg-gray-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-2">
                      No bookings
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-800">Notes</h4>
                    {hasUnsavedChanges && (
                      <span className="text-xs text-orange-600 font-semibold">
                        Unsaved changes
                      </span>
                    )}
                  </div>

                  <textarea
                    value={noteText}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add notes about this player's performance, tactical instructions, or reminders..."
                    className="w-full h-40 p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 resize-none text-sm"
                  />

                  <button
                    onClick={handleSaveNotes}
                    disabled={!hasUnsavedChanges}
                    className={`w-full mt-3 tablet-button ${hasUnsavedChanges
                        ? 'tablet-button-primary'
                        : 'tablet-button-outline opacity-50 cursor-not-allowed'
                      } flex items-center justify-center gap-2`}
                  >
                    <Save size={18} />
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <User size={64} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-500 mb-2">
                  No Player Selected
                </h3>
                <p className="text-gray-400 text-sm">
                  Select a player from the list above to view and edit their notes
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
