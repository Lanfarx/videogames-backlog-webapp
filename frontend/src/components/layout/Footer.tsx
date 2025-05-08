import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="h-16 bg-secondaryBg border-t border-border-color">
      <div className="container mx-auto px-6 h-full flex items-center justify-between max-w-[1440px]">
        <div className="flex items-center space-x-4">
          <Link to="/privacy" className="text-sm text-text-secondary hover:text-accent-primary font-['Roboto']">
            Privacy
          </Link>
          <Link to="/terms" className="text-sm text-text-secondary hover:text-accent-primary font-['Roboto']">
            Termini di servizio
          </Link>
          <Link to="/contact" className="text-sm text-text-secondary hover:text-accent-primary font-['Roboto']">
            Contatti
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-text-disabled font-['Roboto']">
            © {new Date().getFullYear()} GameBacklog. Tutti i diritti riservati.
          </p>
        </div>
        
        <div className="text-xs text-text-disabled font-['Roboto']">
          Versione 0.4.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
