import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import SidebarFilter from '../../components/library/filter/SidebarFilter';
import LibraryToolbar from '../../components/library/LibraryToolbar';
import GridView from '../../components/library/GridView';
import ListView from '../../components/library/ListView';
import MissingDataTable from '../../components/library/MissingDataTable';
import RandomGamePicker from '../../components/library/RandomGamePicker';
import SelectionBar from '../../components/library/SelectionBar';
import Pagination from '../../components/ui/Pagination';
import AddGameModal from '../../components/game/AddGameModal';
import EditGameInfoModal from '../../components/game/EditGameInfoModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import ActiveFilterChips from '../../components/library/ActiveFilterChips';
import { calculateMaxValues, filterGames, isMissingData } from '../../utils/gamesUtils';
import { useAllGames, useGameActions, useLoadGames } from '../../store/hooks/gamesHooks';
import { useToast } from '../../contexts/ToastContext';
import type { GameFilters, SortOption, SortOrder, Game, GameStatus, GameUpdateInput, GameViewMode } from '../../types/game';

const GAMES_PER_PAGE_LIST = 14;
const GRID_ROWS = 3;

function getColumns() {
    const width = window.innerWidth;
    if (width >= 1536) return 5;
    if (width >= 1280) return 4;
    if (width >= 1024) return 3;
    if (width >= 640) return 2;
    return 1;
}

const EMPTY_FILTERS: GameFilters = {
    Status: [],
    Platform: [],
    genre: [],
    PriceRange: [0, 0],
    hoursRange: [0, 0],
    MetacriticRange: [0, 100],
    PurchaseDate: "",
};

// Filtri scelti cliccando un grafico della dashboard: sostituiscono quelli salvati, con gli intervalli al massimo
// (l'effetto sui massimali li porta ai valori reali appena i giochi sono caricati)
function filtersFromDashboard(selected: Partial<GameFilters>): GameFilters {
    const fullRange: [number, number] = [0, Number.POSITIVE_INFINITY];
    return { ...EMPTY_FILTERS, PriceRange: fullRange, hoursRange: fullRange, MetacriticRange: fullRange, ...selected };
}

function loadSavedFilters(): GameFilters {
    try {
        const parsed = JSON.parse(localStorage.getItem('libraryFilters') || 'null');
        if (parsed) {
            return {
                Status: parsed.Status || [],
                Platform: parsed.Platform || [],
                genre: parsed.genre || [],
                PriceRange: parsed.PriceRange || EMPTY_FILTERS.PriceRange,
                hoursRange: parsed.hoursRange || EMPTY_FILTERS.hoursRange,
                MetacriticRange: parsed.MetacriticRange || EMPTY_FILTERS.MetacriticRange,
                PurchaseDate: parsed.PurchaseDate || "",
            };
        }
    } catch (error) {
        console.warn('Errore nel caricamento dei filtri salvati:', error);
    }
    return EMPTY_FILTERS;
}

