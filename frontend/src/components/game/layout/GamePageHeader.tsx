import React from 'react';
import BreadcrumbNav from './BreadcrumbNav';
import BackButton from './BackButton';
import { Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface GamePageHeaderProps {
  title: string;
  onBackClick: () => void;
}

const GamePageHeader: React.FC<GamePageHeaderProps> = ({ title, onBackClick }) => {
  return (
    <header className="h-16 border-b border-border-color flex items-center px-6">
      <div className="flex-1 flex items-center">
        <BreadcrumbNav title={title} />
      </div>
      <div className="flex items-center space-x-2">
      <NavLink to="/settings">
            {({ isActive }) => (
              <Settings className={`h-6 w-6 ${isActive ? 'text-accent-primary' : 'text-text-secondary hover:text-accent-primary'} cursor-pointer`} />
            )}
          </NavLink>
        <BackButton onClick={onBackClick} />
      </div>
    </header>
  );
};

export default GamePageHeader;
