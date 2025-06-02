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
import CatalogPage from './pages/header/CatalogPage';
import GameInfoPage from './pages/inner/GameInfoPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AuthLayout from './components/auth/AuthLayout';
import { getToken } from './utils/getToken';
import { getProfile } from './store/services/profileService';
import { setUserProfile, setProfileLoading, setProfileLoadError } from './store/slice/userSlice';
import LoadingSpinner from './components/loading/LoadingSpinner';

function App() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const userProfile = useAppSelector((state) => state.user.profile);
  const isProfileLoading = useAppSelector((state) => state.user.isProfileLoading);
  
  // Ref per tenere traccia se il profilo è già stato richiesto
  const profileRequestedRef = React.useRef(false);

  // Carica il profilo utente all'avvio se c'è un token ma il profilo non è nello stato globale
  React.useEffect(() => {
    const token = getToken();
    if (token && !userProfile && !profileRequestedRef.current) {
      profileRequestedRef.current = true;
      dispatch(setProfileLoading(true));
      getProfile(token)
        .then((profile) => {
          dispatch(setUserProfile(profile));
        })
        .catch((error) => {
          dispatch(setProfileLoadError('Errore nel caricamento del profilo'));
          profileRequestedRef.current = false; // Reset per permettere retry in caso di errore
        });
    }
  }, [dispatch, userProfile]); // Rimuoviamo isProfileLoading dalle dipendenze per evitare loop
  // Reset del flag quando il profilo viene caricato con successo
  React.useEffect(() => {
    if (userProfile) {
      profileRequestedRef.current = false;
    }
  }, [userProfile]);

  // Reset del flag quando non c'è token (logout)
  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      profileRequestedRef.current = false;
    }
  }, [location.pathname]); // Controlla ad ogni cambio di route

  const ProtectedRoute = () => {
    const token = getToken();
    const profile = useAppSelector((state) => state.user.profile);
    const isLoading = useAppSelector((state) => state.user.isProfileLoading);
    const loadError = useAppSelector((state) => state.user.profileLoadError);

    // Se non c'è token, reindirizza al login
    if (!token) {
      return <Navigate to="/login" />;
    }

    // Se c'è un errore nel caricamento del profilo, reindirizza al login
    if (loadError) {
      return <Navigate to="/login" />;
    }

    // Se il profilo è ancora in caricamento, mostra spinner
    if (isLoading || (token && !profile)) {
      return <LoadingSpinner message="Caricamento profilo..." />;
    }

    // Se tutto è ok (token presente e profilo caricato), consenti l'accesso
    return <Outlet />;
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
          
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
            <Route path="library/:title" element={<GamePage />} />
            <Route path="catalog/:id" element={<GameInfoPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
