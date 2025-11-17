import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SquadManager from './pages/SquadManager';
import LineupBuilder from './pages/LineupBuilder';
import InGame from './pages/InGame';
import SetPieces from './pages/SetPieces';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/squad" replace />} />
        <Route path="/squad" element={<SquadManager />} />
        <Route path="/lineup" element={<LineupBuilder />} />
        <Route path="/game" element={<InGame />} />
        <Route path="/setpieces" element={<SetPieces />} />
      </Routes>
    </Layout>
  );
}

export default App;
