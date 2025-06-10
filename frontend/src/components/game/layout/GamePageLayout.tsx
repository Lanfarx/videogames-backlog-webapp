import React, { ReactNode } from 'react';
import Footer from '../../layout/Footer';
import GamePageHeader from './GamePageHeader';

interface GamePageLayoutProps {
  children: ReactNode;
  title: string;
  parentPath?: string;
  parentLabel?: string;
}

const GamePageLayout: React.FC<GamePageLayoutProps> = ({ 
  children, 
  title, 
  parentPath = '/library',
  parentLabel = 'Libreria'
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-primary-bg">
      <GamePageHeader 
        title={title} 
        parentPath={parentPath}
        parentLabel={parentLabel}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default GamePageLayout;
