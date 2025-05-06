import { Activity, ActivityType } from '../types/activity';
import { Trophy, Clock, Gamepad2, Star, Award, X } from 'lucide-react';
import { getStatusColor } from './statusData';

// Dati di esempio per le attività
export const activitiesData: Activity[] = [
  // Baldur's Gate 3 (id: 5) - Platinato
  {
    id: 1,
    type: "platinum",
    gameId: 5,
    gameTitle: "Baldur's Gate 3",
    timestamp: new Date("2023-09-25"),
    additionalInfo: "Tutti gli achievement completati"
  },
  {
    id: 2,
    type: "completed",
    gameId: 5,
    gameTitle: "Baldur's Gate 3",
    timestamp: new Date("2023-09-15"),
  },
  {
    id: 3,
    type: "played",
    gameId: 5,
    gameTitle: "Baldur's Gate 3",
    timestamp: new Date("2023-08-25"),
    additionalInfo: "20 ore"
  },
  {
    id: 4,
    type: "played",
    gameId: 5,
    gameTitle: "Baldur's Gate 3",
    timestamp: new Date("2023-08-15"),
    additionalInfo: "25 ore"
  },
  {
    id: 5,
    type: "played",
    gameId: 5,
    gameTitle: "Baldur's Gate 3",
    timestamp: new Date("2023-08-10"),
    additionalInfo: "13 ore"
  },
  {
    id: 6,
    type: "added",
    gameId: 5,
    gameTitle: "Baldur's Gate 3",
    timestamp: new Date("2023-08-05"),
  },
  {
    id: 7,
    type: "rated",
    gameId: 5,
    gameTitle: "Baldur's Gate 3",
    timestamp: new Date("2023-09-20"),
    additionalInfo: "5 stelle"
  },

  // God of War Ragnarök (id: 3) - Completato
  {
    id: 8,
    type: "completed",
    gameId: 3,
    gameTitle: "God of War Ragnarök",
    timestamp: new Date("2022-12-05"),
  },
  {
    id: 9,
    type: "played",
    gameId: 3,
    gameTitle: "God of War Ragnarök",
    timestamp: new Date("2022-11-30"),
    additionalInfo: "5 ore"
  },
  {
    id: 10,
    type: "played",
    gameId: 3,
    gameTitle: "God of War Ragnarök",
    timestamp: new Date("2022-11-25"),
    additionalInfo: "6 ore"
  },
  {
    id: 11,
    type: "added",
    gameId: 3,
    gameTitle: "God of War Ragnarök",
    timestamp: new Date("2022-11-15"),
  },
  {
    id: 12,
    type: "rated",
    gameId: 3,
    gameTitle: "God of War Ragnarök",
    timestamp: new Date("2022-12-10"),
    additionalInfo: "5 stelle"
  },

  // Zelda: Breath of the Wild (id: 1) - In corso
  {
    id: 13,
    type: "played",
    gameId: 1,
    gameTitle: "The Legend of Zelda: Breath of the Wild",
    timestamp: new Date("2023-03-20"),
    additionalInfo: "12 ore"
  },
  {
    id: 14,
    type: "played",
    gameId: 1,
    gameTitle: "The Legend of Zelda: Breath of the Wild",
    timestamp: new Date("2023-02-10"),
    additionalInfo: "15 ore"
  },
  {
    id: 15,
    type: "played",
    gameId: 1,
    gameTitle: "The Legend of Zelda: Breath of the Wild",
    timestamp: new Date("2023-01-22"),
    additionalInfo: "10 ore"
  },
  {
    id: 16,
    type: "added",
    gameId: 1,
    gameTitle: "The Legend of Zelda: Breath of the Wild",
    timestamp: new Date("2023-01-15"),
  },
  {
    id: 17,
    type: "played",
    gameId: 1,
    gameTitle: "The Legend of Zelda: Breath of the Wild",
    timestamp: new Date("2023-01-15"),
    additionalInfo: "5 ore"
  },
  {
    id: 18,
    type: "rated",
    gameId: 1,
    gameTitle: "The Legend of Zelda: Breath of the Wild",
    timestamp: new Date("2023-04-15"),
    additionalInfo: "5 stelle"
  },

  // Cyberpunk 2077 (id: 2) - Not started ma con alcune ore
  {
    id: 19,
    type: "played",
    gameId: 2,
    gameTitle: "Cyberpunk 2077",
    timestamp: new Date("2023-01-05"),
    additionalInfo: "10 ore"
  },
  {
    id: 20,
    type: "played",
    gameId: 2,
    gameTitle: "Cyberpunk 2077",
    timestamp: new Date("2022-12-24"),
    additionalInfo: "12 ore"
  },
  {
    id: 21,
    type: "played",
    gameId: 2,
    gameTitle: "Cyberpunk 2077",
    timestamp: new Date("2022-12-12"),
    additionalInfo: "6 ore"
  },
  {
    id: 22,
    type: "added",
    gameId: 2,
    gameTitle: "Cyberpunk 2077",
    timestamp: new Date("2022-12-10"),
  },
  {
    id: 23,
    type: "rated",
    gameId: 2,
    gameTitle: "Cyberpunk 2077",
    timestamp: new Date("2023-01-10"),
    additionalInfo: "4 stelle"
  },

  // Elden Ring (id: 4) - In corso
  {
    id: 24,
    type: "played",
    gameId: 4,
    gameTitle: "Elden Ring",
    timestamp: new Date("2022-05-15"),
    additionalInfo: "20 ore"
  },
  {
    id: 25,
    type: "played",
    gameId: 4,
    gameTitle: "Elden Ring",
    timestamp: new Date("2022-04-20"),
    additionalInfo: "15 ore"
  },
  {
    id: 26,
    type: "played",
    gameId: 4,
    gameTitle: "Elden Ring",
    timestamp: new Date("2022-03-30"),
    additionalInfo: "10 ore"
  },
  {
    id: 27,
    type: "played",
    gameId: 4,
    gameTitle: "Elden Ring",
    timestamp: new Date("2022-03-15"),
    additionalInfo: "5 ore"
  },
  {
    id: 28,
    type: "added",
    gameId: 4,
    gameTitle: "Elden Ring",
    timestamp: new Date("2022-03-10"),
  },
  {
    id: 29,
    type: "rated",
    gameId: 4,
    gameTitle: "Elden Ring",
    timestamp: new Date("2022-05-20"),
    additionalInfo: "5 stelle"
  },

  // Starfield (id: 6) - Non iniziato
  {
    id: 30,
    type: "added",
    gameId: 6,
    gameTitle: "Starfield",
    timestamp: new Date("2023-09-10"),
  },

  // Final Fantasy XVI (id: 7) - Abbandonato
  {
    id: 31,
    type: "abandoned",
    gameId: 7,
    gameTitle: "Final Fantasy XVI",
    timestamp: new Date("2023-07-15"),
    additionalInfo: "dopo 5 ore"
  },
  {
    id: 32,
    type: "played",
    gameId: 7,
    gameTitle: "Final Fantasy XVI",
    timestamp: new Date("2023-07-05"),
    additionalInfo: "3 ore"
  },
  {
    id: 33,
    type: "played",
    gameId: 7,
    gameTitle: "Final Fantasy XVI",
    timestamp: new Date("2023-06-28"),
    additionalInfo: "2 ore"
  },
  {
    id: 34,
    type: "added",
    gameId: 7,
    gameTitle: "Final Fantasy XVI",
    timestamp: new Date("2023-06-25"),
  },
  {
    id: 35,
    type: "rated",
    gameId: 7,
    gameTitle: "Final Fantasy XVI",
    timestamp: new Date("2023-07-15"),
    additionalInfo: "3 stelle"
  },

  // Hogwarts Legacy (id: 8) - Non iniziato
  {
    id: 36,
    type: "added",
    gameId: 8,
    gameTitle: "Hogwarts Legacy",
    timestamp: new Date("2023-08-15"),
  }
];

