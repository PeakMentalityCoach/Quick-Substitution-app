import React from 'react';
import { Outlet } from 'react-router-dom';
import { PlayersProvider } from './context/PlayersContext';
import { GameStateProvider } from './context/GameStateContext';
import { SetPieceProvider } from './context/SetPieceContext';
import { SettingsProvider } from './context/SettingsContext';
import { PMCBrandHeader } from './components/PMCBrandHeader';
import { NavigationBar } from './components/NavigationBar';
import { Footer } from './components/Footer';

export function App() {
  return (
    <SettingsProvider>
      <PlayersProvider>
        <GameStateProvider>
          <SetPieceProvider>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
              <PMCBrandHeader />
              <NavigationBar />
              <main className="flex-1">
                <Outlet />
              </main>
              <Footer />
            </div>
          </SetPieceProvider>
        </GameStateProvider>
      </PlayersProvider>
    </SettingsProvider>
  );
}
