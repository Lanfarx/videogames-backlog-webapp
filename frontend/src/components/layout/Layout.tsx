import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-grow w-full px-6 py-6">
        <div className="w-full mx-auto max-w-[1440px]">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
