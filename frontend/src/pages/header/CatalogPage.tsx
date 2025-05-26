import React, { useState } from "react";
import { catalogGames } from "../../data/gamesData";
import CatalogGameCard from "../../components/catalog/CatalogGameCard";
import { useAllGames } from "../../store/hooks/gamesHooks";
import AddGameModal from "../../components/game/AddGameModal";
import CatalogSortControls from "../../components/catalog/CatalogSortControls";
import CatalogSearchBar from "../../components/catalog/CatalogSearchBar";

const SORT_OPTIONS = [
  { value: "title", label: "Titolo" },
  { value: "releaseYear", label: "Data di rilascio" },
  { value: "rating", label: "Rating" },
  { value: "metacritic", label: "Metacritic" },
];

const CatalogPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [prefillGame, setPrefillGame] = useState<typeof catalogGames[number] | null>(null);
  const [hideOwned, setHideOwned] = useState(false);  const allGames = useAllGames();

  // Funzione helper per ottenere il rating di un gioco
  const getGameRating = (gameTitle: string) => {
    // Utilizziamo il hook useGameReviewsStats per ottenere il rating medio
    // Nota: questo è un hack poiché non possiamo chiamare hooks in loop
    // In una implementazione reale, dovremmo pre-calcolare questi valori
    const gameData = allGames.find(g => g.title === gameTitle);
    if (gameData?.rating) return gameData.rating;
    
    // Fallback: simula un rating basato sul metacritic
    const catalogGame = catalogGames.find(g => g.title === gameTitle);
    return catalogGame ? Math.min(5, Math.max(1, (catalogGame.metacritic / 100) * 5)) : 0;
  };

  // Filtro e ordinamento
  let filteredGames = catalogGames.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(search.toLowerCase());
    const notOwned = !hideOwned || !allGames.some(g => g.title === game.title);
    return matchesSearch && notOwned;
  });  filteredGames = [...filteredGames].sort((a, b) => {
    if (sortBy === "title") {
      return sortOrder === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (sortBy === "releaseYear") {
      return sortOrder === "asc"
        ? a.releaseYear - b.releaseYear
        : b.releaseYear - a.releaseYear;
    }
    if (sortBy === "rating") {
      const ratingA = getGameRating(a.title);
      const ratingB = getGameRating(b.title);
      return sortOrder === "asc"
        ? ratingA - ratingB
        : ratingB - ratingA;
    }
    if (sortBy === "metacritic") {
      return sortOrder === "asc"
        ? (a.metacritic || 0) - (b.metacritic || 0)
        : (b.metacritic || 0) - (a.metacritic || 0);
    }
    return 0;
  });

  // Responsive grid dinamica: 6 colonne su 2xl, 5 su xl, 4 su lg, 3 su md, 2 su sm, 1 su base
  const gridClass = `grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`;

  const handleAddToLibrary = (game: typeof catalogGames[number]) => {
    setPrefillGame(game);
    setIsAddGameModalOpen(true);
  };

  // Simulazione: nessuna recensione utente per ora
  const getUserReview = (game: typeof catalogGames[number]) => null;  return (
    <div className="flex flex-col min-h-screen bg-secondaryBg">
      <div className="w-full border-b border-border-color bg-primary-bg">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-text-primary font-primary mb-2">Catalogo Giochi</h1>
          <p className="text-text-secondary font-secondary mb-4 max-w-2xl">
            Esplora il catalogo globale dei giochi. Puoi cercare, filtrare e scoprire nuovi titoli da aggiungere alla tua libreria personale.
          </p>
        </div>
      </div>
      <main className="container mx-auto flex-1 px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <CatalogSearchBar search={search} setSearch={setSearch} />
          <CatalogSortControls
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            hideOwned={hideOwned}
            setHideOwned={setHideOwned}
            sortOptions={SORT_OPTIONS}
          />
        </div>
        <div className="p-6">
          <div className={gridClass}>
            {filteredGames.map(game => (
              <CatalogGameCard
                key={game.title}
                game={game}
                isInLibrary={allGames.some(g => g.title === game.title)}
                onAddToLibrary={() => handleAddToLibrary(game)}
                userReview={getUserReview(game)}
              />
            ))}
          </div>
        </div>
        <AddGameModal
          isOpen={isAddGameModalOpen}
          onClose={() => {
            setIsAddGameModalOpen(false);
            setPrefillGame(null);
          }}
          prefillGame={prefillGame}
        />
      </main>
    </div>
  );
};

export default CatalogPage;
