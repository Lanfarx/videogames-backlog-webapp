import axios from 'axios';
import { getToken } from '../../utils/getToken';
import { API_CONFIG, buildApiUrl } from '../../config/api';

const API_URL = buildApiUrl(API_CONFIG.ENDPOINTS.FRIENDSHIP);

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

// Tipi per le amicizie
export interface FriendRequest {
  id: number;
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  // Campi opzionali per compatibilità backend
  receiverUserName?: string;
  receiverFullName?: string;
  receiverAvatar?: string;
  createdAt?: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Blocked';
  requestDate: string;
}

export interface Friendship {
  id: number;
  user1Id: number;
  user2Id: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Blocked';
  createdDate: string;
  updatedDate: string;
}

export interface Friend {
  userId: number;
  userName: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  memberSince: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface PublicProfile {
  userId: number;
  userName: string;
  fullName?: string;
  avatar?: string;
  bio?: string;
  memberSince: string;
  tags?: string[];
  isProfilePrivate: boolean;
  canViewStats: boolean;
  canViewDiary: boolean;
  acceptsFriendRequests: boolean;
  stats?: any; // GameStatsDto
  friendshipStatus?: string;
  isFriend: boolean;
  isRequestSender: boolean;
  friendshipId?: number;
}

export interface SearchUsersResponse {
  users: PublicProfile[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export const friendshipService = {
  // Invia richiesta di amicizia
  sendFriendRequest: async (toUserName: string): Promise<void> => {
    await apiClient.post(
      `${API_URL}/send-request`,
      { userName: toUserName }
    );
  },

  // Accetta richiesta di amicizia
  acceptFriendRequest: async (requestId: number): Promise<void> => {
    await apiClient.post(
      `${API_URL}/accept/${requestId}`,
      {}
    );
  },

  // Rifiuta richiesta di amicizia
  rejectFriendRequest: async (requestId: number): Promise<void> => {
    await apiClient.post(
      `${API_URL}/reject/${requestId}`,
      {}
    );
  },

  // Rimuovi amico
  removeFriend: async (friendId: number): Promise<void> => {
    await apiClient.delete(
      `${API_URL}/remove/${friendId}`
    );
  },
  // Blocca utente
  blockUser: async (userId: number): Promise<void> => {
    await apiClient.post(
      `${API_URL}/block/${userId}`,
      {}
    );
  },

  // Ottieni lista amici
  getFriends: async (): Promise<Friend[]> => {
    const response = await apiClient.get(
      `${API_URL}/friends`
    );
    return response.data;
  },

  // Ottieni richieste di amicizia ricevute
  getPendingRequests: async (): Promise<FriendRequest[]> => {
    const response = await apiClient.get(
      `${API_URL}/pending-requests`
    );
    return response.data;
  },

  // Ottieni richieste di amicizia inviate
  getSentRequests: async (): Promise<FriendRequest[]> => {
    const response = await apiClient.get(
      `${API_URL}/sent-requests`
    );
    return response.data;
  },
  // Cerca utenti
  searchUsers: async (
    query: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<SearchUsersResponse> => {
    const response = await apiClient.get(
      `${API_URL}/search`,
      {
        params: { query, page, pageSize }
      }
    );
    return response.data;
  },
  // Ottieni profilo pubblico per userId
  getPublicProfile: async (userId: number): Promise<PublicProfile> => {
    const response = await apiClient.get(
      `${API_URL}/profile/${userId}`
    );
    return response.data;
  },
  // Ottieni profilo pubblico per userName
  getPublicProfileByUsername: async (userName: string): Promise<PublicProfile> => {
    const response = await apiClient.get(
      `${API_URL}/profile/${userName}`
    );
    return response.data;
  }
};
