import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game, GameFilters, SortOption, SortOrder } from '../types/game';
import { useAllGames, useLoadGames } from '../store/hooks/gamesHooks';
import { filterGames } from '../utils/gamesUtils';

interface UseGameNavigationProps {
  currentGame: Game;
  filters?: Partial<GameFilters>;
  sortBy?: SortOption;
  sortOrder?: SortOrder;
  search?: string;
}

// Gioco precedente/successivo nello stesso elenco (filtri, ricerca e ordinamento) da cui si è arrivati dalla libreria
export function useGameNavigation({
  currentGame,
  filters,
  sortBy = 'title',
  sortOrder = 'asc',
  search
}: UseGameNavigationProps) {
  const navigate = useNavigate();
  useLoadGames(); // aprendo la pagina da un link diretto nello store c'è solo questo gioco
  const allGames = useAllGames();

  const ordered = useMemo(
    () => filterGames(allGames, { query: search, filters, sortBy, sortOrder }),
    [allGames, search, filters, sortBy, sortOrder]
  );
  const currentIndex = ordered.findIndex(game => game.id === currentGame?.id);
  const previousGame = currentIndex > 0 ? ordered[currentIndex - 1] : null;
  const nextGame = currentIndex !== -1 ? ordered[currentIndex + 1] ?? null : null;

  const goTo = (game: Game | null) => {
    if (!game) return;
    navigate(`/library/${encodeURIComponent(game.Title.replace(/\s/g, '_'))}`, {
      state: { navigationParams: { filters, sortBy, sortOrder, search } }
    });
  };

  return {
    canGoToPrevious: previousGame !== null,
    canGoToNext: nextGame !== null,
    currentIndex,
    totalGames: ordered.length,
    goToPrevious: () => goTo(previousGame),
    goToNext: () => goTo(nextGame)
  };
}
