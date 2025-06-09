// Tipi per le API della community che corrispondono ai DTO del backend

export interface CommunityStatsDto {
  totalPlayers: number;
  averageRating: number;
  totalReviews: number;
  averagePlaytime: number;
  completionRate: number;
  currentlyPlaying: number;
}

export interface CommunityRatingDto {
  rating: number;
  reviewCount: number;
}

export interface CommunityReviewDto {
  id: number;
  gameTitle: string;
  userId: number;
  username: string;
  avatar?: string;
  text: string;
  gameplay: number;
  graphics: number;
  story: number;
  sound: number;
  overallRating: number;
  date: string;
  helpfulVotes: number;
  comments: ReviewCommentDto[];
  commentsCount: number;
}

export interface PaginatedReviewsDto {
  reviews: CommunityReviewDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AspectStatsDto {
  average: number;
  min: number;
  max: number;
  distribution: Record<number, number>;
}

export interface ReviewStatsDto {
  gameTitle: string;
  totalReviews: number;
  averageGameplay: number;
  averageGraphics: number;
  averageStory: number;
  averageSound: number;
  overallAverageRating: number;
  ratingDistribution: Record<number, number>;
  gameplayStats: AspectStatsDto;
  graphicsStats: AspectStatsDto;
  storyStats: AspectStatsDto;
  soundStats: AspectStatsDto;
}

// Tipo per le richieste di rating multipli
export interface CommunityRatingsRequest {
  gameTitles: string[];
}

export interface CommunityRatingsResponse {
  [gameTitle: string]: number;
}

export interface CommunityRatingsWithCountResponse {
  [gameTitle: string]: CommunityRatingDto;
}

// Tipi per le richieste di creazione recensioni
export interface CreateReviewRequest {
  gameTitle: string;
  text: string;
  gameplay: number;
  graphics: number;
  story: number;
  sound: number;
  overallRating: number;
  isPublic: boolean;
}

// Tipi per i commenti alle recensioni
export interface ReviewCommentDto {
  id: number;
  text: string;
  date: string;
  authorId: number;
  authorUsername: string;
  authorAvatar?: string;
  reviewGameId: number;
}

export interface CreateReviewCommentDto {
  text: string;
  reviewGameId: number;
}
