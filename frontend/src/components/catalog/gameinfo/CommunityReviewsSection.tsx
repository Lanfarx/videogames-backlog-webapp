import React, { useState } from 'react';
import { Star, Calendar, Filter } from 'lucide-react';
import RatingStars from '../../ui/atoms/RatingStars';
import { CommunityReview } from '../../../store/slice/communitySlice';
import { useCommunityReviewsByGame } from '../../../store/hooks/communityHooks';

const CommunityReviewsSection: React.FC<{ GameTitle: string }> = ({ GameTitle }) => {
  const [sortBy, setSortBy] = useState<'newest' | 'Rating'>('newest');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const Reviews = useCommunityReviewsByGame(GameTitle) || [];
  const totalReviews = Reviews.length; // conteggio TOTALE recensioni
  const validReviews = Reviews.filter(r => typeof r.Rating === 'number' && !isNaN(r.Rating));
  const averageRating = validReviews.length > 0 ? validReviews.reduce((sum, r) => sum + r.Rating, 0) / validReviews.length : 0;

  const sortedReviews = [...validReviews].sort((a, b) => {
    switch (sortBy) {
      case 'Rating':
        return b.Rating - a.Rating;
      case 'newest':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const disPlayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    validReviews.forEach(Review => {
      const rounded = Math.round(Review.Rating);
      distribution[rounded as keyof typeof distribution]++;
    });
    return distribution;
  };

  const RatingDistribution = getRatingDistribution();

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-primary font-semibold text-xl text-text-primary">
          Recensioni della Community
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-secondary" />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-secondary-bg border border-border-color rounded-lg px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="newest">Più recenti</option>
            <option value="Rating">Valutazione</option>
          </select>
        </div>
      </div>

      {totalReviews === 0 ? (
        <div className="text-center text-text-secondary py-8">
          Nessuna recensione disponibile per questo gioco.
        </div>
      ) : (
        <>
          {/* Rating Overview */}
          <div className="bg-secondary-bg p-4 rounded-lg mb-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-text-primary mb-1">{averageRating.toFixed(1)}</div>
                <RatingStars Rating={averageRating} showValue={false} size="md" readOnly />
                <div className="text-sm text-text-secondary mt-1">{totalReviews} recensioni</div>
              </div>
              
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = RatingDistribution[stars as keyof typeof RatingDistribution];
                  const percentage = validReviews.length > 0 ? (count / validReviews.length) * 100 : 0;
                  
                  return (
                    <div key={stars} className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-text-secondary w-3">{stars}</span>
                      <Star className="h-3 w-3 text-accent-secondary fill-current" />
                      <div className="flex-1 bg-tertiary-bg rounded-full h-2">
                        <div 
                          className="bg-accent-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {disPlayedReviews.map(Review => (
              <div key={Review.id} className="border border-border-color rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-primary text-white rounded-full flex items-center justify-center font-medium">
                      {Review.UserName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-text-primary">{Review.UserName}</div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar className="h-3 w-3" />
                        {new Date(Review.date).toLocaleDateString('it-IT')}
                        <span>•</span>
                        <span>{Review.Platform}</span>
                      </div>
                    </div>
                  </div>
                  <RatingStars Rating={Review.Rating} showValue={false} size="sm" readOnly />
                </div>

                <h4 className="font-medium text-text-primary mb-2">{Review.UserName}</h4>
                <p className="text-text-secondary mb-3 leading-relaxed">{Review.text}</p>            {/* Detailed Ratings */}
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-3">
                  <span>Gameplay: <strong className="text-text-primary">{Review.Gameplay}</strong></span>
                  <span>Grafica: <strong className="text-text-primary">{Review.Graphics}</strong></span>
                  <span>Storia: <strong className="text-text-primary">{Review.Story}</strong></span>
                  <span>Audio: <strong className="text-text-primary">{Review.Sound}</strong></span>
                </div>
              </div>
            ))}
          </div>      {/* Show More Button */}
          {Reviews.length > 3 && (
            <button 
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full mt-4 py-2 border border-border-color rounded-lg text-accent-primary hover:bg-secondary-bg transition-colors"
            >
              {showAllReviews ? 'Mostra meno' : `Mostra tutte le ${Reviews.length} recensioni`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CommunityReviewsSection;
