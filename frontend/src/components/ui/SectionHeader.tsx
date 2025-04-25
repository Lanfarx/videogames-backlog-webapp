import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  seeAllLink?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  seeAllLink 
}) => {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <div>
        <h2 className="text-2xl font-semibold text-[#222222] font-['Montserrat']">{title}</h2>
        {subtitle && (
          <p className="text-sm text-[#666666] mt-1 font-['Roboto']">{subtitle}</p>
        )}
      </div>
      
      {seeAllLink && (
        <Link 
          to={seeAllLink} 
          className="flex items-center text-sm font-medium text-[#FB7E00] hover:text-[#FB7E00]/80 font-['Roboto']"
        >
          Vedi tutti
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
