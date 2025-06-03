import React, { useEffect, useState } from 'react';
import { UserPlus, Check, X, Clock, Send } from 'lucide-react';
import { usePendingRequests, useSentRequests, useFriendshipActions } from '../../store/hooks/friendshipHooks';
import LoadingSpinner from '../loading/LoadingSpinner';

interface FriendRequestsProps {
  className?: string;
}

const FriendRequests: React.FC<FriendRequestsProps> = ({ className = '' }) => {
  const { requests: pendingRequests, loading: pendingLoading, error: pendingError, loadPendingRequests } = usePendingRequests();
  const { requests: sentRequests, loading: sentLoading, error: sentError, loadSentRequests } = useSentRequests();
  const { acceptFriendRequest, rejectFriendRequest, processing } = useFriendshipActions();
  
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

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
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-secondary-bg rounded-lg border border-border-color"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {request.fromUserName.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info richiesta */}
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        @{request.fromUserName}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Ti ha inviato una richiesta di amicizia
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(request.requestDate).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Azioni */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={processingRequestId === request.id}
                      className="px-4 py-2 bg-accent-success text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >                      {processingRequestId === request.id ? (
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
              ))}
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
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 bg-secondary-bg rounded-lg border border-border-color"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {request.toUserName.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Info richiesta */}
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        @{request.toUserName}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        Richiesta di amicizia inviata
                      </p>
                      <p className="text-xs text-text-secondary">
                        {new Date(request.requestDate).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
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
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;
