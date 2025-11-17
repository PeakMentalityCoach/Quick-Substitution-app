import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ClipboardList, Play, Target, Menu, X } from 'lucide-react';
import PMCLogo from './PMCLogo';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/squad', label: 'Squad Manager', icon: Users, description: 'Manage your team roster' },
    { path: '/lineup', label: 'Lineup Builder', icon: ClipboardList, description: 'Build optimal formations' },
    { path: '/game', label: 'In-Game', icon: Play, description: 'Live substitution optimizer' },
    { path: '/setpieces', label: 'Set Pieces', icon: Target, description: 'Configure set-piece layouts' },
  ];

  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring' as const, stiffness: 300, damping: 30 } },
  };

  const overlayVariants = {
    open: { opacity: 1, pointerEvents: 'auto' as const },
    closed: { opacity: 0, pointerEvents: 'none' as const },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pmc-gray-50 via-white to-pmc-green-50">
      {/* Top Navigation Bar */}
      <header className="bg-gradient-to-r from-pmc-green-700 via-pmc-green-600 to-pmc-green-700 text-white shadow-xl sticky top-0 z-40">
        <div className="px-4 lg:px-6 py-3 lg:py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-pmc-green-600 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <div className="flex-1 lg:flex-initial flex justify-center lg:justify-start">
              <PMCLogo size="md" showText={true} variant="light" />
            </div>

            {/* Desktop Navigation (Top Right) - Optional Quick Links */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-pmc-gold-400">Professional Analysis</p>
                <p className="text-xs text-pmc-green-100">Tactical Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar Navigation */}
        <motion.aside
          initial={false}
          animate={sidebarOpen ? 'open' : 'closed'}
          variants={sidebarVariants}
          className="fixed lg:sticky top-[4rem] left-0 h-[calc(100vh-4rem)] bg-white shadow-2xl z-40 lg:z-0 w-72 flex flex-col border-r border-pmc-gray-200"
        >
          <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-start gap-4 px-4 py-3 rounded-xl font-medium transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-pmc-green-600 to-pmc-green-500 text-white shadow-lg shadow-pmc-green-200'
                      : 'text-pmc-gray-700 hover:bg-pmc-green-50 hover:text-pmc-green-700'
                  }`}
                >
                  <Icon
                    size={22}
                    className={`mt-0.5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-pmc-gold-400' : ''
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{item.label}</div>
                    <div className={`text-xs mt-0.5 ${
                      isActive ? 'text-pmc-green-100' : 'text-pmc-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-pmc-gray-200 bg-pmc-gray-50">
            <div className="text-center text-xs text-pmc-gray-600">
              <p className="font-semibold text-pmc-green-700">Peak Mentality Coach</p>
              <p className="mt-1">v1.0.0 Production</p>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
