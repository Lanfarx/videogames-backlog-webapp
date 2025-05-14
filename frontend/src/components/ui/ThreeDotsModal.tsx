import React, { useRef, useEffect, useState } from 'react';
import { Edit, Trash2, MoreVertical, Clock } from 'lucide-react';
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
  onStatusChange?: (gameId: string, status: GameStatus) => void;
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
      className={`absolute z-50 w-48 bg-primary-bg border border-border-color rounded-lg shadow-lg ${getPositionClasses()}`}
    >
      <div className="absolute top-2 right-2 z-20">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setActiveActionMenu(activeActionMenu === game.id.toString() ? null : game.id.toString());
          }}
          className="p-1 rounded-full text-text-secondary hover:text-accent-primary transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {activeActionMenu === game.id.toString() && (
          <div className="absolute top-8 right-0 bg-white shadow-lg rounded-md p-2 z-30">
            <StatusChangePopover
              currentStatus={game.status}
              onStatusChange={(newStatus: GameStatus) => {
                onStatusChange?.(game.id.toString(), newStatus);
                setActiveActionMenu(null);
              }}
              onCancel={() => setActiveActionMenu(null)}
              hoursPlayed={game.hoursPlayed}
            />
            <PlaytimePopover
              onSave={(hoursToAdd: number) => {
                const updatedGame = { ...game, hoursPlayed: game.hoursPlayed + hoursToAdd };
                onEdit?.(updatedGame);
                setActiveActionMenu(null);
              }}
              onCancel={() => setActiveActionMenu(null)}
            />
          </div>
        )}
      </div>
      <ul className="py-1">
        <li>
          <button 
            onClick={handleEditClick}
            className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-accent-primary/10 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2 text-text-secondary" />
            Modifica gioco
          </button>
        </li>
        <li>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveActionMenu('statusChange');
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-accent-primary/10 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2 text-text-secondary" />
            Modifica stato
          </button>
          {activeActionMenu === 'statusChange' && (
            <StatusChangePopover
              currentStatus={game.status}
              onStatusChange={(newStatus) => {
                onStatusChange?.(game.id.toString(), newStatus);
                setActiveActionMenu(null);
              }}
              onCancel={() => setActiveActionMenu(null)}
              hoursPlayed={game.hoursPlayed}
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
            className="flex items-center w-full px-4 py-2 text-sm text-text-primary hover:bg-accent-primary/10 transition-colors"
          >
            <Clock className="h-4 w-4 mr-2 text-text-secondary" />
            Aggiungi ore
          </button>
          {activeActionMenu === 'addPlaytime' && (
            <PlaytimePopover
              onSave={(hoursToAdd) => {
                const updatedGame = { ...game, hoursPlayed: game.hoursPlayed + hoursToAdd };
                onStatusChange?.(game.id.toString(), updatedGame.status);
                setActiveActionMenu(null);
              }}
              onCancel={() => setActiveActionMenu(null)}
            />
          )}
        </li>
        <li className="border-t border-border-color">
          <button 
            onClick={handleDeleteClick}
            className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ThreeDotsModal;