import React, { useState } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { useAppContext } from '../hooks/useAppContext';
import PMCLogo from '../components/PMCLogo';
import Navigation from '../components/Navigation';
import FormationSelector from '../components/FormationSelector';
import PositionGrid from '../components/PositionGrid';
import { optimizeLineup } from '../utils/optimizer';
import { Wand2, Save, RotateCcw } from 'lucide-react';

export default function LineupPage() {
  const {
    players,
    lineup,
    setLineup,
    formation,
    setFormation,
    getPlayerById,
  } = useAppContext();

  const [showFormationSelector, setShowFormationSelector] = useState(false);

  const handleOptimize = () => {
    if (!formation) return;
    const optimized = optimizeLineup(players, formation.positions);
    setLineup(optimized);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const playerId = active.id as string;
    const positionId = over.id as string;

    // Parse position from droppable ID
    const match = positionId.match(/position-(.+)-(\d+)-(\d+)/);
    if (!match) return;

    const [, position, x, y] = match;

    // Update lineup
    const existingIndex = lineup.findIndex(lp => lp.playerId === playerId);
    const newLineupPlayer = {
      playerId,
      position: position as any,
      x: parseFloat(x),
      y: parseFloat(y),
    };

    if (existingIndex >= 0) {
      // Move existing player
      const newLineup = [...lineup];
      newLineup[existingIndex] = newLineupPlayer;
      setLineup(newLineup);
    }
  };

  const handleReset = () => {
    if (confirm('Reset lineup to empty?')) {
      setLineup([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pmc-primary to-pmc-secondary text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <PMCLogo className="mb-4" />
          <h1 className="text-3xl font-bold">Lineup Builder</h1>
        </div>
      </div>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Controls */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowFormationSelector(!showFormationSelector)}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Change Formation ({formation?.name})
            </button>
            
            <button
              onClick={handleOptimize}
              className="btn-primary flex items-center gap-2"
              disabled={!formation}
            >
              <Wand2 className="w-5 h-5" />
              Auto-Optimize
            </button>

            <button
              onClick={handleReset}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" />
              Reset
            </button>

            <div className="ml-auto text-sm text-gray-600">
              {lineup.length} / 11 positions filled
            </div>
          </div>
        </div>

        {/* Formation Selector */}
        {showFormationSelector && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Select Formation</h2>
            <FormationSelector
              currentFormation={formation}
              onSelect={(f) => {
                setFormation(f);
                setShowFormationSelector(false);
              }}
            />
          </div>
        )}

        {/* Lineup Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Formation: {formation?.name}</h2>
              {formation && (
                <PositionGrid
                  lineup={lineup}
                  onDragEnd={handleDragEnd}
                  getPlayerById={getPlayerById}
                />
              )}
            </div>
          </div>

          {/* Available Players */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Available Players</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {players
                .filter(p => p.status === 'available' && !p.notes?.isInjured)
                .map(player => {
                  const isInLineup = lineup.some(lp => lp.playerId === player.id);
                  return (
                    <div
                      key={player.id}
                      className={`
                        p-3 rounded-lg border-2 transition-all
                        ${isInLineup
                          ? 'bg-green-50 border-green-300'
                          : 'bg-white border-gray-200 hover:border-pmc-primary'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pmc-primary text-white rounded-full flex items-center justify-center font-bold">
                          {player.number}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{player.name}</p>
                          <p className="text-sm text-gray-600">{player.preferredPosition}</p>
                        </div>
                        {isInLineup && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                            In Lineup
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