/**
 * Formatta una data in un formato relativo leggibile (es. "2 giorni fa")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSec = Math.floor(diffInMs / 1000);
  const diffInMin = Math.floor(diffInSec / 60);
  const diffInHour = Math.floor(diffInMin / 60);
  const diffInDay = Math.floor(diffInHour / 24);
  const diffInWeek = Math.floor(diffInDay / 7);
  const diffInMonth = Math.floor(diffInDay / 30);
  const diffInYear = Math.floor(diffInDay / 365);

  if (diffInSec < 60) {
    return "Adesso";
  }
  if (diffInMin < 60) {
    return `${diffInMin} ${diffInMin === 1 ? 'minuto' : 'minuti'} fa`;
  }
  if (diffInHour < 24) {
    return `${diffInHour} ${diffInHour === 1 ? 'ora' : 'ore'} fa`;
  }
  if (diffInDay < 7) {
    return `${diffInDay} ${diffInDay === 1 ? 'giorno' : 'giorni'} fa`;
  }
  if (diffInWeek < 4) {
    return `${diffInWeek} ${diffInWeek === 1 ? 'settimana' : 'settimane'} fa`;
  }
  if (diffInMonth < 12) {
    return `${diffInMonth} ${diffInMonth === 1 ? 'mese' : 'mesi'} fa`;
  }
  return `${diffInYear} ${diffInYear === 1 ? 'anno' : 'anni'} fa`;
}

/**
 * Restituisce l'icona appropriata per il tipo di attività specificato
 */
