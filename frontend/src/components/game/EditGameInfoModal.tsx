import React, { useState } from 'react';
import { Game, GameStatus } from '../../types/game';
import { GAME_PLATFORMS } from '../../constants/gameConstants';
import { useAppDispatch } from '../../store/hooks';
import { updateGameStatus, updateGamePlaytime, updateGamePlatform, updateGamePrice, updateGamePurchaseDate, updateGameCompletionDate, updateGamePlatinumDate } from '../../store/slice/gamesSlice';
import { useAllActivitiesActions } from '../../store/hooks/activitiesHooks';
import { gameStatusToActivityType } from '../../utils/statusUtils';
import { createStatusChangeActivity, createManualPlaytimeActivity } from '../../utils/activityUtils';

interface EditGameInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedGame: Partial<Game>) => void; // Opzionale per backward compatibility
  game: Game;
}

const EditGameInfoModal = ({
  isOpen,
  onClose,
  onSave,
  game
}: EditGameInfoModalProps) => {
  const dispatch = useAppDispatch();
  const { addActivity } = useAllActivitiesActions();
  const [formData, setFormData] = useState({
    platform: game.platform || '',
    price: game.price !== undefined ? game.price.toString() : '',
    purchaseDate: game.purchaseDate || '',
    hoursPlayed: game.hoursPlayed.toString(),
    completionDate: game.completionDate || '',
    platinumDate: game.platinumDate || ''
  });

  // Aggiorna lo stato del form quando cambiano i dati del gioco o quando si apre il modale
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        platform: game.platform || '',
        price: game.price !== undefined ? game.price.toString() : '',
        purchaseDate: game.purchaseDate || '',
        hoursPlayed: game.hoursPlayed.toString(),
        completionDate: game.completionDate || '',
        platinumDate: game.platinumDate || ''
      });
    }
  }, [game, isOpen]);

  // Verifica se il gioco è stato completato o platinato
  const isCompleted = game.status === "completed";
  const isPlatinum = game.status === "platinum";
  const hasBeenCompleted = isCompleted || isPlatinum;

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convertiamo le ore in un numero
    const newHoursPlayed = parseFloat(formData.hoursPlayed) || 0;
    
    // Determiniamo se è necessario cambiare lo stato del gioco
    let newStatus: GameStatus | undefined = undefined;
    
    // Se le ore vengono impostate a 0 e lo stato non è già "not-started",
    // cambiamo lo stato a "not-started"
    if (newHoursPlayed === 0 && game.status !== 'not-started') {
      newStatus = 'not-started';
    }
    // Se le ore passano da 0 a un valore maggiore e lo stato è "not-started",
    // cambiamo lo stato a "in-progress"
    else if (newHoursPlayed > 0 && game.hoursPlayed === 0 && game.status === 'not-started') {
      newStatus = 'in-progress';
    }    // Aggiorna i dati attraverso Redux dispatch
    dispatch(updateGamePlaytime({ gameId: game.id, hoursPlayed: newHoursPlayed }));
    
    // Crea attività in base alla modifica delle ore
    const hoursDifference = newHoursPlayed - game.hoursPlayed;
    
    // Se si reimposta a 0 le ore e viene cambiato lo stato a "not-started"
    if (newHoursPlayed === 0 && newStatus === 'not-started') {
      // Registra l'attività di cambio stato utilizzando la funzione di utilità
      const statusActivity = createStatusChangeActivity(game, 'not-started');
      addActivity(statusActivity);
    } 
    // Se le ore vengono modificate, crea un'attività played
    else if (hoursDifference !== 0) {
      // Utilizza la funzione di utilità per creare l'attività di impostazione manuale delle ore
      const playtimeActivity = createManualPlaytimeActivity(game, newHoursPlayed);
      addActivity(playtimeActivity);
    }
    
    if (formData.platform && formData.platform !== game.platform) {
      dispatch(updateGamePlatform({ gameId: game.id, platform: formData.platform }));
    }
      if (formData.price && parseFloat(formData.price) !== game.price) {
      dispatch(updateGamePrice({ gameId: game.id, price: parseFloat(formData.price) }));
    }
    
    if (formData.purchaseDate && formData.purchaseDate !== game.purchaseDate) {
      dispatch(updateGamePurchaseDate({ gameId: game.id, purchaseDate: formData.purchaseDate }));
    }
    
    // Aggiorna le date se modificate
    if (hasBeenCompleted && formData.completionDate !== game.completionDate) {
      if (formData.completionDate) {
        dispatch(updateGameCompletionDate({ gameId: game.id, completionDate: formData.completionDate }));
      }
    }
    
    if (isPlatinum && formData.platinumDate !== game.platinumDate) {
      if (formData.platinumDate) {
        dispatch(updateGamePlatinumDate({ gameId: game.id, platinumDate: formData.platinumDate }));
      }
    }
    
    // Aggiorna lo stato se necessario
    if (newStatus) {
      dispatch(updateGameStatus({ gameId: game.id, status: newStatus }));
    }
    
    // Chiama la callback opzionale per backward compatibility
    if (onSave) {
      const updatedGame: Partial<Game> = {
        platform: formData.platform,
        price: formData.price ? parseFloat(formData.price) : undefined,
        purchaseDate: formData.purchaseDate || undefined,
        hoursPlayed: newHoursPlayed,
        ...(hasBeenCompleted && { completionDate: formData.completionDate || undefined }),
        ...(isPlatinum && { platinumDate: formData.platinumDate || undefined }),
        ...(newStatus && { status: newStatus })
      };
      onSave(updatedGame);
    }
    
    onClose();
  };

  // Utilizziamo le piattaforme centralizzate
  const platforms = GAME_PLATFORMS;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary-bg rounded-lg shadow-lg z-50 w-full max-w-md overflow-auto max-h-[90vh]">
        <div className="p-6">
          <h3 className="text-lg font-primary font-bold text-text-primary mb-4">Modifica informazioni personali</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="platform" className="block text-text-primary font-secondary text-sm">
                  Piattaforma
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="">Seleziona una piattaforma</option>
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="price" className="block text-text-primary font-secondary text-sm">
                  Prezzo (€)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="purchaseDate" className="block text-text-primary font-secondary text-sm">
                  Data di acquisto
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              {/* Aggiungiamo il campo per modificare le ore di gioco */}
              <div className="space-y-2">
                <label htmlFor="hoursPlayed" className="block text-text-primary font-secondary text-sm">
                  Ore di gioco
                </label>
                <input
                  type="number"
                  id="hoursPlayed"
                  name="hoursPlayed"
                  value={formData.hoursPlayed}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
                <p className="text-xs text-text-secondary">
                  {game.status === 'not-started' 
                    ? "Nota: aggiungere ore di gioco cambierà automaticamente lo stato del gioco a \"In corso\""
                    : "Nota: reimpostare a 0 le ore di gioco cambierà automaticamente lo stato del gioco a \"Da iniziare\""}
                </p>
              </div>

              {/* Data di completamento - mostrata solo se il gioco è stato completato o platinato */}
              {hasBeenCompleted && (
                <div className="space-y-2">
                  <label htmlFor="completionDate" className="block text-text-primary font-secondary text-sm">
                    Data di completamento
                  </label>
                  <input
                    type="date"
                    id="completionDate"
                    name="completionDate"
                    value={formData.completionDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                  <p className="text-xs text-text-secondary">
                    Rimuovere la data di completamento potrebbe richiedere un aggiornamento manuale dello stato del gioco
                  </p>
                </div>
              )}

              {/* Data di platino - mostrata solo se il gioco è platinato */}
              {isPlatinum && (
                <div className="space-y-2">
                  <label htmlFor="platinumDate" className="block text-text-primary font-secondary text-sm">
                    Data di platino
                  </label>
                  <input
                    type="date"
                    id="platinumDate"
                    name="platinumDate"
                    value={formData.platinumDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                  />
                  <p className="text-xs text-text-secondary">
                    Rimuovere la data di platino potrebbe richiedere un aggiornamento manuale dello stato del gioco
                  </p>
                </div>
              )}
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

export default EditGameInfoModal;