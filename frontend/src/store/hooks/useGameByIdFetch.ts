import { useState, useEffect } from 'react';
import { getGamePublicInfo } from '../services/gamesService';
import { Game } from '../../types/game';

interface UseGameByIdFetchResult {
  game: Partial<Game> | null;
  loading: boolean;
  error: string | null;
}

// Funzione per mappare i dati dall'API al formato Game
const mapApiDataToGame = (apiData: any): Partial<Game> => {
  return {
    id: apiData.id,
    Title: apiData.title,
    Platform: apiData.platform,
    ReleaseYear: apiData.releaseYear,
    HoursPlayed: apiData.hoursPlayed,
    CoverImage: apiData.coverImage,
    UserId: apiData.userId,
    Developer: apiData.developer,
    Publisher: apiData.publisher,
    Review: apiData.review ? {
      Text: apiData.review.text,
      Gameplay: apiData.review.gameplay,
      Graphics: apiData.review.graphics,
      Story: apiData.review.story,
      Sound: apiData.review.sound,
      Date: apiData.review.date,
      IsPublic: apiData.review.isPublic
    } : undefined
  };
};

export function useGameByIdFetch(gameId: number | null): UseGameByIdFetchResult {
  const [game, setGame] = useState<Partial<Game> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setGame(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const fetchGame = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const gameData = await getGamePublicInfo(gameId);
        if (isMounted) {
          // Mappa i dati dall'API al formato Game
          const mappedGame = mapApiDataToGame(gameData);
          setGame(mappedGame);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Errore nel caricamento del gioco');
          setLoading(false);
        }
      }
    };

    fetchGame();

    return () => {
      isMounted = false;
    };
  }, [gameId]);

  return { game, loading, error };
}