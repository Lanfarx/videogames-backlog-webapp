import React, { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import { useLoadGames } from "../../store/hooks/gamesHooks";

interface LayoutProps {
  children?: ReactNode; // Rendiamo children opzionale
}

export default function Layout({ children }: LayoutProps) {
  // Carica i giochi all'avvio dell'applicazione per ottimizzare le performance
  // Questo si attiva solo quando l'utente è loggato ed ha accesso al layout protetto
  useLoadGames();

  return (
    <div className="flex flex-col min-h-screen bg-secondary-bg">
      <Header />
      <main className="flex-grow w-full pb-16 md:pb-0">
        <div className="w-full mx-auto">
          {/* Mostra children se forniti, altrimenti usa Outlet per le route nidificate */}
          {children || <Outlet />}
        </div>
      </main>
      <Footer />
      {/* Navigazione mobile inferiore ad altezza pollice */}
      <MobileBottomNav />
    </div>
  );
}
