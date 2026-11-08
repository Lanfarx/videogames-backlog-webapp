import { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { useGamePlaytimeActions } from '../../store/hooks/gamesHooks';
import { useToast } from '../../contexts/ToastContext';

interface SessionTimerProps {
  gameId: number;
  hoursPlayed: number;
}

const TIMER_KEY = 'sessionTimer';
const carryKey = (gameId: number) => `sessionTimerCarry:${gameId}`;

interface RunningTimer { gameId: number; startedAt: number; }

// shortcut: timer e minuti residui vivono nel browser (non seguono tra dispositivi), un solo timer alla volta.
// Lo storage può essere bloccato: in quel caso il timer funziona solo finché la pagina resta aperta.
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // storage non disponibile: vedi shortcut sopra
  }
}

function readTimer(): RunningTimer | null {
  try {
    return JSON.parse(readStorage(TIMER_KEY) ?? 'null');
  } catch {
    return null;
  }
}

const readCarry = (gameId: number) => Number(readStorage(carryKey(gameId))) || 0;

// Timer di sessione: allo stop aggiunge le ore intere giocate, i minuti restanti si sommano alla sessione successiva
export default function SessionTimer({ gameId, hoursPlayed }: SessionTimerProps) {
  const { updatePlaytime } = useGamePlaytimeActions();
  const { showToast } = useToast();
  const [timer, setTimer] = useState<RunningTimer | null>(readTimer);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, [timer]);

  const start = () => {
    const running = { gameId, startedAt: Date.now() };
    writeStorage(TIMER_KEY, JSON.stringify(running));
    setNow(running.startedAt);
    setTimer(running);
  };

  const stop = async () => {
    if (!timer) return;
    const totalMinutes = readCarry(gameId) + Math.floor((Date.now() - timer.startedAt) / 60_000);
    const hours = Math.floor(totalMinutes / 60);
    try {
      if (hours > 0) {
        const result = await updatePlaytime(gameId, hoursPlayed + hours);
        if (result.meta.requestStatus !== 'fulfilled') throw new Error('Salvataggio non riuscito');
      }
      writeStorage(carryKey(gameId), String(totalMinutes % 60));
      writeStorage(TIMER_KEY, null);
      setTimer(null);
      showToast('success', 'Sessione registrata', hours > 0
        ? `Aggiunte ${hours} ${hours === 1 ? 'ora' : 'ore'}${totalMinutes % 60 ? `, restano ${totalMinutes % 60} min per la prossima sessione` : ''}.`
        : `${totalMinutes} min accumulati: diventeranno un'ora con la prossima sessione.`);
    } catch (error: any) {
      showToast('error', 'Sessione non salvata', error.message);
    }
  };

  if (timer && timer.gameId !== gameId) {
    return <span className="text-xs text-text-secondary">Timer attivo su un altro gioco</span>;
  }

  if (!timer) {
    return (
      <button onClick={start} aria-label="Avvia timer di sessione" className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors">
        <Play className="w-3 h-3" /> Avvia sessione
      </button>
    );
  }

  const minutes = Math.floor((now - timer.startedAt) / 60_000);
  return (
    <button onClick={stop} aria-label="Ferma timer di sessione" className="flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors">
      <Square className="w-3 h-3" /> Ferma · {Math.floor(minutes / 60)}h {minutes % 60}m
    </button>
  );
}
