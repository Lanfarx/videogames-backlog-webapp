import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings } from 'lucide-react';

const Header: React.FC = () => {
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
                  { name: 'Diario', path: '/diario' },
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
            {/* Avatar (senza immagine) */}
            <div className="h-11 w-11 rounded-full bg-tertiaryBg border-2 border-accent-primary cursor-pointer">
            </div>
          </div>
      </header>
      {/* Linea di separazione subito sotto l'header */}
      <div className="w-full h-px bg-border-color" />
    </>
  );
};

export default Header;
