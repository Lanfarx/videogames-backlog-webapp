import { useState, useEffect } from 'react';
import RatingStars from '../ui/atoms/RatingStars';
import { Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Game, GameReview } from '../../types/game';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useGameById, useGameActions } from '../../store/hooks/gamesHooks';
import { useAllActivitiesActions } from '../../store/hooks/activitiesHooks';
import { calculateRatingFromReview } from '../../utils/gamesUtils';
import { createRatingActivity } from '../../utils/activityUtils';

interface NotesReviewCardProps {
  game: Game;
  onNotesChange?: (Notes: string) => void;
  onReviewSave?: (Review: GameReview) => void;
}

const NotesReviewCard = ({ game, onNotesChange, onReviewSave }: NotesReviewCardProps) => {
  const [activeTab, setActiveTab] = useState<'Notes' | 'Review'>('Notes');
  const [NotesValue, setNotesValue] = useState(game.Notes || '');
  const [saveNotesSuccess, setSaveNotesSuccess] = useState(false);
  const [saveReviewSuccess, setSaveReviewSuccess] = useState(false);
  
  // Stati per la recensione
  const [Reviewtext, setReviewtext] = useState('');
  const [GameplayRating, setGameplayRating] = useState(0);
  const [GraphicsRating, setGraphicsRating] = useState(0);
  const [StoryRating, setStoryRating] = useState(0);
  const [SoundRating, setSoundRating] = useState(0);
  const [ReviewDate, setReviewDate] = useState('');

  // Ottieni il gioco aggiornato dallo stato globale Redux tramite hook custom
  const gameFromStore = useGameById(game.id);
  const currentGame = gameFromStore || game;
  // Stato per la privacy della recensione - sincronizzato con le impostazioni profilo
  const [IsPublic, setIsPublic] = useState(currentGame.Review?.IsPublic ?? false);
  // Usa Redux per la privacy
  const userProfile = useAppSelector(state => state.user.profile);
  const isProfilePrivate = userProfile?.privacySettings?.isPrivate ?? false;
  const isDiaryPrivate = userProfile?.privacySettings?.showDiary === false;
  const dispatch = useAppDispatch();
  const { addActivity } = useAllActivitiesActions();
  const { update: updateGame } = useGameActions();
  // Forza la privacy a privata se il diario è privato
  useEffect(() => {
    if (isDiaryPrivate) {
      setIsPublic(false);
    } else if (!currentGame.Review || currentGame.Review.IsPublic === undefined) {
      // Solo quando si crea una nuova recensione senza privacy già impostata
      setIsPublic(true);
    } else {
      setIsPublic(currentGame.Review.IsPublic);
    }
  }, [isDiaryPrivate, currentGame.Review]);

  // Verifica se il gioco è "da iniziare" (non permette recensioni)
  const isNotStarted = currentGame.Status === 'NotStarted';

  // Se il gioco è "da iniziare" e l'utente è nella scheda recensione, forza il cambio alla scheda note
  useEffect(() => {
    if (isNotStarted && activeTab === 'Review') {
      setActiveTab('Notes');
    }
  }, [isNotStarted, activeTab]);

  // Carica i dati della recensione dal gioco quando disponibili
  useEffect(() => {
    if (currentGame.Review) {
      setReviewtext(currentGame.Review.Text);
      setGameplayRating(currentGame.Review.Gameplay);
      setGraphicsRating(currentGame.Review.Graphics);
      setStoryRating(currentGame.Review.Story);
      setSoundRating(currentGame.Review.Sound);
      setReviewDate(currentGame.Review.Date);
    }
    setNotesValue(currentGame.Notes || '');  }, [currentGame]);

  // Aggiorna anche lo stato del toggle quando cambia la Review
  useEffect(() => {
    setIsPublic(currentGame.Review?.IsPublic ?? false);
  }, [currentGame.Review]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotesValue(e.target.value);
    // Reset del messaggio di successo quando l'utente inizia a modificare
    if (saveNotesSuccess) setSaveNotesSuccess(false);
  };

  const handleReviewtextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewtext(e.target.value);
    // Reset del messaggio di successo quando l'utente inizia a modificare
    if (saveReviewSuccess) setSaveReviewSuccess(false);
  };
  const handleSaveNotes = () => {
    updateGame(game.id, { Notes: NotesValue });
    if (onNotesChange) {
      onNotesChange(NotesValue);
    }
    // Mostra messaggio di successo per 3 secondi
    setSaveNotesSuccess(true);
    setTimeout(() => setSaveNotesSuccess(false), 3000);
  };
  // Nel salvataggio della recensione, forza IsPublic a false se diario privato
  const handleSaveReview = () => {
    if (!isNotStarted) {
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const ReviewPrivacy = isDiaryPrivate ? false : (currentGame.Review?.IsPublic !== undefined ? IsPublic : true);
      const updatedReview: GameReview = {
        Text: Reviewtext,
        Gameplay: GameplayRating,
        Graphics: GraphicsRating,
        Story: StoryRating,
        Sound: SoundRating,
        Date: formattedDate,
        IsPublic: ReviewPrivacy,
      };      setIsPublic(ReviewPrivacy);
      setReviewDate(formattedDate);
      
      const averageRating = calculateRatingFromReview(updatedReview);
      
      // Singola chiamata per aggiornare sia la review che il rating
      updateGame(game.id, { 
        Review: updatedReview,
        Rating: averageRating 
      });
      
      const RatingActivity = createRatingActivity(game, averageRating);
      addActivity(RatingActivity);
      if (onReviewSave) {
        onReviewSave(updatedReview);
      }
      setSaveReviewSuccess(true);
      setTimeout(() => setSaveReviewSuccess(false), 3000);
    }
  };

  // Gestori per il cambio delle valutazioni a stelle
  const handleGameplayRatingChange = (value: number) => {
    setGameplayRating(value);
    if (saveReviewSuccess) setSaveReviewSuccess(false);
  };

  const handleGraphicsRatingChange = (value: number) => {
    setGraphicsRating(value);
    if (saveReviewSuccess) setSaveReviewSuccess(false);
  };

  const handleStoryRatingChange = (value: number) => {
    setStoryRating(value);
    if (saveReviewSuccess) setSaveReviewSuccess(false);
  };

  const handleSoundRatingChange = (value: number) => {
    setSoundRating(value);
    if (saveReviewSuccess) setSaveReviewSuccess(false);
  };

  // Handler per il click sul tab della recensione
  const handleReviewTabClick = () => {
    if (!isNotStarted) {
      setActiveTab('Review');
    }
  };

  return (
    <div className="bg-primaryBg border border-border-color rounded-xl overflow-hidden mb-8">
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
          <div>
            <textarea
              className="w-full p-4 min-h-[180px] border border-border-color rounded-lg focus:border-accent-primary focus:ring-accent-primary/30 outline-none font-secondary text-base text-text-primary resize-none"
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
              {/* Review text */}
              <textarea
                className="w-full p-4 min-h-[120px] border-b border-border-color focus:border-accent-primary focus:ring-accent-primary/30 outline-none font-secondary text-base text-text-primary resize-none"
                value={Reviewtext}
                onChange={handleReviewtextChange}
                placeholder="Scrivi qui la tua recensione..."
                disabled={isNotStarted}
              ></textarea>              {/* Toggle privacy */}
              <div className="flex items-center gap-2 px-4 py-2 bg-tertiary-bg border-t border-border-color">
                <button
                  type="button"
                  className={`flex items-center gap-2 text-sm ${
                    isDiaryPrivate
                      ? 'text-text-disabled opacity-60 cursor-not-allowed' 
                      : IsPublic 
                        ? 'text-accent-success hover:text-accent-success/80'
                        : 'text-text-secondary hover:text-accent-primary'
                  } focus:outline-none transition-colors`}
                  title={
                    isDiaryPrivate
                      ? 'Per modificare la privacy delle recensioni, rendi pubblico il tuo diario nelle impostazioni.'
                      : (IsPublic ? 'Rendi privata la recensione' : 'Rendi pubblica la recensione')                  }
                  onClick={() => {
                    if (!isNotStarted && !isDiaryPrivate) {
                      const newIsPublic = !IsPublic;
                      setIsPublic(newIsPublic);
                      
                      // Aggiorna solo la privacy della review se esiste
                      if (currentGame.Review) {
                        updateGame(game.id, { 
                          Review: { 
                            ...currentGame.Review, 
                            IsPublic: newIsPublic 
                          } 
                        });
                      }
                    }
                  }}
                  disabled={isNotStarted || isDiaryPrivate}
                >
                  {IsPublic ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                  <span>{IsPublic ? 'Pubblica' : 'Privata'}</span>
                </button>
                <span className="text-xs text-text-disabled">
                  {isDiaryPrivate
                    ? 'Privacy limitata dal diario privato'
                    : (IsPublic ? 'Visibile nella community' : 'Solo per te')
                  }
                </span>
              </div>
              
              {/* Rating categories */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-4 bg-secondaryBg">
                <div>
                  <label className="block mb-1 font-secondary font-medium text-sm text-text-secondary">
                    Gameplay
                  </label>
                  <div className="cursor-pointer">
                    <RatingStars 
                      Rating={GameplayRating} 
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
                      Rating={GraphicsRating} 
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
                      Rating={StoryRating} 
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
                      Rating={SoundRating} 
                      size="md"
                      onRatingChange={handleSoundRatingChange}
                      readOnly={isNotStarted}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex-1">
                {saveReviewSuccess ? (
                  <span className="text-accent-success text-sm font-secondary">
                    Recensione salvata con successo!
                  </span>
                ) : ReviewDate ? (
                  <span className="text-xs text-text-secondary font-secondary">
                    Recensione aggiornata il: {new Date(ReviewDate).toLocaleDateString('it-IT')}
                  </span>
                ) : null}
              </div>
              <button 
                className={`px-6 py-2 rounded-lg font-secondary font-medium text-sm flex items-center ${
                  isNotStarted 
                    ? 'bg-gray-400 text-gray-300 cursor-not-allowed' 
                    : 'bg-accent-primary text-white hover:bg-accent-primary/90 transition-colors'
                }`}
                onClick={handleSaveReview}
                disabled={isNotStarted}
              >
                <Save className="h-4 w-4 mr-2" />
                Salva recensione
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesReviewCard;
