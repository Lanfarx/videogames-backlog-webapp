import React from 'react';
import BreadcrumbNav from './BreadcrumbNav';
import BackButton from './BackButton';

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
      <BackButton onClick={onBackClick} />
    </header>
  );
};

export default GamePageHeader;
