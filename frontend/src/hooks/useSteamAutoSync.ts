import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGames } from '../store/thunks/gamesThunks';
import { syncWithSteam } from '../store/services/steamService';
import { useToast } from '../contexts/ToastContext';

const STEAM_AUTO_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;

// "Aggiorna ore" Steam in automatico all'apertura della libreria, al massimo ogni 6 ore
export function useSteamAutoSync() {
  const dispatch = useAppDispatch();
  const steamId = useAppSelector(state => state.user.profile?.steamId);
  const { showToast } = useToast();

  useEffect(() => {
    if (!steamId) return;
    const key = `steamAutoSync_${steamId}`;
    if (Date.now() - Number(localStorage.getItem(key) || 0) < STEAM_AUTO_SYNC_INTERVAL_MS) return;

    localStorage.setItem(key, String(Date.now())); // subito, per non sincronizzare due volte con più render o più tab
    syncWithSteam(steamId, 'update_hours')
      .then(result => {
        if (result.count === 0) return;
        dispatch(fetchGames()); // la libreria ricalcola i filtri e ricarica la pagina corrente
        showToast('success', 'Libreria aggiornata da Steam', result.message);
      })
      .catch(error => {
        localStorage.removeItem(key); // si riprova alla prossima apertura
        console.warn('Sincronizzazione Steam automatica non riuscita:', error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showToast cambia a ogni render del provider
  }, [steamId, dispatch]);
}
