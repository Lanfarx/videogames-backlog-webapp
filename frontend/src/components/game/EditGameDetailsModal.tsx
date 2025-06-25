import React, { useState } from 'react';
import { Game } from '../../types/game';
import { useGameActions } from '../../store/hooks/gamesHooks';

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
  const { update: updateGame } = useGameActions();
  const [formData, setFormData] = useState({
    title: game.Title,
    Developer: game.Developer,
    Publisher: game.Publisher,
    ReleaseYear: game.ReleaseYear,
    Genres: game.Genres.join(', '), // Convertiamo l'array in una stringa per il form
    CoverImage: game.CoverImage,
    Metacritic: game.Metacritic 
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertiamo la stringa delle Genres di nuovo in un array
    const updatedGame: Partial<Game> = {
      Title: formData.title,
      Developer: formData.Developer,
      Publisher: formData.Publisher,
      ReleaseYear: Number(formData.ReleaseYear),
      Genres: formData.Genres.split(',').map(genre => genre.trim()).filter(Boolean),
      CoverImage: formData.CoverImage,
      Metacritic: Number(formData.Metacritic) || 0
    };
    
    // Aggiorna il gioco usando il nuovo pattern unificato
    updateGame(game.id, updatedGame);
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
          
          <form onSubmit={handleSubmit}>            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-text-secondary font-secondary text-sm">
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
                <label htmlFor="Developer" className="block text-text-secondary font-secondary text-sm">
                  Sviluppatore
                </label>
                <input
                  type="text"
                  id="Developer"
                  name="Developer"
                  value={formData.Developer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="Publisher" className="block text-text-secondary font-secondary text-sm">
                  Editore
                </label>
                <input
                  type="text"
                  id="Publisher"
                  name="Publisher"
                  value={formData.Publisher}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>            
                <div className="space-y-2">
                <label htmlFor="Metacritic" className="block text-text-secondary font-secondary text-sm">
                  Metacritic
                </label>
                <input
                  type="number"
                  id="Metacritic"
                  name="Metacritic"
                  value={formData.Metacritic}
                  onChange={(e) => {
                    const value = e.target.value;
                    let numericValue = Number.parseInt(value) || 0;
                    
                    // Limita il valore tra 0 e 100
                    if (numericValue < 0) numericValue = 0;
                    if (numericValue > 100) numericValue = 100;
                    
                    setFormData(prev => ({
                      ...prev,
                      Metacritic: numericValue
                    }));
                  }}
                  onInput={(e) => {
                    // Previene l'inserimento diretto di valori > 100
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    if (value && Number.parseInt(value) > 100) {
                      target.value = "100";
                    }
                  }}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>              <div className="space-y-2">
                <label htmlFor="ReleaseYear" className="block text-text-secondary font-secondary text-sm">
                  Anno di rilascio
                </label>
                <input
                  type="number"
                  id="ReleaseYear"
                  name="ReleaseYear"
                  value={formData.ReleaseYear}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="Genres" className="block text-text-secondary font-secondary text-sm">
                  Generi (separati da virgola)
                </label>
                <input
                  type="text"
                  id="Genres"
                  name="Genres"
                  value={formData.Genres}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder="Azione, Avventura, RPG, ..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="CoverImage" className="block text-text-secondary font-secondary text-sm">
                  URL immagine di copertina
                </label>
                <input
                  type="url"
                  id="CoverImage"
                  name="CoverImage"
                  value={formData.CoverImage}
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