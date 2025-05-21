import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children?: ReactNode; // Rendiamo children opzionale
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-secondaryBg">
      <Header />
      <main className="flex-grow w-full">
        <div className="w-full mx-auto ">
          {/* Mostra children se forniti, altrimenti usa Outlet per le route nidificate */}
          {children || <Outlet />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
