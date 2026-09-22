import React, { useState, useCallback } from 'react';
import { Search, Loader } from 'lucide-react';
import { useFriendshipActions, useUserSearch } from '../../store/hooks/friendshipHooks';
import { PublicProfile } from '../../store/services/friendshipService';
import { useFriendsNavigation } from '../../hooks/navigationHooks';
import { PaginationControls } from '../ui/PaginationControls';
import { UserSearchCard } from './UserSearchCard';

interface UserSearchProps {
  className?: string;
}

export default function UserSearch({ className = '' }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, blockUser, searchUsers } = useFriendshipActions();
  const { results: searchResults, loading: searchLoading, error: searchError } = useUserSearch();
  const { navigateToFriends } = useFriendsNavigation();
  
  const searchTotal = searchResults?.totalCount || 0;
  const searchCurrentPage = searchResults?.currentPage || 1;
  const searchTotalPages = searchResults?.totalPages || 1;
  const users = searchResults?.users || [];
  
  const handleSearch = useCallback(async (query: string, page: number = 1) => {
    if (query.trim()) {
      setHasSearched(true);
      await searchUsers(query.trim(), page);
      setCurrentPage(page);
    }
  }, [searchUsers]);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      const timeoutId = setTimeout(() => {
        handleSearch(query, 1);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    } else {
      setHasSearched(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (searchQuery.trim()) {
      handleSearch(searchQuery, page);
    }
  };

  const handleAction = async (user: PublicProfile, action: string) => {
    try {
      switch (action) {
        case 'sendRequest':
          await sendFriendRequest(user.userName);
          break;
        case 'accept':
          if (user.friendshipId) {
            await acceptFriendRequest(user.friendshipId);
            navigateToFriends();
            return;
          }
          break;
        case 'reject':
          if (user.friendshipId) {
            await rejectFriendRequest(user.friendshipId);
          }
          break;
        case 'remove':
          await removeFriend(user.userId);
          break;
        case 'block':
          if (window.confirm(`Sei sicuro di voler bloccare ${user.userName}?`)) {
            await blockUser(user.userId);
          }
          break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (searchQuery.trim()) {
        await handleSearch(searchQuery, currentPage);
      }
    } catch (error) {
      console.error('Errore durante l\'azione:', error);
    }
  };

  return (
    <div className={`bg-primary-bg border border-border-color rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-6 w-6 text-accent-primary" />
        <h2 className="text-xl font-bold text-text-primary">
          Cerca Utenti
        </h2>
      </div>

      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInput}
            placeholder="Cerca per username o nome completo..."
            className="w-full pl-10 pr-4 py-3 bg-secondary-bg border border-border-color rounded-lg 
                     text-text-primary placeholder-text-secondary 
                     focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none transition-colors"
          />
        </div>
        
        {searchLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader className="h-5 w-5 text-accent-primary animate-spin" />
          </div>
        )}
      </div>

      {!hasSearched && (
        <div className="text-center py-12 text-text-secondary">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Inizia a digitare per cercare altri utenti</p>
        </div>
      )}

      {searchError && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
          {searchError}
        </div>
      )}

      {hasSearched && !searchLoading && users.length === 0 && !searchError && (
        <div className="text-center py-8">
          <Search className="h-16 w-16 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary mb-2">Nessun utente trovato</p>
          <p className="text-sm text-text-secondary">
            Prova con un termine di ricerca diverso
          </p>
        </div>
      )}

      {users.length > 0 && (
        <div className="space-y-4">
          {users.map((user: PublicProfile) => (
            <UserSearchCard key={user.userId} user={user} onAction={handleAction} />
          ))}
        </div>
      )}

      {hasSearched && searchTotalPages > 1 && (
        <PaginationControls 
          currentPage={searchCurrentPage}
          totalPages={searchTotalPages}
          totalCount={searchTotal}
          onPageChange={handlePageChange}
          variant="simple"
        />
      )}
    </div>
  );
}
