import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
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
import React from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { setGames } from './store/slice/gamesSlice';
import { gamesData } from './data/gamesData';
import { useAllGames } from './store/hooks/gamesHooks';
import { activitiesData } from './data/activitiesData';
import { setActivities } from './store/slice/activitiesSlice';
import { useAllActivities } from './store/hooks/activitiesHooks';
import CatalogPage from './pages/header/CatalogPage';
import GameInfoPage from './pages/inner/GameInfoPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthLayout from './components/auth/AuthLayout';
import { getToken } from './utils/getToken';
import { getProfile } from './store/services/profileService';
import { setUserProfile } from './store/slice/userSlice';

function App() {
  const dispatch = useAppDispatch();
  const allGames = useAllGames();
  const allActivities = useAllActivities();
  const location = useLocation();
  const userProfile = useAppSelector((state) => state.user.profile);

  // Carica il profilo utente all'avvio se c'è un token ma il profilo non è nello stato globale
  React.useEffect(() => {
    const token = getToken();
    if (token && !userProfile) {
      getProfile(token)
        .then((profile) => {
          dispatch(setUserProfile(profile));
        })
        .catch(() => {
          
        });
    }
  }, [dispatch, userProfile]);

  const ProtectedRoute = () => {
    const token = getToken();
    // Consenti l'accesso se c'è un token, anche se il profilo non è ancora caricato
    return token ? <Outlet /> : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      <Routes>
        {/* Route pubbliche */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="contact" element={<ContactPage />} />
        </Route>
        {/* Route protette */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="library" element={<LibraryPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="diario" element={<DiarioPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="library/:title" element={<GamePage />} />
            <Route path="catalog/:id" element={<GameInfoPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
