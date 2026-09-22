import React from 'react';
import { Upload, Award, X } from 'lucide-react';
import { GAME_PlatformS, Genres } from '../../../constants/gameConstants';
import FormErrorInline from '../../ui/atoms/FormErrorInline';

interface AddGameBaseInfoProps {
  gameData: any;
  handleGameDataChange: (data: any) => void;
  handleGenreToggle: (genre: string) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: () => void;
  formError: string | null;
  isAutoFilled: boolean;
  originalMetacritic?: number | undefined;
}

export function AddGameBaseInfo({
  gameData,
  handleGameDataChange,
  handleGenreToggle,
  handleImageUpload,
  removeImage,
  formError,
  isAutoFilled,
  originalMetacritic
}: AddGameBaseInfoProps) {
  return (
    <div className="relative" id="add-game-base-info">
      <h3 id="manual-tab-header" className="font-montserrat font-semibold text-xl text-text-primary mb-6">Informazioni di base</h3>
      <FormErrorInline message={formError} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Titolo */}
        <div className="md:col-span-2">
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
            Titolo <span className="text-accent-primary">*</span>
          </label>
          <input
            type="text"
            value={gameData.Title}
            onChange={(e) => handleGameDataChange({ Title: e.target.value })}
            className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${isAutoFilled ? 'bg-tertiary-bg cursor-not-allowed opacity-80' : ''}`}
            required
            disabled={isAutoFilled}
          />
        </div>

        {/* Sviluppatore */}
        <div>
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Sviluppatore</label>
          <input
            type="text"
            value={gameData.Developer}
            onChange={(e) => handleGameDataChange({ Developer: e.target.value })}
            className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${isAutoFilled ? 'bg-tertiary-bg cursor-not-allowed opacity-80' : ''}`}
            disabled={isAutoFilled}
          />
        </div>

        {/* Publisher */}
        <div>
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Publisher</label>
          <input
            type="text"
            value={gameData.Publisher}
            onChange={(e) => handleGameDataChange({ Publisher: e.target.value })}
            className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${isAutoFilled ? 'bg-tertiary-bg cursor-not-allowed opacity-80' : ''}`}
            disabled={isAutoFilled}
          />
        </div>

        {/* Anno di uscita */}
        <div>
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
            Anno di uscita
          </label>
          <input
            type="number"
            value={gameData.ReleaseYear}
            onChange={(e) => handleGameDataChange({ ReleaseYear: Number.parseInt(e.target.value) || new Date().getFullYear() })}
            min="1970"
            max={new Date().getFullYear()}
            className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${isAutoFilled ? 'bg-tertiary-bg cursor-not-allowed opacity-80' : ''}`}
            disabled={isAutoFilled}
          />
        </div>
        
        {/* Metacritic */}
        <div>
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
            <span className="flex items-center">
              <Award className="w-4 h-4 text-yellow-500 mr-1" />
              Metacritic
            </span>
          </label>
          <input
            type="number"
            value={gameData.Metacritic ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                handleGameDataChange({ Metacritic: null });
                return;
              }
              let numericValue = Number.parseInt(value);
              if (isNaN(numericValue)) return;
              
              if (numericValue < 0) numericValue = 0;
              if (numericValue > 100) numericValue = 100;
              
              handleGameDataChange({ Metacritic: numericValue });
            }}
            onInput={(e) => {
              const target = e.target as HTMLInputElement;
              const value = target.value;
              if (value && Number.parseInt(value) > 100) {
                target.value = "100";
              }
            }}
            min="0"
            max="100"
            className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${
              isAutoFilled && originalMetacritic != null && originalMetacritic > 0 
                ? 'bg-tertiary-bg cursor-not-allowed opacity-80' 
                : ''
            }`}
            disabled={isAutoFilled && originalMetacritic != null && originalMetacritic > 0}
            placeholder="N.D."
          />
        </div>

        {/* Piattaforma */}
        <div>
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
            Piattaforma <span className="text-accent-primary">*</span>
          </label>
          <select
            value={gameData.Platform}
            onChange={(e) => handleGameDataChange({ Platform: e.target.value })}
            className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
            required
          >
            <option value="" disabled>
              Seleziona piattaforma
            </option>
            {GAME_PlatformS.map((Platform) => (
              <option key={Platform} value={Platform}>
                {Platform}
              </option>
            ))}
          </select>
        </div>

        {/* Generi */}
        <div className="md:col-span-2">
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Generi</label>
          <div className="flex flex-wrap gap-2">
            {Genres.map((genre) => (
              <button
                key={genre}
                type="button"
                onClick={() => handleGenreToggle(genre)}
                className={`px-3 py-1 rounded-full text-sm font-roboto transition-colors ${gameData.Genres.includes(genre) ? "bg-accent-primary text-white" : "bg-secondary-bg text-text-primary hover:bg-tertiary-bg"} ${isAutoFilled ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={isAutoFilled}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Upload copertina */}
        <div className="md:col-span-2">
          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Copertina</label>
          {gameData.CoverImage ? (
            <div className="relative w-40 h-40 border border-border-color rounded-md overflow-hidden">
              <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
              <img
                src={gameData.CoverImage || "/placeholder.svg"}
                alt="Copertina"
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-primary-bg rounded-full p-1 text-text-secondary hover:text-accent-primary transition-colors"
                disabled={isAutoFilled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border-color rounded-md bg-secondary-bg hover:border-accent-primary transition-colors cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-10 w-10 text-text-secondary mb-2" />
                <p className="font-roboto text-sm text-text-secondary">
                  <span className="font-medium">Clicca per caricare</span> o trascina qui l'immagine
                </p>
                <p className="text-xs text-text-secondary mt-1">PNG, JPG o WEBP (max. 2MB)</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isAutoFilled} />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
