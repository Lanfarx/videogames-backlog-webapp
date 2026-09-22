import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import RatingStars from '../../ui/atoms/RatingStars';
import { GameReview } from '../../../types/game';

interface PublicReviewTabProps {
  initialReview: GameReview | undefined;
  isNotStarted: boolean;
  onSave: (review: GameReview) => void;
  onPrivacyToggle: (isPublic: boolean) => void;
}

export function PublicReviewTab({ initialReview, isNotStarted, onSave, onPrivacyToggle }: PublicReviewTabProps) {
  const [localReviewText, setLocalReviewText] = useState(initialReview?.Text || '');
  const [localGameplayRating, setLocalGameplayRating] = useState(initialReview?.Gameplay || 0);
  const [localGraphicsRating, setLocalGraphicsRating] = useState(initialReview?.Graphics || 0);
  const [localStoryRating, setLocalStoryRating] = useState(initialReview?.Story || 0);
  const [localSoundRating, setLocalSoundRating] = useState(initialReview?.Sound || 0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!saveSuccess) {
      setLocalReviewText(initialReview?.Text || '');
      setLocalGameplayRating(initialReview?.Gameplay || 0);
      setLocalGraphicsRating(initialReview?.Graphics || 0);
      setLocalStoryRating(initialReview?.Story || 0);
      setLocalSoundRating(initialReview?.Sound || 0);
    }
  }, [initialReview, saveSuccess]);

  const ReviewDate = initialReview?.Date || '';
  const IsPublic = initialReview?.IsPublic ?? true;

  const hasUnsavedChanges = 
    localReviewText !== (initialReview?.Text || '') ||
    localGameplayRating !== (initialReview?.Gameplay || 0) ||
    localGraphicsRating !== (initialReview?.Graphics || 0) ||
    localStoryRating !== (initialReview?.Story || 0) ||
    localSoundRating !== (initialReview?.Sound || 0);

  const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalReviewText(e.target.value);
    if (saveSuccess) setSaveSuccess(false);
  };

  const handleRatingChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: number) => {
    if (!isNotStarted) {
      setter(value);
      if (saveSuccess) setSaveSuccess(false);
    }
  };

  const handleSave = () => {
    if (!isNotStarted) {
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      
      const updatedReview: GameReview = {
        Text: localReviewText,
        Gameplay: localGameplayRating,
        Graphics: localGraphicsRating,
        Story: localStoryRating,
        Sound: localSoundRating,
        Date: formattedDate,
        IsPublic: IsPublic,
      };
      
      onSave(updatedReview);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <div>
      <div className="border border-border-color rounded-lg mb-4 overflow-hidden">
        <textarea
          className="w-full p-4 min-h-[120px] border-b border-border-color bg-secondary-bg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 outline-none font-secondary text-base text-text-primary resize-none transition-colors"
          value={localReviewText}
          onChange={handleReviewTextChange}
          placeholder="Scrivi qui la tua recensione..."
          disabled={isNotStarted}
        ></textarea>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary-bg border-t border-border-color">
          <button
            type="button"
            className={`flex items-center gap-2 text-sm ${
              IsPublic 
                ? 'text-accent-success hover:text-accent-success/80'
                : 'text-text-secondary hover:text-accent-primary'
            } focus:outline-none transition-colors`}
            title={IsPublic ? 'Rendi privata la recensione' : 'Rendi pubblica la recensione'}
            onClick={() => {
              if (!isNotStarted) {
                onPrivacyToggle(!IsPublic);
              }
            }}
            disabled={isNotStarted}
          >
            {IsPublic ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}                  
            <span>{IsPublic ? 'Pubblica' : 'Privata'}</span>
          </button>
          <span className="text-xs text-text-disabled">
            {IsPublic ? 'Visibile nella community' : 'Solo per te'}
          </span>
        </div>              
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 bg-secondary-bg">
          <div>
            <label className="block mb-1 font-secondary font-medium text-sm text-text-secondary">Gameplay</label>
            <div className="cursor-pointer">
              <RatingStars 
                Rating={localGameplayRating} 
                size="md"
                onRatingChange={(val) => handleRatingChange(setLocalGameplayRating, val)}
                readOnly={isNotStarted}
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-secondary font-medium text-sm text-text-secondary">Grafica</label>
            <div className="cursor-pointer">
              <RatingStars 
                Rating={localGraphicsRating} 
                size="md"
                onRatingChange={(val) => handleRatingChange(setLocalGraphicsRating, val)}
                readOnly={isNotStarted}
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-secondary font-medium text-sm text-text-secondary">Storia</label>
            <div className="cursor-pointer">
              <RatingStars 
                Rating={localStoryRating} 
                size="md"
                onRatingChange={(val) => handleRatingChange(setLocalStoryRating, val)}
                readOnly={isNotStarted}
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-secondary font-medium text-sm text-text-secondary">Audio</label>
            <div className="cursor-pointer">
              <RatingStars 
                Rating={localSoundRating} 
                size="md"
                onRatingChange={(val) => handleRatingChange(setLocalSoundRating, val)}
                readOnly={isNotStarted}
              />
            </div>
          </div>
        </div>
      </div>            
      
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {saveSuccess ? (
            <span className="text-accent-success text-sm font-secondary">
              Recensione salvata con successo!
            </span>
          ) : hasUnsavedChanges ? (
            <span className="text-amber-500 text-sm font-secondary">
              Hai modifiche non salvate
            </span>
          ) : ReviewDate ? (
            <span className="text-xs text-text-secondary font-secondary">
              Recensione aggiornata il: {new Date(ReviewDate).toLocaleDateString('it-IT')}
            </span>
          ) : null}
        </div>              
        
        <button 
          className={`px-6 py-2 rounded-lg font-secondary font-medium text-sm flex items-center transition-colors ${
            isNotStarted 
              ? 'bg-text-disabled text-text-disabled cursor-not-allowed' 
              : hasUnsavedChanges
                ? 'bg-accent-primary text-white hover:opacity-90 shadow-lg'
                : 'bg-accent-primary/70 text-white hover:opacity-90'
          }`}
          onClick={handleSave}
          disabled={isNotStarted}
        >
          <Save className="h-4 w-4 mr-2" />
          Salva recensione
          {hasUnsavedChanges && (
            <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>
          )}
        </button>
      </div>
    </div>
  );
}
