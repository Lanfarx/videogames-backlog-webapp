import React from 'react';
import LandingHeader from './LandingHeader';
import Footer from './Footer';

interface LandingLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

export default function LandingLayout({ 
  children, 
  showBackground = true 
}: LandingLayoutProps) {
  return (
    <div className="min-h-[100dvh] bg-primary-bg relative flex flex-col selection:bg-accent-primary/20 selection:text-accent-primary">
      {/* Background ambient lighting and grid pattern */}
      {showBackground && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 landing-grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_15%,#000_70%,transparent_100%)]"></div>
          
          {/* Ambient soft glow behind hero */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-accent-primary/10 dark:bg-accent-primary/15 rounded-full blur-[120px] pointer-events-none"></div>
          
          {/* Secondary ambient highlight */}
          <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-accent-secondary/5 dark:bg-accent-secondary/10 rounded-full blur-[140px] pointer-events-none"></div>
        </div>
      )}

      {/* Sticky Header */}
      <LandingHeader />

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
