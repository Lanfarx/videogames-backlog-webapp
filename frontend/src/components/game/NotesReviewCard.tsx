import { useState, useEffect } from 'react';
import { Game, GameReview } from '../../types/game';
import { useGameById, useGameActions } from '../../store/hooks/gamesHooks';
import { calculateRatingFromReview } from '../../utils/gamesUtils';
import { PrivateNotesTab } from './notes/PrivateNotesTab';
import { PublicReviewTab } from './notes/PublicReviewTab';

interface NotesReviewCardProps {
  game: Game;
}

const NotesReviewCard = ({ game }: NotesReviewCardProps) => {    
  const [activeTab, setActiveTab] = useState<'Notes' | 'Review'>('Notes');
  const [isSavingReview, setIsSavingReview] = useState(false);
  
  const gameFromStore = useGameById(game.id);
  const currentGame = gameFromStore || game;
  
  const { update: updateGame } = useGameActions();
  
  const isNotStarted = currentGame.Status === 'NotStarted';

  useEffect(() => {
    if (isNotStarted && activeTab === 'Review' && !isSavingReview) {
      setActiveTab('Notes');
    }
  }, [isNotStarted, activeTab, isSavingReview]);

  const handleSaveNotes = (notes: string) => {
    updateGame(game.id, { Notes: notes });
  };

  const handleSaveReview = (review: GameReview) => {
    setIsSavingReview(true);
    const averageRating = calculateRatingFromReview(review);
    
    updateGame(game.id, { 
      Review: review,
      Rating: averageRating 
    });
    
    setActiveTab('Review');        
    setTimeout(() => {
      setIsSavingReview(false);
    }, 3000);
  };

  const handlePrivacyToggle = (isPublic: boolean) => {
    updateGame(game.id, { 
      Review: { IsPublic: isPublic }
    });
  };

  const handleReviewTabClick = () => {
    if (!isNotStarted) {
      setActiveTab('Review');
    }
  };

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl overflow-hidden mb-8">
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

      <div className="p-6">
        {activeTab === 'Notes' ? (
          <PrivateNotesTab 
            initialNotes={currentGame.Notes || ''}
            isNotStarted={isNotStarted}
            onSave={handleSaveNotes}
          />
        ) : (
          <PublicReviewTab 
            initialReview={currentGame.Review}
            isNotStarted={isNotStarted}
            onSave={handleSaveReview}
            onPrivacyToggle={handlePrivacyToggle}
          />
        )}
      </div>
    </div>
  );
};

export default NotesReviewCard;
