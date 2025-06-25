import { useState, useEffect, useRef } from 'react';
import { Clock, Pencil, Download, AlertCircle } from 'lucide-react';
import { Game } from '../../types/game';
import RatingStars from '../ui/atoms/RatingStars';
import StatusBadge from '../ui/atoms/StatusBadge';
import PlaytimePopover from '../ui/PlaytimePopover';
import EditGameInfoModal from './EditGameInfoModal';
import { useGameById } from '../../store/hooks/gamesHooks';
import { getGameRating } from '../../utils/gamesUtils';
import { searchGames, getGameDetails } from '../../store/services/rawgService';
import { formatPrice, formatPurchaseDate } from '../../utils/gameDisplayUtils';

interface GameInfoCardProps {
  game: Game;
  onEditInfo?: (updatedGame: Partial<Game>) => void;
  onUpdatePlaytime?: (newHours: number) => void;
}

// Funzione per rilevare se i dati del gioco sono mancanti
const hasMissingData = (game: Game): boolean => {
  const missing = !game.Developer || 
         !game.Publisher || 
         game.Developer === 'Sconosciuto' || 
         game.Publisher === 'Sconosciuto' ||
         game.Developer === '' ||
         game.Publisher === '' ||
         !game.Metacritic ||         game.Metacritic === 0;
  
  return missing;
};

