import React from 'react';
import { Gamepad2, Clock, Trophy } from 'lucide-react';
import { getGamesStats } from '../../utils/gamesData';

interface StatItemProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, icon }) => (
  <div className="flex flex-col items-center">
    <div className="text-accent-primary mb-2">
      {icon}
    </div>
    <div className="text-5xl font-bold text-accent-primary font-primary">
      {value}
    </div>
    <div className="text-sm text-text-secondary mt-1 font-secondary">
      {label}
    </div>
  </div>
);

interface HeroSectionProps {
  username: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ username }) => {
  const stats = getGamesStats();
  
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
            <StatItem 
              value={stats.total || 0} 
              label="Giochi in libreria" 
              icon={<Gamepad2 className="h-8 w-8" />} 
            />
          </div>
          <div className="flex justify-center">
            <StatItem 
              value={stats.totalHours || 0} 
              label="Ore giocate" 
              icon={<Clock className="h-8 w-8" />} 
            />
          </div>
          <div className="flex justify-center">
            <StatItem 
              value={stats.completed || 0} 
              label="Giochi completati" 
              icon={<Trophy className="h-8 w-8" />} 
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;