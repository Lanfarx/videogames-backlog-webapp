// Configurazione degli URL API per diversi ambienti

export const API_CONFIG = {
  // URL base dell'API backend
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  
  // Endpoint API
  ENDPOINTS: {
    AUTH: '/api/Auth',
    PROFILE: '/api/profile',
    GAMES: '/api/games',
    ACTIVITY: '/api/activity',
    FRIENDSHIP: '/api/friendship',
    COMMUNITY: '/api/community',
    NOTIFICATION: '/api/notification',
    ACTIVITY_REACTIONS: '/api/activity-reactions',
    STEAM: '/api/steam',
    RAWG: '/api/rawg'
  }
} as const;

// Helper per costruire URL completi
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Esporta URL completi per retrocompatibilità
export const API_URLS = {
  AUTH: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH),
  PROFILE: buildApiUrl(API_CONFIG.ENDPOINTS.PROFILE),
  GAMES: buildApiUrl(API_CONFIG.ENDPOINTS.GAMES),
  ACTIVITY: buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVITY),
  FRIENDSHIP: buildApiUrl(API_CONFIG.ENDPOINTS.FRIENDSHIP),
  COMMUNITY: buildApiUrl(API_CONFIG.ENDPOINTS.COMMUNITY),
  NOTIFICATION: buildApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATION),
  ACTIVITY_REACTIONS: buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVITY_REACTIONS),
  STEAM: buildApiUrl(API_CONFIG.ENDPOINTS.STEAM),
  RAWG: buildApiUrl(API_CONFIG.ENDPOINTS.RAWG)
} as const;
