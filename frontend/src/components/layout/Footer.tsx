import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="h-16 bg-[#F8F8F8] border-t border-[#E0E0E0]">
      <div className="container mx-auto px-6 h-full flex items-center justify-between max-w-[1440px]">
        <div className="flex items-center space-x-4">
          <Link to="/privacy" className="text-sm text-[#666666] hover:text-[#FB7E00] font-['Roboto']">
            Privacy
          </Link>
          <Link to="/terms" className="text-sm text-[#666666] hover:text-[#FB7E00] font-['Roboto']">
            Termini di servizio
          </Link>
          <Link to="/contact" className="text-sm text-[#666666] hover:text-[#FB7E00] font-['Roboto']">
            Contatti
          </Link>
        </div>
        
        <div className="text-center">
          <p className="text-xs text-[#999999] font-['Roboto']">
            © {new Date().getFullYear()} GameBacklog. Tutti i diritti riservati.
          </p>
        </div>
        
        <div className="text-xs text-[#999999] font-['Roboto']">
          Versione 0.1.0
        </div>
      </div>
    </footer>
  );
};

export default Footer;
