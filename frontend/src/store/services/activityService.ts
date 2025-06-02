import axios from 'axios';
import { Activity, ActivityFilters, ActivityType } from '../../types/activity';
import { getToken } from '../../utils/getToken';

const API_URL = 'http://localhost:5097/api/activity';

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

// Tipi DTO per il backend
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
  types?: ActivityType[];
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

// Mappatura da API response a tipo frontend
function mapActivityFromApi(apiActivity: any): Activity {
  return {
    id: apiActivity.id,
    Type: apiActivity.type as ActivityType,
    GameId: apiActivity.gameId,
    GameTitle: apiActivity.gameTitle,
    Timestamp: apiActivity.timestamp, // Mantieni come stringa per la serializzazione Redux
    AdditionalInfo: apiActivity.additionalInfo
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
    // Per ASP.NET Core model binding, inviamo gli array come: Types[0]=value1&Types[1]=value2
    filters.Types.forEach((type, index) => {
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
  const res = await apiClient.post(API_URL, activity);
  return mapActivityFromApi(res.data);
};

export const updateActivity = async (id: number, activity: UpdateActivityDto): Promise<Activity> => {
  const res = await apiClient.put(`${API_URL}/${id}`, activity);
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

