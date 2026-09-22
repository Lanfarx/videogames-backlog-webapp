import React from 'react';
import { UserPlus, UserMinus, Ban, UserCheck, UserX } from 'lucide-react';
import { PublicProfile } from '../../store/services/friendshipService';

interface FriendshipActionButtonsProps {
  profile: PublicProfile;
  onAction: (action: string) => Promise<void>;
}

export default function FriendshipActionButtons({ profile, onAction }: FriendshipActionButtonsProps) {
  if (!profile.acceptsFriendRequests && !profile.isFriend && profile.friendshipStatus !== 'Blocked') {
    return null;
  }

  switch (profile.friendshipStatus) {
    case 'Pending':
      if (profile.isRequestSender) {
        return (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-300">
            <span className="text-sm">Richiesta di amicizia inviata</span>
          </div>
        );
      }
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onAction('accept')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Accetta Richiesta
          </button>
          <button
            onClick={() => onAction('reject')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <UserX className="h-4 w-4" />
            Rifiuta
          </button>
        </div>
      );

    case 'Accepted':
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onAction('remove')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <UserMinus className="h-4 w-4" />
            Rimuovi Amico
          </button>
          <button
            onClick={() => onAction('block')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Ban className="h-4 w-4" />
            Blocca
          </button>
        </div>
      );
    
    case 'Rejected':
      return (
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg border border-red-300">
            <span className="text-sm">Richiesta rifiutata</span>
          </div>
          <button
            onClick={() => onAction('sendRequest')}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Riprova
          </button>
        </div>
      );

    case 'Blocked':
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onAction('block')}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <Ban className="h-4 w-4" />
            Sblocca
          </button>
        </div>
      );

    default:
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onAction('sendRequest')}
            className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Aggiungi Amico
          </button>
          <button
            onClick={() => onAction('block')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Ban className="h-4 w-4" />
            Blocca
          </button>
        </div>
      );
  }
}
