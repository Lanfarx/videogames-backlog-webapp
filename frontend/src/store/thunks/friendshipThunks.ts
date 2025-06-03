import { createAsyncThunk } from '@reduxjs/toolkit';
import { 
  friendshipService, 
  Friend, 
  FriendRequest, 
  PublicProfile, 
  SearchUsersResponse 
} from '../services/friendshipService';
import { fetchUnreadCountThunk } from './notificationThunks';

// Thunk per ottenere lista amici
export const fetchFriendsThunk = createAsyncThunk(
  'friendship/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      return await friendshipService.getFriends();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Errore nel caricamento degli amici');
    }
  }
);

// Thunk per ottenere richieste di amicizia ricevute
export const fetchPendingRequestsThunk = createAsyncThunk(
  'friendship/fetchPendingRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await friendshipService.getPendingRequests();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Errore nel caricamento delle richieste');
    }
  }
);

// Thunk per ottenere richieste di amicizia inviate
export const fetchSentRequestsThunk = createAsyncThunk(
  'friendship/fetchSentRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await friendshipService.getSentRequests();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Errore nel caricamento delle richieste inviate');
    }
  }
);

// Thunk per inviare richiesta di amicizia
export const sendFriendRequestThunk = createAsyncThunk(
  'friendship/sendFriendRequest',
  async (toUserId: number, { rejectWithValue }) => {
    try {
      await friendshipService.sendFriendRequest(toUserId);
      return toUserId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Errore nell\'invio della richiesta';
      return rejectWithValue(message);
    }
  }
);

// Thunk per accettare richiesta di amicizia
export const acceptFriendRequestThunk = createAsyncThunk(
  'friendship/acceptFriendRequest',
  async (requestId: number, { dispatch, rejectWithValue }) => {
    try {
      await friendshipService.acceptFriendRequest(requestId);
      // Aggiorna il conteggio delle notifiche
      dispatch(fetchUnreadCountThunk() as any);
      return requestId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Errore nell\'accettazione della richiesta';
      return rejectWithValue(message);
    }
  }
);

// Thunk per rifiutare richiesta di amicizia
export const rejectFriendRequestThunk = createAsyncThunk(
  'friendship/rejectFriendRequest',
  async (requestId: number, { dispatch, rejectWithValue }) => {
    try {
      await friendshipService.rejectFriendRequest(requestId);
      // Aggiorna il conteggio delle notifiche
      dispatch(fetchUnreadCountThunk() as any);
      return requestId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Errore nel rifiuto della richiesta';
      return rejectWithValue(message);
    }
  }
);

// Thunk per rimuovere amico
export const removeFriendThunk = createAsyncThunk(
  'friendship/removeFriend',
  async (friendId: number, { rejectWithValue }) => {
    try {
      await friendshipService.removeFriend(friendId);
      return friendId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Errore nella rimozione dell\'amico';
      return rejectWithValue(message);
    }
  }
);

// Thunk per bloccare utente
export const blockUserThunk = createAsyncThunk(
  'friendship/blockUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      await friendshipService.blockUser(userId);
      return userId;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Errore nel blocco dell\'utente';
      return rejectWithValue(message);
    }
  }
);

// Thunk per cercare utenti
export const searchUsersThunk = createAsyncThunk(
  'friendship/searchUsers',
  async (
    { query, page = 1, pageSize = 10 }: { query: string; page?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      return await friendshipService.searchUsers(query, page, pageSize);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Errore nella ricerca degli utenti');
    }
  }
);

// Thunk per ottenere profilo pubblico per userId
export const fetchPublicProfileThunk = createAsyncThunk(
  'friendship/fetchPublicProfile',
  async (userId: number, { rejectWithValue }) => {
    try {
      return await friendshipService.getPublicProfile(userId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Errore nel caricamento del profilo');
    }
  }
);

// Thunk per ottenere profilo pubblico per userName
export const fetchPublicProfileByUsernameThunk = createAsyncThunk(
  'friendship/fetchPublicProfileByUsername',
  async (userName: string, { rejectWithValue }) => {
    try {
      return await friendshipService.getPublicProfileByUsername(userName);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Errore nel caricamento del profilo');
    }
  }
);
