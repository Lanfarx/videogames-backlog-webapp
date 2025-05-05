import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import DiarioPage from './pages/DiarioPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import GamePage from './pages/GamePage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/library" element={
          <Layout>
            <LibraryPage />
          </Layout>
        } />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/dashboard" element={
          <Layout>
            <DashboardPage />
          </Layout>
        } />
        <Route path="/diario" element={
          <Layout>
            <DiarioPage />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <SettingsPage />
          </Layout>
        } />
      </Routes>
    </div>
  );
}

export default App;
