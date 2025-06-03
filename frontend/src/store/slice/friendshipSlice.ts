import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  Friend, 
  FriendRequest, 
  PublicProfile, 
  SearchUsersResponse 
} from '../services/friendshipService';
import {
  fetchFriendsThunk,
  fetchPendingRequestsThunk,
  fetchSentRequestsThunk,
  sendFriendRequestThunk,
  acceptFriendRequestThunk,
  rejectFriendRequestThunk,
  removeFriendThunk,
  blockUserThunk,
  searchUsersThunk,
  fetchPublicProfileThunk,
  fetchPublicProfileByUsernameThunk
} from '../thunks/friendshipThunks';

interface FriendshipState {
  // Lista amici
  friends: Friend[];
  friendsLoading: boolean;
  friendsError: string | null;

  // Richieste di amicizia ricevute
  pendingRequests: FriendRequest[];
  pendingRequestsLoading: boolean;
  pendingRequestsError: string | null;

  // Richieste di amicizia inviate
  sentRequests: FriendRequest[];
  sentRequestsLoading: boolean;
  sentRequestsError: string | null;

  // Ricerca utenti
  searchResults: SearchUsersResponse | null;
  searchLoading: boolean;
  searchError: string | null;
  lastSearchQuery: string;

  // Profilo pubblico
  currentProfile: PublicProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // Azioni in corso
  sendingRequest: boolean;
  processingRequest: boolean;
  removingFriend: boolean;
  blockingUser: boolean;
}

const initialState: FriendshipState = {
  friends: [],
  friendsLoading: false,
  friendsError: null,

  pendingRequests: [],
  pendingRequestsLoading: false,
  pendingRequestsError: null,

  sentRequests: [],
  sentRequestsLoading: false,
  sentRequestsError: null,

  searchResults: null,
  searchLoading: false,
  searchError: null,
  lastSearchQuery: '',

  currentProfile: null,
  profileLoading: false,
  profileError: null,

  sendingRequest: false,
  processingRequest: false,
  removingFriend: false,
  blockingUser: false
};