export function getActivityIcon(type: ActivityType) {
  switch(type) {
    case "completed":
      return <Trophy className="h-5 w-5" style={{ color: getStatusColor('completed') }} />;
    case "played":
      return <Clock className="h-5 w-5" style={{ color: getStatusColor('played') }} />;
    case "added":
      return <Gamepad2 className="h-5 w-5" style={{ color: getStatusColor('added') }} />;
    case "rated":
      return <Star className="h-5 w-5" style={{ color: getStatusColor('rated') }} />;
    case "platinum":
      return <Award className="h-5 w-5" style={{ color: getStatusColor('platinum') }} />;
    case "abandoned":
      return <X className="h-5 w-5" style={{ color: getStatusColor('abandoned') }} />;
  }
}  

/**
 * Restituisce il testo formattato per l'attività
 */
export function getActivityText(activity: Activity): string {
  switch(activity.type) {
    case "completed":
      return `Hai completato ${activity.gameTitle}`;
    case "played":
      return `Hai giocato ${activity.additionalInfo} a ${activity.gameTitle}`;
    case "added":
      return `Hai aggiunto ${activity.gameTitle} alla tua libreria`;
    case "rated":
      return `Hai valutato ${activity.gameTitle} con ${activity.additionalInfo}`;
    case "platinum":
      return `Hai platinato ${activity.gameTitle}`;
    case "abandoned":
      return `Hai abbandonato ${activity.gameTitle} ${activity.additionalInfo ? activity.additionalInfo : ''}`;
  }
}

/**
 * Restituisce tutte le attività
 */
export function getAllActivities(): Activity[] {
  return activitiesData;
}

/**
 * Restituisce le attività recenti
 */
export function getRecentActivities(count: number): Activity[] {
  return activitiesData.slice(0, count);
}

/**
 * Restituisce le attività per un gioco specifico
 */
export function getActivitiesByGameId(gameId: number): Activity[] {
  return activitiesData.filter(activity => activity.gameId === gameId);
}

/**
 * Aggiunge una nuova attività
 */
export function addActivity(activity: Omit<Activity, 'id'>): Activity {
  const newActivity: Activity = {
    id: Math.max(...activitiesData.map(a => a.id)) + 1,
    ...activity,
    timestamp: activity.timestamp || new Date()
  };
  
  activitiesData.unshift(newActivity);
  return newActivity;
}

/**
 * Registra attività di gioco con ore specifiche
 */
export function recordGameplayHours(gameId: number, gameTitle: string, hours: number): Activity {
  return addActivity({
    type: "played",
    gameId,
    gameTitle,
    timestamp: new Date(),
    additionalInfo: `${hours} ore`
  });
}

/**
 * Registra completamento del gioco
 */
export function recordGameCompletion(gameId: number, gameTitle: string): Activity {
  return addActivity({
    type: "completed",
    gameId,
    gameTitle,
    timestamp: new Date()
  });
}

/**
 * Registra platino del gioco
 */
export function recordGamePlatinum(gameId: number, gameTitle: string): Activity {
  return addActivity({
    type: "platinum",
    gameId,
    gameTitle,
    timestamp: new Date()
  });
}

/**
 * Registra abbandono del gioco
 */
export function recordGameAbandoned(gameId: number, gameTitle: string, reason?: string): Activity {
  return addActivity({
    type: "abandoned",
    gameId,
    gameTitle,
    timestamp: new Date(),
    additionalInfo: reason
  });
}

/**
 * Registra un'attività per un cambio di stato
 */
export function recordStatusChange(gameId: number, gameTitle: string, newStatus: ActivityType): Activity {
  // Verifica che newStatus sia una ActivityType valida
  const validTypes: ActivityType[] = ["completed", "played", "added", "rated", "platinum", "abandoned"];
  
  if (!validTypes.includes(newStatus)) {
    console.warn(`Tipo di attività non valido: ${newStatus}. Utilizzando "added" come fallback.`);
    newStatus = "added";
  }
  
  return addActivity({
    type: newStatus,
    gameId,
    gameTitle,
    timestamp: new Date()
  });
}
