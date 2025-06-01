import React, { useRef, useEffect, useState } from 'react';
import { Edit, Trash2, MoreVertical, Clock, Settings } from 'lucide-react'; // Aggiunto Settings per "Modifica stato"
import type { Game, GameStatus } from '../../types/game';
import StatusChangePopover from '../ui/StatusChangePopover';
import PlaytimePopover from '../ui/PlaytimePopover';

interface ThreeDotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
  position?: 'top-right' | 'right' | 'bottom-right' | 'bottom-left' | 'left' | 'top-left';
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;
  onStatusChange?: (gameId: string, Status: GameStatus) => void;
}

const ThreeDotsModal: React.FC<ThreeDotsModalProps> = ({ 
  isOpen, 
  onClose, 
  game, 
  position = 'top-right',
  onEdit,
  onDelete,
  onStatusChange
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);

  // Gestisce click fuori dal modale per chiuderlo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null); // Resetta il contesto della sezione attiva
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Determina la posizione del modale
  const getPositionClasses = () => {
    switch (position) {
      case 'right':
        return 'right-0 top-1/2 -translate-y-1/2';
      case 'bottom-right':
        return 'right-0 bottom-0';
      case 'bottom-left':
        return 'left-0 bottom-0';
      case 'left':
        return 'left-0 top-1/2 -translate-y-1/2';
      case 'top-left':
        return 'left-0 top-0';
      case 'top-right':
      default:
        return 'right-0 top-0';
    }
  };

  if (!isOpen) return null;

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(game);
    onClose();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(String(game.id));
    onClose();
  };

  return (
    <div
      ref={modalRef}
      className={`absolute z-50 w-56 bg-primary-bg border border-border-color rounded-lg shadow-lg ${getPositionClasses()}`}
    >
      <ul className="py-2">
        <li>
          <button
            onClick={handleEditClick}
            className="flex items-center w-full px-4 py-3 text-sm text-text-primary hover:bg-accent-primary/10 hover:text-accent-primary transition-colors rounded-t-lg"
          >
            <Edit className="h-5 w-5 mr-3 text-blue-500" /> {/* Icona blu per "Modifica gioco" */}
            Modifica gioco
          </button>
        </li>
        <li>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveActionMenu('StatusChange');
            }}
            className="flex items-center w-full px-4 py-3 text-sm text-text-primary hover:bg-accent-primary/10 hover:text-accent-primary transition-colors"
          >
            <Settings className="h-5 w-5 mr-3 text-green-500" /> {/* Icona verde per "Modifica stato" */}
            Modifica stato
          </button>
          {activeActionMenu === 'StatusChange' && (
            <StatusChangePopover
              gameId={game.id}
              currentStatus={game.Status}
              onStatusChange={(newStatus) => {
                onStatusChange?.(game.id.toString(), newStatus);
                setActiveActionMenu(null);
              }}
              onCancel={() => setActiveActionMenu(null)}
              HoursPlayed={game.HoursPlayed}
            />
          )}
        </li>
        <li>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveActionMenu('addPlaytime');
            }}
            className="flex items-center w-full px-4 py-3 text-sm text-text-primary hover:bg-accent-primary/10 hover:text-accent-primary transition-colors"
          >
            <Clock className="h-5 w-5 mr-3 text-text-secondary" />
            Aggiungi ore
          </button>
          {activeActionMenu === 'addPlaytime' && (
            <PlaytimePopover
              gameId={game.id}
              currentHours={game.HoursPlayed}
              onSave={() => setActiveActionMenu(null)}
              onCancel={() => setActiveActionMenu(null)}
            />
          )}
        </li>
        <li className="border-t border-border-color">
          <button
            onClick={handleDeleteClick}
            className="flex items-center w-full px-4 py-3 text-sm text-accent-danger hover:bg-accent-danger/10 hover:text-accent-danger transition-colors rounded-b-lg"
          >
            <Trash2 className="h-5 w-5 mr-3" />
            Elimina
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ThreeDotsModal;