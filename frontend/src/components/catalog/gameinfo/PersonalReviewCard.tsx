import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateReviewPrivacy } from '../../../store/slice/gamesSlice';
import { useGameByTitle } from '../../../store/hooks/gamesHooks';
import { selectIsProfilePrivate, selectIsDiaryPrivate } from '../../../store/slice/settingsSlice';

interface PersonalReview {
  text: string;
  gameplay: number;
  graphics: number;
  story: number;
  sound: number;
  date: string;
  isPublic?: boolean;
  title: string;
}

interface PersonalReviewCardProps {
  personalReview: PersonalReview;
}

const PersonalReviewCard: React.FC<PersonalReviewCardProps> = ({ personalReview }) => {
  const dispatch = useAppDispatch();
  const game = useGameByTitle(personalReview.title);
  const isPublic = game?.review?.isPublic ?? false;
  const isDiaryPrivate = useAppSelector(selectIsDiaryPrivate);

  // Forza la privacy a privata se il diario è privato
  const effectiveIsPublic = isDiaryPrivate ? false : isPublic;

  return (
    <div className="bg-secondary-bg p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-text-primary">La tua recensione</h3>
        {game?.review && (
          <button
            type="button"
            className={`flex items-center gap-2 text-sm ${
              isDiaryPrivate 
                ? 'opacity-60 cursor-not-allowed text-text-disabled' 
                : effectiveIsPublic 
                  ? 'text-accent-success hover:text-accent-success/80'
                  : 'text-text-secondary hover:text-accent-primary'
            } focus:outline-none`}
            title={
              isDiaryPrivate 
                ? 'Per modificare la privacy delle recensioni, rendi pubblico il tuo diario nelle impostazioni.' 
                : (effectiveIsPublic ? 'Rendi privata la recensione' : 'Rendi pubblica la recensione')
            }
            onClick={() => {
              if (game && game.review && !isDiaryPrivate) {
                dispatch(updateReviewPrivacy({ gameId: game.id, isPublic: !effectiveIsPublic }));
              }
            }}
            disabled={isDiaryPrivate}
          >
            {effectiveIsPublic ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
            <span className="text-xs">{effectiveIsPublic ? 'Pubblica' : 'Privata'}</span>
          </button>
        )}
      </div>
      <div className="mb-4 text-base text-text-primary leading-relaxed">{personalReview.text}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-text-secondary">Gameplay</div>
          <div className="font-bold text-text-primary">{personalReview.gameplay}</div>
        </div>
        <div className="text-center">
          <div className="text-text-secondary">Grafica</div>
          <div className="font-bold text-text-primary">{personalReview.graphics}</div>
        </div>
        <div className="text-center">
          <div className="text-text-secondary">Storia</div>
          <div className="font-bold text-text-primary">{personalReview.story}</div>
        </div>
        <div className="text-center">
          <div className="text-text-secondary">Audio</div>
          <div className="font-bold text-text-primary">{personalReview.sound}</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-text-secondary">
        Recensito il {new Date(personalReview.date).toLocaleDateString('it-IT')}
      </div>
    </div>
  );
};

export default PersonalReviewCard;
