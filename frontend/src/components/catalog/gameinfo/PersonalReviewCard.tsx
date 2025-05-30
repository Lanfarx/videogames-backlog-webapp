import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateReviewPrivacy } from '../../../store/slice/gamesSlice';
import { useGameByTitle } from '../../../store/hooks/gamesHooks';

interface PersonalReview {
  Text: string;
  Gameplay: number;
  Graphics: number;
  Story: number;
  Sound: number;
  Date: string;
  IsPublic?: boolean;
  title: string;
}

interface PersonalReviewCardProps {
  personalReview: PersonalReview;
}

const PersonalReviewCard: React.FC<PersonalReviewCardProps> = ({ personalReview }) => {
  const dispatch = useAppDispatch();
  const game = useGameByTitle(personalReview.title);
  const IsPublic = game?.Review?.IsPublic ?? false;
  const userProfile = useAppSelector(state => state.user.profile);
  const isDiaryPrivate = userProfile?.privacySettings?.showDiary === false;
  // Forza la privacy a privata se il diario è privato
  const effectiveIsPublic = isDiaryPrivate ? false : IsPublic;

  return (
    <div className="bg-secondary-bg p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-text-primary">La tua recensione</h3>
        {game?.Review && (
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
              if (game && game.Review && !isDiaryPrivate) {
                dispatch(updateReviewPrivacy({ gameId: game.id, IsPublic: !effectiveIsPublic }));
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
      <div className="mb-4 text-base text-text-primary leading-relaxed">{personalReview.Text}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-text-secondary">Gameplay</div>
          <div className="font-bold text-text-primary">{personalReview.Gameplay}</div>
        </div>
        <div className="text-center">
          <div className="text-text-secondary">Grafica</div>
          <div className="font-bold text-text-primary">{personalReview.Graphics}</div>
        </div>
        <div className="text-center">
          <div className="text-text-secondary">Storia</div>
          <div className="font-bold text-text-primary">{personalReview.Story}</div>
        </div>
        <div className="text-center">
          <div className="text-text-secondary">Audio</div>
          <div className="font-bold text-text-primary">{personalReview.Sound}</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-text-secondary">
        Recensito il {new Date(personalReview.Date).toLocaleDateString('it-IT')}
      </div>
    </div>
  );
};

export default PersonalReviewCard;