const friendshipSlice = createSlice({
  name: 'friendship',
  initialState,
  reducers: {
    // Reset degli stati
    resetFriendshipState: (state) => {
      return initialState;
    },
    
    // Clear errori
    clearFriendsError: (state) => {
      state.friendsError = null;
    },
    clearPendingRequestsError: (state) => {
      state.pendingRequestsError = null;
    },
    clearSentRequestsError: (state) => {
      state.sentRequestsError = null;
    },
    clearSearchError: (state) => {
      state.searchError = null;
    },
    clearProfileError: (state) => {
      state.profileError = null;
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = null;
      state.lastSearchQuery = '';
    },

    // Clear current profile
    clearCurrentProfile: (state) => {
      state.currentProfile = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch friends
      .addCase(fetchFriendsThunk.pending, (state) => {
        state.friendsLoading = true;
        state.friendsError = null;
      })
      .addCase(fetchFriendsThunk.fulfilled, (state, action) => {
        state.friendsLoading = false;
        state.friends = action.payload;
      })
      .addCase(fetchFriendsThunk.rejected, (state, action) => {
        state.friendsLoading = false;
        state.friendsError = action.payload as string;
      })

      // Fetch pending requests
      .addCase(fetchPendingRequestsThunk.pending, (state) => {
        state.pendingRequestsLoading = true;
        state.pendingRequestsError = null;
      })
      .addCase(fetchPendingRequestsThunk.fulfilled, (state, action) => {
        state.pendingRequestsLoading = false;
        state.pendingRequests = action.payload;
      })
      .addCase(fetchPendingRequestsThunk.rejected, (state, action) => {
        state.pendingRequestsLoading = false;
        state.pendingRequestsError = action.payload as string;
      })

      // Fetch sent requests
      .addCase(fetchSentRequestsThunk.pending, (state) => {
        state.sentRequestsLoading = true;
        state.sentRequestsError = null;
      })
      .addCase(fetchSentRequestsThunk.fulfilled, (state, action) => {
        state.sentRequestsLoading = false;
        state.sentRequests = action.payload;
      })
      .addCase(fetchSentRequestsThunk.rejected, (state, action) => {
        state.sentRequestsLoading = false;
        state.sentRequestsError = action.payload as string;
      })

      // Send friend request
      .addCase(sendFriendRequestThunk.pending, (state) => {
        state.sendingRequest = true;
      })
      .addCase(sendFriendRequestThunk.fulfilled, (state, action) => {
        state.sendingRequest = false;
        // Aggiorna i risultati di ricerca se presenti
        if (state.searchResults) {
          const userId = action.payload;
          const userIndex = state.searchResults.users.findIndex(u => u.userId === userId);
          if (userIndex !== -1) {
            state.searchResults.users[userIndex].friendshipStatus = 'Pending';
          }
        }
        // Aggiorna il profilo corrente se presente
        if (state.currentProfile && state.currentProfile.userId === action.payload) {
          state.currentProfile.friendshipStatus = 'Pending';
        }
      })
      .addCase(sendFriendRequestThunk.rejected, (state) => {
        state.sendingRequest = false;
      })

      // Accept friend request
      .addCase(acceptFriendRequestThunk.pending, (state) => {
        state.processingRequest = true;
      })
      .addCase(acceptFriendRequestThunk.fulfilled, (state, action) => {
        state.processingRequest = false;
        // Rimuovi la richiesta dalla lista pending
        state.pendingRequests = state.pendingRequests.filter(req => req.id !== action.payload);
      })
      .addCase(acceptFriendRequestThunk.rejected, (state) => {
        state.processingRequest = false;
      })

      // Reject friend request
      .addCase(rejectFriendRequestThunk.pending, (state) => {
        state.processingRequest = true;
      })
      .addCase(rejectFriendRequestThunk.fulfilled, (state, action) => {
        state.processingRequest = false;
        // Rimuovi la richiesta dalla lista pending
        state.pendingRequests = state.pendingRequests.filter(req => req.id !== action.payload);
      })
      .addCase(rejectFriendRequestThunk.rejected, (state) => {
        state.processingRequest = false;
      })

      // Remove friend
      .addCase(removeFriendThunk.pending, (state) => {
        state.removingFriend = true;
      })
      .addCase(removeFriendThunk.fulfilled, (state, action) => {
        state.removingFriend = false;
        // Rimuovi l'amico dalla lista
        state.friends = state.friends.filter(friend => friend.userId !== action.payload);
        // Aggiorna il profilo corrente se presente
        if (state.currentProfile && state.currentProfile.userId === action.payload) {
          state.currentProfile.isFriend = false;
          state.currentProfile.friendshipStatus = undefined;
        }
      })
      .addCase(removeFriendThunk.rejected, (state) => {
        state.removingFriend = false;
      })

      // Block user
      .addCase(blockUserThunk.pending, (state) => {
        state.blockingUser = true;
      })
      .addCase(blockUserThunk.fulfilled, (state, action) => {
        state.blockingUser = false;
        const userId = action.payload;
        // Rimuovi l'utente dalla lista amici se presente
        state.friends = state.friends.filter(friend => friend.userId !== userId);
        // Rimuovi dalle richieste pending se presente
        state.pendingRequests = state.pendingRequests.filter(req => req.fromUserId !== userId);
        // Rimuovi dalle richieste inviate se presente
        state.sentRequests = state.sentRequests.filter(req => req.toUserId !== userId);
        // Aggiorna il profilo corrente se presente
        if (state.currentProfile && state.currentProfile.userId === userId) {
          state.currentProfile.friendshipStatus = 'Blocked';
          state.currentProfile.isFriend = false;
        }
      })
      .addCase(blockUserThunk.rejected, (state) => {
        state.blockingUser = false;
      })

      // Search users
      .addCase(searchUsersThunk.pending, (state) => {
        state.searchLoading = true;
        state.searchError = null;
      })
      .addCase(searchUsersThunk.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
        state.lastSearchQuery = action.meta.arg.query;
      })      .addCase(searchUsersThunk.rejected, (state, action) => {
        state.searchLoading = false;
        state.searchError = action.payload as string;
      })

      // Fetch public profile
      .addCase(fetchPublicProfileThunk.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchPublicProfileThunk.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchPublicProfileThunk.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      })
      // Cases per fetchPublicProfileByUsernameThunk
      .addCase(fetchPublicProfileByUsernameThunk.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchPublicProfileByUsernameThunk.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.currentProfile = action.payload;
      })
      .addCase(fetchPublicProfileByUsernameThunk.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload as string;
      });
  }
});

export const {
  resetFriendshipState,
  clearFriendsError,
  clearPendingRequestsError,
  clearSentRequestsError,
  clearSearchError,
  clearProfileError,
  clearSearchResults,
  clearCurrentProfile
} = friendshipSlice.actions;

export default friendshipSlice.reducer;
