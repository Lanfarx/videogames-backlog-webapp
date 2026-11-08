import { Trash2, X } from 'lucide-react';
import { Status_OPTIONS } from '../../constants/gameConstants';
import type { GameStatus } from '../../types/game';

interface SelectionBarProps {
  selectedCount: number;
  filteredCount: number;
  onSelectAllFiltered: () => void;
  onChangeStatus: (status: GameStatus) => void;
  onDelete: () => void;
  onClear: () => void;
}

// Barra fissa con le azioni sui giochi selezionati, visibile solo con almeno una selezione
export default function SelectionBar({ selectedCount, filteredCount, onSelectAllFiltered, onChangeStatus, onDelete, onClear }: SelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Azioni sui giochi selezionati"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-primary-bg border border-border-color shadow-lg max-w-[calc(100%-2rem)]"
    >
      <span className="font-roboto text-sm text-text-primary font-medium">{selectedCount} selezionati</span>
      {selectedCount < filteredCount && (
        <button className="text-sm text-accent-primary hover:underline" onClick={onSelectAllFiltered}>
          Seleziona tutti i {filteredCount} filtrati
        </button>
      )}
      <select
        value=""
        onChange={e => e.target.value && onChangeStatus(e.target.value as GameStatus)}
        aria-label="Cambia stato dei selezionati"
        className="px-2 py-1.5 rounded-md border border-border-color bg-primary-bg text-text-primary text-sm"
      >
        <option value="">Cambia stato...</option>
        {Status_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <button
        onClick={onDelete}
        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-accent-danger text-white text-sm hover:opacity-90"
      >
        <Trash2 className="h-4 w-4" /> Elimina
      </button>
      <button onClick={onClear} aria-label="Annulla selezione" className="p-1 text-text-secondary hover:text-accent-primary">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
