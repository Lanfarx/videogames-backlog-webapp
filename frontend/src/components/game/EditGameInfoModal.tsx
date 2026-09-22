import React from 'react';
import { Game } from '../../types/game';
import { GAME_PlatformS } from '../../constants/gameConstants';
import { useEditGameInfoForm } from '../../hooks/useEditGameInfoForm';

interface EditGameInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Game;
}

const EditGameInfoModal = ({
  isOpen,
  onClose,
  game
}: EditGameInfoModalProps) => {
  const { formData, isSubmitting, handleChange, handleSubmit } = useEditGameInfoForm(game, isOpen, onClose);

  const isCompleted = game.Status === "Completed";
  const isPlatinum = game.Status === "Platinum";
  const hasBeenCompleted = isCompleted || isPlatinum;

  if (!isOpen) return null;

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
                  min="-1"
                  className="w-full px-3 py-2 border border-border-color rounded-lg bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary"
                  placeholder="0.00"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Inserisci 0 se Gratis, oppure -1 se Regalato. Lascia vuoto per Family Share/Game Pass.
                </p>
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
                disabled={isSubmitting}
                className={`px-4 py-2 text-white rounded-lg transition-colors font-secondary flex items-center justify-center min-w-[150px] ${
                  isSubmitting ? "bg-accent-primary/70 cursor-not-allowed" : "bg-accent-primary hover:opacity-90"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Salvataggio...
                  </>
                ) : (
                  "Salva modifiche"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditGameInfoModal;