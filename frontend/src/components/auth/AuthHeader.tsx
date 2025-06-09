import React from 'react';
import { Link } from 'react-router-dom';
import AppLogo from '../ui/atoms/AppLogo';

const AuthHeader: React.FC = () => (
  <header className="h-20 flex flex-col items-center justify-center bg-white shadow-sm border-b border-b-gray-100 relative">
    <Link 
      to="/landing" 
      className="absolute left-6 top-1/2 transform -translate-y-1/2 text-accent-primary hover:text-accent-primary/80 transition-colors text-sm font-medium"
    >
      ← Torna alla home
    </Link>
    <div className="flex flex-col items-center mt-6">
      <AppLogo className="h-8 w-auto mb-1" asLink={false} />
      <span className="text-xs text-gray-500 font-roboto mt-1 mb-4">Organizza la tua libreria di giochi</span>
    </div>
  </header>
);

export default AuthHeader;
