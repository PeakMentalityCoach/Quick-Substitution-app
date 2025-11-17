import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import PMCLogo from '../components/PMCLogo';
import Navigation from '../components/Navigation';
import PositionGrid from '../components/PositionGrid';
import SubstitutionPanel from '../components/SubstitutionPanel';
import { SubstitutionSuggestion } from '../types';
import { Play, Pause, RotateCcw, TrendingUp } from 'lucide-react';

export default function GamePage() {
  const {
    lineup,
    setLineup,
    gameState,
    setGameState,
    getPlayerById,
    getSubstitutionSuggestions,
    players,
    updatePlayer,
    formation,
  } = useAppContext();

  const [isPlaying, setIsPlaying] = useState(false);
  const [suggestions, setSuggestions] = useState<SubstitutionSuggestion[]>([]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setGameState({
          currentMinute: Math.min(gameState.currentMinute + 1, 90),
        });
        
        // Update minutes played for players in lineup
        lineup.forEach(lp => {
          const player = getPlayerById(lp.playerId);
          if (player) {
            updatePlayer(player.id, {
              minutesPlayed: player.minutesPlayed + 1,
            });
          }
        });

        if (gameState.currentMinute >= 90) {
          setIsPlaying(false);
        }
      }, 1000); // Simulate 1 second = 1 minute
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameState.currentMinute]);

  const handleRefreshSuggestions = () => {
    const newSuggestions = getSubstitutionSuggestions();
    setSuggestions(newSuggestions);
  };

  const handleApplySuggestion = (suggestion: SubstitutionSuggestion) => {
    if (gameState.substitutionsUsed >= gameState.maxSubstitutions) {
      alert('Maximum substitutions reached!');
      return;
    }

    // Replace player in lineup
    const newLineup = lineup.map(lp => 
      lp.playerId === suggestion.playerOut.id
        ? { ...lp, playerId: suggestion.playerIn.id }
        : lp
    );
    setLineup(newLineup);
    
    // Update substitutions count
    setGameState({
      substitutionsUsed: gameState.substitutionsUsed + 1,
    });

    // Refresh suggestions
    setTimeout(handleRefreshSuggestions, 100);
  };

  const handleReset = () => {
    if (confirm('Reset game state?')) {
      setGameState({
        currentMinute: 0,
        score: { home: 0, away: 0 },
        substitutionsUsed: 0,
      });
      setIsPlaying(false);
      
      // Reset minutes played
      players.forEach(player => {
        updatePlayer(player.id, { minutesPlayed: 0 });
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pmc-primary to-pmc-secondary text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <PMCLogo className="mb-4" />
          <h1 className="text-3xl font-bold">Game Manager</h1>
        </div>
      </div>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Controls */}
        <div className="card mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-pmc-primary">
                  {gameState.currentMinute}'
                </div>
                <div className="text-sm text-gray-600">Game Time</div>
              </div>
              
              <div className="h-12 w-px bg-gray-300" />
              
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {gameState.score.home} - {gameState.score.away}
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              
              <div className="h-12 w-px bg-gray-300" />
              
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">
                  {gameState.substitutionsUsed} / {gameState.maxSubstitutions}
                </div>
                <div className="text-sm text-gray-600">Substitutions</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`btn-primary flex items-center gap-2 ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start
                  </>
                )}
              </button>
              
              <button
                onClick={handleReset}
                className="btn-secondary flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Lineup */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Current Lineup</h2>
            {formation && (
              <PositionGrid
                lineup={lineup}
                onDragEnd={() => {}}
                getPlayerById={getPlayerById}
                interactive={false}
              />
            )}
          </div>

          {/* Substitution Suggestions */}
          <div>
            <div className="card mb-4">
              <button
                onClick={handleRefreshSuggestions}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                Get Substitution Suggestions
              </button>
            </div>
            
            <SubstitutionPanel
              suggestions={suggestions}
              onApply={handleApplySuggestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
