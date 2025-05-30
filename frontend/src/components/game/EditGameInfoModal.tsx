import React, { useState } from 'react';
import { Game, GameStatus } from '../../types/game';
import { GAME_PlatformS } from '../../constants/gameConstants';
import { useAppDispatch } from '../../store/hooks';
import { updateGameStatus, updateGameplaytime, updateGamePlatform, updateGamePrice, updateGamePurchaseDate, updateGameCompletionDate, updateGamePlatinumDate } from '../../store/slice/gamesSlice';
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
    Platform: game.Platform || '',
    Price: game.Price !== undefined ? game.Price.toString() : '',
    PurchaseDate: game.PurchaseDate || '',
    HoursPlayed: game.HoursPlayed.toString(),
    CompletionDate: game.CompletionDate || '',
    PlatinumDate: game.PlatinumDate || ''
  });

  // Aggiorna lo stato del form quando cambiano i dati del gioco o quando si apre il modale
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        Platform: game.Platform || '',
        Price: game.Price !== undefined ? game.Price.toString() : '',
        PurchaseDate: game.PurchaseDate || '',
        HoursPlayed: game.HoursPlayed.toString(),
        CompletionDate: game.CompletionDate || '',
        PlatinumDate: game.PlatinumDate || ''
      });
    }
  }, [game, isOpen]);

  // Verifica se il gioco è stato completato o platinato
  const isCompleted = game.Status === "Completed";
  const isPlatinum = game.Status === "Platinum";
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
    const newHoursPlayed = parseFloat(formData.HoursPlayed) || 0;
    
    // Determiniamo se è necessario cambiare lo stato del gioco
    let newStatus: GameStatus | undefined = undefined;
    
    // Se le ore vengono impostate a 0 e lo stato non è già "NotStarted",
    // cambiamo lo stato a "NotStarted"
    if (newHoursPlayed === 0 && game.Status !== 'NotStarted') {
      newStatus = 'NotStarted';
    }
    // Se le ore passano da 0 a un valore maggiore e lo stato è "NotStarted",
    // cambiamo lo stato a "InProgress"
    else if (newHoursPlayed > 0 && game.HoursPlayed === 0 && game.Status === 'NotStarted') {
      newStatus = 'InProgress';
    }    // Aggiorna i dati attraverso Redux dispatch
    dispatch(updateGameplaytime({ gameId: game.id, HoursPlayed: newHoursPlayed }));
    
    // Crea attività in base alla modifica delle ore
    const hoursDifference = newHoursPlayed - game.HoursPlayed;
    
    // Se si reimposta a 0 le ore e viene cambiato lo stato a "NotStarted"
    if (newHoursPlayed === 0 && newStatus === 'NotStarted') {
      // Registra l'attività di cambio stato utilizzando la funzione di utilità
      const StatusActivity = createStatusChangeActivity(game, 'NotStarted');
      addActivity(StatusActivity);
    } 
    // Se le ore vengono modificate, crea un'attività played
    else if (hoursDifference !== 0) {
      // Utilizza la funzione di utilità per creare l'attività di impostazione manuale delle ore
      const playtimeActivity = createManualPlaytimeActivity(game, newHoursPlayed);
      addActivity(playtimeActivity);
    }
    
    if (formData.Platform && formData.Platform !== game.Platform) {
      dispatch(updateGamePlatform({ gameId: game.id, Platform: formData.Platform }));
    }
      if (formData.Price && parseFloat(formData.Price) !== game.Price) {
      dispatch(updateGamePrice({ gameId: game.id, Price: parseFloat(formData.Price) }));
    }
    
    if (formData.PurchaseDate && formData.PurchaseDate !== game.PurchaseDate) {
      dispatch(updateGamePurchaseDate({ gameId: game.id, PurchaseDate: formData.PurchaseDate }));
    }
    
    // Aggiorna le date se modificate
    if (hasBeenCompleted && formData.CompletionDate !== game.CompletionDate) {
      if (formData.CompletionDate) {
        dispatch(updateGameCompletionDate({ gameId: game.id, CompletionDate: formData.CompletionDate }));
      }
    }
    
    if (isPlatinum && formData.PlatinumDate !== game.PlatinumDate) {
      if (formData.PlatinumDate) {
        dispatch(updateGamePlatinumDate({ gameId: game.id, PlatinumDate: formData.PlatinumDate }));
      }
    }
    
    // Aggiorna lo stato se necessario
    if (newStatus) {
      dispatch(updateGameStatus({ gameId: game.id, Status: newStatus }));
    }
    
    // Chiama la callback opzionale per backward compatibility
    if (onSave) {
      const updatedGame: Partial<Game> = {
        Platform: formData.Platform,
        Price: formData.Price ? parseFloat(formData.Price) : undefined,
        PurchaseDate: formData.PurchaseDate || undefined,
        HoursPlayed: newHoursPlayed,
        ...(hasBeenCompleted && { CompletionDate: formData.CompletionDate || undefined }),
        ...(isPlatinum && { PlatinumDate: formData.PlatinumDate || undefined }),
        ...(newStatus && { Status: newStatus })
      };
      onSave(updatedGame);
    }
    
    onClose();
  };

  // Utilizziamo le piattaforme centralizzate
  const Platforms = GAME_PlatformS;

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
                <label htmlFor="Platform" className="block text-text-primary font-secondary text-sm">
                  Piattaforma
                </label>
                <select
                  id="Platform"
                  name="Platform"
                  value={formData.Platform}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                >
                  <option value="">Seleziona una piattaforma</option>
                  {Platforms.map(Platform => (
                    <option key={Platform} value={Platform}>
                      {Platform}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="Price" className="block text-text-primary font-secondary text-sm">
                  Prezzo (€)
                </label>
                <input
                  type="number"
                  id="Price"
                  name="Price"
                  value={formData.Price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="PurchaseDate" className="block text-text-primary font-secondary text-sm">
                  Data di acquisto
                </label>
                <input
                  type="date"
                  id="PurchaseDate"
                  name="PurchaseDate"
                  value={formData.PurchaseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
              </div>

              {/* Aggiungiamo il campo per modificare le ore di gioco */}
              <div className="space-y-2">
                <label htmlFor="HoursPlayed" className="block text-text-primary font-secondary text-sm">
                  Ore di gioco
                </label>
                <input
                  type="number"
                  id="HoursPlayed"
                  name="HoursPlayed"
                  value={formData.HoursPlayed}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                />
                <p className="text-xs text-text-secondary">
                  {game.Status === 'NotStarted' 
                    ? "Nota: aggiungere ore di gioco cambierà automaticamente lo stato del gioco a \"In corso\""
                    : "Nota: reimpostare a 0 le ore di gioco cambierà automaticamente lo stato del gioco a \"Da iniziare\""}
                </p>
              </div>

              {/* Data di completamento - mostrata solo se il gioco è stato completato o platinato */}
              {hasBeenCompleted && (
                <div className="space-y-2">
                  <label htmlFor="CompletionDate" className="block text-text-primary font-secondary text-sm">
                    Data di completamento
                  </label>
                  <input
                    type="date"
                    id="CompletionDate"
                    name="CompletionDate"
                    value={formData.CompletionDate}
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
                  <label htmlFor="PlatinumDate" className="block text-text-primary font-secondary text-sm">
                    Data di platino
                  </label>
                  <input
                    type="date"
                    id="PlatinumDate"
                    name="PlatinumDate"
                    value={formData.PlatinumDate}
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