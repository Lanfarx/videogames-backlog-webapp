import React, { useState, useEffect, useRef, useCallback } from 'react';
import SidebarFilter from '../../components/library/filter/SidebarFilter';
import LibraryToolbar from '../../components/library/LibraryToolbar';
import GridView from '../../components/library/GridView';
import ListView from '../../components/library/ListView';
import Pagination from '../../components/ui/Pagination';
import AddGameModal from '../../components/game/AddGameModal';
import EditGameInfoModal from '../../components/game/EditGameInfoModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { calculateMaxValues } from '../../utils/gamesUtils';
import { useAllGames, usePaginatedGames, useGameActionsWithPagination } from '../../store/hooks/gamesHooks';
import { useAppDispatch } from '../../store/hooks';
import { fetchGames } from '../../store/thunks/gamesThunks';
import type { GameFilters, SortOption, SortOrder, Game, GameStatus } from '../../types/game';

// Interfaccia per i parametri di navigazione che verranno passati alla GamePage
interface NavigationParams {
    filters: GameFilters;
    sortBy: SortOption;
    sortOrder: SortOrder;
    search: string;
}

// Hook personalizzato per il debouncing di funzioni
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): T {
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    
    return useCallback((...args: Parameters<T>) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]) as T;
}

const LibraryPage: React.FC = () => {
    const dispatch = useAppDispatch();    const allGamesFromStore = useAllGames();
    const { remove, update } = useGameActionsWithPagination();    // Hook per la paginazione lato server
    const { 
        paginatedGames, 
        paginationData, 
        paginationLoading, 
        fetchPaginatedGames
    } = usePaginatedGames();const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(() => {
        const savedPage = localStorage.getItem('libraryCurrentPage');
        return savedPage ? parseInt(savedPage, 10) : 1;
    });
    const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [gameToDelete, setGameToDelete] = useState<string | null>(null);     const [filters, setFilters] = useState<GameFilters>({
        Status: [],
        Platform: [],
        genre: [],
        PriceRange: [0, 0],
        hoursRange: [0, 0],
        MetacriticRange: [0, 100],
        PurchaseDate: "",
    });
    
    // Filtri separati per il debouncing (solo range sliders)
    const [debouncedFilters, setDebouncedFilters] = useState<GameFilters>({
        Status: [],
        Platform: [],
        genre: [],
        PriceRange: [0, 0],
        hoursRange: [0, 0],
        MetacriticRange: [0, 100],
        PurchaseDate: "",
    });    // Flag per evitare chiamate API prima che i massimali siano calcolati
    const [filtersInitialized, setFiltersInitialized] = useState(false);    // Stato per l'ordinamento con persistenza localStorage
    const [sortBy, setSortBy] = useState<SortOption>(() => {
        const savedSortBy = localStorage.getItem('librarySortBy');
        return (savedSortBy as SortOption) || "title";
    });
    const [sortOrder, setSortOrder] = useState<SortOrder>(() => {
        const savedSortOrder = localStorage.getItem('librarySortOrder');
        return (savedSortOrder as SortOrder) || "asc";
    });
    const [gamesPerPage, setGamesPerPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [columns, setColumns] = useState(4);
    const gridContainerRef = useRef<HTMLDivElement>(null);    // Funzione debounced per aggiornare i filtri di range
    const updateDebouncedFilters = useDebounce((newFilters: GameFilters) => {
        setDebouncedFilters(newFilters);
    }, 500); // 500ms di delay

    // Carica tutti i giochi per i filtri sidebar (solo se non ancora caricati)
    useEffect(() => {
        if (allGamesFromStore.length === 0) {
            dispatch(fetchGames());
        }
    }, [dispatch, allGamesFromStore.length]);    // Calcola i massimali per i filtri quando i giochi sono caricati
    useEffect(() => {
        if (allGamesFromStore.length > 0) {
            const { PriceRange, hoursRange, MetacriticRange } = calculateMaxValues(allGamesFromStore);
            const newFilters = {
                Status: [],
                Platform: [],
                genre: [],
                PriceRange: [0, PriceRange[1]] as [number, number],
                hoursRange: [0, hoursRange[1]] as [number, number],
                MetacriticRange: [0, MetacriticRange[1]] as [number, number],
                PurchaseDate: "",
            };
            
            setFilters(newFilters);
            setDebouncedFilters(newFilters);
            setFiltersInitialized(true);
        }
    }, [allGamesFromStore]);

    // Sincronizza i filtri per il debouncing
    useEffect(() => {
        // Aggiorna immediatamente i filtri non-range (Status, Platform, genre, PurchaseDate)
        const hasNonRangeChange = 
            JSON.stringify(filters.Status) !== JSON.stringify(debouncedFilters.Status) ||
            JSON.stringify(filters.Platform) !== JSON.stringify(debouncedFilters.Platform) ||
            JSON.stringify(filters.genre) !== JSON.stringify(debouncedFilters.genre) ||
            filters.PurchaseDate !== debouncedFilters.PurchaseDate;
            
        const hasRangeChange = 
            JSON.stringify(filters.PriceRange) !== JSON.stringify(debouncedFilters.PriceRange) ||
            JSON.stringify(filters.hoursRange) !== JSON.stringify(debouncedFilters.hoursRange) ||
            JSON.stringify(filters.MetacriticRange) !== JSON.stringify(debouncedFilters.MetacriticRange);

        if (hasNonRangeChange) {
            // Aggiorna immediatamente per filtri non-range
            setDebouncedFilters(filters);
        } else if (hasRangeChange) {
            // Usa debouncing per i range sliders
            updateDebouncedFilters(filters);
        }
    }, [filters, updateDebouncedFilters]);    // Reset alla prima pagina quando cambiano filtri, ricerca o ordinamento
    // ESCLUSO: reset automatico per i range che si aggiornano quando cambiano i massimali
    useEffect(() => {
        if (!filtersInitialized) return;
        
        // Solo reset per filtri espliciti dell'utente, NON per i range automatici
        const hasUserFilterChanges = 
            debouncedFilters.Status.length > 0 ||
            debouncedFilters.Platform.length > 0 ||
            debouncedFilters.genre.length > 0 ||
            debouncedFilters.PurchaseDate !== "";
            
        // Reset solo se ci sono filtri utente attivi, ricerca o ordinamento
        if (hasUserFilterChanges || searchQuery.trim() !== "" || sortBy !== "title" || sortOrder !== "asc") {
            setCurrentPage(1);
            localStorage.setItem('libraryCurrentPage', '1');
        }
    }, [searchQuery, sortBy, sortOrder, filtersInitialized, 
        debouncedFilters.Status, debouncedFilters.Platform, debouncedFilters.genre, debouncedFilters.PurchaseDate]);    // Carica i giochi paginati quando cambiano i parametri
    useEffect(() => {
        // Non fare chiamate API finché i filtri non sono inizializzati
        if (!filtersInitialized) return;
        
        const loadPaginatedGames = async () => {
            const filtersParam = {
                Status: debouncedFilters.Status,
                Platform: debouncedFilters.Platform,
                genre: debouncedFilters.genre,
                PriceRange: debouncedFilters.PriceRange,
                hoursRange: debouncedFilters.hoursRange,
                MetacriticRange: debouncedFilters.MetacriticRange,
                PurchaseDate: debouncedFilters.PurchaseDate
            };

            await fetchPaginatedGames({
                page: currentPage,
                pageSize: gamesPerPage,
                filters: JSON.stringify(filtersParam),
                sortBy,
                sortOrder,
                search: searchQuery.trim() || undefined
            });
        };        loadPaginatedGames();
    }, [currentPage, gamesPerPage, debouncedFilters, sortBy, sortOrder, searchQuery, fetchPaginatedGames, filtersInitialized]);

    // Gestione responsive delle colonne
    useEffect(() => {
        function calculateColumns() {
            const width = window.innerWidth;
            if (width >= 1536) return 5;
            if (width >= 1280) return 4;
            if (width >= 1024) return 3;
            if (width >= 640) return 2;
            return 1;
        }
        function handleResize() {
            setColumns(calculateColumns());
        }
        setColumns(calculateColumns());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);    // Calcola gamesPerPage in base alla vista
    useEffect(() => {
        if (viewMode === "grid") {
            const rows = 3;
            setGamesPerPage(columns * rows);
        } else {
            setGamesPerPage(14);
        }
    }, [viewMode, columns]);    // Reset alla prima pagina quando cambia gamesPerPage
    useEffect(() => {
        setCurrentPage(1);
        localStorage.setItem('libraryCurrentPage', '1');
    }, [gamesPerPage]);const handleSortChange = (newSortBy: SortOption) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(newSortBy);
            setSortOrder("asc");
        }
    };const handleFiltersChange = (newFilters: GameFilters | ((prev: GameFilters) => GameFilters)) => {
        if (typeof newFilters === 'function') {            setFilters(newFilters);        } else {
            setFilters(newFilters);
        }
    };    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
    };    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        localStorage.setItem('libraryCurrentPage', page.toString());
    };// Funzione helper per resettare alla prima pagina
    const resetToFirstPage = () => {
        setCurrentPage(1);
        localStorage.setItem('libraryCurrentPage', '1');
    };

    // Gestisce l'apertura del modale di modifica
    const handleEditGame = (game: Game) => {
        setSelectedGame(game);
        setIsEditModalOpen(true);
    };    // Gestisce il salvataggio delle modifiche
    const handleSaveEdit = (updatedGame: Partial<Game>) => {
        setIsEditModalOpen(false);
        setSelectedGame(null);
    };

    // Gestisce l'apertura del modale di conferma per l'eliminazione
    const handleDeleteConfirmation = (GameId: string) => {
        setGameToDelete(GameId);
        setIsDeleteModalOpen(true);
    };    // Gestisce l'eliminazione effettiva del gioco mantenendo la pagina corrente
    const handleDeleteGame = async () => {
        if (!gameToDelete || !paginationData) return;

        const gameId = parseInt(gameToDelete);
        await remove(gameId);

        // Logica per mantenere la posizione della pagina dopo l'eliminazione
        const totalGamesAfterDelete = paginationData.totalItems - 1;
        const maxPossiblePage = Math.ceil(totalGamesAfterDelete / paginationData.pageSize);
          // Se la pagina corrente è ancora valida, mantienila
        // Altrimenti, vai alla pagina precedente
        if (currentPage > maxPossiblePage && maxPossiblePage > 0) {
            setCurrentPage(maxPossiblePage);
            localStorage.setItem('libraryCurrentPage', maxPossiblePage.toString());
        }

        setIsDeleteModalOpen(false);
        setGameToDelete(null);
    };// Gestisce il refresh dei giochi
    const handleRefreshGames = () => {
        dispatch(fetchGames());
        // Ricarica anche la pagina corrente
        const filtersParam = {
            Status: debouncedFilters.Status,
            Platform: debouncedFilters.Platform,
            genre: debouncedFilters.genre,
            PriceRange: debouncedFilters.PriceRange,
            hoursRange: debouncedFilters.hoursRange,
            MetacriticRange: debouncedFilters.MetacriticRange,
            PurchaseDate: debouncedFilters.PurchaseDate
        };
        
        fetchPaginatedGames({
            page: currentPage,
            pageSize: gamesPerPage,
            filters: JSON.stringify(filtersParam),
            sortBy,
            sortOrder,
            search: searchQuery.trim() || undefined
        });
    };

    // Gestisce il cambio di stato di un gioco
    const handleStatusChange = (GameId: string, newStatus: GameStatus) => {
        update(parseInt(GameId), { Status: newStatus });
    };    // Effetto per salvare l'ordinamento nel localStorage quando cambia
    useEffect(() => {
        localStorage.setItem('librarySortBy', sortBy);
        localStorage.setItem('librarySortOrder', sortOrder);
    }, [sortBy, sortOrder]);    return (
        <div className="flex flex-col bg-secondary-bg min-h-screen w-full overflow-x-hidden library-container">
            <main className="flex-grow flex flex-col md:flex-row min-w-0 overflow-hidden library-main">
                <SidebarFilter
                    filters={filters}
                    setFilters={handleFiltersChange}
                    gamesCount={paginationData?.totalItems || 0}
                    games={allGamesFromStore}
                />

                <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col library-content">
                    <LibraryToolbar
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onAddGame={() => setIsAddGameModalOpen(true)}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                        onSearchChange={handleSearchChange}
                        onRefreshGames={handleRefreshGames}
                    />

                    <div className="flex-1 p-4 md:p-6 min-w-0 overflow-hidden bg-secondary-bg" ref={gridContainerRef}>
                        {paginationLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-3 text-text-secondary">Caricamento giochi...</span>
                            </div>                        ) : paginatedGames.length > 0 ? (
                            <>
                                {/* Creiamo i parametri di navigazione da passare ai componenti */}
                                {(() => {
                                    const navigationParams: NavigationParams = {
                                        filters: debouncedFilters,
                                        sortBy,
                                        sortOrder,
                                        search: searchQuery
                                    };
                                    
                                    return viewMode === "grid" ? (
                                        <GridView 
                                            games={paginatedGames} 
                                            onEdit={handleEditGame}
                                            onDelete={handleDeleteConfirmation}
                                            onStatusChange={handleStatusChange}
                                            columns={columns}
                                            navigationParams={navigationParams}
                                        />
                                    ) : (
                                        <ListView 
                                            games={paginatedGames} 
                                            onEdit={handleEditGame}
                                            onDelete={handleDeleteConfirmation}
                                            onStatusChange={handleStatusChange}
                                            navigationParams={navigationParams}
                                        />
                                    );
                                })()}
                                {paginationData && (
                                    <Pagination 
                                        currentPage={paginationData.currentPage} 
                                        totalPages={paginationData.totalPages} 
                                        onPageChange={handlePageChange} 
                                    />
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <p className="text-text-secondary text-lg mb-4">Nessun gioco trovato con i filtri selezionati</p>
                                <button
                                    onClick={() => {
                                        const { PriceRange, hoursRange, MetacriticRange } = calculateMaxValues(allGamesFromStore);
                                        setFilters({
                                            Status: [],
                                            Platform: [],
                                            genre: [],
                                            PriceRange: [0, PriceRange[1]],
                                            hoursRange: [0, hoursRange[1]],
                                            MetacriticRange: [0, MetacriticRange[1]],
                                            PurchaseDate: "",                                        });
                                        setSearchQuery("");
                                        setCurrentPage(1);
                                        localStorage.setItem('libraryCurrentPage', '1');
                                    }}
                                    className="px-4 py-2 bg-accent-primary text-white font-roboto font-medium text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
                                >
                                    Reimposta filtri
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modali */}
            <AddGameModal 
                isOpen={isAddGameModalOpen} 
                onClose={() => setIsAddGameModalOpen(false)} 
                // Rimosso onSave perché ora il modal gestisce Redux internamente
            />

            {selectedGame && (
                <EditGameInfoModal
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedGame(null);
                    }}
                    game={selectedGame}
                    onSave={handleSaveEdit}
                />
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setGameToDelete(null);
                }}
                onConfirm={handleDeleteGame}
                title="Elimina gioco"
                message="Sei sicuro di voler eliminare questo gioco? Questa azione non può essere annullata."
                confirmButtontext="Elimina"
            />
        </div>
    );
};

export default LibraryPage;