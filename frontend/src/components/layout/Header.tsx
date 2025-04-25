import React from 'react';
import { NavLink } from 'react-router-dom';
import { Search, Plus, Settings } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-6 max-w-[1440px]">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <NavLink to="/" className="text-2xl font-bold text-[#222222] font-['Montserrat']">
            Game<span className="text-[#FB7E00]">Backlog</span>
          </NavLink>

          {/* Menu di navigazione - allineato al centro */}
          <nav className="flex-1 flex justify-center">
            <ul className="flex space-x-10">
              {[

                { name: 'Home', path: '/' },
                { name: 'Libreria', path: '/library' },
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'Diario', path: '/diario' },
              ].map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive
                        ? 'text-[#FB7E00] border-b-2 border-[#FB7E00] pb-1 font-medium font-["Roboto"]'
                        : 'text-[#666666] hover:text-[#FB7E00] font-medium font-["Roboto"]'
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Profilo utente - allineato a destra */}
          <div className="flex items-center space-x-4">
            {/* Icona impostazioni con NavLink */}
            <NavLink to="/settings">
              <Settings className="h-6 w-6 text-[#666666] hover:text-[#FB7E00] cursor-pointer" />
            </NavLink>
            
            {/* Avatar (senza immagine) */}
            <div className="h-10 w-10 rounded-full bg-gray-300 border-2 border-[#FB7E00] cursor-pointer">
              {/* Avatar vuoto */}
            </div>
          </div>
        </div>
        
        {/* Barra di ricerca e pulsante */}
        <div className="py-4">
          <div className="relative w-full flex items-center">
            <div className="relative flex-grow max-w-2xl">
              <input
                type="text"
                className="w-full h-12 pl-12 pr-4 rounded-3xl border border-[#E0E0E0] focus:border-[#FB7E00] focus:outline-none focus:ring-2 focus:ring-[#FB7E00]/30"
                placeholder="Cerca nella tua libreria..."
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#666666]" />
              </div>
            </div>
            <button className="ml-4 flex items-center px-6 py-3 bg-[#FB7E00] text-white font-medium rounded-lg hover:bg-[#FB7E00]/90 transition-colors">
              <Plus className="h-5 w-5 mr-2" />
              Aggiungi un gioco
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
