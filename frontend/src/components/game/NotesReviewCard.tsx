import { useState, useEffect } from 'react';
import RatingStars from '../ui/atoms/RatingStars';
import { Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Game, GameReview } from '../../types/game';
import { useAppDispatch } from '../../store/hooks';
import { useGameById, useGameActions } from '../../store/hooks/gamesHooks';
import { calculateRatingFromReview } from '../../utils/gamesUtils';

interface NotesReviewCardProps {
  game: Game;
}

const NotesReviewCard = ({ game }: NotesReviewCardProps) => {    
  const [activeTab, setActiveTab] = useState<'Notes' | 'Review'>('Notes');
  const [NotesValue, setNotesValue] = useState(game.Notes || '');
  const [saveNotesSuccess, setSaveNotesSuccess] = useState(false);  const [saveReviewSuccess, setSaveReviewSuccess] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  
  // Ottieni il gioco aggiornato dallo stato globale Redux tramite hook custom
  const gameFromStore = useGameById(game.id);
  const currentGame = gameFromStore || game;
  // Stato locale per la recensione (salvato solo al click del pulsante)
  const [localReviewText, setLocalReviewText] = useState(currentGame.Review?.Text || '');
  const [localGameplayRating, setLocalGameplayRating] = useState(currentGame.Review?.Gameplay || 0);
  const [localGraphicsRating, setLocalGraphicsRating] = useState(currentGame.Review?.Graphics || 0);
  const [localStoryRating, setLocalStoryRating] = useState(currentGame.Review?.Story || 0);
  const [localSoundRating, setLocalSoundRating] = useState(currentGame.Review?.Sound || 0);  // Valori dal backend per confronto e display della data
  const ReviewDate = currentGame.Review?.Date || '';
  const IsPublic = currentGame.Review?.IsPublic ?? true;
  
  // Controlla se ci sono modifiche non salvate nella recensione (esclusa la privacy che è gestita separatamente)
  const hasUnsavedReviewChanges = 
    localReviewText !== (currentGame.Review?.Text || '') ||
    localGameplayRating !== (currentGame.Review?.Gameplay || 0) ||
    localGraphicsRating !== (currentGame.Review?.Graphics || 0) ||
    localStoryRating !== (currentGame.Review?.Story || 0) ||
    localSoundRating !== (currentGame.Review?.Sound || 0);
    const dispatch = useAppDispatch();
  const { update: updateGame } = useGameActions();
  
  // Verifica se il gioco è "da iniziare" (non permette recensioni)
  const isNotStarted = currentGame.Status === 'NotStarted';
  // Se il gioco è "da iniziare" e l'utente è nella scheda recensione, forza il cambio alla scheda note
  // Ma non interferire con i salvataggi di recensioni per giochi validi
  useEffect(() => {
    if (isNotStarted && activeTab === 'Review' && !isSavingReview) {
      setActiveTab('Notes');
    }
  }, [isNotStarted, activeTab, isSavingReview]);  // Aggiorna lo stato locale quando cambia il gioco dal backend (ma non durante il salvataggio)
  useEffect(() => {
    if (!isSavingReview) {
      setNotesValue(currentGame.Notes || '');
      setLocalReviewText(currentGame.Review?.Text || '');
      setLocalGameplayRating(currentGame.Review?.Gameplay || 0);
      setLocalGraphicsRating(currentGame.Review?.Graphics || 0);
      setLocalStoryRating(currentGame.Review?.Story || 0);
      setLocalSoundRating(currentGame.Review?.Sound || 0);
    }
  }, [currentGame, isSavingReview]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotesValue(e.target.value);
    // Reset del messaggio di successo quando l'utente inizia a modificare
    if (saveNotesSuccess) setSaveNotesSuccess(false);
  };

  const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalReviewText(e.target.value);
    // Reset del messaggio di successo quando l'utente inizia a modificare
    if (saveReviewSuccess) setSaveReviewSuccess(false);
  };  const handleSaveNotes = () => {
    updateGame(game.id, { Notes: NotesValue });
    // Mostra messaggio di successo per 3 secondi
    setSaveNotesSuccess(true);
    setTimeout(() => setSaveNotesSuccess(false), 3000);
  };// Nel salvataggio della recensione, usa i valori locali
  const handleSaveReview = () => {
    if (!isNotStarted) {
      setIsSavingReview(true);      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      
      const updatedReview: GameReview = {
        Text: localReviewText,
        Gameplay: localGameplayRating,
        Graphics: localGraphicsRating,
        Story: localStoryRating,
        Sound: localSoundRating,
        Date: formattedDate,
        IsPublic: IsPublic, // Usa il valore dal backend, non quello locale
      };const averageRating = calculateRatingFromReview(updatedReview);
        // Singola chiamata per aggiornare sia la review che il rating
      updateGame(game.id, { 
        Review: updatedReview,
        Rating: averageRating 
      });
      
      // Note: Backend automatically creates "Rated" activities when Rating field is updated
      
      setSaveReviewSuccess(true);
      // Assicurati che rimanga nella tab Review dopo il salvataggio
      setActiveTab('Review');        
      setTimeout(() => {
        setSaveReviewSuccess(false);
        setIsSavingReview(false);
      }, 3000);
    }
  };// Gestori per il cambio delle valutazioni a stelle - aggiornano lo stato locale
  const handleGameplayRatingChange = (value: number) => {
    if (!isNotStarted) {
      setLocalGameplayRating(value);
      if (saveReviewSuccess) setSaveReviewSuccess(false);
    }
  };

  const handleGraphicsRatingChange = (value: number) => {
    if (!isNotStarted) {
      setLocalGraphicsRating(value);
      if (saveReviewSuccess) setSaveReviewSuccess(false);
    }
  };

  const handleStoryRatingChange = (value: number) => {
    if (!isNotStarted) {
      setLocalStoryRating(value);
      if (saveReviewSuccess) setSaveReviewSuccess(false);
    }
  };

  const handleSoundRatingChange = (value: number) => {
    if (!isNotStarted) {
      setLocalSoundRating(value);
      if (saveReviewSuccess) setSaveReviewSuccess(false);
    }
  };

  // Handler per il click sul tab della recensione
  const handleReviewTabClick = () => {
    if (!isNotStarted) {
      setActiveTab('Review');
    }
  };
  return (
    <div className="bg-primary-bg border border-border-color rounded-xl overflow-hidden mb-8">
      {/* Tab header */}
      <div className="flex text-center border-b border-border-color">
        <button
          className={`flex-1 py-4 font-primary font-semibold ${
            activeTab === 'Notes' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-secondary'
          }`}
          onClick={() => setActiveTab('Notes')}
        >
          Note
        </button>
        <button
          className={`flex-1 py-4 font-primary font-semibold ${
            activeTab === 'Review' 
              ? 'border-b-2 border-accent-primary text-accent-primary' 
              : isNotStarted 
                ? 'text-text-secondary/50 cursor-not-allowed' 
                : 'text-text-secondary'
          }`}
          onClick={handleReviewTabClick}
          disabled={isNotStarted}
        >
          Recensione
        </button>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {activeTab === 'Notes' ? (
          <div>            <textarea
              className="w-full p-4 min-h-[180px] border border-border-color rounded-lg bg-secondary-bg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 outline-none font-secondary text-base text-text-primary resize-none transition-colors"
              placeholder="Aggiungi le tue note private per questo gioco..."
              value={NotesValue}
              onChange={handleNotesChange}
            ></textarea>
            
            <div className="flex justify-between items-center mt-4">
              {saveNotesSuccess && (
                <span className="text-accent-success text-sm font-secondary">
                  Note salvate con successo!
                </span>
              )}
              {isNotStarted && (
                <span className="text-amber-500 text-sm font-secondary flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Per scrivere una recensione, inizia a giocare a questo titolo.
                </span>
              )}
              <div className="ml-auto">
                <button 
                  className="px-6 py-2 bg-accent-primary text-white rounded-lg font-secondary font-medium text-sm hover:bg-accent-primary/90 transition-colors flex items-center"
                  onClick={handleSaveNotes}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salva note
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Review content */}
            <div className="border border-border-color rounded-lg mb-4 overflow-hidden">
              {/* Review text */}              <textarea
                className="w-full p-4 min-h-[120px] border-b border-border-color bg-secondary-bg focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 outline-none font-secondary text-base text-text-primary resize-none transition-colors"
                value={localReviewText}
                onChange={handleReviewTextChange}
                placeholder="Scrivi qui la tua recensione..."
                disabled={isNotStarted}
              ></textarea>{/* Toggle privacy */}
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
                      const newIsPublic = !IsPublic;
                      
                      // Aggiorna solo il campo privacy con chiamata API immediata
                      updateGame(game.id, { 
                        Review: { IsPublic: newIsPublic }
                      });
                    }
                  }}
                  disabled={isNotStarted}
                >{IsPublic ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}                  <span>{IsPublic ? 'Pubblica' : 'Privata'}</span>
                </button>
                <span className="text-xs text-text-disabled">
                  {IsPublic ? 'Visibile nella community' : 'Solo per te'}
                </span>
              </div>              
              {/* Rating categories */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 bg-secondary-bg">
                <div>
                  <label className="block mb-1 font-secondary font-medium text-sm text-text-secondary">
                    Gameplay
                  </label><div className="cursor-pointer">
                    <RatingStars 
                      Rating={localGameplayRating} 
                      size="md"
                      onRatingChange={handleGameplayRatingChange}
                      readOnly={isNotStarted}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-secondary font-medium text-sm text-text-secondary">
                    Grafica
                  </label>
                  <div className="cursor-pointer">
                    <RatingStars 
                      Rating={localGraphicsRating} 
                      size="md"
                      onRatingChange={handleGraphicsRatingChange}
                      readOnly={isNotStarted}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-secondary font-medium text-sm text-text-secondary">
                    Storia
                  </label>
                  <div className="cursor-pointer">
                    <RatingStars 
                      Rating={localStoryRating} 
                      size="md"
                      onRatingChange={handleStoryRatingChange}
                      readOnly={isNotStarted}
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1 font-secondary font-medium text-sm text-text-secondary">
                    Audio
                  </label>
                  <div className="cursor-pointer">
                    <RatingStars 
                      Rating={localSoundRating} 
                      size="md"
                      onRatingChange={handleSoundRatingChange}
                      readOnly={isNotStarted}
                    />
                  </div>
                </div>
              </div>
            </div>            <div className="flex justify-between items-center">
              <div className="flex-1">
                {saveReviewSuccess ? (
                  <span className="text-accent-success text-sm font-secondary">
                    Recensione salvata con successo!
                  </span>
                ) : hasUnsavedReviewChanges ? (
                  <span className="text-amber-500 text-sm font-secondary">
                    Hai modifiche non salvate
                  </span>
                ) : ReviewDate ? (
                  <span className="text-xs text-text-secondary font-secondary">
                    Recensione aggiornata il: {new Date(ReviewDate).toLocaleDateString('it-IT')}
                  </span>
                ) : null}
              </div>              <button 
                className={`px-6 py-2 rounded-lg font-secondary font-medium text-sm flex items-center transition-colors ${
                  isNotStarted 
                    ? 'bg-text-disabled text-text-disabled cursor-not-allowed' 
                    : hasUnsavedReviewChanges
                      ? 'bg-accent-primary text-white hover:bg-accent-primary/90 shadow-lg'
                      : 'bg-accent-primary/70 text-white hover:bg-accent-primary/90'
                }`}
                onClick={handleSaveReview}
                disabled={isNotStarted}
              >
                <Save className="h-4 w-4 mr-2" />
                Salva recensione
                {hasUnsavedReviewChanges && (
                  <span className="ml-1 w-2 h-2 bg-white rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesReviewCard;
