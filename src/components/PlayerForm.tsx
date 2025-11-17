import React, { useState, useEffect } from 'react';
import { Player, Position, PlayerStatus } from '../types';
import { ALL_POSITIONS, getPositionLabel } from '../utils/helpers';

interface PlayerFormProps {
  player?: Player;
  onSubmit: (player: Omit<Player, 'id'> | Player) => void;
  onCancel: () => void;
}

export default function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const [formData, setFormData] = useState({
    name: player?.name || '',
    number: player?.number || 1,
    preferredPosition: player?.preferredPosition || 'CM' as Position,
    alternativePositions: player?.alternativePositions || [] as Position[],
    skillLevel: player?.skillLevel || 5,
    status: player?.status || 'available' as PlayerStatus,
    minutesPlayed: player?.minutesPlayed || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (player) {
      onSubmit({ ...player, ...formData });
    } else {
      onSubmit({
        ...formData,
        notes: {
          isInjured: false,
        },
      });
    }
  };

  const toggleAlternativePosition = (position: Position) => {
    setFormData(prev => ({
      ...prev,
      alternativePositions: prev.alternativePositions.includes(position)
        ? prev.alternativePositions.filter(p => p !== position)
        : [...prev.alternativePositions, position],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Player Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jersey Number
        </label>
        <input
          type="number"
          min="1"
          max="99"
          value={formData.number}
          onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Position
        </label>
        <select
          value={formData.preferredPosition}
          onChange={(e) => setFormData({ ...formData, preferredPosition: e.target.value as Position })}
          className="input-field"
          required
        >
          {ALL_POSITIONS.map(pos => (
            <option key={pos} value={pos}>
              {getPositionLabel(pos)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alternative Positions
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ALL_POSITIONS.filter(p => p !== formData.preferredPosition).map(pos => (
            <button
              key={pos}
              type="button"
              onClick={() => toggleAlternativePosition(pos)}
              className={`
                px-2 py-1 text-sm rounded border transition-colors
                ${formData.alternativePositions.includes(pos)
                  ? 'bg-pmc-primary text-white border-pmc-primary'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-pmc-primary'
                }
              `}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Skill Level: {formData.skillLevel}/10
        </label>
        <input
          type="range"
          min="1"
          max="10"
          value={formData.skillLevel}
          onChange={(e) => setFormData({ ...formData, skillLevel: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as PlayerStatus })}
          className="input-field"
          required
        >
          <option value="available">Available</option>
          <option value="injured">Injured</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Minutes Played
        </label>
        <input
          type="number"
          min="0"
          max="90"
          value={formData.minutesPlayed}
          onChange={(e) => setFormData({ ...formData, minutesPlayed: parseInt(e.target.value) })}
          className="input-field"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn-primary flex-1">
          {player ? 'Update' : 'Add'} Player
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  );
}
