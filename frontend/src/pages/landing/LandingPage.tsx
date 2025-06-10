import React from 'react';
import { Link } from 'react-router-dom';
import LandingLayout from '../../components/layout/LandingLayout';

const LandingPage: React.FC = () => {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto py-8">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-secondary-bg dark:bg-secondary-bg backdrop-blur-sm rounded-full text-text-secondary dark:text-text-secondary text-sm font-medium mb-8 border border-border-color dark:border-border-color font-secondary">
            <span className="w-2 h-2 bg-accent-success rounded-full mr-2 animate-pulse"></span>
            La tua libreria di giochi, organizzata
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-primary font-bold text-text-primary dark:text-text-primary mb-8 leading-tight py-2">
            Organizza la tua
            <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent block py-1">
              passione per i videogiochi
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-text-secondary dark:text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed font-secondary">
            Tieni traccia dei tuoi giochi, scopri nuovi titoli, condividi recensioni e connettiti con altri amici gamer appassionati come te.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/register"
              className="bg-accent-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-accent-primary/90 transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto font-secondary"
            >
              🎮 Inizia Gratis
            </Link>
            <Link
              to="/login"
              className="bg-secondary-bg dark:bg-secondary-bg text-text-primary dark:text-text-primary px-8 py-4 rounded-xl font-semibold text-lg hover:bg-tertiary-bg dark:hover:bg-tertiary-bg transition-all duration-300 border border-border-color dark:border-border-color hover:border-accent-primary dark:hover:border-accent-primary w-full sm:w-auto font-secondary"
            >
              Accedi al tuo account
            </Link>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            <div className="bg-secondary-bg dark:bg-secondary-bg rounded-xl p-6 border border-border-color dark:border-border-color hover:bg-tertiary-bg dark:hover:bg-tertiary-bg hover:border-accent-primary dark:hover:border-accent-primary transition-all duration-300 group">
              <div className="w-12 h-12 bg-accent-primary rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary mb-2 font-primary">📚 Organizza la tua libreria</h3>
              <p className="text-text-secondary dark:text-text-secondary text-sm font-secondary">Tieni traccia di tutti i tuoi giochi, da quelli da iniziare a quelli platinati!.</p>
            </div>

            <div className="bg-secondary-bg dark:bg-secondary-bg rounded-xl p-6 border border-border-color dark:border-border-color hover:bg-tertiary-bg dark:hover:bg-tertiary-bg hover:border-accent-primary dark:hover:border-accent-primary transition-all duration-300 group">
              <div className="w-12 h-12 bg-accent-secondary rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary mb-2 font-primary">⭐ Scrivi recensioni</h3>
              <p className="text-text-secondary dark:text-text-secondary text-sm font-secondary">Condividi le tue opinioni sui giochi e leggi quelle della community.</p>
            </div>

            <div className="bg-secondary-bg dark:bg-secondary-bg rounded-xl p-6 border border-border-color dark:border-border-color hover:bg-tertiary-bg dark:hover:bg-tertiary-bg hover:border-accent-primary dark:hover:border-accent-primary transition-all duration-300 group">
              <div className="w-12 h-12 bg-accent-success rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary mb-2 font-primary">👥 Connettiti con amici</h3>
              <p className="text-text-secondary dark:text-text-secondary text-sm font-secondary">Scopri cosa stanno giocando i tuoi amici e condividi i tuoi progressi.</p>
            </div>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
};

export default LandingPage;
