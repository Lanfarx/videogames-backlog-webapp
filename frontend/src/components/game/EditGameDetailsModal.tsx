import React, { useState } from 'react';
import { Game } from '../../types/game';
import { useAppDispatch } from '../../store/hooks';
import { updateGame } from '../../store/slice/gamesSlice';

interface EditGameDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedGame: Partial<Game>) => void; // Opzionale per backward compatibility
  game: Game;
}

const EditGameDetailsModal = ({
  isOpen,
  onClose,
  onSave,
  game
}: EditGameDetailsModalProps) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: game.title,
    developer: game.developer,
    publisher: game.publisher,
    releaseYear: game.releaseYear,
    genres: game.genres.join(', '), // Convertiamo l'array in una stringa per il form
    coverImage: game.coverImage,
    metacritic: game.metacritic 
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertiamo la stringa delle genres di nuovo in un array
    const updatedGame: Partial<Game> = {
      ...formData,
      releaseYear: Number(formData.releaseYear),
      genres: formData.genres.split(',').map(genre => genre.trim()).filter(Boolean),
      metacritic: Number(formData.metacritic) || 0
    };
    
    // Aggiorna il gioco attraverso Redux usando updateGame
    const completeUpdatedGame = {
      ...game,
      ...updatedGame
    };
    
    dispatch(updateGame(completeUpdatedGame));
    
    // Chiama la callback opzionale per backward compatibility
    if (onSave) {
      onSave(updatedGame);
    }
    
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-bg rounded-lg shadow-lg z-50 w-full max-w-xl">
        <div className="p-6">
          <h3 className="text-lg font-primary font-bold text-text-primary mb-4">Modifica dettagli gioco</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-text-primary font-secondary text-sm">
                  Titolo
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="developer" className="block text-text-primary font-secondary text-sm">
                  Sviluppatore
                </label>
                <input
                  type="text"
                  id="developer"
                  name="developer"
                  value={formData.developer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="publisher" className="block text-text-primary font-secondary text-sm">
                  Editore
                </label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="metacritic" className="block text-text-primary font-secondary text-sm">
                  Metacritic
                </label>
                <input
                  type="number"
                  id="metacritic"
                  name="metacritic"
                  value={formData.metacritic}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="releaseYear" className="block text-text-primary font-secondary text-sm">
                  Anno di rilascio
                </label>
                <input
                  type="number"
                  id="releaseYear"
                  name="releaseYear"
                  value={formData.releaseYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="genres" className="block text-text-primary font-secondary text-sm">
                  Generi (separati da virgola)
                </label>
                <input
                  type="text"
                  id="genres"
                  name="genres"
                  value={formData.genres}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder="Azione, Avventura, RPG, ..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="coverImage" className="block text-text-primary font-secondary text-sm">
                  URL immagine di copertina
                </label>
                <input
                  type="url"
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-border-color rounded-lg text-text-primary hover:bg-secondary-bg transition-colors font-secondary"
                onClick={onClose}
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white rounded-lg bg-accent-primary hover:bg-accent-primary/90 transition-colors font-secondary"
              >
                Salva modifiche
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditGameDetailsModal;