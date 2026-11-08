import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { getSteamCandidates, importSteamGames, setSteamGamesIgnored, SteamCandidate } from '../../store/services/steamService';
import { Status_OPTIONS } from '../../constants/gameConstants';
import { formatRelativeTime } from '../../utils/dateUtils';
import { useAppDispatch } from '../../store/hooks';
import { fetchGames } from '../../store/thunks/gamesThunks';
import { storeSteamPendingCount, useSteamSyncNow } from '../../hooks/useSteamAutoSync';
import { useToast } from '../../contexts/ToastContext';
import type { GameStatus } from '../../types/game';

const RECENTLY_PLAYED_MS = 14 * 24 * 60 * 60 * 1000;

interface SteamImportPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Giochi posseduti su Steam non ancora in libreria: si aggiungono o si ignorano (gli ignorati si possono ripristinare)
export default function SteamImportPanel({ isOpen, onClose }: SteamImportPanelProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { sync } = useSteamSyncNow();
  const [showIgnored, setShowIgnored] = useState(false);
  const [onlyWithHours, setOnlyWithHours] = useState(true);
  const [candidates, setCandidates] = useState<SteamCandidate[]>([]);
  const [statuses, setStatuses] = useState<Record<number, GameStatus>>({});
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    setSelected(new Set());
    try {
      const list = await getSteamCandidates(showIgnored);
      setCandidates(list);
      setStatuses(Object.fromEntries(list.map(c => [c.appId, c.suggestedStatus])));
      if (!showIgnored) {
        storeSteamPendingCount(dispatch, list.filter(c => c.lastPlayedAt && Date.now() - Date.parse(c.lastPlayedAt) < RECENTLY_PLAYED_MS).length);
      }
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Impossibile leggere la libreria Steam');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load dipende solo da showIgnored
  }, [isOpen, showIgnored]);

  const visible = useMemo(
    () => (showIgnored || !onlyWithHours ? candidates : candidates.filter(c => c.hoursPlayed > 0)),
    [candidates, showIgnored, onlyWithHours]
  );
  const allSelected = visible.length > 0 && visible.every(c => selected.has(c.appId));

  const toggle = (appId: number) => setSelected(prev => {
    const next = new Set(prev);
    if (!next.delete(appId)) next.add(appId);
    return next;
  });

  // Agisce solo sui selezionati ancora visibili: un filtro cambiato non porta con sé selezioni nascoste
  const run = async (action: 'import' | 'ignore' | 'restore') => {
    const appIds = visible.filter(c => selected.has(c.appId)).map(c => c.appId);
    if (appIds.length === 0) return;
    setBusy(true);
    try {
      if (action === 'import') {
        const count = await importSteamGames(appIds.map(appId => ({ appId, status: statuses[appId] })));
        dispatch(fetchGames());
        sync(true); // in background: achievement e Platino dei nuovi giochi subito, non alla prossima sync automatica
        showToast('success', 'Giochi aggiunti', `${count} giochi aggiunti dalla libreria Steam`);
      } else {
        await setSteamGamesIgnored(appIds, action === 'ignore');
        showToast('success', action === 'ignore' ? 'Giochi ignorati' : 'Giochi ripristinati', `${appIds.length} giochi`);
      }
      await load();
    } catch (e: any) {
      showToast('error', 'Operazione non riuscita', e.response?.data?.detail || e.message);
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  const buttonClass = 'px-4 py-2 rounded-lg font-secondary text-sm transition-colors disabled:opacity-50';

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="steam-import-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-bg rounded-lg shadow-lg z-50 w-[calc(100%-2rem)] max-w-3xl max-h-[85vh] flex flex-col"
      >
        <div className="flex items-center justify-between p-5 border-b border-border-color">
          <h2 id="steam-import-title" className="text-lg font-primary font-bold text-text-primary">
            {showIgnored ? 'Giochi Steam ignorati' : 'Da importare da Steam'}
          </h2>
          <button onClick={onClose} aria-label="Chiudi" className="text-text-secondary hover:text-accent-primary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-border-color text-sm text-text-secondary">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(visible.map(c => c.appId)))} disabled={loading || visible.length === 0} />
            Seleziona tutti ({visible.length})
          </label>
          {!showIgnored && (
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={onlyWithHours} onChange={e => setOnlyWithHours(e.target.checked)} />
              Solo con ore di gioco
            </label>
          )}
          <button className="ml-auto underline hover:text-accent-primary" onClick={() => setShowIgnored(!showIgnored)}>
            {showIgnored ? 'Torna ai giochi da importare' : 'Mostra ignorati'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {loading ? (
            <p className="py-10 text-center text-text-secondary">Caricamento libreria Steam...</p>
          ) : error ? (
            <p className="py-10 text-center text-red-500">{error}</p>
          ) : visible.length === 0 ? (
            <p className="py-10 text-center text-text-secondary">
              {showIgnored ? 'Nessun gioco ignorato.' : 'Nessun gioco da importare: la libreria è allineata con Steam.'}
            </p>
          ) : (
            <ul className="divide-y divide-border-color">
              {visible.map(c => (
                <li key={c.appId} className="flex items-center gap-3 py-2">
                  <input type="checkbox" checked={selected.has(c.appId)} onChange={() => toggle(c.appId)} aria-label={`Seleziona ${c.name}`} />
                  <img src={c.coverImage} alt="" loading="lazy" className="w-24 h-11 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium truncate">{c.name}</p>
                    <p className="text-xs text-text-secondary">
                      {c.hoursPlayed} ore · {c.lastPlayedAt ? `giocato ${formatRelativeTime(c.lastPlayedAt).toLowerCase()}` : 'mai giocato'}
                    </p>
                  </div>
                  {!showIgnored && (
                    <select
                      value={statuses[c.appId]}
                      onChange={e => setStatuses(prev => ({ ...prev, [c.appId]: e.target.value as GameStatus }))}
                      aria-label={`Stato di ${c.name}`}
                      className="px-2 py-1 rounded-md border border-border-color bg-primary-bg text-text-primary text-sm"
                    >
                      {Status_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-border-color">
          {showIgnored ? (
            <button className={`${buttonClass} bg-accent-primary text-white hover:opacity-90`} disabled={busy || selected.size === 0} onClick={() => run('restore')}>
              Ripristina selezionati
            </button>
          ) : (
            <>
              <button className={`${buttonClass} border border-border-color text-text-primary hover:bg-secondary-bg`} disabled={busy || selected.size === 0} onClick={() => run('ignore')}>
                Ignora selezionati
              </button>
              <button className={`${buttonClass} bg-accent-primary text-white hover:opacity-90`} disabled={busy || selected.size === 0} onClick={() => run('import')}>
                Aggiungi selezionati
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
