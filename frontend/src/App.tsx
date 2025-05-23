import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/header/HomePage';
import LibraryPage from './pages/header/LibraryPage';
import DashboardPage from './pages/header/DashboardPage';
import SettingsPage from './pages/header/SettingsPage';
import GamePage from './pages/GamePage';
import DiarioPage from './pages/DiarioPage';
import ProfilePage from './pages/header/ProfilePage';
import PrivacyPage from './pages/footer/PrivacyPage';
import TermsPage from './pages/footer/TermsPage';
import ContactPage from './pages/footer/ContactPage';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { setGames } from './store/slice/gamesSlice';
import { gamesData } from './utils/gamesData';
import { useAllGames } from './utils/gamesHooks';

function App() {
  const dispatch = useAppDispatch();
  const allGames = useAllGames();

  useEffect(() => {
    if (allGames.length === 0) {
      dispatch(setGames(gamesData));
    }
  }, [allGames.length, dispatch]);

  return (
    <div className="App">
      <Routes>
        {/* Route con layout standard */}
          <Route path="/game/:id" element={<GamePage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/diario" element={<DiarioPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
