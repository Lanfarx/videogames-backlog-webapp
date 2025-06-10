import React from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../ui/atoms/AppLogo';

interface LandingHeaderProps {
  className?: string;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ className = "" }) => {
  return (
    <>
      <header className={`h-16 bg-primary-bg shadow-sm flex items-center justify-between px-6 flex-shrink-0 relative z-10 ${className}`}>
        <div className="flex items-center space-x-2">
          <AppLogo className="h-8 w-auto text-accent-primary" asLink={false} />
        </div>
        <div className="flex space-x-4">
          <Link
            to="/login"
            className="text-text-secondary hover:text-accent-primary transition-colors px-4 py-2 rounded-lg hover:bg-secondary-bg font-secondary"
          >
            Accedi
          </Link>
          <Link
            to="/register"
            className="bg-accent-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-accent-primary/90 transition-all duration-300 transform hover:scale-105 shadow-lg font-secondary"
          >
            Registrati
          </Link>
        </div>
      </header>
      {/* Linea di separazione subito sotto l'header */}
      <div className="w-full h-px bg-border-color relative z-10" />
    </>
  );
};

export default LandingHeader;