// Funzione per cercare e aggiornare i dati del gioco da RAWG
const updateGameDataFromRAWG = async (game: Game, onEditInfo?: (updatedGame: Partial<Game>) => void) => {
  try {
    // Prima proviamo a cercare il gioco per titolo
    const searchResults = await searchGames(game.Title);
      if (searchResults.results && searchResults.results.length > 0) {
      const bestMatch = searchResults.results[0]; // Prendiamo il primo risultato
      
      // Otteniamo i dettagli completi del gioco
      const gameDetails = await getGameDetails(bestMatch.id.toString());
      
      // Aggiorniamo i dati usando il pattern semplice
      const updateData: Partial<Game> = {
        CoverImage: gameDetails.CoverImage || game.CoverImage,
        Developer: gameDetails.Developer || game.Developer,
        Publisher: gameDetails.Publisher || game.Publisher,
        ReleaseYear: gameDetails.ReleaseYear || game.ReleaseYear,
        Genres: gameDetails.Genres || game.Genres,
        // Solo aggiorna Metacritic se il nuovo valore è valido (maggiore di 0)
        Metacritic: (gameDetails.Metacritic && gameDetails.Metacritic > 0) ? gameDetails.Metacritic : game.Metacritic,
      };
      
      if (onEditInfo) {
        onEditInfo(updateData);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dei dati da RAWG:', error);
    throw error;
  }
};

const GameInfoCard = ({ game, onEditInfo, onUpdatePlaytime }: GameInfoCardProps) => {
  const [isEditingHours, setIsEditingHours] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [isUpdatingFromRAWG, setIsUpdatingFromRAWG] = useState(false);
  
  // Ottieni il gioco aggiornato dallo stato globale Redux
  const currentGame = useGameById(game.id) || game;

  // Calcola il Rating direttamente dalla Review aggiornata
  const calculatedRating = currentGame.Rating ?? getGameRating(currentGame);

  // Usa sempre le ore aggiornate dallo stato globale
  const disPlayedHours = currentGame.HoursPlayed;
 // Ref per tracciare il rating precedente e evitare aggiornamenti inutili
  const prevRatingRef = useRef(calculatedRating);

  // RIMOSSO: useEffect che causava chiamate API ridondanti
  // Il rating viene già aggiornato quando si salva la recensione in NotesReviewCard
  // Non è necessario sincronizzarlo di nuovo da qui
  
  useEffect(() => {
    // Aggiorna solo il ref per tracking, senza fare chiamate API
    prevRatingRef.current = calculatedRating;
  }, [calculatedRating]);
  
  const handleSavePlaytime = () => {
    setIsEditingHours(false);
  };
  
  const handleCancelPlaytime = () => {
    setIsEditingHours(false);
  };

  const handleEditInfoClick = () => {
    setShowEditInfoModal(true);
  };
  const handleSaveInfo = (updatedInfo: Partial<Game>) => {
    if (onEditInfo) {
      onEditInfo(updatedInfo);
    }
  };

  const handleUpdateFromRAWG = async () => {
    if (!onEditInfo) return;
    
    setIsUpdatingFromRAWG(true);
    try {
      const success = await updateGameDataFromRAWG(currentGame, onEditInfo);
      if (!success) {
        console.warn('Nessun dato aggiuntivo trovato su RAWG per questo gioco');
      }
    } catch (error) {
      console.error('Errore durante l\'aggiornamento da RAWG:', error);
    } finally {
      setIsUpdatingFromRAWG(false);
    }
  };
  // Verifica se il gioco è stato completato o platinato
  const isCompleted = currentGame.Status === "Completed"; 
   const isPlatinum = currentGame.Status === "Platinum";
  const hasBeenCompleted = isCompleted || isPlatinum; // Sia i completati che i platinati sono stati completati

  // Verifica se mostrare il bottone RAWG per completare informazioni mancanti
  const showRAWGButton = onEditInfo && hasMissingData(currentGame);

  return (
    <div className="bg-primary-bg border border-border-color rounded-xl p-6 mb-8">      <div className="flex justify-between items-center mb-4">
        <h2 className="font-primary font-semibold text-xl text-text-primary">
          Informazioni
        </h2>
        <div className="flex items-center space-x-2">
          {/* Bottone di aggiornamento RAWG - visibile solo quando i dati sono mancanti */}
          {onEditInfo && hasMissingData(currentGame) && (
            <button
              onClick={handleUpdateFromRAWG}
              disabled={isUpdatingFromRAWG}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-accent-secondary/10 
                         text-accent-secondary hover:bg-accent-secondary/20 rounded-md 
                         transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Aggiorna dati mancanti da RAWG"
            >
              {isUpdatingFromRAWG ? (
                <>
                  <div className="w-3 h-3 border border-accent-secondary border-t-transparent rounded-full animate-spin" />
                  <span>Aggiornando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span>Aggiorna dati</span>
                </>
              )}
            </button>
          )}
            {/* Icona di avviso per dati mancanti */}
          {hasMissingData(currentGame) && (
            <div title="Alcuni dati del gioco sono mancanti">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </div>
          )}
          
          {/* Bottone di modifica esistente */}
          {onEditInfo && (
            <Pencil 
              className="w-5 h-5 text-text-secondary hover:text-accent-primary cursor-pointer" 
              onClick={handleEditInfoClick}
            />
          )}
        </div>
      </div>

      {/* Stato */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Stato
        </span>
        <StatusBadge Status={currentGame.Status} />
      </div>      {/* Piattaforma */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Piattaforma
        </span>
        <span className="font-secondary text-base text-text-primary">
          {currentGame.Platform || 'Non specificata'}
        </span>
      </div>

      {/* Tempo di gioco */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Tempo di gioco
        </span>
        <div className="flex items-center relative">
          <span className="font-secondary font-semibold text-lg text-text-primary">
            {disPlayedHours} ore
          </span>
          
          {onUpdatePlaytime && (
            <>
              <Clock 
                className="w-4 h-4 text-accent-primary cursor-pointer ml-2"
                onClick={() => setIsEditingHours(!isEditingHours)}
              />
              
              {isEditingHours && (
                <PlaytimePopover 
                  GameId={currentGame.id}
                  currentHours={disPlayedHours}
                  onSave={handleSavePlaytime}
                  onCancel={handleCancelPlaytime}
                />
              )}
            </>
          )}
        </div>
      </div>      {/* Prezzo - Spostato qui, subito dopo il tempo di gioco */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Prezzo
        </span>
        <span className="font-secondary text-base text-text-primary">
          {currentGame.Price !== undefined ? formatPrice(currentGame.Price) : 'Non specificato'}
        </span>
      </div>      {/* Data di acquisto */}
      <div className="flex justify-between items-center py-3 border-b border-border-color">
        <span className="font-secondary font-medium text-sm text-text-secondary">
          Data di acquisto
        </span>
        <span className="font-secondary text-base text-text-primary">
          {formatPurchaseDate(currentGame.PurchaseDate, currentGame.Platform)}
        </span>
      </div>

      {/* Data di completamento - Mostrata per giochi completati E platinati */}
      {hasBeenCompleted && currentGame.CompletionDate && (
        <div className="flex justify-between items-center py-3 border-b border-border-color">
          <span className="font-secondary font-medium text-sm text-text-secondary">
            Data di completamento
          </span>
          <span className="font-secondary text-base text-text-primary">
            {new Date(currentGame.CompletionDate).toLocaleDateString('it-IT')}
          </span>
        </div>
      )}

      {/* Data di platino - Mostrata solo per giochi platinati */}
      {isPlatinum && currentGame.PlatinumDate && (
        <div className="flex justify-between items-center py-3 border-b border-border-color">
          <span className="font-secondary font-medium text-sm text-text-secondary">
            Data di platino
          </span>
          <span className="font-secondary text-base text-text-primary">
            {new Date(currentGame.PlatinumDate).toLocaleDateString('it-IT')}
          </span>
        </div>      )}
      
      {/* Valutazione */}
      <div className="py-3">
        <div className="flex justify-between items-center">
          <span className="font-secondary font-medium text-sm text-text-secondary">
            La tua valutazione
          </span>
          {calculatedRating === 0 ? (
            <span className="font-secondary text-base text-text-secondary italic">
              Non valutato
            </span>
          ) : (
            <RatingStars Rating={calculatedRating} showValue={false} size="md" />
          )}
        </div>
      </div>
      
      {/* Modale di modifica delle informazioni */}
      <EditGameInfoModal
        isOpen={showEditInfoModal}
        onClose={() => setShowEditInfoModal(false)}
        onSave={handleSaveInfo}
        game={currentGame}
      />
    </div>
  );
};

export default GameInfoCard;
