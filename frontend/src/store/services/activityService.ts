import axios from 'axios';
import { Activity, ActivityFilters, ActivityType, ActivityWithReactions } from '../../types/activity';
import { getToken } from '../../utils/getToken';
import { API_CONFIG, buildApiUrl } from '../../config/api';

const API_URL = buildApiUrl(API_CONFIG.ENDPOINTS.ACTIVITY);

// Istanza axios che aggiunge il token JWT se presente
const apiClient = axios.create();
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Tipi DTO per il backend (con valori numerici enum)
interface CreateActivityDtoApi {
  type: number;
  GameId: number;
  AdditionalInfo?: string;
}

interface UpdateActivityDtoApi {
  type?: number;
  AdditionalInfo?: string;
}

// Tipi DTO per il frontend (con stringhe ActivityType)
export interface CreateActivityDto {
  type: ActivityType;
  GameId: number;
  AdditionalInfo?: string;
}

export interface UpdateActivityDto {
  type?: ActivityType;
  AdditionalInfo?: string;
}

export interface ActivityFiltersDto {
  types?: ActivityType[]; // Il frontend usa stringhe ActivityType
  year?: number;
  month?: number;
  GameId?: number;
  limit?: number;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedActivitiesDto {
  activities: Activity[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Mapping da valori numerici enum backend a stringhe frontend
function mapActivityTypeFromApi(backendType: number): ActivityType {
  switch (backendType) {
    case 0: return 'Played';
    case 1: return 'Completed';
    case 2: return 'Added';
    case 3: return 'Rated';
    case 4: return 'Platinum';
    case 5: return 'Abandoned';
    default: return 'Played'; // Fallback
  }
}

// Mapping da stringhe frontend a valori numerici enum backend
function mapActivityTypeToApi(frontendType: ActivityType): number {
  switch (frontendType) {
    case 'Played': return 0;
    case 'Completed': return 1;
    case 'Added': return 2;
    case 'Rated': return 3;
    case 'Platinum': return 4;
    case 'Abandoned': return 5;
    default: return 0; // Fallback
  }
}

// Mappatura da API response a tipo frontend
function mapActivityFromApi(apiActivity: any): Activity {
  return {
    id: apiActivity.id,
    type: mapActivityTypeFromApi(apiActivity.type),
    gameId: apiActivity.gameId,
    gameTitle: apiActivity.gameTitle,
    timestamp: apiActivity.timestamp, // Mantieni come stringa per la serializzazione Redux
    additionalInfo: apiActivity.additionalInfo,
    gameImageUrl: apiActivity.gameImageUrl
  };
}

// Funzioni API

export const getActivities = async (
  filters: ActivityFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedActivitiesDto> => {
  const params: any = { page, pageSize };
  
  // Mappa i filtri frontend sul formato del DTO backend
  if (filters.Types?.length) {
    // Converti i tipi stringa in numeri per il backend
    const numericTypes = filters.Types.map(mapActivityTypeToApi);
    // Per ASP.NET Core model binding, inviamo gli array come: Types[0]=value1&Types[1]=value2
    numericTypes.forEach((type, index) => {
      params[`Types[${index}]`] = type;
    });
  }
  if (filters.Year !== undefined) params.Year = filters.Year;
  if (filters.Month !== undefined) params.Month = filters.Month;
  if (filters.GameId !== undefined) params.GameId = filters.GameId;
  if (filters.Limit !== undefined) params.Limit = filters.Limit;
  if (filters.SortDirection !== undefined) params.SortDirection = filters.SortDirection;

  const res = await apiClient.get(API_URL, { params });
  
  return {
    activities: res.data.activities.map(mapActivityFromApi),
    totalCount: res.data.totalCount,
    pageSize: res.data.pageSize,
    currentPage: res.data.currentPage,
    totalPages: res.data.totalPages
  };
};

export const getActivityById = async (id: number): Promise<Activity> => {
  const res = await apiClient.get(`${API_URL}/${id}`);
  return mapActivityFromApi(res.data);
};

export const createActivity = async (activity: CreateActivityDto): Promise<Activity> => {
  const apiActivity: CreateActivityDtoApi = {
    type: mapActivityTypeToApi(activity.type),
    GameId: activity.GameId,
    AdditionalInfo: activity.AdditionalInfo
  };
  const res = await apiClient.post(API_URL, apiActivity);
  return mapActivityFromApi(res.data);
};

export const updateActivity = async (id: number, activity: UpdateActivityDto): Promise<Activity> => {
  const apiActivity: UpdateActivityDtoApi = {
    type: activity.type ? mapActivityTypeToApi(activity.type) : undefined,
    AdditionalInfo: activity.AdditionalInfo
  };
  const res = await apiClient.put(`${API_URL}/${id}`, apiActivity);
  return mapActivityFromApi(res.data);
};

export const deleteActivity = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_URL}/${id}`);
};

export const getRecentActivities = async (count: number = 10): Promise<Activity[]> => {
  const res = await apiClient.get(`${API_URL}/recent`, { params: { count } });
  return res.data.map(mapActivityFromApi);
};

export const getActivitiesByGame = async (GameId: number): Promise<Activity[]> => {
  const res = await apiClient.get(`${API_URL}/game/${GameId}`);
  return res.data.map(mapActivityFromApi);
};

export const getActivityStats = async (year?: number): Promise<Record<string, number>> => {
  const params = year ? { year } : {};
  const res = await apiClient.get(`${API_URL}/stats`, { params });
  return res.data;
};

export const getPublicActivities = async (
  userIdOrUsername: string,
  filters: ActivityFiltersDto = {},
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedActivitiesDto> => {
  const params: any = { page, pageSize };
  
  // Converti i filtri di tipo da stringa a numero per il backend
  if (filters.types?.length) {
    const numericTypes = filters.types.map(mapActivityTypeToApi);
    numericTypes.forEach((type, index) => {
      params[`Types[${index}]`] = type;
    });
  }
  
  // Aggiungi altri filtri se presenti
  if (filters.year !== undefined) params.Year = filters.year;
  if (filters.month !== undefined) params.Month = filters.month;
  if (filters.GameId !== undefined) params.GameId = filters.GameId;
  if (filters.limit !== undefined) params.Limit = filters.limit;
  if (filters.sortDirection !== undefined) params.SortDirection = filters.sortDirection;
  
  const res = await apiClient.get(`${API_URL}/public/${userIdOrUsername}`, { params });
  
  return {
    activities: res.data.activities.map(mapActivityFromApi),
    totalCount: res.data.totalCount,
    pageSize: res.data.pageSize,
    currentPage: res.data.page,
    totalPages: res.data.totalPages
  };
};

/**
 * Mappatura da API response a ActivityWithReactions frontend
 */
function mapActivityWithReactionsFromApi(apiActivity: any): ActivityWithReactions {
  return {
    id: apiActivity.id,
    type: mapActivityTypeFromApi(apiActivity.type),
    gameId: apiActivity.gameId,
    gameTitle: apiActivity.gameTitle,
    timestamp: apiActivity.timestamp,
    additionalInfo: apiActivity.additionalInfo,
    gameImageUrl: apiActivity.gameImageUrl,
    reactions: apiActivity.reactions || [],
    reactionSummary: apiActivity.reactionSummary || []
  };
}

