import React, { useState, useEffect } from 'react';
import SidebarFilter from '../../components/library/filter/SidebarFilter';
import LibraryToolbar from '../../components/library/LibraryToolbar';
import GridView from '../../components/library/GridView';
import ListView from '../../components/library/ListView';
import Pagination from '../../components/library/Pagination';
import AddGameModal from '../../components/game/AddGameModal';
import EditGameInfoModal from '../../components/game/EditGameInfoModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import { filterGames, sortGames, calculateMaxValues } from '../../utils/gameUtils';
import { useAllGames } from '../../utils/gamesHooks';
import { useAppDispatch } from '../../store/hooks';
import { deleteGame, updateGameStatus } from '../../store/slice/gamesSlice';
import type { GameFilters, SortOption, SortOrder, Game, GameStatus, GameSearchParams } from '../../types/game';

const LibraryPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const allGamesFromStore = useAllGames();
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [gameToDelete, setGameToDelete] = useState<string | null>(null);
    const [filters, setFilters] = useState<GameFilters>({
        status: [],
        platform: [],
        genre: [],
        priceRange: [0, 0],
        hoursRange: [0, 0],
        metacriticRange: [0, 100],
        purchaseDate: "",
    });
    const [sortBy, setSortBy] = useState<SortOption>("title");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
    const gamesPerPage = 8;

    // Carica i giochi all'inizio e aggiorna quando cambiano i dati da Redux
    useEffect(() => {
        // Calcola i massimali iniziali
        const { priceRange, hoursRange, metacriticRange } = calculateMaxValues(allGamesFromStore);

        // Imposta i filtri iniziali con i massimali calcolati
        setFilters({
            status: [],
            platform: [],
            genre: [],
            priceRange: [0, priceRange[1]],
            hoursRange: [0, hoursRange[1]],
            metacriticRange: [0, metacriticRange[1]],
            purchaseDate: "",
        });

        setFilteredGames(allGamesFromStore);
    }, [allGamesFromStore]);

    // Applica i filtri quando cambiano
    useEffect(() => {
        // Mappa i filtri di tipo GameFilters in GameSearchParams
        const searchParams: GameSearchParams = {
            filters: {
                ...filters,
                priceRange: filters.priceRange || [0, 0],
                hoursRange: filters.hoursRange || [0, 0],
                metacriticRange: filters.metacriticRange || [0, 0],
            },
            sortBy,
            sortOrder,
        };

        const filtered = filterGames(allGamesFromStore, searchParams);
        const sorted = sortGames(filtered, sortBy, sortOrder);
        setFilteredGames(sorted);
        setCurrentPage(1);
    }, [allGamesFromStore, filters, sortBy, sortOrder]);

    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);

    const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

    const handleSortChange = (newSortBy: SortOption) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(newSortBy);
            setSortOrder("asc");
        }
    };

    // Gestisce l'apertura del modale di modifica
    const handleEditGame = (game: Game) => {
        setSelectedGame(game);
        setIsEditModalOpen(true);
    };

    // Gestisce il salvataggio delle modifiche (ora usa Redux automaticamente)
    const handleSaveEdit = (updatedGame: Partial<Game>) => {
        // I modal componenti ora gestiscono Redux internamente
        setIsEditModalOpen(false);
        setSelectedGame(null);
    };

    // Gestisce l'apertura del modale di conferma per l'eliminazione
    const handleDeleteConfirmation = (gameId: string) => {
        setGameToDelete(gameId);
        setIsDeleteModalOpen(true);
    };

    // Gestisce l'eliminazione effettiva del gioco usando Redux
    const handleDeleteGame = () => {
        if (gameToDelete) {
            dispatch(deleteGame(parseInt(gameToDelete)));
            setIsDeleteModalOpen(false);
            setGameToDelete(null);
        }
    };

    // Gestisce il cambio di stato di un gioco usando Redux
    const handleStatusChange = (gameId: string, newStatus: GameStatus) => {
        dispatch(updateGameStatus({ gameId: parseInt(gameId), status: newStatus }));
    };

    return (
        <div className="flex flex-col bg-secondaryBg min-h-screen">
            <main className="flex-grow flex flex-col md:flex-row">
                <SidebarFilter
                    filters={filters}
                    setFilters={setFilters}
                    gamesCount={filteredGames.length}
                    games={allGamesFromStore}
                />

                <div className="flex-1">
                    <LibraryToolbar
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onAddGame={() => setIsAddGameModalOpen(true)}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={handleSortChange}
                    />

                    <div className="p-6">
                        {filteredGames.length > 0 ? (
                            <>
                                {viewMode === "grid" ? (
                                    <GridView 
                                        games={currentGames} 
                                        onEdit={handleEditGame}
                                        onDelete={handleDeleteConfirmation}
                                        onStatusChange={handleStatusChange}
                                    />
                                ) : (
                                    <ListView 
                                        games={currentGames} 
                                        onEdit={handleEditGame}
                                        onDelete={handleDeleteConfirmation}
                                        onStatusChange={handleStatusChange}
                                    />
                                )}
                                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12">
                                <p className="text-text-secondary text-lg mb-4">Nessun gioco trovato con i filtri selezionati</p>
                                <button
                                    onClick={() =>
                                        setFilters({
                                            status: [],
                                            platform: [],
                                            genre: [],
                                            priceRange: [0, filters.priceRange[1]],
                                            hoursRange: [0, filters.hoursRange[1]],
                                            metacriticRange: [0, filters.metacriticRange[1]],
                                            purchaseDate: "",
                                        })
                                    }
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
                confirmButtonText="Elimina"
            />
        </div>
    );
};

export default LibraryPage;