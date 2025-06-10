import React, { useEffect, useState } from 'react';
import { Users, UserMinus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFriends, useFriendshipActions } from '../../store/hooks/friendshipHooks';
import LoadingSpinner from '../loading/LoadingSpinner';

interface FriendsListProps {
  className?: string;
}

const FriendsList: React.FC<FriendsListProps> = ({ className = '' }) => {
  const { friends, loading, error, loadFriends, clearError } = useFriends();
  const { removeFriend, removing } = useFriendshipActions();
  const [removingFriendId, setRemovingFriendId] = useState<number | null>(null);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  const handleRemoveFriend = async (friendId: number, friendName: string) => {
    if (window.confirm(`Sei sicuro di voler rimuovere ${friendName} dalla tua lista amici?`)) {
      setRemovingFriendId(friendId);
      await removeFriend(friendId);
      setRemovingFriendId(null);
      // Ricarica la lista dopo la rimozione
      loadFriends();
    }
  };
  if (loading) {
    return (
      <div className={`bg-primary-bg border border-border-color rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner message="Caricamento amici..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-primary-bg border border-border-color rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <p className="text-accent-danger mb-4">{error}</p>
          <button
            onClick={() => {
              clearError();
              loadFriends();
            }}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
          >
            Riprova
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-primary-bg border border-border-color rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-6 w-6 text-accent-primary" />
        <h2 className="text-xl font-semibold text-text-primary">
          I tuoi amici ({friends.length})
        </h2>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-16 w-16 text-text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-text-secondary mb-2">Non hai ancora amici</p>
          <p className="text-sm text-text-secondary">
            Cerca utenti e invia richieste di amicizia per iniziare a connetterti!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {friends.map((friend) => (
            <div
              key={friend.userId}
              className="flex items-center justify-between p-4 bg-secondary-bg rounded-lg border border-border-color hover:border-accent-primary transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center">
                    {friend.avatar ? (
                      <img
                        src={friend.avatar}
                        alt={friend.userName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {friend.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {friend.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-success rounded-full border-2 border-primary-bg"></div>
                  )}
                </div>                {/* Info utente */}
                <div>
                  <Link 
                    to={`/profile/${friend.userName}`}
                    className="font-semibold text-text-primary hover:text-accent-primary transition-colors cursor-pointer"
                  >
                    {friend.fullName || friend.userName}
                  </Link>
                  <p className="text-sm text-text-secondary">@{friend.userName}</p>
                  {friend.bio && (
                    <p className="text-xs text-text-secondary mt-1 max-w-md truncate">
                      {friend.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-text-secondary">
                      Membro da {new Date(friend.memberSince).toLocaleDateString('it-IT')}
                    </span>
                    {!friend.isOnline && friend.lastSeen && (
                      <span className="text-xs text-text-secondary">
                        Ultimo accesso: {new Date(friend.lastSeen).toLocaleDateString('it-IT')}
                      </span>
                    )}
                  </div>
                </div>
              </div>              {/* Azioni */}
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button
                    className="p-2 hover:bg-accent-danger hover:text-white rounded-lg transition-colors text-text-secondary"
                    title="Rimuovi amico"
                    onClick={() => handleRemoveFriend(friend.userId, friend.userName)}
                    disabled={removingFriendId === friend.userId}
                  >                    {removingFriendId === friend.userId ? (
                      <div className="w-4 h-4 flex items-center justify-center">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsList;
