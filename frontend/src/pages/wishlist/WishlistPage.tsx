import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, Filter } from 'lucide-react';
import WishlistItemCard from '../../components/wishlist/WishlistItemCard';
import AddGameModal from '../../components/game/AddGameModal';
import { wishlistService, WishlistItem } from '../../store/services/wishlistService';
import { getGameDetails } from '../../store/services/rawgService';
import { useToast } from '../../contexts/ToastContext';

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [isAddGameModalOpen, setIsAddGameModalOpen] = useState(false);
  const [prefillGame, setPrefillGame] = useState<any>(null);

  // Carica la wishlist
  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const response = await wishlistService.getWishlist();
      setWishlistItems(response.data);    } catch (error) {
      console.error('Errore nel caricamento della wishlist:', error);
      showToast('error', 'Errore', 'Errore nel caricamento della wishlist');
    } finally {
      setLoading(false);
    }
  };

  // Rimuovi dalla wishlist
  const handleRemove = async (id: number) => {
    try {      await wishlistService.removeFromWishlist(id);
      setWishlistItems(prev => prev.filter(item => item.id !== id));
      showToast('success', 'Successo', 'Gioco rimosso dalla wishlist');
    } catch (error) {
      console.error('Errore nella rimozione:', error);
      showToast('error', 'Errore', 'Errore nella rimozione del gioco');
    }
  };
  // Acquista (sposta nella libreria)
  const handlePurchase = async (id: number) => {
    try {
      // Trova l'item nella wishlist
      const wishlistItem = wishlistItems.find(item => item.id === id);
      if (!wishlistItem) {
        showToast('error', 'Errore', 'Gioco non trovato nella wishlist');
        return;
      }

      // Rimuovi dalla wishlist
      await wishlistService.removeFromWishlist(id);
      setWishlistItems(prev => prev.filter(item => item.id !== id));

      // Ottieni i dettagli completi da RAWG
      const gameDetails = await getGameDetails(wishlistItem.rawgId.toString());
      
      // Prepara i dati per il prefill del modale
      setPrefillGame({
        Title: gameDetails.Title,
        CoverImage: gameDetails.CoverImage,
        Developer: gameDetails.Developer,
        Publisher: gameDetails.Publisher,
        ReleaseYear: gameDetails.ReleaseYear,
        Genres: gameDetails.Genres,
        Metacritic: gameDetails.Metacritic,
      });

      // Apri il modale di aggiunta gioco
      setIsAddGameModalOpen(true);
      
      showToast('success', 'Successo', 'Gioco rimosso dalla wishlist. Completa ora l\'aggiunta alla libreria!');
    } catch (error) {
      console.error('Errore nello spostamento:', error);
      showToast('error', 'Errore', 'Errore nello spostamento del gioco');
    }
  };

  // Aggiorna note
  const handleUpdateNotes = async (id: number, notes: string) => {
    try {
      const response = await wishlistService.updateWishlistNotes(id, { notes });
      setWishlistItems(prev =>
        prev.map(item =>
          item.id === id ? { ...item, notes: response.data.notes } : item        )
      );
      showToast('success', 'Successo', 'Note aggiornate');
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle note:', error);
      showToast('error', 'Errore', 'Errore nell\'aggiornamento delle note');
    }
  };

  // Vai alle info del gioco
  const handleViewInfo = (rawgId: number) => {
    navigate(`/catalog/${rawgId}`);
  };

  // Filtra i giochi
  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !filterGenre || item.genres.some(genre => genre.toLowerCase().includes(filterGenre.toLowerCase()));
    return matchesSearch && matchesGenre;
  });
  // Ottieni tutti i generi per il filtro
  const allGenres = Array.from(new Set(wishlistItems.flatMap(item => item.genres))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-text-secondary">Caricamento wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-cyan-500 fill-cyan-500" />
          <h1 className="text-3xl font-bold text-text-primary">La mia Wishlist</h1>
          <span className="bg-cyan-500 text-white text-sm px-2 py-1 rounded-full">
            {wishlistItems.length}
          </span>
        </div>

        {/* Filtri e ricerca */}
        <div className="bg-primary-bg rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Barra di ricerca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
              <input
                type="text"
                placeholder="Cerca nella tua wishlist..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border-color rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Filtro per genere */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
              <select
                value={filterGenre}
                onChange={(e) => setFilterGenre(e.target.value)}
                className="pl-10 pr-8 py-2 border border-border-color rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none bg-white min-w-48"
              >
                <option value="">Tutti i generi</option>
                {allGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lista wishlist */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              {wishlistItems.length === 0 ? 'La tua wishlist è vuota' : 'Nessun gioco trovato'}
            </h3>
            <p className="text-text-secondary mb-4">
              {wishlistItems.length === 0 
                ? 'Aggiungi giochi alla tua wishlist dal catalogo per iniziare!'
                : 'Prova a modificare i filtri di ricerca'
              }
            </p>
            {wishlistItems.length === 0 && (
              <button
                onClick={() => navigate('/catalog')}
                className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Esplora il Catalogo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <WishlistItemCard
                key={item.id}
                item={item}
                onRemove={handleRemove}
                onPurchase={handlePurchase}
                onUpdateNotes={handleUpdateNotes}
                onViewInfo={handleViewInfo}
              />
            ))}
          </div>        )}
      </div>

      {/* Modale per aggiunta gioco */}
      <AddGameModal
        isOpen={isAddGameModalOpen}
        onClose={() => {
          setIsAddGameModalOpen(false);
          setPrefillGame(null);
        }}
        prefillGame={prefillGame}
      />
    </div>
  );
};

export default WishlistPage;
