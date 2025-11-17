import React from 'react';
import { Player } from '../types';
import { getPositionLabel, getPlayerStatusColor, getPlayerStatusBadge, formatMinutes } from '../utils/helpers';
import { Edit, Trash2, AlertCircle } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (id: string) => void;
}

export default function PlayerCard({ player, onEdit, onDelete }: PlayerCardProps) {
  const statusColor = getPlayerStatusColor(player);
  const statusBadge = getPlayerStatusBadge(player);
  
  return (
    <div className="card hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-pmc-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
              {player.number}
            </div>
            <div>
              <h3 className="font-bold text-lg">{player.name}</h3>
              <p className="text-sm text-gray-600">
                {getPositionLabel(player.preferredPosition)}
              </p>
            </div>
          </div>
          
          <div className="space-y-1 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Skill:</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                <div
                  className="bg-pmc-accent h-2 rounded-full"
                  style={{ width: `${player.skillLevel * 10}%` }}
                />
              </div>
              <span className="text-sm font-medium">{player.skillLevel}/10</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Minutes:</span>
              <span className="font-medium">{formatMinutes(player.minutesPlayed)}</span>
              {player.notes?.minutesLimit && (
                <span className="text-gray-500">/ {formatMinutes(player.notes.minutesLimit)}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`badge ${statusColor.replace('text-', 'bg-').replace('600', '100')} ${statusColor}`}>
                {statusBadge}
              </span>
              {player.notes?.excludeFromOptimizer && (
                <span className="badge badge-blue">Manual</span>
              )}
            </div>
            
            {player.notes?.notes && (
              <div className="flex items-start gap-2 mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{player.notes.notes}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(player)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(player.id)}
            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
