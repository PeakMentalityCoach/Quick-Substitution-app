import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import PMCLogo from '../components/PMCLogo';
import Navigation from '../components/Navigation';
import { Users, Layout, PlayCircle, Flag, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const { players, lineup, settings, getAvailablePlayers } = useAppContext();
  
  const availablePlayers = getAvailablePlayers();

  const cards = [
    {
      title: 'Total Players',
      value: players.length,
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => navigate('/settings'),
    },
    {
      title: 'Available Players',
      value: availablePlayers.length,
      icon: TrendingUp,
      color: 'bg-green-500',
      onClick: () => navigate('/lineup'),
    },
    {
      title: 'Lineup Set',
      value: lineup.length,
      icon: Layout,
      color: 'bg-purple-500',
      onClick: () => navigate('/lineup'),
    },
    {
      title: 'Max Subs',
      value: settings.maxSubstitutions,
      icon: PlayCircle,
      color: 'bg-orange-500',
      onClick: () => navigate('/settings'),
    },
  ];

  const quickActions = [
    {
      title: 'Build Lineup',
      description: 'Create and optimize your starting lineup',
      icon: Layout,
      color: 'bg-pmc-primary',
      onClick: () => navigate('/lineup'),
    },
    {
      title: 'Start Game',
      description: 'Manage live game and substitutions',
      icon: PlayCircle,
      color: 'bg-green-600',
      onClick: () => navigate('/game'),
    },
    {
      title: 'Set Pieces',
      description: 'Plan corner kicks and free kicks',
      icon: Flag,
      color: 'bg-blue-600',
      onClick: () => navigate('/set-pieces'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-pmc-primary to-pmc-secondary text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <PMCLogo className="mb-6" />
          <h1 className="text-4xl font-bold mb-2">Football Optimizer</h1>
          <p className="text-pmc-light text-lg">
            {settings.teamName} - Coach {settings.coachName}
          </p>
        </div>
      </div>

      <Navigation />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={card.onClick}
              className="card cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} w-14 h-14 rounded-lg flex items-center justify-center`}>
                  <card.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={action.onClick}
                className="card cursor-pointer hover:shadow-xl transition-all group"
              >
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        {players.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="card bg-gradient-to-r from-pmc-light to-white border-2 border-pmc-primary"
          >
            <h2 className="text-2xl font-bold text-pmc-primary mb-4">Getting Started</h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-pmc-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>Go to <strong>Settings</strong> to add your players and configure team details</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-pmc-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>Visit <strong>Lineup</strong> to build your starting formation</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-pmc-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>Use <strong>Game</strong> mode to manage live substitutions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-pmc-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span>Plan your <strong>Set Pieces</strong> for corners and free kicks</span>
              </li>
            </ol>
          </motion.div>
        )}
      </div>
    </div>
  );
}
