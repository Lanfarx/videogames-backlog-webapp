import React from 'react';
import LandingHeader from './LandingHeader';
import Footer from './Footer';

interface LandingLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ 
  children, 
  showBackground = true 
}) => {
  return (
    <div className="min-h-screen bg-primary-bg dark:bg-primary-bg relative flex flex-col">
      {/* Background elements with accent colors */}
      {showBackground && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-primary-bg via-secondary-bg to-tertiary-bg dark:from-primary-bg dark:via-secondary-bg dark:to-tertiary-bg"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-accent-primary/10 dark:bg-accent-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-secondary/10 dark:bg-accent-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent-primary/5 dark:bg-accent-primary/10 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
        </>
      )}

      {/* Header */}
      <LandingHeader />

      {/* Main content */}
      <main className="relative z-10 flex-1">
        {children}
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default LandingLayout;
