import { useState } from 'react';
import { Plus, Minus, Save } from 'lucide-react';

interface PlaytimePopoverProps {
  onSave: (hoursToAdd: number) => void;
  onCancel: () => void;
}

const PlaytimePopover = ({ onSave, onCancel }: PlaytimePopoverProps) => {
  const [hoursToAdd, setHoursToAdd] = useState(1);
  
  const incrementHours = () => {
    setHoursToAdd(prev => prev + 1);
  };
  
  const decrementHours = () => {
    setHoursToAdd(prev => prev > 1 ? prev - 1 : 1);
  };

  const handleSave = () => {
    if (hoursToAdd > 0) {
      onSave(hoursToAdd);
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 p-4 bg-primaryBg border border-border-color rounded-lg shadow-md z-10 w-56">
      <div className="text-sm text-text-secondary mb-3 font-secondary">
        Aggiungi ore di gioco:
      </div>
      
      <div className="flex items-center justify-center space-x-3 mb-4">
        <button 
          className="p-1.5 rounded-full bg-secondaryBg hover:bg-tertiaryBg transition-colors"
          onClick={decrementHours}
          aria-label="Diminuisci ore"
        >
          <Minus className="w-4 h-4 text-text-secondary" />
        </button>
        
        <span className="font-secondary font-medium text-xl text-text-primary w-10 text-center">
          {hoursToAdd}
        </span>
        
        <button 
          className="p-1.5 rounded-full bg-secondaryBg hover:bg-tertiaryBg transition-colors"
          onClick={incrementHours}
          aria-label="Aumenta ore"
        >
          <Plus className="w-4 h-4 text-text-secondary" />
        </button>
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <button 
          className="text-sm text-text-secondary hover:text-text-primary font-secondary"
          onClick={onCancel}
        >
          Annulla
        </button>
        
        <button 
          className="flex items-center px-4 py-1.5 bg-accent-primary text-white rounded-md text-sm hover:bg-accent-primary/90 transition-colors font-secondary"
          onClick={handleSave}
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Salva
        </button>
      </div>
    </div>
  );
};

export default PlaytimePopover;
