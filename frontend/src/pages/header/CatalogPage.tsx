import React, { useState, useEffect } from "react";
// import { catalogGames } from "../../data/gamesData";
import CatalogGameCard from "../../components/catalog/CatalogGameCard";
import { useAllGames } from "../../store/hooks/gamesHooks";
import { usePublicCommunityRatingsWithCount } from "../../store/hooks/communityHooks";
import AddGameModal from "../../components/game/AddGameModal";
import CatalogSortControls from "../../components/catalog/CatalogSortControls";
import CatalogSearchBar from "../../components/catalog/CatalogSearchBar";
import Pagination from "../../components/ui/Pagination";
import { getPaginatedGames, getGameDetails } from '../../store/services/rawgService';
import { wishlistService, AddToWishlistDto } from '../../store/services/wishlistService';
import { useNavigate } from "react-router-dom";
import { findMatchingGame } from '../../utils/gameMatchingUtils';
import { useToast } from '../../contexts/ToastContext';

const SORT_OPTIONS = [
  { value: "title", label: "Titolo" },
  { value: "ReleaseYear", label: "Data di rilascio" },
  { value: "Rating", label: "Rating" },
  { value: "Metacritic", label: "Metacritic" },
];

const CatalogPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Metacritic");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [prefillGame, setPrefillGame] = useState<any>(null);
  const [hideOwned, setHideOwned] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [gamesPerPage, setGamesPerPage] = useState(48); 
  const [columns, setColumns] = useState(6);
  const [apiGames, setApiGames] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);  const [error, setError] = useState<string | null>(null);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const navigate = useNavigate();
  const { showToast } = useToast();const userGames = useAllGames();
  // Carica la wishlist dell'utente
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const response = await wishlistService.getWishlist();
        setWishlistItems(response.data);
      } catch (error) {
        console.error('Errore nel caricamento della wishlist:', error);
      }
    };
    loadWishlist();
  }, []);

  // Calcola colonne dinamicamente come in LibraryPage
  useEffect(() => {
    function calculateColumns() {
      const width = window.innerWidth;
      if (width >= 1536) return 6;
      if (width >= 1280) return 5;
      if (width >= 1024) return 4;
      if (width >= 640) return 3;
      if (width >= 480) return 2;
      return 1;
    }
    function handleResize() {
      setColumns(calculateColumns());
    }
    setColumns(calculateColumns());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    setGamesPerPage(columns * 8);
  }, [columns]);

  // Carica i giochi dall'API RAWG
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    getPaginatedGames(currentPage, gamesPerPage, {
      search: search || undefined,
      ordering: sortBy === 'title' ? (sortOrder === 'asc' ? 'name' : '-name')
        : sortBy === 'ReleaseYear' ? (sortOrder === 'asc' ? 'released' : '-released')
        : sortBy === 'Metacritic' ? (sortOrder === 'asc' ? 'metacritic' : '-metacritic')
        : undefined,
      Platforms: '1,4,7,18,22',
    })
      .then(data => {
        setApiGames(data.results || []);
        setTotalPages(Math.ceil((data.count || 0) / gamesPerPage));
      })
      .catch(err => {
        setError('Errore nel caricamento dei giochi dal catalogo.');
      })
      .finally(() => setIsLoading(false));
  }, [currentPage, gamesPerPage, search, sortBy, sortOrder, columns]);
  // Mappa solo i dati necessari per CatalogGameCard
  const mappedGames = apiGames.map((rawgGame: any) => ({
    id: String(rawgGame.id), // id RAWG come stringa
    Title: rawgGame.name,
    CoverImage: rawgGame.background_image || "/placeholder.svg",
    ReleaseYear: rawgGame.released ? new Date(rawgGame.released).getFullYear() : 0,
    Genres: rawgGame.genres?.map((g: any) => g.name) || [],
    Metacritic: rawgGame.metacritic,
  }));
  // Ottieni i rating della community per tutti i giochi in una volta
  const gameTitles = mappedGames.map(game => game.Title);
  const { data: communityRatings = {} } = usePublicCommunityRatingsWithCount(gameTitles);

  // Stato per gestire la navigazione con titolo
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedGameId) {
      // Naviga alla pagina dettagli passando l'id RAWG nella rotta
      navigate(`/catalog/${selectedGameId}`);
    }
  }, [selectedGameId, navigate]);

  // Responsive grid dinamica: 6 colonne su 2xl, 5 su xl, 4 su lg, 3 su md, 2 su sm, 1 su base
  const gridClass = `grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`;  const handleAddToLibrary = async (game: any) => {
    try {
      setIsLoading(true);
      // Ottieni i dettagli completi del gioco dall'API RAWG
      const gameDetails = await getGameDetails(game.id.toString());
      setPrefillGame(gameDetails);
      setIsAddGameModalOpen(true);
    } catch (error) {
      console.error('Errore nel caricamento dei dettagli del gioco:', error);
      // Fallback: usa i dati base del gioco
      setPrefillGame(game);
      setIsAddGameModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };  const handleAddToWishlist = async (game: any) => {
    try {
      const matchingWishlistItem = findMatchingGame(wishlistItems, game.Title);

      if (matchingWishlistItem) {
        showToast('info', 'Info', 'Questo gioco è già nella tua wishlist');
        return;
      }

      const wishlistData: AddToWishlistDto = {
        title: game.Title,
        coverImage: game.CoverImage,
        releaseYear: game.ReleaseYear,
        genres: game.Genres,
        metacritic: game.Metacritic || 0,
        rawgId: parseInt(game.id),
      };

      const response = await wishlistService.addToWishlist(wishlistData);
      setWishlistItems(prev => [...prev, response.data]);
      showToast('success', 'Successo', 'Gioco aggiunto alla wishlist!');
    } catch (error) {
      console.error('Errore nell\'aggiunta alla wishlist:', error);
      showToast('error', 'Errore', 'Errore nell\'aggiunta alla wishlist');
    }
  };

  const handleRemoveFromWishlist = async (game: any) => {
    try {
      const matchingWishlistItem = findMatchingGame(wishlistItems, game.Title);

      if (!matchingWishlistItem) {
        showToast('info', 'Info', 'Questo gioco non è nella tua wishlist');
        return;
      }

      await wishlistService.removeFromWishlist(matchingWishlistItem.id);
      setWishlistItems(prev => prev.filter(item => item.id !== matchingWishlistItem.id));
      showToast('success', 'Successo', 'Gioco rimosso dalla wishlist!');
    } catch (error) {
      console.error('Errore nella rimozione dalla wishlist:', error);
      showToast('error', 'Errore', 'Errore nella rimozione dalla wishlist');
    }
  };// Applica filtro giochi posseduti se richiesto
  const filteredGames = hideOwned
    ? mappedGames.filter(game => {
        const isOwned = !!findMatchingGame(userGames, game.Title);
        return !isOwned;
      })
    : mappedGames;

  return (
    <div className="flex flex-col min-h-screen bg-secondary-bg">
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
          {isLoading ? (
            <div className="text-center py-12 text-text-secondary">Caricamento giochi...</div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">{error}</div>
          ) : (
            <>              <div className={gridClass}>                {filteredGames.map(game => {
                  const matchingGame = findMatchingGame(userGames, game.Title);
                  const isInLibrary = !!matchingGame;
                  const matchingWishlistItem = findMatchingGame(wishlistItems, game.Title);
                  const isInWishlist = !!matchingWishlistItem;
                  
                  const communityRating = (communityRatings ?? {})[game.Title];
                  return (                    <CatalogGameCard
                      key={game.id}
                      game={game}
                      isInLibrary={isInLibrary}
                      isInWishlist={isInWishlist}
                      onAddToLibrary={() => handleAddToLibrary(game)}
                      onAddToWishlist={() => handleAddToWishlist(game)}
                      onRemoveFromWishlist={() => handleRemoveFromWishlist(game)}
                      onInfoClick={setSelectedGameId}
                      communityRating={communityRating}
                    />
                  );
                })}
              </div>
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
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
