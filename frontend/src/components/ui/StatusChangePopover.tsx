import React, { useRef, useEffect } from 'react';
import { GameStatus } from '../../types/game';
import { Status_OPTIONS } from '../../constants/gameConstants';

interface StatusChangePopoverProps {
  GameId: number; // aggiunto id gioco
  currentStatus: GameStatus;
  onStatusChange?: (newStatus: GameStatus) => void;
  onCancel: () => void;
  HoursPlayed: number; // Aggiungiamo le ore di gioco come prop
}

const StatusChangePopover: React.FC<StatusChangePopoverProps> = ({ 
  GameId,
  currentStatus, 
  onStatusChange, 
  onCancel,
  HoursPlayed 
}) => {
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
  const handleStatusChange = (Status: GameStatus) => {
    if (onStatusChange) onStatusChange(Status);
    onCancel();
  };

  return (
    <div 
      ref={popoverRef}
      className="absolute z-10 top-full right-0 mt-2 w-56 rounded-md shadow-lg bg-primaryBg border border-border-color"
    >
      <div className="rounded-md shadow-xs py-1">
        <div className="px-3 py-2 border-b border-border-color">
          <h3 className="text-sm font-medium text-text-primary">Cambia stato</h3>
        </div>
        <div className="py-1">
          {Status_OPTIONS.map((option) => {
            const Status = option.value;
            
            // Filtro degli stati non selezionabili secondo le regole di business:
            
            // Regola 1: Non mostrare "Da iniziare" se ci sono ore di gioco
            if (Status === 'NotStarted' && HoursPlayed > 0) {
              return null;
            }
            
            // Regola 2: Mostra "In corso" solo se il gioco ha già ore di gioco
            if (Status === 'InProgress' && HoursPlayed === 0) {
              return null;
            }
            
            return (
              <button
                key={Status}
                onClick={() => handleStatusChange(Status)}
                className={`w-full text-left px-4 py-2 text-sm leading-5 flex items-center ${
                  Status === currentStatus ? 'bg-secondaryBg' : 'hover:bg-secondaryBg'
                }`}
              >
                <span 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: option.color }} 
                />
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="border-t border-border-color px-3 py-2">
          <button
            onClick={onCancel}
            className="w-full text-sm text-accent-primary hover:text-accent-primary/80"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusChangePopover;
