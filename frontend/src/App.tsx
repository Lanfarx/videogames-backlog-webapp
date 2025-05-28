import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import React, { useEffect, useState } from 'react';
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
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthLayout from './components/auth/AuthLayout';

function getIsLoggedIn() {
  return Boolean(localStorage.getItem('token'));
}

function App() {
  const dispatch = useAppDispatch();
  const allGames = useAllGames();
  const allActivities = useAllActivities();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn());

  useEffect(() => {
    const onStorage = () => setIsLoggedIn(getIsLoggedIn());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

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

  useEffect(() => {
    // Aggiorna lo stato loggato dopo login/logout
    setIsLoggedIn(getIsLoggedIn());
  }, [location.pathname]);

  return (
    <div className="App">
      <Routes>
        {/* Se non loggato, redirect a /login tranne che su /register, privacy, terms, contact */}
        {!isLoggedIn &&
          !['/login', '/register', '/privacy', '/terms', '/contact'].includes(location.pathname) && (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/privacy" element={
          isLoggedIn ? <Layout><PrivacyPage /></Layout> : <AuthLayout><PrivacyPage /></AuthLayout>
        } />
        <Route path="/terms" element={
          isLoggedIn ? <Layout><TermsPage /></Layout> : <AuthLayout><TermsPage /></AuthLayout>
        } />
        <Route path="/contact" element={
          isLoggedIn ? <Layout><ContactPage /></Layout> : <AuthLayout><ContactPage /></AuthLayout>
        } />
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
        </Route>
      </Routes>
    </div>
  );
}

export default App;
