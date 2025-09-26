import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, X, Loader2, Check } from 'lucide-react';
import { searchGames } from '../../store/services/rawgService';

interface SearchResult {
  id: number;
  Title: string;
  CoverImage: string;
  ReleaseYear: number | null;
  Genres: string[];
  Metacritic: number;
  Developer: string;
  Publisher: string;
}

interface GameSearchBarProps {
  placeholder?: string;
  onGameSelect?: (game: SearchResult) => void; // Per AddGameModal
  onGameAdd?: (game: SearchResult) => Promise<void>; // Per Wishlist
  buttonText?: string;
  buttonVariant?: 'primary' | 'cyan'; // Variante del colore del pulsante
  maxResults?: number;
  showTooltip?: boolean;
  className?: string;
}

const GameSearchBar: React.FC<GameSearchBarProps> = ({
  placeholder = "Cerca giochi...",
  onGameSelect,
  onGameAdd,
  buttonText,
  buttonVariant = 'primary',
  maxResults = 8,
  showTooltip = false,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [processingGameId, setProcessingGameId] = useState<number | null>(null);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Gestisce la ricerca con debounce
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await searchGames(query);
      setSearchResults(response.results.slice(0, maxResults));
      setShowResults(true);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [maxResults]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      await performSearch(searchQuery.trim());
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Chiude i risultati quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGameAction = async (game: SearchResult) => {
    setProcessingGameId(game.id);
    try {
      if (onGameSelect) {
        // Modalità AddGameModal - seleziona il gioco
        onGameSelect(game);
        clearSearch();
      } else if (onGameAdd) {
        // Modalità Wishlist - aggiunge il gioco
        await onGameAdd(game);
        clearSearch();
      }
    } catch (error: any) {
      console.error('Errore nell\'azione del gioco:', error);
      // Non mostriamo errori qui perché sono gestiti dai componenti parent
      // che hanno accesso al toast context
    } finally {
      setProcessingGameId(null);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const getButtonClasses = () => {
    const baseClasses = "flex-shrink-0 flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    
    if (buttonVariant === 'cyan') {
      return `${baseClasses} bg-cyan-500 text-white hover:bg-cyan-600`;
    }
    return `${baseClasses} bg-accent-primary text-white hover:bg-accent-primary/90`;
  };

  const getDefaultButtonText = () => {
    if (onGameAdd) return 'Aggiungi';
    if (onGameSelect) return 'Seleziona';
    return 'Azione';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Barra di ricerca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          className="w-full pl-10 pr-12 py-3 border border-border-color rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-text-primary placeholder-text-secondary"
        />
        
        {/* Icona di caricamento o clear */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isSearching ? (
            <Loader2 className="h-5 w-5 text-cyan-500 animate-spin" />
          ) : searchQuery && (
            <button
              onClick={clearSearch}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Risultati di ricerca */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-border-color rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((game) => (
            <div
              key={game.id}
              className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-border-color last:border-b-0"
            >
              {/* Immagine del gioco */}
              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded overflow-hidden">
                <img
                  src={game.CoverImage}
                  alt={game.Title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
              </div>

              {/* Info del gioco */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-text-primary truncate">{game.Title}</h4>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span>{game.ReleaseYear || 'TBA'}</span>
                  {game.Metacritic > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-yellow-600">★ {game.Metacritic}</span>
                    </>
                  )}
                </div>
                {game.Genres.length > 0 && (
                  <div className="text-xs text-text-secondary mt-1 truncate">
                    {game.Genres.slice(0, 3).join(', ')}
                  </div>
                )}
              </div>

              {/* Pulsante azione */}
              <button
                onClick={() => handleGameAction(game)}
                disabled={processingGameId === game.id}
                className={getButtonClasses()}
              >
                {processingGameId === game.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : onGameAdd ? (
                  <Plus className="h-4 w-4" />
                ) : onGameSelect ? (
                  <Check className="h-4 w-4" />
                ) : null}
                {processingGameId === game.id 
                  ? (onGameAdd ? 'Aggiungendo...' : 'Selezionando...')
                  : (buttonText || getDefaultButtonText())
                }
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Messaggio nessun risultato */}
      {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-border-color rounded-lg shadow-lg p-4 text-center text-text-secondary">
          Nessun gioco trovato per "{searchQuery}"
        </div>
      )}

      {/* Tooltip opzionale */}
      {showTooltip && (
        <div className="mt-2 text-xs text-text-secondary">
          Digita almeno 2 caratteri per iniziare la ricerca
        </div>
      )}
    </div>
  );
};
 
export default GameSearchBar;
