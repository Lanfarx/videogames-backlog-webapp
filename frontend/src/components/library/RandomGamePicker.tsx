import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { Game } from '../../types/game';
import StatusBadge from '../ui/atoms/StatusBadge';

interface RandomGamePickerProps {
  onClose: () => void;
  games: Game[]; // i giochi tra cui pescare
  onStart: (game: Game) => void;
}

// Pesca un id a caso, evitando se possibile quello appena proposto
const pickRandomId = (games: Game[], excludeId?: number) => {
  const pool = games.length > 1 ? games.filter(g => g.id !== excludeId) : games;
  return pool[Math.floor(Math.random() * pool.length)]?.id;
};

// Si monta all'apertura e propone un gioco a caso: "Inizia" lo porta In corso, "Un altro" ne pesca un altro
export default function RandomGamePicker({ onClose, games, onStart }: RandomGamePickerProps) {
  const [pickedId, setPickedId] = useState(() => pickRandomId(games));
  const game = games.find(g => g.id === pickedId);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="random-game-title"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-bg rounded-lg shadow-lg z-50 w-[calc(100%-2rem)] max-w-sm overflow-hidden"
      >
        <button onClick={onClose} aria-label="Chiudi" className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/40 text-white hover:bg-black/60">
          <X className="h-4 w-4" />
        </button>
        {game ? (
          <>
            <img src={game.CoverImage || '/placeholder.svg'} alt="" className="w-full h-44 object-cover" />
            <div className="p-5">
              <h2 id="random-game-title" className="font-montserrat font-semibold text-lg text-text-primary">{game.Title}</h2>
              <p className="mt-1 text-sm text-text-secondary">
                {game.Platform} · {game.HoursPlayed} ore · {game.Genres.slice(0, 2).join(', ') || 'Generi non indicati'}
              </p>
              <div className="mt-2"><StatusBadge Status={game.Status} /></div>
              <div className="mt-5 flex flex-wrap gap-2">
                {game.Status !== 'InProgress' && (
                  <button className="px-3 py-2 rounded-lg bg-accent-primary text-white text-sm hover:opacity-90" onClick={() => { onStart(game); onClose(); }}>
                    Inizia
                  </button>
                )}
                <button className="px-3 py-2 rounded-lg border border-border-color text-text-primary text-sm hover:bg-secondary-bg" onClick={() => setPickedId(pickRandomId(games, pickedId))}>
                  Un altro
                </button>
                <Link to={`/library/${encodeURIComponent(game.Title.replace(/ /g, '_'))}`} className="px-3 py-2 text-sm text-accent-primary hover:underline">
                  Apri
                </Link>
              </div>
            </div>
          </>
        ) : (
          <p className="p-8 text-center text-text-secondary">Nessun gioco da proporre con i filtri attuali.</p>
        )}
      </div>
    </>
  );
}
