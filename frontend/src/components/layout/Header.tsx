import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, User } from 'lucide-react';

const Header: React.FC = () => {
  const [userProfile, setUserProfile] = useState({
    username: 'utente123',
    avatar: null
  });

  // Carica i dati del profilo salvati
  useEffect(() => {
    const loadProfileData = () => {
      const savedProfileData = localStorage.getItem('profileData');
      if (savedProfileData) {
        const profileInfo = JSON.parse(savedProfileData);
        setUserProfile({
          username: profileInfo.username || 'utente123',
          avatar: profileInfo.avatar || null
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
      <header className="h-20 bg-primary-bg shadow-sm flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center">
            {/* Logo */}
            <NavLink to="/" className="text-3xl font-bold text-text-primary font-primary">
              Game<span className="text-accent-primary">Backlog</span>
            </NavLink>
          </div>

          {/* Menu di navigazione - centrato orizzontalmente */}
          <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2">
            <ul className="flex space-x-10">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'I miei giochi', path: '/library' },
                  { name: 'Dashboard', path: '/dashboard' },
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
            {/* Avatar */}
            <NavLink to="/profile">
              <div className="h-11 w-11 rounded-full bg-tertiary-bg border-2 border-accent-primary cursor-pointer flex items-center justify-center overflow-hidden">
                {userProfile.avatar ? (
                  <img 
                    src={userProfile.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-accent-primary font-bold text-lg">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </NavLink>
          </div>
      </header>
      {/* Linea di separazione subito sotto l'header */}
      <div className="w-full h-px bg-border-color" />
    </>
  );
};

export default Header;
