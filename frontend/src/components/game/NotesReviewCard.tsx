import { useState, useEffect } from 'react';
import RatingStars from '../ui/atoms/RatingStars';
import { Save, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Game, GameReview } from '../../types/game';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateGameReview, updateGameRating, updateGameNotes } from '../../store/slice/gamesSlice';
import { useGameById } from '../../store/hooks/gamesHooks';
import { useAllActivitiesActions } from '../../store/hooks/activitiesHooks';
import { calculateRatingFromReview } from '../../utils/gamesUtils';
import { createRatingActivity } from '../../utils/activityUtils';

interface NotesReviewCardProps {
  game: Game;
  onNotesChange?: (notes: string) => void;
  onReviewSave?: (review: GameReview) => void;
}

const NotesReviewCard = ({ game, onNotesChange, onReviewSave }: NotesReviewCardProps) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'review'>('notes');
  const [notesValue, setNotesValue] = useState(game.notes || '');
  const [saveNotesSuccess, setSaveNotesSuccess] = useState(false);
  const [saveReviewSuccess, setSaveReviewSuccess] = useState(false);
  
  // Stati per la recensione
  const [reviewText, setReviewText] = useState('');
  const [gameplayRating, setGameplayRating] = useState(0);
  const [graphicsRating, setGraphicsRating] = useState(0);
  const [storyRating, setStoryRating] = useState(0);
  const [soundRating, setSoundRating] = useState(0);
  const [reviewDate, setReviewDate] = useState('');

  // Ottieni il gioco aggiornato dallo stato globale Redux tramite hook custom
  const gameFromStore = useGameById(game.id);
  const currentGame = gameFromStore || game;
  // Stato per la privacy della recensione - sincronizzato con le impostazioni profilo
  const [isPublic, setIsPublic] = useState(currentGame.review?.isPublic ?? false);
  // Usa Redux per la privacy
  const userProfile = useAppSelector(state => state.user.profile);
  const isProfilePrivate = userProfile?.privacySettings?.isPrivate ?? false;
  const isDiaryPrivate = userProfile?.privacySettings?.showDiary === false;

  const dispatch = useAppDispatch();
  const { addActivity } = useAllActivitiesActions();
  // Forza la privacy a privata se il diario è privato
  useEffect(() => {
    if (isDiaryPrivate) {
      setIsPublic(false);
    } else if (!currentGame.review || currentGame.review.isPublic === undefined) {
      // Solo quando si crea una nuova recensione senza privacy già impostata
      setIsPublic(true);
    } else {
      setIsPublic(currentGame.review.isPublic);
    }
  }, [isDiaryPrivate, currentGame.review]);

  // Verifica se il gioco è "da iniziare" (non permette recensioni)
  const isNotStarted = currentGame.status === 'not-started';

  // Se il gioco è "da iniziare" e l'utente è nella scheda recensione, forza il cambio alla scheda note
  useEffect(() => {
    if (isNotStarted && activeTab === 'review') {
      setActiveTab('notes');
    }
  }, [isNotStarted, activeTab]);

  // Carica i dati della recensione dal gioco quando disponibili
  useEffect(() => {
    if (currentGame.review) {
      setReviewText(currentGame.review.text);
      setGameplayRating(currentGame.review.gameplay);
      setGraphicsRating(currentGame.review.graphics);
      setStoryRating(currentGame.review.story);
      setSoundRating(currentGame.review.sound);
      setReviewDate(currentGame.review.date);
    }
    setNotesValue(currentGame.notes || '');  }, [currentGame]);

  // Aggiorna anche lo stato del toggle quando cambia la review
  useEffect(() => {
    setIsPublic(currentGame.review?.isPublic ?? false);
  }, [currentGame.review]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotesValue(e.target.value);
    // Reset del messaggio di successo quando l'utente inizia a modificare
    if (saveNotesSuccess) setSaveNotesSuccess(false);
  };

  const handleReviewTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewText(e.target.value);
    // Reset del messaggio di successo quando l'utente inizia a modificare
    if (saveReviewSuccess) setSaveReviewSuccess(false);
  };

  const handleSaveNotes = () => {
    dispatch(updateGameNotes({ gameId: game.id, notes: notesValue }));
    if (onNotesChange) {
      onNotesChange(notesValue);
    }
    // Mostra messaggio di successo per 3 secondi
    setSaveNotesSuccess(true);
    setTimeout(() => setSaveNotesSuccess(false), 3000);
  };
  // Nel salvataggio della recensione, forza isPublic a false se diario privato
  const handleSaveReview = () => {
    if (!isNotStarted) {
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      const reviewPrivacy = isDiaryPrivate ? false : (currentGame.review?.isPublic !== undefined ? isPublic : true);
      const updatedReview: GameReview = {
        text: reviewText,
        gameplay: gameplayRating,
        graphics: graphicsRating,
        story: storyRating,
        sound: soundRating,
        date: formattedDate,
        isPublic: reviewPrivacy,
      };
      setIsPublic(reviewPrivacy);
      setReviewDate(formattedDate);
      dispatch(updateGameReview({ gameId: game.id, review: updatedReview }));
      const averageRating = calculateRatingFromReview(updatedReview);
      dispatch(updateGameRating({ gameId: game.id, rating: averageRating }));
      const ratingActivity = createRatingActivity(game, averageRating);
      addActivity(ratingActivity);
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
      setActiveTab('review');
    }
  };

  return (
    <div className="bg-primaryBg border border-border-color rounded-xl overflow-hidden mb-8">
      {/* Tab header */}
      <div className="flex text-center border-b border-border-color">
        <button
          className={`flex-1 py-4 font-primary font-semibold ${
            activeTab === 'notes' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-secondary'
          }`}
          onClick={() => setActiveTab('notes')}
        >
          Note
        </button>
        <button
          className={`flex-1 py-4 font-primary font-semibold ${
            activeTab === 'review' 
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
        {activeTab === 'notes' ? (
          <div>
            <textarea
              className="w-full p-4 min-h-[180px] border border-border-color rounded-lg focus:border-accent-primary focus:ring-accent-primary/30 outline-none font-secondary text-base text-text-primary resize-none"
              placeholder="Aggiungi le tue note private per questo gioco..."
              value={notesValue}
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
                value={reviewText}
                onChange={handleReviewTextChange}
                placeholder="Scrivi qui la tua recensione..."
                disabled={isNotStarted}
              ></textarea>              {/* Toggle privacy */}
              <div className="flex items-center gap-2 px-4 py-2 bg-tertiary-bg border-t border-border-color">
                <button
                  type="button"
                  className={`flex items-center gap-2 text-sm ${
                    isDiaryPrivate
                      ? 'text-text-disabled opacity-60 cursor-not-allowed' 
                      : isPublic 
                        ? 'text-accent-success hover:text-accent-success/80'
                        : 'text-text-secondary hover:text-accent-primary'
                  } focus:outline-none transition-colors`}
                  title={
                    isDiaryPrivate
                      ? 'Per modificare la privacy delle recensioni, rendi pubblico il tuo diario nelle impostazioni.'
                      : (isPublic ? 'Rendi privata la recensione' : 'Rendi pubblica la recensione')
                  }
                  onClick={() => {
                    if (!isNotStarted && !isDiaryPrivate) {
                      setIsPublic(!isPublic);
                      dispatch({
                        type: 'games/updateReviewPrivacy',
                        payload: { gameId: game.id, isPublic: !isPublic }
                      });
                    }
                  }}
                  disabled={isNotStarted || isDiaryPrivate}
                >
                  {isPublic ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                  <span>{isPublic ? 'Pubblica' : 'Privata'}</span>
                </button>
                <span className="text-xs text-text-disabled">
                  {isDiaryPrivate
                    ? 'Privacy limitata dal diario privato'
                    : (isPublic ? 'Visibile nella community' : 'Solo per te')
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
                      rating={gameplayRating} 
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
                      rating={graphicsRating} 
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
                      rating={storyRating} 
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
                      rating={soundRating} 
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
                ) : reviewDate ? (
                  <span className="text-xs text-text-secondary font-secondary">
                    Recensione aggiornata il: {new Date(reviewDate).toLocaleDateString('it-IT')}
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
