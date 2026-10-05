import { Link } from 'react-router-dom';
import { Gamepad2, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import HeroMockupPreview from './HeroMockupPreview';
import { PLATFORM_BADGES } from '../landingData';

export default function LandingHero() {
  return (
    <section className="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold font-primary text-text-primary tracking-tight leading-[1.12] mb-6 [text-wrap:balance]">
              Organizza, traccia e conquista{' '}
              <span className="text-accent-primary">
                ogni videogioco
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-text-secondary font-secondary leading-relaxed mb-8 max-w-xl [text-wrap:pretty]">
              Dì addio a backlog dispersi e giochi dimenticati. Gestisci la tua collezione tra Steam, PlayStation, Xbox e Nintendo Switch, monitora le ore di gioco e conserva le tue recensioni.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <Link
                to="/register"
                className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-accent-primary text-white font-semibold text-base hover:brightness-110 shadow-lg shadow-accent-primary/25 hover:shadow-xl hover:shadow-accent-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all font-secondary min-h-[44px]"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Inizia Subito — È Gratis</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <a
                href="#funzionalita"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-secondary-bg text-text-primary font-semibold text-base border-2 border-border-color hover:border-accent-primary hover:text-accent-primary transition-colors duration-200 font-secondary min-h-[44px]"
              >
                Scopri come funziona
              </a>
            </div>

            {/* Micro value list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-border-color/60 w-full text-xs text-text-secondary font-secondary">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0" />
                <span>Oltre 800k Giochi RAWG</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0" />
                <span>Ore & Recensioni</span>
              </div>
              <div className="flex items-center space-x-2 col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-accent-success flex-shrink-0" />
                <span>100% Gratuito</span>
              </div>
            </div>

            {/* Supported platforms strip */}
            <div className="mt-8 pt-4 w-full">
              <span className="text-[11px] uppercase tracking-wider text-text-disabled font-semibold block mb-2 font-secondary">
                Supporto Piattaforme Principali
              </span>
              <div className="flex flex-wrap gap-2">
                {PLATFORM_BADGES.map((plat) => (
                  <span
                    key={plat.name}
                    className="text-xs px-2.5 py-1 rounded-lg bg-secondary-bg/80 border border-border-color text-text-secondary font-medium font-secondary flex items-center space-x-1.5"
                  >
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: plat.color }}
                    />
                    <span>{plat.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Backlog Centerpiece */}
          <div className="lg:col-span-6 w-full">
            <HeroMockupPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
