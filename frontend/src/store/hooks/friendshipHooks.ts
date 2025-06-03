import { useSelector } from 'react-redux';
import { useCallback } from 'react';
import { RootState } from '../index';
import { useAppDispatch } from '../hooks';
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
import {
  clearFriendsError,
  clearPendingRequestsError,
  clearSentRequestsError,
  clearSearchError,
  clearProfileError,
  clearSearchResults,
  clearCurrentProfile
} from '../slice/friendshipSlice';

// Hook per ottenere lista amici
export function useFriends() {
  const dispatch = useAppDispatch();
  const { friends, friendsLoading, friendsError } = useSelector(
    (state: RootState) => state.friendship
  );

  const loadFriends = useCallback(() => {
    dispatch(fetchFriendsThunk());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearFriendsError());
  }, [dispatch]);

  return {
    friends,
    loading: friendsLoading,
    error: friendsError,
    loadFriends,
    clearError
  };
}

// Hook per ottenere richieste di amicizia ricevute
export function usePendingRequests() {
  const dispatch = useAppDispatch();
  const { pendingRequests, pendingRequestsLoading, pendingRequestsError } = useSelector(
    (state: RootState) => state.friendship
  );

  const loadPendingRequests = useCallback(() => {
    dispatch(fetchPendingRequestsThunk());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearPendingRequestsError());
  }, [dispatch]);

  return {
    requests: pendingRequests,
    loading: pendingRequestsLoading,
    error: pendingRequestsError,
    loadPendingRequests,
    clearError
  };
}

// Hook per ottenere richieste di amicizia inviate
export function useSentRequests() {
  const dispatch = useAppDispatch();
  const { sentRequests, sentRequestsLoading, sentRequestsError } = useSelector(
    (state: RootState) => state.friendship
  );

  const loadSentRequests = useCallback(() => {
    dispatch(fetchSentRequestsThunk());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearSentRequestsError());
  }, [dispatch]);

  return {
    requests: sentRequests,
    loading: sentRequestsLoading,
    error: sentRequestsError,
    loadSentRequests,
    clearError
  };
}

// Hook per cercare utenti
export function useUserSearch() {
  const dispatch = useAppDispatch();
  const { searchResults, searchLoading, searchError, lastSearchQuery } = useSelector(
    (state: RootState) => state.friendship
  );

  const searchUsers = useCallback((query: string, page?: number, pageSize?: number) => {
    dispatch(searchUsersThunk({ query, page, pageSize }));
  }, [dispatch]);

  const clearResults = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearSearchError());
  }, [dispatch]);

  return {
    results: searchResults,
    loading: searchLoading,
    error: searchError,
    lastQuery: lastSearchQuery,
    searchUsers,
    clearResults,
    clearError
  };
}

// Hook per visualizzare profili pubblici
export function usePublicProfile() {
  const dispatch = useAppDispatch();
  const { currentProfile, profileLoading, profileError } = useSelector(
    (state: RootState) => state.friendship
  );

  const loadProfile = useCallback((userId: number) => {
    dispatch(fetchPublicProfileThunk(userId));
  }, [dispatch]);

  const loadProfileByUsername = useCallback((userName: string) => {
    dispatch(fetchPublicProfileByUsernameThunk(userName));
  }, [dispatch]);

  const clearProfile = useCallback(() => {
    dispatch(clearCurrentProfile());
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearProfileError());
  }, [dispatch]);

  return {
    profile: currentProfile,
    loading: profileLoading,
    error: profileError,
    loadProfile,
    loadProfileByUsername,
    clearProfile,
    clearError
  };
}

// Hook per azioni di amicizia
export function useFriendshipActions() {
  const dispatch = useAppDispatch();
  const { 
    sendingRequest, 
    processingRequest, 
    removingFriend, 
    blockingUser 
  } = useSelector((state: RootState) => state.friendship);

  const sendFriendRequest = useCallback((toUserId: number) => {
    dispatch(sendFriendRequestThunk(toUserId));
  }, [dispatch]);

  const acceptFriendRequest = useCallback((requestId: number) => {
    dispatch(acceptFriendRequestThunk(requestId));
  }, [dispatch]);

  const rejectFriendRequest = useCallback((requestId: number) => {
    dispatch(rejectFriendRequestThunk(requestId));
  }, [dispatch]);

  const removeFriend = useCallback((friendId: number) => {
    dispatch(removeFriendThunk(friendId));
  }, [dispatch]);

  const blockUser = useCallback((userId: number) => {
    dispatch(blockUserThunk(userId));
  }, [dispatch]);

  const searchUsers = useCallback((query: string, page?: number, pageSize?: number) => {
    dispatch(searchUsersThunk({ query, page, pageSize }));
  }, [dispatch]);

  return {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    searchUsers,
    sending: sendingRequest,
    processing: processingRequest,
    removing: removingFriend,
    blocking: blockingUser
  };
}

// Hook combinato per gestire tutto lo stato delle amicizie
export function useFriendshipState() {
  const friends = useFriends();
  const pendingRequests = usePendingRequests();
  const sentRequests = useSentRequests();
  const userSearch = useUserSearch();
  const publicProfile = usePublicProfile();
  const actions = useFriendshipActions();

  // Aggiungi accessori diretti per compatibilità
  const { searchResults, searchLoading, searchError } = useSelector(
    (state: RootState) => state.friendship
  );

  return {
    friends,
    pendingRequests,
    sentRequests,
    userSearch,
    publicProfile,
    actions,
    // Accessori diretti per i risultati di ricerca
    searchResults: searchResults?.users || [],
    searchLoading,
    searchError,
    searchTotal: searchResults?.totalCount || 0,
    searchCurrentPage: searchResults?.currentPage || 1,
    searchTotalPages: searchResults?.totalPages || 1
  };
}
