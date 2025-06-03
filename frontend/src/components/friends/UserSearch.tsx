import React, { useState, useCallback, useMemo } from 'react';
import { Search, User, Plus, UserCheck, UserX, Ban, Loader, ArrowLeft, ArrowRight } from 'lucide-react';
import { useFriendshipActions, useUserSearch } from '../../store/hooks/friendshipHooks';
import { PublicProfile } from '../../store/services/friendshipService';

interface UserSearchProps {
  className?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ className = '' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, blockUser, searchUsers } = useFriendshipActions();
  const { results: searchResults, loading: searchLoading, error: searchError } = useUserSearch();
  
  // Derive pagination values from search results
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
      // Debounce della ricerca
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
          await sendFriendRequest(user.userId);
          break;
        case 'accept':
          await acceptFriendRequest(user.userId);
          break;
        case 'reject':
          await rejectFriendRequest(user.userId);
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
      
      // Ricarica i risultati di ricerca per aggiornare lo stato
      if (searchQuery.trim()) {
        handleSearch(searchQuery, currentPage);
      }
    } catch (error) {
      console.error('Errore durante l\'azione:', error);
    }
  };

  const getActionButton = (user: PublicProfile) => {
    if (!user.acceptsFriendRequests && !user.isFriend) {
      return (
        <div className="text-sm text-text-secondary">
          Non accetta richieste
        </div>
      );
    }

    switch (user.friendshipStatus) {
      case 'Pending':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(user, 'accept')}
              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <UserCheck className="h-4 w-4" />
              Accetta
            </button>
            <button
              onClick={() => handleAction(user, 'reject')}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <UserX className="h-4 w-4" />
              Rifiuta
            </button>
          </div>
        );
      
      case 'Accepted':
        return (
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm">
              Amici
            </span>
            <button
              onClick={() => handleAction(user, 'remove')}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Rimuovi
            </button>
          </div>
        );
      
      case 'Blocked':
        return (
          <span className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm">
            Bloccato
          </span>
        );
      
      default:
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(user, 'sendRequest')}
              className="px-3 py-1 bg-accent-primary text-white rounded-lg text-sm hover:bg-accent-primary/90 transition-colors flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Aggiungi
            </button>
            <button
              onClick={() => handleAction(user, 'block')}
              className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              <Ban className="h-4 w-4" />
              Blocca
            </button>
          </div>
        );
    }
  };

  const paginationControls = useMemo(() => {
    if (!hasSearched || searchTotalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-text-secondary">
          Mostrando pagina {searchCurrentPage} di {searchTotalPages} ({searchTotal} risultati)
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(searchCurrentPage - 1)}
            disabled={searchCurrentPage <= 1}
            className="px-3 py-1 bg-secondary-bg text-text-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover-color transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Precedente
          </button>
          
          <span className="px-3 py-1 bg-accent-primary text-white rounded-lg">
            {searchCurrentPage}
          </span>
          
          <button
            onClick={() => handlePageChange(searchCurrentPage + 1)}
            disabled={searchCurrentPage >= searchTotalPages}
            className="px-3 py-1 bg-secondary-bg text-text-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover-color transition-colors flex items-center gap-1"
          >
            Successiva
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }, [hasSearched, searchTotalPages, searchCurrentPage, searchTotal, handlePageChange]);

  return (
    <div className={`bg-primary-bg border border-border-color rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Search className="h-6 w-6 text-accent-primary" />
        <h2 className="text-xl font-bold text-text-primary">
          Cerca Utenti
        </h2>
      </div>

      {/* Barra di ricerca */}
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

      {/* Messaggio di stato */}
      {!hasSearched && (
        <div className="text-center py-12 text-text-secondary">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Inizia a digitare per cercare altri utenti</p>
        </div>
      )}

      {/* Errore */}
      {searchError && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
          {searchError}
        </div>
      )}      {/* Nessun risultato */}
      {hasSearched && !searchLoading && users.length === 0 && !searchError && (
        <div className="text-center py-8">
          <Search className="h-16 w-16 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary mb-2">Nessun utente trovato</p>
          <p className="text-sm text-text-secondary">
            Prova con un termine di ricerca diverso
          </p>
        </div>
      )}

      {/* Lista risultati */}
      {users.length > 0 && (
        <div className="space-y-4">
          {users.map((user: PublicProfile) => (
            <div
              key={user.userId}
              className="flex items-center gap-4 p-4 bg-secondary-bg rounded-lg hover:bg-hover-color transition-colors"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.userName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex items-center justify-center">
                    <User className="h-6 w-6 text-accent-primary" />
                  </div>
                )}
              </div>

              {/* Info utente */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-text-primary truncate">
                    {user.userName}
                  </h3>
                  {user.isProfilePrivate && (
                    <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">
                      Privato
                    </span>
                  )}
                </div>
                
                {user.fullName && (
                  <p className="text-sm text-text-secondary truncate">
                    {user.fullName}
                  </p>
                )}
                
                {user.bio && (
                  <p className="text-sm text-text-secondary truncate mt-1">
                    {user.bio}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-2 text-xs text-text-secondary">
                  <span>Membro dal {new Date(user.memberSince).toLocaleDateString()}</span>                  {user.tags && user.tags.length > 0 && (
                    <div className="flex gap-1">
                      {user.tags.slice(0, 2).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-accent-primary/20 text-accent-primary rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {user.tags.length > 2 && (
                        <span className="text-text-secondary">
                          +{user.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Azioni */}
              <div className="flex-shrink-0">
                {getActionButton(user)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginazione */}
      {paginationControls}
    </div>
  );
};

export default UserSearch;
