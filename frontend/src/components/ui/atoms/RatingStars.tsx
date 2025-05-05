import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RatingStars = ({ rating, showValue = true, size = 'md' }: RatingStarsProps) => {
  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };

  const starSize = getStarSize();

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <Star className={starSize} style={{ color: '#FFCC3F', fill: '#FFCC3F' }} />
          ) : star - 0.5 <= rating ? (
            <StarHalf className={starSize} style={{ color: '#FFCC3F', fill: '#FFCC3F' }} />
          ) : (
            <Star className={starSize} style={{ color: '#CCCCCC' }} />
          )}
        </span>
      ))}
      {showValue && (
        <span className="ml-2 text-text-primary font-secondary text-sm">{rating}/5</span>
      )}
    </div>
  );
};

export default RatingStars;
