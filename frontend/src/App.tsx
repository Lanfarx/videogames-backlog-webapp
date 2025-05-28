import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/header/HomePage';
import LibraryPage from './pages/header/LibraryPage';
import DashboardPage from './pages/header/DashboardPage';
import SettingsPage from './pages/header/SettingsPage';
import GamePage from './pages/inner/GamePage';
import DiarioPage from './pages/inner/DiarioPage';
import ProfilePage from './pages/header/ProfilePage';
import PrivacyPage from './pages/footer/PrivacyPage';
import TermsPage from './pages/footer/TermsPage';
import ContactPage from './pages/footer/ContactPage';
import { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { setGames } from './store/slice/gamesSlice';
import { gamesData } from './data/gamesData';
import { useAllGames } from './store/hooks/gamesHooks';
import { activitiesData } from './data/activitiesData';
import { setActivities } from './store/slice/activitiesSlice';
import { useAllActivities } from './store/hooks/activitiesHooks';
import CatalogPage from './pages/header/CatalogPage';
import GameInfoPage from './pages/inner/GameInfoPage';
import { setProfilePublic, setPrivacyOptions } from './store/slice/settingsSlice';
import { loadFromLocal } from './utils/localStorage';

function App() {
  const dispatch = useAppDispatch();
  const allGames = useAllGames();
  const allActivities = useAllActivities();

  useEffect(() => {
    if (allGames.length === 0) {
      dispatch(setGames(gamesData));
    }
    if (allActivities.length === 0) {
      dispatch(setActivities(activitiesData));
    }
    // Inizializza privacy da localStorage
    const isProfilePublic = loadFromLocal('isProfilePublic');
    if (typeof isProfilePublic === 'boolean') {
      dispatch(setProfilePublic(isProfilePublic));
    }
    const privacyOptions = loadFromLocal('privacyOptions');
    if (privacyOptions) {
      dispatch(setPrivacyOptions(privacyOptions));
    }
  }, [allGames.length, dispatch]);

  return (
    <div className="App">
      <Routes>
        {/* Route con layout standard */}
          <Route path="/library/:title" element={<GamePage />} />
          <Route path="/catalog/:id" element={<GameInfoPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
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
