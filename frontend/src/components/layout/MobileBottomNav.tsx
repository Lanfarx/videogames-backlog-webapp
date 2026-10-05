import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gamepad2, LayoutDashboard, Compass, Users } from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}

const navItems: NavItem[] = [
  { name: 'Home', path: '/', icon: Home, ariaLabel: 'Vai alla Home' },
  { name: 'Libreria', path: '/library', icon: Gamepad2, ariaLabel: 'I miei giochi' },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, ariaLabel: 'Dashboard e statistiche' },
  { name: 'Catalogo', path: '/catalog', icon: Compass, ariaLabel: 'Catalogo giochi' },
  { name: 'Amici', path: '/friends', icon: Users, ariaLabel: 'Amici e attività' },
];

export default function MobileBottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-primary-bg/95 backdrop-blur border-t border-border-color md:hidden pb-[max(0.25rem,env(safe-area-inset-bottom))] px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]"
      aria-label="Navigazione mobile principale"
    >
      <ul className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                aria-label={item.ariaLabel}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full min-h-[48px] py-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
                    isActive
                      ? 'text-accent-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
                    <span className="text-[11px] font-secondary tracking-tight">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
