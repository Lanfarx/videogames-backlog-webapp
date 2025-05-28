import { useEffect, useState } from 'react';
import { getSimilarGames } from '../services/rawgService';
import type { PublicCatalogGame } from '../../types/game';

export const useSimilarGames = (
  currentGame: PublicCatalogGame,
  count: number = 4
): PublicCatalogGame[] => {
  const [similar, setSimilar] = useState<PublicCatalogGame[]>([]);

  useEffect(() => {
    const fetchSimilar = async () => {
      try {
        const genreIds = currentGame.genres?.map(g => g.id).filter(Boolean);
        // DEBUG: logga currentGame per capire se ha id RAWG
        console.log('currentGame in useSimilarGames:', currentGame);
        if (genreIds && genreIds.length > 0 && currentGame.id) {
          const results = await getSimilarGames(genreIds, currentGame.id, count, currentGame.metacritic);
          // DEBUG: logga la risposta
          console.log('Risposta getSimilarGames:', results);

          const formatted = results.map((game: any) => ({
            id: game.id,
            title: game.name,
            coverImage: game.background_image,
            developer: game.developers?.[0]?.name ?? "Sconosciuto",
            publisher: game.publishers?.[0]?.name ?? "Sconosciuto",
            releaseYear: game.released ? new Date(game.released).getFullYear() : null,
            genres: game.genres?.map((g: any) => ({ id: g.id, name: g.name })) || [],
            metacritic: game.metacritic || 0,
            platforms: game.platforms?.map((p: any) => p.platform?.name) || [],
          }));

          setSimilar(formatted);
        } else {
          setSimilar([]);
        }
      } catch (error) {
        setSimilar([]);
        console.error("Errore nel caricamento dei giochi simili:", error);
      }
    };

    fetchSimilar();
  }, [currentGame, count]);

  return similar;
};
