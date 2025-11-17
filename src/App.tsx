import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './hooks/useAppContext'
import Dashboard from './pages/Dashboard'
import LineupPage from './pages/LineupPage'
import GamePage from './pages/GamePage'
import SetPiecesPage from './pages/SetPiecesPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lineup" element={<LineupPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/set-pieces" element={<SetPiecesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App
