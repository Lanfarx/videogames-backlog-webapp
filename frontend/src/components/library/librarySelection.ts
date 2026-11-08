// Selezione multipla della libreria: la gestisce LibraryPage, le viste mostrano solo le checkbox
export interface LibrarySelection {
  selectedIds: Set<number>;
  onToggle: (gameId: number) => void;
}
