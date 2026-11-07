import React from 'react';
import { X } from 'lucide-react';
import { Status_LABELS } from '../../constants/gameConstants';
import type { GameFilters, NumericRange } from '../../types/game';

type RangeKey = 'PriceRange' | 'hoursRange' | 'MetacriticRange';

const RANGE_LABELS: Record<RangeKey, string> = {
  PriceRange: 'Prezzo',
  hoursRange: 'Ore',
  MetacriticRange: 'Metacritic',
};

interface ActiveFilterChipsProps {
  filters: GameFilters;
  setFilters: React.Dispatch<React.SetStateAction<GameFilters>>;
  maxes: Record<RangeKey, NumericRange>;
  searchQuery: string;
  onClearSearch: () => void;
}

// Mostra i filtri attivi come chip rimovibili, così si capisce subito perché un gioco non compare
export default function ActiveFilterChips({ filters, setFilters, maxes, searchQuery, onClearSearch }: ActiveFilterChipsProps) {
  const chips: { key: string; label: string; onRemove: () => void }[] = [];

  if (searchQuery.trim()) {
    chips.push({ key: 'search', label: `Cerca: "${searchQuery.trim()}"`, onRemove: onClearSearch });
  }

  const listKeys = ['Status', 'Platform', 'genre'] as const;
  for (const listKey of listKeys) {
    for (const value of filters[listKey] as string[]) {
      chips.push({
        key: `${listKey}-${value}`,
        label: listKey === 'Status' ? Status_LABELS[value] ?? value : value,
        onRemove: () => setFilters(prev => ({ ...prev, [listKey]: (prev[listKey] as string[]).filter(v => v !== value) })),
      });
    }
  }

  for (const rangeKey of Object.keys(RANGE_LABELS) as RangeKey[]) {
    const [min, max] = filters[rangeKey];
    const fullMax = maxes[rangeKey][1];
    if (min > 0 || max < fullMax) {
      chips.push({
        key: rangeKey,
        label: `${RANGE_LABELS[rangeKey]}: ${min}–${max}`,
        onRemove: () => setFilters(prev => ({ ...prev, [rangeKey]: [0, fullMax] })),
      });
    }
  }

  if (filters.PurchaseDate) {
    chips.push({
      key: 'PurchaseDate',
      label: `Acquistato il ${filters.PurchaseDate}`,
      onRemove: () => setFilters(prev => ({ ...prev, PurchaseDate: '' })),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map(chip => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 pl-3 pr-1 py-1 rounded-full bg-accent-primary/10 text-text-primary text-sm"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Rimuovi filtro ${chip.label}`}
            className="p-0.5 rounded-full hover:bg-accent-primary/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}
