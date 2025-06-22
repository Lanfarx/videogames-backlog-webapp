import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { UserPlus, Check, X, Clock, Send } from 'lucide-react';
import { usePendingRequests, useSentRequests, useFriendshipActions } from '../../store/hooks/friendshipHooks';
import { useFriendsNavigation } from '../../store/hooks/navigationHooks';
import LoadingSpinner from '../loading/LoadingSpinner';
import { RequestsSubSection } from '../../store/hooks/navigationHooks';

interface FriendRequestsProps {
  className?: string;
  initialActiveTab?: RequestsSubSection;
}

export interface FriendRequestsRef {
  setActiveTab: (tab: RequestsSubSection) => void;
}

const FriendRequests = forwardRef<FriendRequestsRef, FriendRequestsProps>(({ 
  className = '', 
  initialActiveTab = 'received' 
}, ref) => {
  const { requests: pendingRequests, loading: pendingLoading, error: pendingError, loadPendingRequests } = usePendingRequests();
  const { requests: sentRequests, loading: sentLoading, error: sentError, loadSentRequests } = useSentRequests();
  const { acceptFriendRequest, rejectFriendRequest, processing } = useFriendshipActions();
  const { navigateToFriends } = useFriendsNavigation();
  
  const [activeTab, setActiveTab] = useState<RequestsSubSection>(initialActiveTab);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

  // Esponi il metodo setActiveTab tramite ref
  useImperativeHandle(ref, () => ({
    setActiveTab
  }));

  useEffect(() => {
    loadPendingRequests();
    loadSentRequests();
  }, [loadPendingRequests, loadSentRequests]);
  const handleAcceptRequest = async (requestId: number) => {
    setProcessingRequestId(requestId);
    await acceptFriendRequest(requestId);
    setProcessingRequestId(null);
    // Ricarica le richieste dopo l'accettazione
    loadPendingRequests();
    // Naviga automaticamente alla sezione "I miei amici"
    navigateToFriends();
  };

  const handleRejectRequest = async (requestId: number) => {
    setProcessingRequestId(requestId);
    await rejectFriendRequest(requestId);
    setProcessingRequestId(null);
    // Ricarica le richieste dopo il rifiuto
    loadPendingRequests();
  };

  const pendingCount = pendingRequests.length;
  const sentCount = sentRequests.length;

  return (
    <div className={`bg-primary-bg border border-border-color rounded-xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="h-6 w-6 text-accent-primary" />
        <h2 className="text-xl font-semibold text-text-primary">
          Richieste di amicizia
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-color mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Ricevute ({pendingCount})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Inviate ({sentCount})
          </div>
        </button>
      </div>

      {/* Contenuto tab richieste ricevute */}
      {activeTab === 'received' && (
        <div>          {pendingLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner message="Caricamento richieste..." />
            </div>
          ) : pendingError ? (
            <div className="text-center py-8">
              <p className="text-accent-danger mb-4">{pendingError}</p>
              <button
                onClick={loadPendingRequests}
                className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
              >
                Riprova
              </button>
            </div>
          ) : pendingCount === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary mb-2">Nessuna richiesta in sospeso</p>
              <p className="text-sm text-text-secondary">
                Le nuove richieste di amicizia appariranno qui
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => {
                // Safe fallback per compatibilità vecchi dati o risposte incomplete
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
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {displayLetter}
                        </span>
                      </div>

                      {/* Info richiesta */}
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

                    {/* Azioni */}
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
          )}
        </div>
      )}

      {/* Contenuto tab richieste inviate */}
      {activeTab === 'sent' && (
        <div>          {sentLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner message="Caricamento richieste inviate..." />
            </div>
          ) : sentError ? (
            <div className="text-center py-8">
              <p className="text-accent-danger mb-4">{sentError}</p>
              <button
                onClick={loadSentRequests}
                className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-colors"
              >
                Riprova
              </button>
            </div>
          ) : sentCount === 0 ? (
            <div className="text-center py-8">
              <Send className="h-16 w-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <p className="text-text-secondary mb-2">Nessuna richiesta inviata</p>
              <p className="text-sm text-text-secondary">
                Le richieste che invii appariranno qui
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((request) => {
                // Safe fallback per compatibilità vecchi dati o risposte incomplete
                // Il backend invia ora receiverUserName e CreatedAt, ma il tipo FriendRequest non li prevede: fix temporaneo con cast
                const anyRequest = request as any;
                const userName = request.toUserName || anyRequest.receiverUserName || '';
                const displayLetter = userName ? userName.charAt(0).toUpperCase() : '?';
                const dateString = request.requestDate || anyRequest.createdAt;
                return (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 bg-secondary-bg rounded-lg border border-border-color"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {displayLetter}
                        </span>
                      </div>

                      {/* Info richiesta */}
                      <div>
                        <h3 className="font-semibold text-text-primary">
                          @{userName || 'utente'}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          Richiesta di amicizia inviata
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

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        In attesa
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}        </div>
      )}
    </div>
  );
});

FriendRequests.displayName = 'FriendRequests';

export default FriendRequests;
