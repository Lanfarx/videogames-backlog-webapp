import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Heart } from 'lucide-react';
import AppLogo from '../ui/atoms/AppLogo';
import ProfileAvatar from '../ui/ProfileAvatar';
import NotificationBell from '../notifications/NotificationBell';

export default function Header() {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'I miei giochi', path: '/library' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Catalogo', path: '/catalog' },
    { name: 'Amici', path: '/friends' },
  ];

  return (
    <>
      <header className="h-16 bg-primary-bg shadow-sm flex items-center justify-between px-4 sm:px-6 flex-shrink-0 relative z-30">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <AppLogo className="h-7 w-auto" />
          </div>

          {/* Menu di navigazione desktop - centrato orizzontalmente */}
          <nav className="hidden md:flex items-center absolute left-1/2 transform -translate-x-1/2" aria-label="Navigazione principale">
            <ul className="flex space-x-6 lg:space-x-10">
                {navItems.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        isActive
                          ? 'text-base lg:text-lg text-accent-primary border-b-2 border-accent-primary py-1 font-medium font-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary'
                          : 'text-base lg:text-lg text-text-secondary hover:text-accent-primary font-medium font-secondary py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary'
                      }
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </nav>

          {/* Profilo utente e azioni rapide - allineato a destra */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Icona wishlist */}
            <NavLink
              to="/wishlist"
              aria-label="Wishlist"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-text-secondary hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              {({ isActive }) => (
                <Heart className={`h-6 w-6 ${isActive ? 'text-cyan-500 fill-cyan-500' : ''} transition-colors`} />
              )}
            </NavLink>
            
            {/* Icona notifiche */}
            <NotificationBell />
            
            {/* Icona impostazioni */}
            <NavLink
              to="/settings"
              aria-label="Impostazioni"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-text-secondary hover:text-accent-primary hover:bg-accent-primary/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              {({ isActive }) => (
                <Settings className={`h-6 w-6 ${isActive ? 'text-accent-primary' : ''} transition-colors`} />
              )}
            </NavLink>
            <ProfileAvatar />
          </div>
      </header>
      {/* Linea di separazione subito sotto l'header */}
      <div className="w-full h-px bg-border-color" />
    </>
  );
}