export default function LibraryPage() {
    const dashboardFilters = (useLocation().state as { filters?: Partial<GameFilters> } | null)?.filters;
    const { loading, gamesLoaded } = useLoadGames();
    const allGames = useAllGames();
    const { update, remove, removeBulk, updateStatusBulk } = useGameActions();
    const { showToast } = useToast();

    // La modalità "da completare" non si ricorda: riaprendo la libreria si torna a griglia o lista
    const [viewMode, setViewMode] = useState<GameViewMode>(() =>
        localStorage.getItem('libraryViewMode') === 'list' ? 'list' : 'grid');
    const [currentPage, setCurrentPage] = useState(() => dashboardFilters ? 1 : Number(localStorage.getItem('libraryCurrentPage')) || 1);
    const [columns, setColumns] = useState(getColumns);
    const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [gameToDelete, setGameToDelete] = useState<string | null>(null);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isRandomOpen, setIsRandomOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    // Giochi modificati dalla tabella "da completare": restano in elenco anche se ora hanno i dati
    const [editedIds, setEditedIds] = useState<Set<number>>(new Set());

    const [filters, setFilters] = useState<GameFilters>(() => dashboardFilters ? filtersFromDashboard(dashboardFilters) : loadSavedFilters());
    // I massimali dei filtri a intervallo si calcolano quando i giochi sono caricati: fino ad allora l'elenco resta vuoto
    const [filtersInitialized, setFiltersInitialized] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>(() => (localStorage.getItem('librarySortBy') as SortOption) || "title");
    const [sortOrder, setSortOrder] = useState<SortOrder>(() => (localStorage.getItem('librarySortOrder') as SortOrder) || "asc");
    const [searchQuery, setSearchQuery] = useState(() => dashboardFilters ? "" : localStorage.getItem('librarySearchQuery') || "");

    const filterMaxes = useMemo(() => calculateMaxValues(allGames), [allGames]);

    // Ultimi massimali visti: un limite superiore lasciato al massimo segue il nuovo massimo (es. ore aumentate dopo una sync Steam)
    const lastMaxes = useRef<ReturnType<typeof calculateMaxValues> | null>(null);
    useEffect(() => {
        if (allGames.length === 0) return;
        if (!lastMaxes.current) {
            try {
                lastMaxes.current = JSON.parse(localStorage.getItem('libraryFilterMaxes') || 'null');
            } catch {
                lastMaxes.current = null;
            }
        }
        const previous = lastMaxes.current;
        lastMaxes.current = filterMaxes;
        localStorage.setItem('libraryFilterMaxes', JSON.stringify(filterMaxes));
        const adjustRange = (current: [number, number], key: 'PriceRange' | 'hoursRange' | 'MetacriticRange'): [number, number] => {
            const newMax = filterMaxes[key][1];
            const wasAtMax = !previous || current[1] >= previous[key][1];
            return [current[0], wasAtMax ? newMax : Math.min(current[1], newMax)];
        };
        setFilters(current => ({
            ...current,
            PriceRange: adjustRange(current.PriceRange, 'PriceRange'),
            hoursRange: adjustRange(current.hoursRange, 'hoursRange'),
            MetacriticRange: adjustRange(current.MetacriticRange, 'MetacriticRange'),
        }));
        setFiltersInitialized(true);
    }, [allGames, filterMaxes]);

    const filtered = useMemo(
        () => filtersInitialized ? filterGames(allGames, { query: searchQuery.trim(), filters, sortBy, sortOrder }) : [],
        [allGames, filtersInitialized, searchQuery, filters, sortBy, sortOrder]
    );
    const visible = useMemo(
        () => viewMode === 'complete' ? filtered.filter(game => isMissingData(game) || editedIds.has(game.id)) : filtered,
        [filtered, viewMode, editedIds]
    );
    const missingCount = useMemo(() => allGames.filter(isMissingData).length, [allGames]);

    const pageSize = viewMode === 'grid' ? columns * GRID_ROWS : GAMES_PER_PAGE_LIST;
    const totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
    // Se i risultati si restringono (filtro a intervallo, eliminazioni) si resta sull'ultima pagina valida
    const page = Math.min(currentPage, totalPages);
    const pageGames = visible.slice((page - 1) * pageSize, page * pageSize);

    // Torna alla prima pagina quando cambiano ricerca, ordinamento o filtri a scelta (non i range, che si limitano a restringere)
    const queryKey = JSON.stringify([searchQuery, sortBy, sortOrder, filters.Status, filters.Platform, filters.genre, filters.PurchaseDate]);
    const lastQueryKey = useRef<string | null>(null);
    useEffect(() => {
        if (!filtersInitialized) return;
        if (lastQueryKey.current !== null && lastQueryKey.current !== queryKey) {
            setCurrentPage(1);
            localStorage.setItem('libraryCurrentPage', '1');
        }
        lastQueryKey.current = queryKey;
    }, [queryKey, filtersInitialized]);

    useEffect(() => {
        const handleResize = () => setColumns(getColumns());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        localStorage.setItem('librarySortBy', sortBy);
        localStorage.setItem('librarySortOrder', sortOrder);
    }, [sortBy, sortOrder]);

    useEffect(() => {
        if (filtersInitialized) localStorage.setItem('libraryFilters', JSON.stringify(filters));
    }, [filters, filtersInitialized]);

    useEffect(() => {
        if (viewMode !== 'complete') localStorage.setItem('libraryViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        localStorage.setItem('librarySearchQuery', searchQuery);
    }, [searchQuery]);

    // La selezione vale per le viste a griglia e a lista
    useEffect(() => {
        if (viewMode === 'complete') setSelectedIds(new Set());
        else setEditedIds(new Set());
    }, [viewMode]);

    const toggleSelect = useCallback((gameId: number) => setSelectedIds(prev => {
        const next = new Set(prev);
        if (!next.delete(gameId)) next.add(gameId);
        return next;
    }), []);
    const selection = useMemo(() => ({ selectedIds, onToggle: toggleSelect }), [selectedIds, toggleSelect]);
    const navigationParams = useMemo(
        () => ({ filters, sortBy, sortOrder, search: searchQuery }),
        [filters, sortBy, sortOrder, searchQuery]
    );

    const handleSortChange = (newSortBy: SortOption) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(newSortBy);
            setSortOrder("asc");
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        localStorage.setItem('libraryCurrentPage', newPage.toString());
    };

    const handleEditGame = (game: Game) => {
        setSelectedGame(game);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedGame(null);
    };

    const handleDeleteGame = async () => {
        if (!gameToDelete) return;
        const gameId = parseInt(gameToDelete);
        await remove(gameId);
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.delete(gameId);
            return next;
        });
        setGameToDelete(null);
    };

    const handleStatusChange = (gameId: string, newStatus: GameStatus) => {
        update(parseInt(gameId), { Status: newStatus });
    };

    const handleMissingDataUpdate = (gameId: number, data: GameUpdateInput) => {
        setEditedIds(prev => new Set(prev).add(gameId));
        update(gameId, data);
    };

    const handleBulkStatus = async (status: GameStatus) => {
        await updateStatusBulk([...selectedIds], status);
        showToast('success', 'Stato aggiornato', `${selectedIds.size} giochi`);
        setSelectedIds(new Set());
    };

    const handleBulkDelete = async () => {
        await removeBulk([...selectedIds]);
        showToast('success', 'Giochi eliminati', `${selectedIds.size} giochi`);
        setSelectedIds(new Set());
        setIsBulkDeleteOpen(false);
    };

    const handleResetFilters = () => {
        setFilters({
            ...EMPTY_FILTERS,
            PriceRange: [0, filterMaxes.PriceRange[1]],
            hoursRange: [0, filterMaxes.hoursRange[1]],
            MetacriticRange: [0, filterMaxes.MetacriticRange[1]],
        });
        localStorage.removeItem('libraryFilters');
        setSearchQuery("");
        handlePageChange(1);
    };

    // Per "scegli a caso": tra i giochi filtrati, i "Da iniziare" a meno che non si sia scelto uno stato
    const randomPool = filters.Status.length > 0 ? filtered : filtered.filter(game => game.Status === 'NotStarted');

    return (
        <div className="flex flex-col bg-secondary-bg min-h-screen w-full overflow-x-hidden library-container">
            <main className="flex-grow flex flex-col md:flex-row min-w-0 overflow-hidden library-main">
                <SidebarFilter
                    filters={filters}
                    setFilters={setFilters}
                    gamesCount={filtered.length}
                    games={allGames}
                />

                <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col library-content">
                    <LibraryToolbar
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        missingCount={missingCount}
                        onRandomGame={() => setIsRandomOpen(true)}
                        onAddGame={() => setIsAddGameModalOpen(true)}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />

                    <div className="flex-1 p-4 md:p-6 min-w-0 overflow-hidden bg-secondary-bg">
                        <ActiveFilterChips
                            filters={filters}
                            setFilters={setFilters}
                            maxes={filterMaxes}
                            searchQuery={searchQuery}
                            onClearSearch={() => setSearchQuery("")}
                        />
                        {(loading || !gamesLoaded) && allGames.length === 0 ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-text-secondary">Caricamento giochi...</span>
                            </div>
                        ) : pageGames.length > 0 ? (
                            <>
                                {viewMode === 'grid' && (
                                    <GridView
                                        games={pageGames}
                                        onEdit={handleEditGame}
                                        onDelete={setGameToDelete}
                                        onStatusChange={handleStatusChange}
                                        columns={columns}
                                        navigationParams={navigationParams}
                                        selection={selection}
                                    />
                                )}
                                {viewMode === 'list' && (
                                    <ListView
                                        games={pageGames}
                                        onEdit={handleEditGame}
                                        onDelete={setGameToDelete}
                                        onStatusChange={handleStatusChange}
                                        navigationParams={navigationParams}
                                        selection={selection}
                                    />
                                )}
                                {viewMode === 'complete' && (
                                    <MissingDataTable games={pageGames} onUpdate={handleMissingDataUpdate} onEdit={handleEditGame} />
                                )}
                                {totalPages > 1 && (
                                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <p className="text-text-secondary text-lg mb-4">
                                    {viewMode === 'complete' ? 'Nessun gioco con dati da completare' : 'Nessun gioco trovato con i filtri selezionati'}
                                </p>
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 bg-accent-primary text-white font-roboto font-medium text-sm rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Reimposta filtri
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <SelectionBar
                selectedCount={selectedIds.size}
                filteredCount={filtered.length}
                onSelectAllFiltered={() => setSelectedIds(new Set(filtered.map(game => game.id)))}
                onChangeStatus={handleBulkStatus}
                onDelete={() => setIsBulkDeleteOpen(true)}
                onClear={() => setSelectedIds(new Set())}
            />

            {/* Modali */}
            <AddGameModal
                isOpen={isAddGameModalOpen}
                onClose={() => setIsAddGameModalOpen(false)}
            />

            {isRandomOpen && (
                <RandomGamePicker
                    games={randomPool}
                    onClose={() => setIsRandomOpen(false)}
                    onStart={game => update(game.id, { Status: 'InProgress' })}
                />
            )}

            {selectedGame && (
                <EditGameInfoModal
                    isOpen={isEditModalOpen}
                    onClose={closeEditModal}
                    game={selectedGame}
                    onSave={closeEditModal}
                />
            )}

            <ConfirmationModal
                isOpen={gameToDelete !== null}
                onClose={() => setGameToDelete(null)}
                onConfirm={handleDeleteGame}
                title="Elimina gioco"
                message="Sei sicuro di voler eliminare questo gioco? Questa azione non può essere annullata. Se viene da Steam, la sincronizzazione non lo reimporterà."
                confirmButtontext="Elimina"
            />

            <ConfirmationModal
                isOpen={isBulkDeleteOpen}
                onClose={() => setIsBulkDeleteOpen(false)}
                onConfirm={handleBulkDelete}
                title="Elimina giochi selezionati"
                message={`Sei sicuro di voler eliminare ${selectedIds.size} giochi? Questa azione non può essere annullata. Quelli che vengono da Steam non saranno reimportati dalla sincronizzazione.`}
                confirmButtontext="Elimina"
            />
        </div>
    );
}
