import { Game, GameStatus, GameComment, GameReview, GAME_PLATFORMS, GamePlatform } from '../types/game';

// Dati di esempio per i giochi
export const gamesData: Game[] = [
    {
      id: 1,
      title: "The Legend of Zelda: Breath of the Wild",
      coverImage: "/placeholder.svg?height=280&width=280",
      developer: "Nintendo EPD",
      publisher: "Nintendo",
      releaseYear: 2017,
      genres: ["Action", "Adventure", "Open World"],
      platform: "Nintendo Switch",
      hoursPlayed: 42,
      status: "in-progress",
      purchaseDate: "2023-01-15",
      price: 59.99,
      notes: "Uno dei migliori giochi open world che abbia mai giocato. L'esplorazione è incredibile!",
      review: {
        text: "Breath of the Wild è un capolavoro che ridefinisce il genere open world con la sua libertà di esplorazione.",
        gameplay: 5,
        graphics: 4.5,
        story: 4,
        sound: 5,
        date: "2023-04-15"
      },
      comments: [
        { id: 1, date: "2023-01-20", text: "Ho trovato un Easter Egg interessante nel villaggio Calbarico" },
        { id: 2, date: "2023-02-15", text: "La missione secondaria di Tarrey Town è molto coinvolgente" }
      ]
    },
    {
      id: 2,
      title: "Cyberpunk 2077",
      coverImage: "/placeholder.svg?height=280&width=280",
      developer: "CD Projekt Red",
      publisher: "CD Projekt",
      releaseYear: 2020,
      genres: ["RPG", "Action", "Open World"],
      platform: "Steam",
      hoursPlayed: 28,
      status: "in-progress",
      purchaseDate: "2022-12-10",
      price: 49.99,
      notes: "Dopo i vari aggiornamenti, il gioco è molto migliorato. Devo esplorare Night City più a fondo.",
      review: {
        text: "Dopo le patch, Cyberpunk è diventato un ottimo gioco. Night City è incredibilmente dettagliata e le missioni principali sono ben scritte.",
        gameplay: 4,
        graphics: 4.5,
        story: 4,
        sound: 4,
        date: "2023-02-10"
      },
      comments: [
        { id: 1, date: "2022-12-15", text: "I bug sembrano molto ridotti rispetto al lancio" }
      ]
    },
    {
      id: 3,
      title: "God of War Ragnarök",
      coverImage: "/placeholder.svg?height=280&width=280",
      developer: "Santa Monica Studio",
      publisher: "Sony Interactive Entertainment",
      releaseYear: 2022,
      genres: ["Action", "Adventure"],
      platform: "PlayStation 5",
      hoursPlayed: 15,
      status: "completed",
      purchaseDate: "2022-11-15",
      price: 69.99,
      completionDate: "2022-12-05",
      notes: "Sequel eccezionale, la storia tra Kratos e Atreus è emozionante. I combattimenti sono spettacolari.",
      review: {
        text: "Un sequel che migliora il predecessore sotto ogni aspetto. La narrazione è coinvolgente e il gameplay è stato perfezionato.",
        gameplay: 5,
        graphics: 5,
        story: 5,
        sound: 4.5,
        date: "2022-12-10"
      }
    },
    {
      id: 4,
      title: "Elden Ring",
      coverImage: "/placeholder.svg?height=280&width=280",
      developer: "FromSoftware",
      publisher: "Bandai Namco Entertainment",
      releaseYear: 2022,
      genres: ["RPG", "Action", "Open World"],
      platform: "Xbox Series X/S",
      hoursPlayed: 50,
      status: "in-progress",
      purchaseDate: "2022-03-10",
      price: 59.99,
      notes: "Il mio primo soulslike. Difficile ma incredibilmente gratificante. L'esplorazione è fantastica.",
      review: {
        text: "Elden Ring fonde perfettamente il gameplay soulslike con un mondo aperto. La direzione artistica è fenomenale.",
        gameplay: 5,
        graphics: 4.5,
        story: 4,
        sound: 5,
        date: "2022-05-20"
      }
    },
    {
      id: 5,
      title: "Baldur's Gate 3",
      coverImage: "/placeholder.svg?height=280&width=280",
      developer: "Larian Studios",
      publisher: "Larian Studios",
      releaseYear: 2023,
      genres: ["RPG", "Strategy"],
      platform: "Steam",
      hoursPlayed: 60,
      status: "platinum",
      purchaseDate: "2023-08-05",
      price: 59.99,
      completionDate: "2023-09-15",
      platinumDate: "2023-09-25",
      notes: "Uno dei migliori RPG che abbia mai giocato. La libertà di scelta è incredibile.",
      review: {
        text: "Baldur's Gate 3 è il miglior RPG degli ultimi anni, con un sistema di combattimento tattico eccezionale e una libertà di scelta senza precedenti.",
        gameplay: 5,
        graphics: 4.5,
        story: 5,
        sound: 4.5,
        date: "2023-09-20"
      }
    },
    {
      id: 6,
      title: "Starfield",
      coverImage: "/placeholder.svg?height=280&width=280",
      developer: "Bethesda Game Studios",
      publisher: "Bethesda Softworks",
      releaseYear: 2023,
      genres: ["RPG", "Adventure", "Sci-Fi"],
      platform: "Xbox Series X/S",
      hoursPlayed: 0,
      status: "not-started",
      purchaseDate: "2023-09-10",
      price: 69.99,
      notes: "Appena acquistato, non vedo l'ora di esplorare lo spazio!"
    },
    {
      id: 7,
      title: "Final Fantasy XVI",
      coverImage: "/placeholder.svg?height=280&width=280",
      developer: "Square Enix",
      publisher: "Square Enix",
      releaseYear: 2023,
      genres: ["RPG", "Action"],
      platform: "PlayStation 5",
      hoursPlayed: 5,
      status: "abandoned",
      purchaseDate: "2023-06-25",
      price: 69.99,
      notes: "Non mi ha preso come speravo. Il sistema di combattimento è buono ma la storia non mi ha coinvolto.",
      review: {
        text: "Graficamente impressionante ma la narrativa è confusa. Il sistema di combattimento è divertente ma non abbastanza da mantenermi interessato.",
        gameplay: 3.5,
        graphics: 4.5,
        story: 2,
        sound: 4,
        date: "2023-07-10"
      }
    },
    {
      id: 8,
      title: "Hogwarts Legacy",
      coverImage: "/placeholder.svg?height=280&width=280",
      developer: "Avalanche Software",
      publisher: "Warner Bros. Games",
      releaseYear: 2023,
      genres: ["RPG", "Adventure"],
      platform: "Epic Games Store",
      hoursPlayed: 0,
      status: "not-started",
      purchaseDate: "",
      price: 49.99,
      notes: "Nella libreria, aspetto che ho voglia."
    },
  ]

