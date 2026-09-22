import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, Gamepad2 } from 'lucide-react';
import AppLogo from '../ui/atoms/AppLogo';
import { useTheme } from '../../contexts/theme-context';

interface LandingHeaderProps {
  className?: string;
}

export default function LandingHeader({ className = '' }: LandingHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md bg-primary-bg/85 border-b border-border-color/70 transition-colors duration-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <AppLogo className="text-2xl font-extrabold" asLink={false} />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 font-secondary text-sm font-medium">
          <a
            href="#funzionalita"
            className="text-text-secondary hover:text-accent-primary transition-colors duration-200"
          >
            Funzionalità
          </a>
          <a
            href="#come-funziona"
            className="text-text-secondary hover:text-accent-primary transition-colors duration-200"
          >
            Come funziona
          </a>
        </nav>

        {/* Right action items */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Cambia tema chiaro o scuro"
            className="p-2 rounded-xl text-text-secondary hover:text-accent-primary hover:border-accent-primary/60 transition-all duration-200 border border-border-color/60 focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-accent-secondary" />
            ) : (
              <Moon className="w-5 h-5 text-accent-primary" />
            )}
          </button>

          {/* Login Button */}
          <Link
            to="/login"
            className="hidden sm:inline-flex text-sm font-semibold text-text-primary hover:text-accent-primary px-3.5 py-2 transition-colors font-secondary"
          >
            Accedi
          </Link>

          {/* Register / CTA Button */}
          <Link
            to="/register"
            className="inline-flex items-center space-x-1.5 bg-accent-primary text-white text-sm font-semibold px-4 py-2 rounded-xl hover:brightness-110 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all font-secondary"
          >
            <Gamepad2 className="w-4 h-4" />
            <span>Registrati</span>
          </Link>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-text-secondary hover:text-text-primary border border-border-color/60"
            aria-label="Apri menu mobile"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-color bg-secondary-bg/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-3 font-secondary text-sm">
          <a
            href="#funzionalita"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-tertiary-bg"
          >
            Funzionalità
          </a>
          <a
            href="#come-funziona"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-text-secondary hover:text-accent-primary hover:bg-tertiary-bg"
          >
            Come funziona
          </a>
          <div className="pt-2 border-t border-border-color flex flex-col space-y-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-center px-4 py-2.5 rounded-xl border border-border-color text-text-primary hover:text-accent-primary hover:border-accent-primary font-semibold"
            >
              Accedi
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}


