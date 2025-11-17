import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';
import { PlayersPage } from './pages/PlayersPage';
import { LineupPage } from './pages/LineupPage';
import { SubstitutionsPage } from './pages/SubstitutionsPage';
import { SetPiecesPage } from './pages/SetPiecesPage';
import { MatchDayPage } from './pages/MatchDayPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/players" replace />
      },
      {
        path: 'players',
        element: <PlayersPage />
      },
      {
        path: 'lineup',
        element: <LineupPage />
      },
      {
        path: 'subs',
        element: <SubstitutionsPage />
      },
      {
        path: 'setpieces',
        element: <SetPiecesPage />
      },
      {
        path: 'match',
        element: <MatchDayPage />
      },
      {
        path: 'settings',
        element: <SettingsPage />
      }
    ]
  }
]);
