import React, { useState } from 'react';
import { Star, Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RatingStars from '../../ui/atoms/RatingStars';
import ReviewCommentsSection from './ReviewCommentsSection';
import { CommunityReviewDto } from '../../../types/community';
import { usePublicCommunityReviews, useReviewStats } from '../../../store/hooks/communityHooks';

const CommunityReviewsSection: React.FC<{ GameTitle: string }> = ({ GameTitle }) => {
  const [sortBy, setSortBy] = useState<'newest' | 'rating'>('newest');
  const [showAllReviews, setShowAllReviews] = useState(false);
  const navigate = useNavigate();
  
  // Usa il nuovo hook di React Query per le recensioni visualizzate (senza quella dell'utente corrente)
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = usePublicCommunityReviews(GameTitle, 1, 50);
  const reviews = reviewsData?.reviews || [];
  
  // Usa il hook per le statistiche complete (inclusa la recensione dell'utente corrente)
  const { data: reviewStats, isLoading: statsLoading, error: statsError } = useReviewStats(GameTitle);
  
  // Usa le statistiche dal backend per i dati aggregati corretti
  const totalReviews = reviewStats?.totalReviews || 0;
  const averageRating = reviewStats?.overallAverageRating || 0;
  
  // Per le recensioni visualizzate, usa i dati filtrati dal backend
  const validReviews = reviews.filter((r: CommunityReviewDto) => typeof r.overallRating === 'number' && !isNaN(r.overallRating));
  const sortedReviews = [...validReviews].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.overallRating - a.overallRating;
      case 'newest':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
  });

  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3);  const getRatingDistribution = () => {
    // Se abbiamo le statistiche dal backend, usa quelle per la distribuzione
    if (reviewStats?.ratingDistribution) {
      // Converte il Dictionary dal backend nel formato atteso dal frontend
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      Object.entries(reviewStats.ratingDistribution).forEach(([rating, count]) => {
        const ratingNum = parseInt(rating);
        if (ratingNum >= 1 && ratingNum <= 5) {
          distribution[ratingNum as keyof typeof distribution] = count;
        }
      });
      return distribution;
    }
    
    // Fallback: calcola dalla lista di recensioni visualizzate
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    validReviews.forEach((review: CommunityReviewDto) => {
      const rounded = Math.round(review.overallRating);
      if (rounded >= 1 && rounded <= 5) {
        distribution[rounded as keyof typeof distribution]++;
      }
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  
  const isLoading = reviewsLoading || statsLoading;
  const error = reviewsError || statsError;

  if (isLoading) {
    return (
      <div className="bg-primary-bg border border-border-color rounded-xl p-6">
        <div className="text-center text-text-secondary py-8">
          Caricamento recensioni...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-primary-bg border border-border-color rounded-xl p-6">
        <div className="text-center text-red-500 py-8">
          Errore nel caricamento delle recensioni
        </div>
      </div>
    );
  }

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
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'rating')}
            className="bg-secondary-bg border border-border-color rounded-lg px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="newest">Più recenti</option>
            <option value="rating">Valutazione</option>
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
                  const count = ratingDistribution[stars as keyof typeof ratingDistribution];
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  
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
            {displayedReviews.map(review => (              <div key={review.id} className="border border-border-color rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-primary text-white rounded-full flex items-center justify-center font-medium overflow-hidden">
                      {review.avatar ? (
                        <img 
                          src={review.avatar} 
                          alt={`Avatar di ${review.username}`}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        review.username.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div 
                        className="font-medium text-text-primary cursor-pointer hover:underline hover:text-accent-primary transition-colors"
                        onClick={() => navigate(`/profile/${review.username}`)}
                        title={`Vai al profilo di ${review.username}`}
                      >
                        {review.username}
                      </div><div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar className="h-3 w-3" />
                        {new Date(review.date).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                  </div>
                  <RatingStars Rating={review.overallRating} showValue={false} size="sm" readOnly />
                </div>                {review.text && (
                  <p className="text-text-secondary mb-3 leading-relaxed">{review.text}</p>
                )}
                
                {/* Detailed Ratings */}
                <div className="flex flex-wrap gap-4 text-sm text-text-secondary mb-3">
                  <span>Gameplay: <strong className="text-text-primary">{review.gameplay}</strong></span>
                  <span>Grafica: <strong className="text-text-primary">{review.graphics}</strong></span>
                  <span>Storia: <strong className="text-text-primary">{review.story}</strong></span>
                  <span>Audio: <strong className="text-text-primary">{review.sound}</strong></span>
                </div>

                {/* Comments Section */}
                <ReviewCommentsSection 
                  reviewGameId={review.id} 
                  commentsCount={review.commentsCount || 0} 
                />
              </div>
            ))}
          </div>

          {/* Show More Button */}
          {reviews.length > 3 && (
            <button 
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full mt-4 py-2 border border-border-color rounded-lg text-accent-primary hover:bg-secondary-bg transition-colors"
            >
              {showAllReviews ? 'Mostra meno' : `Mostra tutte le ${reviews.length} recensioni`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CommunityReviewsSection;
