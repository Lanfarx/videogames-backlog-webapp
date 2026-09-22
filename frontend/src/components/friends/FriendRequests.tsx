import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { UserPlus, Clock, Send } from 'lucide-react';
import { usePendingRequests, useSentRequests } from '../../store/hooks/friendshipHooks';
import { RequestsSubSection } from '../../hooks/navigationHooks';
import { ReceivedRequestsTab } from './requests/ReceivedRequestsTab';
import { SentRequestsTab } from './requests/SentRequestsTab';

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
  
  const [activeTab, setActiveTab] = useState<RequestsSubSection>(initialActiveTab);

  useImperativeHandle(ref, () => ({
    setActiveTab
  }));

  useEffect(() => {
    loadPendingRequests();
    loadSentRequests();
  }, [loadPendingRequests, loadSentRequests]);

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

      {/* Tab content */}
      {activeTab === 'received' && (
        <ReceivedRequestsTab 
          pendingRequests={pendingRequests}
          loading={pendingLoading}
          error={pendingError}
          loadPendingRequests={loadPendingRequests}
          count={pendingCount}
        />
      )}

      {activeTab === 'sent' && (
        <SentRequestsTab 
          sentRequests={sentRequests}
          loading={sentLoading}
          error={sentError}
          loadSentRequests={loadSentRequests}
          count={sentCount}
        />
      )}
    </div>
  );
});

FriendRequests.displayName = 'FriendRequests';

export default FriendRequests;
