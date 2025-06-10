import React from 'react';
import { Gamepad2, Clock, Trophy, TrendingUp } from 'lucide-react';
import { useGamesStats } from '../../store/hooks/gamesHooks';
import StatsCard from '../ui/StatsCard';

interface HeroSectionProps {
  UserName: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ UserName }) => {
  const stats = useGamesStats();
  
  // Calcola statistiche aggiuntive
  const completionRate = stats.stats.total > 0 
    ? Math.round((stats.stats.completed / stats.stats.total) * 100) 
    : 0;
  
  const averageHoursPerGame = stats.stats.total > 0 
    ? Math.round(stats.stats.totalHours / stats.stats.total) 
    : 0;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-bg via-secondary-bg to-primary-bg">      {/* Elementi decorativi di sfondo */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Particelle animate */}
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-accent-primary/30 rounded-full animate-pulse shadow-lg shadow-accent-primary/20"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-accent-primary/40 rounded-full animate-ping shadow-lg shadow-accent-primary/20"></div>
        <div className="absolute bottom-1/4 left-1/2 w-2.5 h-2.5 bg-accent-primary/25 rounded-full animate-pulse delay-700 shadow-lg shadow-accent-primary/15"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-accent-primary/35 rounded-full animate-ping delay-1000"></div>        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-accent-primary/20 rounded-full animate-pulse delay-500"></div>
        
        {/* Gradienti radiali per profondità */}        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-accent-primary/8 via-accent-primary/4 to-transparent rounded-full"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-radial from-accent-primary/6 to-transparent rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-radial from-accent-primary/4 to-transparent rounded-full"></div>
      </div>
      
      <div className="relative container mx-auto px-6 sm:px-8 py-16 sm:py-20">        {/* Header con animazione di entrata */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-text-primary font-primary mb-6 leading-tight">
            Bentornato, <span className="text-accent-primary drop-shadow-lg">{UserName}</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-text-secondary font-secondary max-w-3xl mx-auto leading-relaxed">
            Esplora la tua <span className="text-accent-primary font-bold">collezione di giochi</span> e traccia i tuoi <span className="text-accent-primary/80 font-bold">progressi epici</span>
          </p>
        </div>        {/* Statistiche principali con StatsCard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <div className="group transform hover:scale-105 transition-all duration-300 animate-fade-in-up delay-100">
            <div className="bg-gradient-to-br from-primary-bg to-secondary-bg p-6 rounded-2xl border border-border-color shadow-lg hover:shadow-2xl hover:border-accent-primary/50 transition-all duration-300">              <StatsCard
                label="Giochi in libreria"
                value={stats.stats.total.toString()}
                icon={<Gamepad2 className="h-6 w-6 text-blue-500 drop-shadow-lg filter" />}
                variant="hero"
              />              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-text-secondary">
                <TrendingUp className="h-3 w-3" />
                <span>La tua collezione</span>
              </div>
            </div>
          </div>

          <div className="group transform hover:scale-105 transition-all duration-300 animate-fade-in-up delay-200">
            <div className="bg-gradient-to-br from-primary-bg to-secondary-bg p-6 rounded-2xl border border-border-color shadow-lg hover:shadow-2xl hover:border-accent-primary/50 transition-all duration-300">              <StatsCard
                label="Ore giocate"
                value={stats.stats.totalHours.toString()}
                icon={<Clock className="h-6 w-6 text-green-500 drop-shadow-lg filter" />}
                variant="hero"
              />
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-text-secondary">
                <span>~{averageHoursPerGame}h per gioco</span>
              </div>
            </div>
          </div>

          <div className="group transform hover:scale-105 transition-all duration-300 animate-fade-in-up delay-300">
            <div className="bg-gradient-to-br from-primary-bg to-secondary-bg p-6 rounded-2xl border border-border-color shadow-lg hover:shadow-2xl hover:border-accent-primary/50 transition-all duration-300">              <StatsCard
                label="Giochi completati"
                value={stats.stats.completed.toString()}
                icon={<Trophy className="h-6 w-6 text-yellow-500 drop-shadow-lg filter" />}
                variant="hero"
              />
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-text-secondary">
                <span>{completionRate}% completamento</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;