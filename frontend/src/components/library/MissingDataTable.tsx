import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import type { Game, GameUpdateInput } from '../../types/game';

interface MissingDataTableProps {
  games: Game[];
  onUpdate: (gameId: number, data: GameUpdateInput) => void;
  onEdit: (game: Game) => void;
}

const inputClass = 'w-24 px-2 py-1 rounded border border-border-color bg-primary-bg text-text-primary text-sm';

// Numero salvato all'uscita dalla cella, solo se valido e cambiato
function NumberCell({ value, label, step = 1, onSave }: { value: number | null | undefined; label: string; step?: number; onSave: (value: number) => void }) {
  return (
    <input
      key={value ?? 'vuoto'}
      type="number"
      min={0}
      step={step}
      defaultValue={value ?? ''}
      aria-label={label}
      className={inputClass}
      onBlur={e => {
        const number = Number(e.target.value);
        if (e.target.value !== '' && number !== value) onSave(number);
      }}
    />
  );
}

// Tabella dei giochi a cui manca qualche dato, con prezzo, anno e data d'acquisto modificabili direttamente
export default function MissingDataTable({ games, onUpdate, onEdit }: MissingDataTableProps) {
  const header = 'text-left p-3 font-roboto font-medium text-sm text-text-secondary border-b border-border-color';
  const cell = 'p-3 border-b border-border-color align-middle';

  return (
    <div className="overflow-x-auto w-full min-w-0">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr className="bg-secondary-bg">
            <th className={header}>Gioco</th>
            <th className={header}>Prezzo</th>
            <th className={header}>Anno</th>
            <th className={header}>Data acquisto</th>
            <th className={header}>Generi</th>
          </tr>
        </thead>
        <tbody>
          {games.map(game => (
            <tr key={game.id} className="hover:bg-tertiary-bg transition-colors">
              <td className={cell}>
                <div className="flex items-center gap-3">
                  <img src={game.CoverImage || '/placeholder.svg'} alt="" loading="lazy" className="h-10 w-16 object-cover rounded" />
                  <Link to={`/library/${encodeURIComponent(game.Title.replace(/ /g, '_'))}`} className="font-montserrat text-sm text-text-primary hover:text-accent-primary">
                    {game.Title}
                  </Link>
                </div>
              </td>
              <td className={cell}>
                <div className="flex items-center gap-2">
                  <NumberCell label={`Prezzo di ${game.Title}`} step={0.01} value={game.Price != null && game.Price > 0 ? game.Price : null} onSave={price => onUpdate(game.id, { Price: price })} />
                  {[{ label: 'Gratis', price: 0 }, { label: 'Regalato', price: -1 }].map(({ label, price }) => (
                    <button
                      key={label}
                      type="button"
                      aria-pressed={game.Price === price}
                      onClick={() => onUpdate(game.id, { Price: price })}
                      className={`px-2 py-1 rounded text-xs border ${game.Price === price ? 'bg-accent-primary text-white border-accent-primary' : 'border-border-color text-text-secondary hover:text-accent-primary'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </td>
              <td className={cell}>
                <NumberCell label={`Anno di uscita di ${game.Title}`} value={game.ReleaseYear || null} onSave={year => onUpdate(game.id, { ReleaseYear: year })} />
              </td>
              <td className={cell}>
                <input
                  type="date"
                  defaultValue={game.PurchaseDate?.slice(0, 10) ?? ''}
                  aria-label={`Data di acquisto di ${game.Title}`}
                  className={`${inputClass} w-36`}
                  onBlur={e => e.target.value && e.target.value !== game.PurchaseDate?.slice(0, 10) && onUpdate(game.id, { PurchaseDate: e.target.value })}
                />
              </td>
              <td className={cell}>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  {game.Genres.length > 0 ? game.Genres.slice(0, 3).join(', ') : <span className="text-yellow-500">Mancanti</span>}
                  <button type="button" onClick={() => onEdit(game)} aria-label={`Modifica ${game.Title}`} className="p-1 hover:text-accent-primary">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
