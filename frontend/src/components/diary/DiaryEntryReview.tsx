import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import RatingStars from '../ui/atoms/RatingStars';
import { calculateRatingFromReview } from '../../utils/gamesUtils';
import { Review } from '../../types/game';

interface DiaryEntryReviewProps {
  review: Review;
}

export function DiaryEntryReview({ review }: DiaryEntryReviewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-secondary-bg p-3 rounded-lg mt-2">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-text-primary">Recensione</span>
        </div>
        <RatingStars Rating={calculateRatingFromReview(review)} />
      </div>
      <p className={`text-xs text-text-secondary ${!expanded ? 'line-clamp-2' : ''}`}>
        {review.Text}
      </p>
      {review.Text && review.Text.length > 100 ? (
        <button 
          className="flex items-center text-xs text-accent-primary mt-1 hover:underline"
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3 mr-1" />
              Mostra meno
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3 mr-1" />
              Mostra tutto
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}
