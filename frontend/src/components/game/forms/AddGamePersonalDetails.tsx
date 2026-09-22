import React from 'react';
import { GameStatus } from '../../../types/game';
import { Status_OPTIONS } from '../../../constants/gameConstants';

interface AddGamePersonalDetailsProps {
  gameData: any;
  handleGameDataChange: (data: any) => void;
}

export function AddGamePersonalDetails({
  gameData,
  handleGameDataChange
}: AddGamePersonalDetailsProps) {
  return (
    <div>
      <h3 className="font-montserrat font-semibold text-xl text-text-primary mb-6">Dettagli personali</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stato */}
        <div>
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
            Stato <span className="text-accent-primary">*</span>
          </label>
          <select
            value={gameData.Status}
            onChange={(e) => handleGameDataChange({ Status: e.target.value as GameStatus })}
            className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
            required
          >
            {Status_OPTIONS.map((Status) => (
              <option key={Status.value} value={Status.value}>
                {Status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Ore di gioco */}
        <div>
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
            Ore di gioco
          </label>
          <input
            type="number"
            value={gameData.Status === "NotStarted" ? 0 : (gameData.HoursPlayed === 0 ? "" : gameData.HoursPlayed)}
            onChange={(e) => {
              const val = e.target.value;
              handleGameDataChange({ HoursPlayed: val === "" ? 0 : Number.parseInt(val) });
            }}
            min="0"
            disabled={gameData.Status === "NotStarted"}
            placeholder="0"
            className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${
              gameData.Status === "NotStarted" ? "bg-tertiary-bg cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Data di acquisto */}
        <div>
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
            Data di acquisto
          </label>
          <input
            type="date"
            value={gameData.PurchaseDate}
            onChange={(e) => handleGameDataChange({ PurchaseDate: e.target.value })}
            className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
            />
        </div>

        {/* Prezzo */}
        <div>
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Prezzo (€)</label>
          <input
            type="number"
            value={gameData.Price ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                handleGameDataChange({ Price: undefined });
                return;
              }
              const numericValue = Number.parseFloat(value);
              if (isNaN(numericValue)) return;
              handleGameDataChange({ Price: numericValue >= 0 ? numericValue : 0 });
            }}
            min="0"
            step="0.01"
            className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
            placeholder="Lascia vuoto per Gratis/Condiviso/Pass"
            />
        </div>

        {/* Data di completamento */}
        {(gameData.Status === "Completed" || gameData.Status === "Platinum") && (
          <div>
            <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
              Data di completamento
            </label>
            <input
              type="date"
              value={gameData.CompletionDate || ""}
              onChange={(e) => handleGameDataChange({ CompletionDate: e.target.value })}
              className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
            />
          </div>
        )}

        {/* Data di platino */}
        {gameData.Status === "Platinum" && (
          <div>
            <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
              Data di platino
            </label>
            <input
              type="date"
              value={gameData.PlatinumDate || ""}
              onChange={(e) => handleGameDataChange({ PlatinumDate: e.target.value })}
              className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
            />
          </div>
        )}

        {/* Note */}
        <div className="md:col-span-2">
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Note</label>
          <textarea
            value={gameData.Notes}
            onChange={(e) => handleGameDataChange({ Notes: e.target.value })}
            rows={4}
            className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors resize-none font-roboto text-base"
            placeholder="Aggiungi note personali sul gioco..."
            ></textarea>
        </div>
      </div>
    </div>
  );
}
