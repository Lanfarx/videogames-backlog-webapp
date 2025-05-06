import { useState, useEffect } from 'react';
import RatingStars from '../ui/atoms/RatingStars';
import { Save } from 'lucide-react';
import { Game, GameReview } from '../../types/game';

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

  // Carica i dati della recensione dal gioco quando disponibili
  useEffect(() => {
    if (game.review) {
      setReviewText(game.review.text);
      setGameplayRating(game.review.gameplay);
      setGraphicsRating(game.review.graphics);
      setStoryRating(game.review.story);
      setSoundRating(game.review.sound);
      setReviewDate(game.review.date);
    }
    setNotesValue(game.notes || '');
  }, [game]);

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
    if (onNotesChange) {
      onNotesChange(notesValue);
      // Mostra messaggio di successo per 3 secondi
      setSaveNotesSuccess(true);
      setTimeout(() => setSaveNotesSuccess(false), 3000);
    }
  };

  const handleSaveReview = () => {
    if (onReviewSave) {
      const now = new Date();
      const formattedDate = now.toISOString().split('T')[0];
      
      const updatedReview: GameReview = {
        text: reviewText,
        gameplay: gameplayRating,
        graphics: graphicsRating,
        story: storyRating,
        sound: soundRating,
        date: formattedDate
      };
      
      // Aggiorna anche lo stato locale della data
      setReviewDate(formattedDate);
      
      onReviewSave(updatedReview);
      // Mostra messaggio di successo per 3 secondi
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
            activeTab === 'review' ? 'border-b-2 border-accent-primary text-accent-primary' : 'text-text-secondary'
          }`}
          onClick={() => setActiveTab('review')}
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
              ></textarea>
              
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
                className="px-6 py-2 bg-accent-primary text-white rounded-lg font-secondary font-medium text-sm hover:bg-accent-primary/90 transition-colors flex items-center"
                onClick={handleSaveReview}
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
