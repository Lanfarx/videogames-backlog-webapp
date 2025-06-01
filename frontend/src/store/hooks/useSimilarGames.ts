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
        const genreIds = currentGame.Genres?.map(g => g.id).filter(Boolean);
        // DEBUG: logga currentGame per capire se ha id RAWG
        console.log('currentGame in useSimilarGames:', currentGame);
        if (genreIds && genreIds.length > 0 && currentGame.id) {
          const results = await getSimilarGames(genreIds, currentGame.id, count, currentGame.Metacritic);
          // DEBUG: logga la risposta
          console.log('Risposta getSimilarGames:', results);

          const formatted = results.map((game: any) => ({
            id: game.id,
            title: game.name,
            CoverImage: game.background_image,
            Developer: game.Developers?.[0]?.name ?? "Sconosciuto",
            Publisher: game.Publishers?.[0]?.name ?? "Sconosciuto",
            ReleaseYear: game.released ? new Date(game.released).getFullYear() : null,
            Genres: game.Genres?.map((g: any) => ({ id: g.id, name: g.name })) || [],
            Metacritic: game.Metacritic || 0,
            Platforms: game.Platforms?.map((p: any) => p.Platform?.name) || [],
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
