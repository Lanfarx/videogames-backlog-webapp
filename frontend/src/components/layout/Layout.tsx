import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-secondaryBg">
      <Header />
      <main className="flex-grow w-full">
        <div className="w-full mx-auto ">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
  