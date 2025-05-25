import { Star, StarHalf } from 'lucide-react';
import { useState, useRef } from 'react';

interface RatingStarsProps {
  rating: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean; // Aggiungiamo la proprietà readOnly
}

const RatingStars = ({ rating, showValue = true, size = 'md', onRatingChange, readOnly = false }: RatingStarsProps) => {
  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const starRefs = useRef<(HTMLSpanElement | null)[]>([null, null, null, null, null]);

  const starSize = getStarSize();
  // Un componente è interattivo solo se ha un gestore onRatingChange E non è readOnly
  const isInteractive = !!onRatingChange && !readOnly;

  const handleClick = (event: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
    if (!isInteractive || !onRatingChange) return;

    const starElement = starRefs.current[starIndex - 1];
    if (!starElement) return;

    const rect = starElement.getBoundingClientRect();
    const starWidth = rect.width;
    const offsetX = event.clientX - rect.left;

    let newRating: number;

    if (offsetX < starWidth / 2) {
      newRating = starIndex - 0.5;
    } else {
      newRating = starIndex;
    }

    if (newRating === rating) {
      onRatingChange(0);
    } else {
      onRatingChange(newRating);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>, starIndex: number) => {
    if (!isInteractive || !onRatingChange) return;

    const starElement = starRefs.current[starIndex - 1];
    if (!starElement) return;

    const rect = starElement.getBoundingClientRect();
    const starWidth = rect.width;
    const offsetX = event.clientX - rect.left;

    if (offsetX < starWidth / 2) {
      setHoverRating(starIndex - 0.5);
    } else {
      setHoverRating(starIndex);
    }
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setHoverRating(null);
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="flex items-center" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          ref={el => { starRefs.current[star - 1] = el; }}
          className={`${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={(e) => handleClick(e, star)}
          onMouseMove={(e) => handleMouseMove(e, star)}
        >
          {star <= displayRating ? (
            <Star 
              className={starSize} 
              style={{ color: 'rgb(var(--accent-secondary))', fill: 'rgb(var(--accent-secondary))' }} 
            />
          ) : star - 0.5 <= displayRating ? (
            <StarHalf 
              className={starSize} 
              style={{ color: 'rgb(var(--accent-secondary))', fill: 'rgb(var(--accent-secondary))' }} 
            />
          ) : (
            <Star 
              className={starSize} 
              style={{ color: 'rgb(var(--text-disabled))' }} 
            />
          )}
        </span>
      ))}
      {showValue && (
        <span className="ml-2 text-text-primary font-secondary text-sm">
          {displayRating !== null ? displayRating : rating}/5
        </span>
      )}
    </div>
  );
};

export default RatingStars;
