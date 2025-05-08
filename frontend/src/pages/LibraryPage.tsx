import React, { useState, useEffect } from 'react';
import SidebarFilter from '../components/library/filter/SidebarFilter';
import LibraryToolbar from '../components/library/LibraryToolbar';
import GridView from '../components/library/GridView';
import ListView from '../components/library/ListView';
import Pagination from '../components/library/Pagination';
import AddGameModal from '../components/game/AddGameModal';
import { filterGames, sortGames, calculateMaxValues } from '../utils/gameUtils';
import { getAllGames } from '../utils/gamesData';
import type { GameFilters, SortOption, SortOrder, Game } from '../types/game';

const LibraryPage: React.FC = () => {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
    const [allGames, setAllGames] = useState<Game[]>([]);
    const [filteredGames, setFilteredGames] = useState<Game[]>([]);
    const [filters, setFilters] = useState<GameFilters>({
        status: [],
        platform: [],
        genre: [],
        priceRange: [0, 0],
        hoursRange: [0, 0],
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
        const { maxPriceTemp, maxHoursTemp } = calculateMaxValues(games);

        // Imposta i filtri iniziali con i massimali calcolati
        setFilters({
            status: [],
            platform: [],
            genre: [],
            priceRange: [0, maxPriceTemp],
            hoursRange: [0, maxHoursTemp],
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

    return (
        <div className="flex flex-col min-h-screen border">
            <main className="flex-grow flex flex-col md:flex-row">
                <SidebarFilter
                    filters={filters}
                    setFilters={setFilters}
                    gamesCount={filteredGames.length}
                    games={allGames}
                />

                <div className="flex-1 px-4">
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
                                {viewMode === "grid" ? <GridView games={currentGames} /> : <ListView games={currentGames} />}
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
                                            priceRange: [0, 70],
                                            hoursRange: [0, 100],
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
            <AddGameModal isOpen={isAddGameModalOpen} onClose={() => setIsAddGameModalOpen(false)} />
        </div>
    );
};

export default LibraryPage;