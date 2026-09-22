import { useState, useCallback } from 'react';
import { Game } from '../types/game';
import { searchGames, getGameDetails } from '../store/services/rawgService';

export function hasMissingData(game: Game): boolean {
  return !game.Developer || 
         !game.Publisher || 
         game.Developer === 'Sconosciuto' || 
         game.Publisher === 'Sconosciuto' ||
         game.Developer === '' ||
         game.Publisher === '' ||
         !game.Metacritic ||
         game.Metacritic === 0;
}

export function useRAWGUpdate(game: Game, onEditInfo?: (updatedGame: Partial<Game>) => void) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateFromRAWG = useCallback(async () => {
    if (!onEditInfo) return false;
    
    setIsUpdating(true);
    try {
      const searchResults = await searchGames(game.Title);
      if (searchResults.results && searchResults.results.length > 0) {
        const bestMatch = searchResults.results[0];
        
        const gameDetails = await getGameDetails(bestMatch.id.toString());
        
        const updateData: Partial<Game> = {
          CoverImage: gameDetails.CoverImage || game.CoverImage,
          Developer: gameDetails.Developer || game.Developer,
          Publisher: gameDetails.Publisher || game.Publisher,
          ReleaseYear: gameDetails.ReleaseYear || (game.ReleaseYear > 0 ? game.ReleaseYear : new Date().getFullYear()),
          Genres: gameDetails.Genres || game.Genres,
          Metacritic: (gameDetails.Metacritic && gameDetails.Metacritic > 0) ? gameDetails.Metacritic : game.Metacritic,
        };
        
        onEditInfo(updateData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Errore durante l\'aggiornamento da RAWG:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [game, onEditInfo]);

  return {
    isUpdating,
    updateFromRAWG,
    missingData: hasMissingData(game)
  };
}
