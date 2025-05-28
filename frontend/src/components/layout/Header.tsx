import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { loadFromLocal } from '../../utils/localStorage';
import AppLogo from '../ui/atoms/AppLogo';
import ProfileAvatar from '../ui/ProfileAvatar';

const Header: React.FC = () => {
  const [userProfile, setUserProfile] = useState({
    username: 'utente123',
    avatar: null
  });

  // Carica i dati del profilo salvati
  useEffect(() => {
    const loadProfileData = () => {
      const savedProfileData = loadFromLocal('profileData');
      if (savedProfileData) {
        setUserProfile({
          username: savedProfileData.username || 'utente123',
          avatar: savedProfileData.avatar || null
        });
      }
    };

    loadProfileData();
    
    // Aggiorna quando cambia lo storage
    window.addEventListener('storage', loadProfileData);
    
    return () => {
      window.removeEventListener('storage', loadProfileData);
    };
  }, []);

  return (
    <>
      <header className="h-16 bg-primary-bg shadow-sm flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <AppLogo className="h-7 w-auto" />
          </div>

          {/* Menu di navigazione - centrato orizzontalmente */}
          <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            <ul className="flex space-x-10">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'I miei giochi', path: '/library' },
                  { name: 'Dashboard', path: '/dashboard' },
                  { name: 'Catalogo', path: '/catalog' },
                ].map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? 'text-lg text-accent-primary border-b-2 border-accent-primary py-1 font-medium font-secondary'
                          : 'text-lg text-text-secondary hover:text-accent-primary font-medium font-secondary'
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Profilo utente - allineato a destra */}
          <div className="flex items-center space-x-5">
            {/* Icona impostazioni */}
            <NavLink to="/settings">
              {({ isActive }) => (
                <Settings className={`h-6 w-6 ${isActive ? 'text-accent-primary' : 'text-text-secondary hover:text-accent-primary'} cursor-pointer`} />
              )}
            </NavLink>
            <ProfileAvatar />
          </div>
      </header>
      {/* Linea di separazione subito sotto l'header */}
      <div className="w-full h-px bg-border-color" />
    </>
  );
};

export default Header;
