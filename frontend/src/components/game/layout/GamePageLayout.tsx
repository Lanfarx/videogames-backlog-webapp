import React, { ReactNode } from 'react';
import Footer from '../../layout/Footer';
import GamePageHeader from './GamePageHeader';

interface GamePageLayoutProps {
  children: ReactNode;
  title: string;
  onBackClick: () => void;
}

const GamePageLayout: React.FC<GamePageLayoutProps> = ({ 
  children, 
  title, 
  onBackClick 
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-primaryBg">
      <GamePageHeader title={title} onBackClick={onBackClick} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default GamePageLayout;
