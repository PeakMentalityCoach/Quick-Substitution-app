import { Link, useLocation } from 'react-router-dom';
import { Users, ClipboardList, Play, Target } from 'lucide-react';
import PMCLogo from './PMCLogo';
import { PMC_APP_NAME } from '../constants/brand';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/squad', label: 'Squad', icon: Users },
    { path: '/lineup', label: 'Build Lineup', icon: ClipboardList },
    { path: '/game', label: 'Match Day', icon: Play },
    { path: '/setpieces', label: 'Set Pieces', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-green-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <PMCLogo size="md" />
              <div>
                <h1 className="text-2xl font-bold text-white">{PMC_APP_NAME}</h1>
                <p className="text-green-200 text-sm">Optimize your team with data-driven insights</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                    isActive
                      ? 'text-green-700 border-b-2 border-green-700 bg-green-50'
                      : 'text-gray-600 hover:text-green-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
