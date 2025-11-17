import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, PlayCircle, Layout, Settings } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/lineup', icon: Layout, label: 'Lineup' },
  { path: '/game', icon: PlayCircle, label: 'Game' },
  { path: '/set-pieces', icon: Users, label: 'Set Pieces' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-center space-x-1 md:space-x-4">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`
                  flex items-center gap-2 px-3 md:px-6 py-4 border-b-2 transition-colors
                  ${
                    isActive
                      ? 'border-pmc-primary text-pmc-primary'
                      : 'border-transparent text-gray-600 hover:text-pmc-primary hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden md:inline font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
