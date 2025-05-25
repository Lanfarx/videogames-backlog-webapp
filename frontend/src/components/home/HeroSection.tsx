import React from 'react';
import { Gamepad2, Clock, Trophy } from 'lucide-react';
import { useGamesStats } from '../../store/hooks/gamesHooks';
import StatsCard from '../ui/StatsCard';

interface HeroSectionProps {
  username: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ username }) => {
  const stats = useGamesStats();
  
  return (
    <section className="bg-gradient-to-b from-secondaryBg to-primaryBg">
      <div className="container mx-auto px-8 py-14">
        <h1 className="text-4xl font-bold text-text-primary font-primary mb-3">
          Bentornato, {username}
        </h1>
        <p className="text-base text-text-secondary font-secondary mb-10">
          Ecco cosa sta succedendo nella tua libreria
        </p>
      
        <div className="grid grid-cols-3 gap-12 py-4">
          <div className="flex justify-center">
            <StatsCard 
              label="Giochi in libreria" 
              value={stats.total.toString()} 
              icon={<Gamepad2 className="h-8 w-8 text-accent-primary" />} 
              variant="hero"
            />
          </div>
          <div className="flex justify-center border-x border-border-color px-8">
            <StatsCard 
              label="Ore giocate" 
              value={stats.totalHours.toString()} 
              icon={<Clock className="h-8 w-8 text-accent-primary" />} 
              variant="hero"
            />
          </div>
          <div className="flex justify-center">
            <StatsCard 
              label="Giochi completati" 
              value={stats.completed.toString()} 
              icon={<Trophy className="h-8 w-8 text-accent-primary" />} 
              variant="hero"
            />  
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;