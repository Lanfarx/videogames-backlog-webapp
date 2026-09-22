import React from 'react';
import { Send, Clock } from 'lucide-react';
import LoadingSpinner from '../../loading/LoadingSpinner';
import { FriendRequest } from '../../../types/friendship';

interface SentRequestsTabProps {
  sentRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
  loadSentRequests: () => void;
  count: number;
}

export function SentRequestsTab({
  sentRequests,
  loading,
  error,
  loadSentRequests,
  count
}: SentRequestsTabProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner message="Caricamento richieste inviate..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-accent-danger mb-4">{error}</p>
        <button
          onClick={loadSentRequests}
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
        <Send className="h-16 w-16 text-text-secondary mx-auto mb-4 opacity-50" />
        <p className="text-text-secondary mb-2">Nessuna richiesta inviata</p>
        <p className="text-sm text-text-secondary">
          Le richieste che invii appariranno qui
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sentRequests.map((request) => {
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
              <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">{displayLetter}</span>
              </div>
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
  );
}
