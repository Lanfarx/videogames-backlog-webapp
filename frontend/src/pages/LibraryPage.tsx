import React, { useState, useEffect } from 'react';
import SidebarFilter from '../components/library/filter/SidebarFilter';
import LibraryToolbar from '../components/library/LibraryToolbar';
import GridView from '../components/library/GridView';
import ListView from '../components/library/ListView';
import Pagination from '../components/library/Pagination';
import AddGameModal from '../components/game/AddGameModal';
import EditGameInfoModal from '../components/game/EditGameInfoModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { filterGames, sortGames, calculateMaxValues } from '../utils/gameUtils';
import { getAllGames, updateGame, deleteGame } from '../utils/gamesData';
import type { GameFilters, SortOption, SortOrder, Game, GameStatus } from '../types/game';

const LibraryPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
    const [allGames, setAllGames] = useState<Game[]>([]);
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

    // Carica i giochi all'inizio
    useEffect(() => {
        const games = getAllGames();
        setAllGames(games);

        // Calcola i massimali iniziali
        const { maxPriceTemp, maxHoursTemp, maxMetacriticTemp } = calculateMaxValues(games);

        // Imposta i filtri iniziali con i massimali calcolati
        setFilters({
            status: [],
            platform: [],
            genre: [],
            priceRange: [0, maxPriceTemp],
            hoursRange: [0, maxHoursTemp],
            metacriticRange: [0, maxMetacriticTemp],
            purchaseDate: "",
        });

        setFilteredGames(games);
    }, []);

    // Applica i filtri quando cambiano
    useEffect(() => {
        const filtered = filterGames(allGames, filters);
        const sorted = sortGames(filtered, sortBy, sortOrder);
        setFilteredGames(sorted);
        setCurrentPage(1);
    }, [filters, sortBy, sortOrder, allGames]);

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

    // Gestisce il salvataggio delle modifiche
    const handleSaveEdit = (updatedGame: Partial<Game>) => {
        if (!updatedGame.id) return; // Ensure the game has an ID
        const updatedGames = allGames.map(game => 
            game.id === updatedGame.id ? { ...game, ...updatedGame } : game
        );
        setAllGames(updatedGames);
        updateGame({ ...allGames.find(game => game.id === updatedGame.id), ...updatedGame } as Game); // Ensure a full Game is passed
        setIsEditModalOpen(false);
        setSelectedGame(null);
    };

    // Gestisce l'apertura del modale di conferma per l'eliminazione
    const handleDeleteConfirmation = (gameId: string) => {
        setGameToDelete(gameId);
        setIsDeleteModalOpen(true);
    };

    // Gestisce l'eliminazione effettiva del gioco
    const handleDeleteGame = () => {
        if (gameToDelete) {
            const newGames = allGames.filter(game => game.id !== parseInt(gameToDelete));
            setAllGames(newGames);
            deleteGame(parseInt(gameToDelete)); // Elimina dal database o da localStorage
            setIsDeleteModalOpen(false);
            setGameToDelete(null);
        }
    };

    // Gestisce il cambio di stato di un gioco
    const handleStatusChange = (gameId: string, newStatus: GameStatus) => {
        const gameToUpdate = allGames.find(game => game.id === parseInt(gameId));
        if (gameToUpdate) {
            const now = new Date().toISOString();
            const updatedGame = { 
                ...gameToUpdate, 
                status: newStatus,
                // Aggiorna le date in base al nuovo stato
                ...(newStatus === 'completed' && { completionDate: now }),
                ...(newStatus === 'platinum' && { platinumDate: now, completionDate: gameToUpdate.completionDate || now })
            };
            
            const updatedGames = allGames.map(game => 
                game.id === parseInt(gameId) ? updatedGame : game
            );
            
            setAllGames(updatedGames);
            updateGame(updatedGame);
        }
    };

    return (
        <div className="flex flex-col bg-secondaryBg min-h-screen">
            <main className="flex-grow flex flex-col md:flex-row">
                <SidebarFilter
                    filters={filters}
                    setFilters={setFilters}
                    gamesCount={filteredGames.length}
                    games={allGames}
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
                onSave={(newGame: Game) => {
                    setAllGames([...allGames, newGame]);
                    setIsAddGameModalOpen(false);
                }}
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
                } }
                onConfirm={handleDeleteGame}
                title="Elimina gioco"
                message="Sei sicuro di voler eliminare questo gioco? Questa azione non può essere annullata." confirmButtonText={''}            />
        </div>
    );
};

export default LibraryPage;