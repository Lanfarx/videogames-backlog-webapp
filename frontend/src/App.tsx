import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';
import DiarioPage from './pages/DiarioPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <div className="App">
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/diario" element={<DiarioPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
