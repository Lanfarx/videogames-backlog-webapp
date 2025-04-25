import React from 'react';
import { Gamepad2, Trophy, Clock } from 'lucide-react';
import { getGamesStats } from '../../hooks/gamesData';

interface StatItemProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, icon }) => (
  <div className="flex items-center">
    <div className="text-[#FB7E00] mr-2">{icon}</div>
    <div>
      <div className="text-3xl font-bold text-[#FB7E00] font-['Montserrat']">{value}</div>
      <div className="text-sm text-[#666666] font-['Roboto']">{label}</div>
    </div>
  </div>
);

interface HeroSectionProps {
  username: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ username }) => {
  const stats = getGamesStats();
  
  return (
    <section className="bg-gradient-to-b from-[#D1DFD2]/10 to-white rounded-lg p-8 mb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#222222] font-['Montserrat']">
          Bentornato, {username}
        </h1>
        <p className="text-base text-[#666666] mt-2 font-['Roboto']">
          Ecco cosa sta succedendo nella tua libreria
        </p>
      </div>
      
      <div className="flex justify-between divide-x divide-[#E0E0E0]">
        <div className="flex-1 flex justify-center">
          <StatItem 
            value={stats.inProgress} 
            label="Giochi in corso" 
            icon={<Gamepad2 className="h-6 w-6" />} 
          />
        </div>
        <div className="flex-1 flex justify-center">
          <StatItem 
            value={stats.completed} 
            label="Giochi completati" 
            icon={<Trophy className="h-6 w-6" />} 
          />
        </div>
        <div className="flex-1 flex justify-center">
          <StatItem 
            value={stats.totalHours} 
            label="Ore totali" 
            icon={<Clock className="h-6 w-6" />} 
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
