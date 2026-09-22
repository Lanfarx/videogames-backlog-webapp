import React, { useState } from 'react';
import { Check, X, Clock } from 'lucide-react';
import LoadingSpinner from '../../loading/LoadingSpinner';
import { useFriendshipActions } from '../../../store/hooks/friendshipHooks';
import { useFriendsNavigation } from '../../../hooks/navigationHooks';
import { FriendRequest } from '../../../types/friendship';

interface ReceivedRequestsTabProps {
  pendingRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
  loadPendingRequests: () => void;
  count: number;
}

export function ReceivedRequestsTab({
  pendingRequests,
  loading,
  error,
  loadPendingRequests,
  count
}: ReceivedRequestsTabProps) {
  const { acceptFriendRequest, rejectFriendRequest } = useFriendshipActions();
  const { navigateToFriends } = useFriendsNavigation();
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

  const handleAcceptRequest = async (requestId: number) => {
    setProcessingRequestId(requestId);
    await acceptFriendRequest(requestId);
    setProcessingRequestId(null);
    loadPendingRequests();
    navigateToFriends();
  };

  const handleRejectRequest = async (requestId: number) => {
    setProcessingRequestId(requestId);
    await rejectFriendRequest(requestId);
    setProcessingRequestId(null);
    loadPendingRequests();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner message="Caricamento richieste..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-accent-danger mb-4">{error}</p>
        <button
          onClick={loadPendingRequests}
          className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-16 w-16 text-text-secondary mx-auto mb-4 opacity-50" />
        <p className="text-text-secondary mb-2">Nessuna richiesta in sospeso</p>
        <p className="text-sm text-text-secondary">
          Le nuove richieste di amicizia appariranno qui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingRequests.map((request) => {
        const anyRequest = request as any;
        const userName = request.fromUserName || anyRequest.senderUserName || '';
        const displayLetter = userName ? userName.charAt(0).toUpperCase() : '?';
        const dateString = request.requestDate || anyRequest.createdAt;
        
        return (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 bg-secondary-bg rounded-lg border border-border-color"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{displayLetter}</span>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  @{userName || 'utente'}
                </h3>
                <p className="text-sm text-text-secondary">
                  Ti ha inviato una richiesta di amicizia
                </p>
                <p className="text-xs text-text-secondary">
                  {dateString ? new Date(dateString).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : 'Data sconosciuta'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAcceptRequest(request.id)}
                disabled={processingRequestId === request.id}
                className="px-4 py-2 bg-accent-success text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processingRequestId === request.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Accetta
              </button>
              <button
                onClick={() => handleRejectRequest(request.id)}
                disabled={processingRequestId === request.id}
                className="px-4 py-2 bg-accent-danger text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {processingRequestId === request.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <X className="h-4 w-4" />
                )}
                Rifiuta
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
