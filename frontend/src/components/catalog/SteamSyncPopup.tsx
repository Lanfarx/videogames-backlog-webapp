import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { syncWithSteam, SteamSyncResponse, UpdatedGameInfo } from '../../store/services/steamService';

interface SteamSyncPopupProps {
  show: boolean;
  onHide: () => void;
  onSyncComplete: () => void;
}

export function SteamSyncPopup({ show, onHide, onSyncComplete }: SteamSyncPopupProps) {
  const userProfile = useSelector((state: RootState) => state.user.profile);
  const [syncType, setSyncType] = useState<'initial_load' | 'update_hours'>('update_hours');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [syncResult, setSyncResult] = useState<SteamSyncResponse | null>(null);
  const [showDetails, setShowDetails] = useState(false);  const handleSync = async () => {
    if (!userProfile?.steamId) {
      setError('Steam ID non trovato nel profilo. Collega il tuo account Steam nelle impostazioni.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setSyncResult(null);
    setShowDetails(false);
  
      try {
      const result = await syncWithSteam(userProfile.steamId, syncType);
      setMessage(result.message);
      setSyncResult(result);
      
      // Se ci sono giochi aggiornati, mostra il pulsante per i dettagli
      if (result.updatedGames && result.updatedGames.length > 0) {
        setShowDetails(false); // Inizialmente non mostrare i dettagli
      }
      
      // Non chiudere automaticamente se ci sono dettagli da mostrare
      if (!result.updatedGames || result.updatedGames.length === 0) {
        setTimeout(() => {
          onSyncComplete();
          onHide();
        }, 2000);
      }
    } catch (error: any) {
      console.error('Errore sincronizzazione Steam:', error);
      setError(error.response?.data?.error || error.message || 'Errore durante la sincronizzazione');
    } finally {
      setLoading(false);
    }
  };
  const handleClose = () => {
    if (syncResult) {
      onSyncComplete();
    }
    onHide();
  };

  // Reset stato quando il popup viene riaperto
  useEffect(() => {
    if (show) {
      setSyncResult(null);
      setShowDetails(false);
      setMessage('');
      setError('');
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Sincronizza con Steam
          </h2>
          <button
            onClick={onHide}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>        <div className="space-y-4">
          {/* Mostra lo Steam ID collegato */}
          {userProfile?.steamId ? (
            <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-3 py-2 rounded-md text-sm">
              <div className="font-medium">Account Steam collegato</div>
              <div className="text-xs opacity-75">Steam ID: {userProfile.steamId}</div>
            </div>
          ) : (
            <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-md text-sm">
              <div className="font-medium">Steam ID non collegato</div>
              <div className="text-xs opacity-75">Vai nelle impostazioni per collegare il tuo account Steam</div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo di sincronizzazione
            </label>
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="radio"
                  name="syncType"
                  value="update_hours"
                  checked={syncType === 'update_hours'}
                  onChange={() => setSyncType('update_hours')}
                  disabled={loading}
                  className="mt-0.5 mr-2"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Aggiorna solo ore di gioco
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Aggiorna le ore di gioco dei giochi già presenti nella tua libreria
                  </div>
                </div>
              </label>
              
              <label className="flex items-start">
                <input
                  type="radio"
                  name="syncType"
                  value="initial_load"
                  checked={syncType === 'initial_load'}
                  onChange={() => setSyncType('initial_load')}
                  disabled={loading}
                  className="mt-0.5 mr-2"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Caricamento iniziale completo
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Importa tutti i giochi dalla tua libreria Steam (solo quelli non già presenti)
                  </div>
                </div>
              </label>
            </div>
          </div>          {error && (
            <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-3 py-2 rounded-md text-sm">
              <div className="font-medium">{message}</div>
              {syncResult && syncResult.updatedGames && syncResult.updatedGames.length > 0 && (
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="mt-2 text-xs underline hover:no-underline focus:outline-none"
                >
                  {showDetails ? 'Nascondi dettagli' : `Mostra dettagli (${syncResult.updatedGames.length} giochi)`}
                </button>
              )}
            </div>
          )}

          {/* Dettagli giochi aggiornati */}
          {syncResult && syncResult.updatedGames && showDetails && (
            <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-md">
              <div className="px-3 py-2 border-b border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Giochi aggiornati ({syncResult.updatedGames.length})
                </h4>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {syncResult.updatedGames.map((game, index) => (
                  <div key={index} className="px-3 py-2 border-b border-blue-100 dark:border-blue-800/50 last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate">
                          {game.gameTitle}
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          <span className="inline-flex items-center">
                            {game.previousHours}h → {game.newHours}h 
                            <span className="ml-1 text-green-600 dark:text-green-400 font-medium">
                              (+{game.hoursAdded}h)
                            </span>
                          </span>
                        </div>
                        {game.statusChanged && (
                          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            📈 {game.previousStatus} → {game.newStatus}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {syncResult ? 'Chiudi' : 'Annulla'}
          </button>          {!syncResult && (
            <button
              onClick={handleSync}
              disabled={loading || !userProfile?.steamId}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sincronizzando...
                </>
              ) : (
                'Sincronizza'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
