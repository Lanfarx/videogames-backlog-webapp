import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import { getToken } from '../../utils/getToken';

export interface WishlistItem {
  id: number;
  title: string;
  coverImage?: string;
  releaseYear: number;
  genres: string[];
  metacritic: number;
  addedDate: string;
  rawgId: number;
  notes?: string;
  userId: number;
}

export interface AddToWishlistDto {
  title: string;
  coverImage?: string;
  releaseYear: number;
  genres: string[];
  metacritic: number;
  rawgId: number;
  notes?: string;
}

export interface UpdateWishlistNotesDto {
  notes?: string;
}

const API_URL = `${API_CONFIG.BASE_URL}/api/wishlist`;

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

export const wishlistService = {
  // Ottieni la wishlist dell'utente
  getWishlist: () => 
    apiClient.get<WishlistItem[]>(API_URL),

  // Aggiungi un gioco alla wishlist
  addToWishlist: (dto: AddToWishlistDto) =>
    apiClient.post<WishlistItem>(API_URL, dto),

  // Rimuovi un gioco dalla wishlist
  removeFromWishlist: (id: number) =>
    apiClient.delete(`${API_URL}/${id}`),

  // Aggiorna le note di un gioco nella wishlist
  updateWishlistNotes: (id: number, dto: UpdateWishlistNotesDto) =>
    apiClient.put<WishlistItem>(`${API_URL}/${id}/notes`, dto),

  // Controlla se un gioco è nella wishlist
  checkGameInWishlist: (title: string) =>
    apiClient.get<boolean>(`${API_URL}/check/${encodeURIComponent(title)}`),

  // Sposta un gioco dalla wishlist alla libreria (rimuove dalla wishlist e restituisce le info)
  moveToLibrary: (id: number) =>
    apiClient.post<WishlistItem>(`${API_URL}/${id}/move-to-library`, {}),
};

export default wishlistService;
