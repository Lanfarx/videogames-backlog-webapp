import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchGames } from '../store/thunks/gamesThunks';
import { syncWithSteam } from '../store/services/steamService';
import { setSteamPendingCount, setSteamSynced } from '../store/slice/userSlice';
import { useToast } from '../contexts/ToastContext';

const STEAM_AUTO_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;

export function storeSteamPendingCount(dispatch: ReturnType<typeof useAppDispatch>, count: number) {
  localStorage.setItem('steamPendingCount', String(count));
  dispatch(setSteamPendingCount(count));
}

// Sincronizzazione Steam: aggiorna ore, stati e achievement dei giochi già in libreria
export function useSteamSyncNow() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);

  const sync = useCallback(async (silent: boolean) => {
    setSyncing(true);
    try {
      const result = await syncWithSteam();
      dispatch(setSteamSynced(new Date().toISOString()));
      storeSteamPendingCount(dispatch, result.pendingCount);
      dispatch(fetchGames()); // anche solo gli achievement possono essere cambiati: la libreria si ricarica
      if (result.count > 0 || !silent) showToast('success', 'Libreria aggiornata da Steam', result.message);
      if (result.warning) showToast('warning', 'Steam', result.warning);
    } catch (error: any) {
      if (!silent) showToast('error', 'Sincronizzazione Steam non riuscita', error.response?.data?.detail || error.message);
      console.warn('Sincronizzazione Steam non riuscita:', error);
    } finally {
      setSyncing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- showToast cambia a ogni render del provider
  }, [dispatch]);

  return { sync, syncing };
}

// Sync automatica all'apertura dell'app, al massimo ogni 6 ore (l'orario dell'ultima sync è sul server)
export function SteamAutoSync() {
  const steamId = useAppSelector(state => state.user.profile?.steamId);
  const lastSync = useAppSelector(state => state.user.profile?.lastSteamSyncAt);
  const { sync } = useSteamSyncNow();

  useEffect(() => {
    if (!steamId) return;
    if (lastSync && Date.now() - Date.parse(lastSync) < STEAM_AUTO_SYNC_INTERVAL_MS) return;
    sync(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una volta per Steam ID: lastSync cambia proprio per effetto della sync
  }, [steamId, sync]);

  return null;
}