// Funzioni di utilità per accedere ai dati in modo tipizzato

/**
 * Restituisce tutti i giochi
 */
export function getAllGames(): Game[] {
  return gamesData
}

/**
 * Restituisce un gioco specifico per ID
 */
export function getGameById(id: number): Game | null {
  return gamesData.find((game) => game.id === id) || null
}

/**
 * Restituisce i giochi filtrati per stato
 */
export function getGamesByStatus(status: GameStatus): Game[] {
  return gamesData.filter((game) => game.status === status)
}

/**
 * Restituisce i giochi in corso
 */
export function getGamesInProgress(): Game[] {
  return getGamesByStatus('in-progress')
}

/**
 * Restituisce i giochi completati (include sia quelli con stato "completed" che "platinum")
 */
export function getCompletedGames(): Game[] {
  return gamesData.filter((game) => game.status === 'completed' || game.status === 'platinum');
}

/**
 * Restituisce i giochi non ancora iniziati
 */
export function getNotStartedGames(): Game[] {
  return getGamesByStatus('not-started')
}

/**
 * Restituisce i giochi abbandonati
 */
export function getAbandonedGames(): Game[] {
  return getGamesByStatus('abandoned')
}

/**
 * Restituisce i giochi platinati
 */
export function getPlatinumGames(): Game[] {
  return getGamesByStatus('platinum')
}

/**
 * Restituisce le statistiche aggregate dei giochi
 */
export function getGamesStats() {
  const total = gamesData.length
  const inProgress = getGamesInProgress().length
  const completed = getCompletedGames().length
  const notStarted = getNotStartedGames().length
  const abandoned = getAbandonedGames().length
  const platinum = getPlatinumGames().length
  
  const totalHours = gamesData.reduce((acc, game) => acc + game.hoursPlayed, 0)
  
  return {
    total,
    inProgress,
    completed,
    notStarted,
    abandoned,
    platinum,
    totalHours
  }
}

/**
 * Calcola il rating complessivo di un gioco dalla sua recensione
 */
export function calculateRatingFromReview(review: GameReview | undefined): number {
  if (!review) return 0;
  
  const { gameplay, graphics, story, sound } = review;
  const average = (gameplay + graphics + story + sound) / 4;
  
  // Arrotonda a 0.5 più vicino
  return Math.round(average * 2) / 2;
}

/**
 * Ottiene il rating effettivo di un gioco, calcolato dalla review se presente
 */
export function getGameRating(game: Game): number {
  return game.review ? calculateRatingFromReview(game.review) : 0;
}

/**
 * Aggiorna i rating dei giochi in base ai loro dati di recensione
 */
export function getGamesWithCalculatedRatings(): Game[] {
  return gamesData.map(game => ({
    ...game,
    rating: getGameRating(game)
  }));
}

/**
 * Restituisce tutti i giochi con rating calcolati automaticamente dalle recensioni
 */
export function getAllGamesWithRatings(): Game[] {
  return getGamesWithCalculatedRatings();
}

/**
 * Restituisce tutte le piattaforme di gioco predefinite
 */
export function getAllPlatforms(): GamePlatform[] {
  return GAME_PLATFORMS;
}

/**
 * Ottiene le piattaforme effettivamente utilizzate nei giochi esistenti
 */
export function getUsedPlatforms(): string[] {
  const platforms = new Set<string>();
  
  gamesData.forEach(game => {
    if (game.platform) {
      platforms.add(game.platform);
    }
  });
  
  return Array.from(platforms).sort();
}

/**
 * Raggruppa i giochi per piattaforma
 */
export function getGamesByPlatform(): Record<string, Game[]> {
  const gamesByPlatform: Record<string, Game[]> = {};
  
  gamesData.forEach(game => {
    const platform = game.platform || 'Non specificata';
    
    if (!gamesByPlatform[platform]) {
      gamesByPlatform[platform] = [];
    }
    
    gamesByPlatform[platform].push(game);
  });
  
  return gamesByPlatform;
}

/**
 * Ottiene i giochi appartenenti ad una specifica piattaforma
 */
export function getGamesForPlatform(platform: string): Game[] {
  return gamesData.filter(game => game.platform === platform);
}
