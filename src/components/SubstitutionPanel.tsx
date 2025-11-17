import React from 'react';
import { SubstitutionSuggestion } from '../types';
import { getPositionLabel, formatMinutes } from '../utils/helpers';
import { ArrowRight, AlertCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface SubstitutionPanelProps {
  suggestions: SubstitutionSuggestion[];
  onApply: (suggestion: SubstitutionSuggestion) => void;
}

export default function SubstitutionPanel({ suggestions, onApply }: SubstitutionPanelProps) {
  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (suggestions.length === 0) {
    return (
      <div className="card text-center py-12">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">No substitution suggestions at this time</p>
        <p className="text-sm text-gray-400 mt-2">
          The optimizer will suggest changes based on player fatigue and constraints
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={`${suggestion.playerOut.id}-${suggestion.playerIn.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="card"
        >
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge ${getPriorityColor(suggestion.priority)} border`}>
                  {suggestion.priority.toUpperCase()}
                </span>
                <span className="text-sm text-gray-600">
                  {getPositionLabel(suggestion.position)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                {/* Player Out */}
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 bg-gray-300 text-white rounded-full flex items-center justify-center font-bold">
                    {suggestion.playerOut.number}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{suggestion.playerOut.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatMinutes(suggestion.playerOut.minutesPlayed)} played
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />

                {/* Player In */}
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-10 h-10 bg-pmc-primary text-white rounded-full flex items-center justify-center font-bold">
                    {suggestion.playerIn.number}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{suggestion.playerIn.name}</p>
                    <p className="text-xs text-gray-500">
                      Skill: {suggestion.playerIn.skillLevel}/10
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{suggestion.reason}</p>
              </div>
            </div>

            <button
              onClick={() => onApply(suggestion)}
              className="btn-primary px-4 py-2 whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
