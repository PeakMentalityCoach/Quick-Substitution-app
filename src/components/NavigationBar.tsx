import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Layout, RefreshCw, Target, Trophy, Settings } from 'lucide-react';

const navItems = [
  { path: '/players', label: 'Players', icon: Users },
  { path: '/lineup', label: 'Lineup', icon: Layout },
  { path: '/subs', label: 'Substitutions', icon: RefreshCw },
  { path: '/setpieces', label: 'Set Pieces', icon: Target },
  { path: '/match', label: 'Match Day', icon: Trophy },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export function NavigationBar() {
  const location = useLocation();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;

            return (
              <li key={path} className="relative">
                <Link
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-4 transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-500'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </Link>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
