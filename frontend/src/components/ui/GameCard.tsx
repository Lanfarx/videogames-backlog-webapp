import React from 'react';
import { Clock } from 'lucide-react';

interface GameCardProps {
  title: string;
  coverImage: string;
  platform: string;
  hoursPlayed: number;
  progress: number;
}

const GameCard: React.FC<GameCardProps> = ({ 
  title, 
  coverImage, 
  platform, 
  hoursPlayed, 
  progress 
}) => {
  return (
    <div className="w-[280px] h-[180px] bg-white border border-[#E0E0E0] rounded-lg shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#FB7E00] transition-all">
      <div 
        className="h-[140px] w-full bg-cover bg-center rounded-t-lg relative"
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-[#FFCC3F] bg-opacity-20 rounded-t-lg"></div>
      </div>
      
      <div className="p-4">
        <h3 className="text-base font-semibold text-[#222222] truncate font-['Montserrat']">{title}</h3>
        
        <div className="flex items-center mt-1 text-xs text-[#666666] font-['Roboto']">
          <span>{platform}</span>
          <span className="mx-2">|</span>
          <Clock className="h-3 w-3 mr-1" />
          <span>{hoursPlayed} ore</span>
        </div>
        
        <div className="mt-2 mb-2 h-1 w-full bg-[#E0E0E0] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#FB7E00] rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        <button className="text-sm font-medium text-[#FB7E00] hover:text-[#FB7E00]/80 font-['Roboto']">
          Riprendi
        </button>
      </div>
    </div>
  );
};

export default GameCard;
