import React from 'react';
import { User, Plus, UserCheck, UserX, Ban } from 'lucide-react';
import { PublicProfile } from '../../store/services/friendshipService';
import { useNavigate } from 'react-router-dom';

interface UserSearchCardProps {
  user: PublicProfile;
  onAction: (user: PublicProfile, action: string) => void;
}

export function UserSearchCard({ user, onAction }: UserSearchCardProps) {
  const navigate = useNavigate();

  const getActionButton = () => {
    if (!user.acceptsFriendRequests && !user.isFriend) {
      return (
        <div className="text-sm text-text-secondary">
          Non accetta richieste
        </div>
      );
    }

    switch (user.friendshipStatus) {
      case 'Pending':
        if (user.isRequestSender) {
          return (
            <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300 text-sm">
              Richiesta inviata
            </div>
          );
        }
        return (
          <div className="flex gap-2">
            <button
              onClick={() => onAction(user, 'accept')}
              className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <UserCheck className="h-4 w-4" />
              Accetta
            </button>
            <button
              onClick={() => onAction(user, 'reject')}
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
              onClick={() => onAction(user, 'remove')}
              className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              Rimuovi
            </button>
          </div>
        );
      
      case 'Rejected':
        return (
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm">
              Richiesta rifiutata
            </span>
            <button
              onClick={() => onAction(user, 'sendRequest')}
              className="px-3 py-1 bg-accent-primary text-white rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Riprova
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
              onClick={() => onAction(user, 'sendRequest')}
              className="px-3 py-1 bg-accent-primary text-white rounded-lg text-sm hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Aggiungi
            </button>
            <button
              onClick={() => onAction(user, 'block')}
              className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
            >
              <Ban className="h-4 w-4" />
              Blocca
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-secondary-bg rounded-lg hover:bg-hover-color transition-colors">
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3
            className="font-medium text-text-primary truncate cursor-pointer hover:underline"
            title={user.userName}
            onClick={() => navigate(`/profile/${user.userName}`)}
          >
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
          <span>Membro dal {new Date(user.memberSince).toLocaleDateString()}</span>
          {user.tags && user.tags.length > 0 && (
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

      <div className="flex-shrink-0">
        {getActionButton()}
      </div>
    </div>
  );
}
