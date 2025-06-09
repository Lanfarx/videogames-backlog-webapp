import { useEffect, useState } from 'react';
import { getSimilarGames } from '../services/rawgService';
import type { PublicCatalogGame } from '../../types/game';

export const useSimilarGames = (
  currentGame: PublicCatalogGame,
  count: number = 4
): PublicCatalogGame[] => {
  const [similar, setSimilar] = useState<PublicCatalogGame[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchSimilar = async () => {
      if (!currentGame?.id) {
        setSimilar([]);
        return;
      }

      setLoading(true);
      try {
        // Gestisci i generi con mapping più completo
        let genreIds: number[] = [];
        
        if (currentGame.Genres && Array.isArray(currentGame.Genres)) {
          genreIds = currentGame.Genres
            .map(g => {
              if (typeof g === 'object' && g.id) {
                return g.id;
              }
              // Mapping completo per i generi più comuni
              if (typeof g === 'string') {
                const genreMapping: { [key: string]: number } = {
                  'Action': 4,
                  'Adventure': 3,
                  'RPG': 5,
                  'Role-playing (RPG)': 5,
                  'Strategy': 10,
                  'Shooter': 2,
                  'Puzzle': 7,
                  'Racing': 1,
                  'Sports': 15,
                  'Simulation': 14,
                  'Platformer': 83,
                  'Platform': 83,
                  'Fighting': 6,
                  'Arcade': 11,
                  'Indie': 51,
                  'Massively Multiplayer': 59,
                  'Family': 19,
                  'Board Games': 28,
                  'Educational': 34,
                  'Card': 17
                };
                return genreMapping[g] || null;
              }
              return null;
            })
            .filter((id): id is number => id !== null);
        }

        // Se non ci sono generi validi, usa fallback con giochi popolari simili
        if (genreIds.length === 0) {
          console.warn('Nessun genere valido trovato, utilizzo fallback');
          genreIds = [4, 3]; // Action e Adventure come fallback
        }

        // Priorità ai primi 2 generi per una ricerca più mirata
        const primaryGenres = genreIds.slice(0, 2);
        
        const results = await getSimilarGames(
          primaryGenres, 
          currentGame.id, 
          count * 2, // Ottieni più risultati per filtrarli
          currentGame.Metacritic
        );

        // Formatta e filtra i risultati
        const formatted = results
          .filter((game: any) => 
            game.name && 
            game.background_image && 
            game.released && 
            game.rating > 3.0 && // Solo giochi con rating decente
            game.ratings_count > 5 // Con almeno 5 recensioni
          )
          .slice(0, count) // Limita al numero richiesto
          .map((game: any) => ({
            id: game.id,
            title: game.name,
            CoverImage: game.background_image,
            ReleaseYear: game.released ? new Date(game.released).getFullYear() : null,
            Metacritic: game.metacritic || 0,
            Rating: game.rating || 0,
            RatingsCount: game.ratings_count || 0
          }));

        setSimilar(formatted);
      } catch (error) {
        console.error("Errore nel caricamento dei giochi simili:", error);
        setSimilar([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilar();
  }, [currentGame?.id, currentGame?.title, count]);

  return similar;
};
