import React, { useState } from 'react';
import { WishlistItem } from '../../store/services/wishlistService';
import { ShoppingCart, Trash2, Info, Edit3, Save, X } from 'lucide-react';

interface WishlistItemCardProps {
  item: WishlistItem;
  onRemove: (id: number) => void;
  onPurchase: (id: number) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  onViewInfo: (rawgId: number) => void;
}

const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  item,
  onRemove,
  onPurchase,
  onUpdateNotes,
  onViewInfo,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(item.notes || '');

  const handleSaveNotes = () => {
    onUpdateNotes(item.id, editedNotes);
    setIsEditingNotes(false);
  };

  const handleCancelEdit = () => {
    setEditedNotes(item.notes || '');
    setIsEditingNotes(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
  };

  return (
    <div className="bg-primary-bg border border-border-color rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Immagine di copertina */}
      <div className="aspect-video bg-gray-200 relative">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500 text-sm">Nessuna immagine</span>
          </div>
        )}
      </div>

      {/* Contenuto */}
      <div className="p-4">
        {/* Titolo e anno */}
        <div className="mb-2">
          <h3 className="font-bold text-lg text-text-primary line-clamp-2 mb-1">
            {item.title}
          </h3>
          <p className="text-text-secondary text-sm">
            {item.releaseYear} • {item.genres.slice(0, 2).join(', ')}
          </p>
        </div>

        {/* Metacritic score */}
        {item.metacritic > 0 && (
          <div className="mb-2">
            <span
              className={`inline-block px-2 py-1 rounded text-xs font-bold text-white ${
                item.metacritic >= 75
                  ? 'bg-green-500'
                  : item.metacritic >= 50
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            >
              {item.metacritic}
            </span>
          </div>
        )}

        {/* Data di aggiunta */}
        <p className="text-text-secondary text-xs mb-3">
          Aggiunto il {formatDate(item.addedDate)}
        </p>

        {/* Note personalizzate */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-primary">Note personali:</span>
            {!isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-cyan-500 hover:text-cyan-600 p-1"
              >
                <Edit3 size={14} />
              </button>
            )}
          </div>
          
          {isEditingNotes ? (
            <div className="space-y-2">
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Aggiungi note personali per questo gioco..."
                className="w-full p-2 border border-border-color rounded text-sm resize-none"
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-3 py-1 text-xs border border-border-color rounded hover:bg-secondary-bg"
                >
                  <X size={12} className="inline mr-1" />
                  Annulla
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-3 py-1 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600"
                >
                  <Save size={12} className="inline mr-1" />
                  Salva
                </button>
              </div>
            </div>
          ) : (
            <p className="text-text-secondary text-sm italic">
              {item.notes || 'Nessuna nota aggiunta'}
            </p>
          )}
        </div>

        {/* Azioni */}
        <div className="flex space-x-2">
          <button
            onClick={() => onPurchase(item.id)}
            className="flex-1 bg-cyan-500 text-white px-3 py-2 rounded text-sm font-medium hover:bg-cyan-600 transition-colors flex items-center justify-center"
          >
            <ShoppingCart size={16} className="mr-1" />
            Acquista
          </button>
          <button
            onClick={() => onViewInfo(item.rawgId)}
            className="px-3 py-2 border border-border-color rounded text-sm hover:bg-secondary-bg transition-colors flex items-center justify-center"
          >
            <Info size={16} />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="px-3 py-2 border border-red-300 text-red-600 rounded text-sm hover:bg-red-50 transition-colors flex items-center justify-center"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistItemCard;
