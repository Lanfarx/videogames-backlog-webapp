import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { syncWithSteam, SteamSyncResponse } from '../store/services/steamService';

export function useSteamSync(show: boolean, onHide: () => void, onSyncComplete: () => void) {
  const userProfile = useSelector((state: RootState) => state.user.profile);
  const [syncType, setSyncType] = useState<'initial_load' | 'update_hours'>('update_hours');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [syncResult, setSyncResult] = useState<SteamSyncResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (show) {
      setSyncResult(null);
      setShowDetails(false);
      setMessage('');
      setError('');
    }
  }, [show]);

  const handleSync = useCallback(async () => {
    if (!userProfile?.steamId) {
      setError('Steam ID non trovato nel profilo. Collega il tuo account Steam nelle impostazioni.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setSyncResult(null);
    setShowDetails(false);
    
    abortControllerRef.current = new AbortController();
  
    try {
      const result = await syncWithSteam(userProfile.steamId, syncType, abortControllerRef.current.signal);
      setMessage(result.message);
      setSyncResult(result);
      
      if (result.updatedGames && result.updatedGames.length > 0) {
        setShowDetails(false);
      }
      
      if (!result.updatedGames || result.updatedGames.length === 0) {
        setTimeout(() => {
          onSyncComplete();
          onHide();
        }, 2000);
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.message === 'canceled') {
        console.log('Sincronizzazione annullata');
        return;
      }
      console.error('Errore sincronizzazione Steam:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Errore durante la sincronizzazione';
      
      if (errorMessage.includes('429') || errorMessage.includes('Too Many Requests') || errorMessage.includes('Limite di richieste') || errorMessage.includes('troppe richieste')) {
        setError('⚠️ Steam API: Limite di richieste raggiunto. Riprova tra 5-10 minuti. Questo è un limite di Steam per proteggere i loro server.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [userProfile?.steamId, syncType, onSyncComplete, onHide]);

  const handleClose = useCallback(() => {
    if (loading && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (syncResult) {
      onSyncComplete();
    }
    onHide();
  }, [loading, syncResult, onSyncComplete, onHide]);

  return {
    userProfile,
    syncType,
    setSyncType,
    loading,
    message,
    error,
    syncResult,
    showDetails,
    setShowDetails,
    handleSync,
    handleClose
  };
}
