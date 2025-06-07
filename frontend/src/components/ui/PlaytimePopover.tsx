import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Save } from 'lucide-react';
import { useGamePlaytimeActions } from '../../store/hooks/gamesHooks';

interface PlaytimePopoverProps {
  GameId: number;
  currentHours: number;
  onSave?: (hoursToAdd: number) => void;
  onCancel: () => void;
}

const PlaytimePopover = ({ GameId, currentHours, onSave, onCancel }: PlaytimePopoverProps) => {
  const [hoursToAdd, setHoursToAdd] = useState(1);
  const { updatePlaytime } = useGamePlaytimeActions();
  
  // Ref per il popover
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Effetto per gestire i clic fuori dal popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    // Aggiungi l'event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Pulisci l'event listener quando il componente viene smontato
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);
  
  const incrementHours = () => {
    setHoursToAdd(prev => prev + 1);
  };
  const decrementHours = () => {
    // Non permettiamo valori negativi, il minimo è 1
    setHoursToAdd(prev => prev > 1 ? prev - 1 : 1);
  };  const handleSave = () => {
    // Assicuriamoci che hoursToAdd sia sempre maggiore di zero
    if (hoursToAdd > 0) {
      const newTotal = currentHours + hoursToAdd;
      
      // Aggiorna lo stato nel Redux store usando il nuovo metodo
      // Il backend creerà automaticamente l'attività appropriata
      updatePlaytime(GameId, newTotal);
      
      if (onSave) onSave(hoursToAdd);
      onCancel();
    }
  };

  return (
    <div 
      ref={popoverRef}
      className="absolute top-full right-0 mt-2 p-4 bg-primary-bg border border-border-color rounded-lg shadow-md z-10 w-56"    >      <div className="text-sm text-text-secondary mb-3 font-secondary">
        Aggiungi ore di gioco:
      </div>
      
      <div className="flex items-center justify-center space-x-3 mb-4">
        <button 
          className="p-1.5 rounded-full bg-secondary-bg hover:bg-tertiary-bg transition-colors"
          onClick={decrementHours}
          aria-label="Diminuisci ore"
        >
          <Minus className="w-4 h-4 text-text-secondary" />
        </button>
        
        <span className="font-secondary font-medium text-xl text-text-primary w-10 text-center">
          {hoursToAdd}
        </span>
        
        <button 
          className="p-1.5 rounded-full bg-secondary-bg hover:bg-tertiary-bg transition-colors"
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
