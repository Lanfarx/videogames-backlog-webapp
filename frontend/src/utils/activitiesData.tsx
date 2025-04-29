import { Activity, ActivityType } from '../types/activity';
import { Trophy, Clock, Gamepad2, Star, Award, X, BookmarkPlus } from 'lucide-react';

// Dati di esempio per le attività
export const activitiesData: Activity[] = [
  {
    id: 1,
    type: "completed",
    gameId: 5,
    gameTitle: "Baldur's Gate 3",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 giorni fa
    additionalInfo: "100%"
  },
  {
    id: 2,
    type: "played",
    gameId: 2,
    gameTitle: "Cyberpunk 2077",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 giorni fa
    additionalInfo: "3 ore"
  },
  {
    id: 3,
    type: "added",
    gameId: 6,
    gameTitle: "Starfield",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 settimana fa
  },
  {
    id: 4,
    type: "rated",
    gameId: 3,
    gameTitle: "God of War Ragnarök",
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 settimane fa
    additionalInfo: "5 stelle"
  },
  {
    id: 5,
    type: "platinum",
    gameId: 3,
    gameTitle: "God of War Ragnarök",
    timestamp: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), // circa 2 settimane fa
  },
  {
    id: 6,
    type: "abandoned",
    gameId: 7,
    gameTitle: "Final Fantasy XVI",
    timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 settimane fa
    additionalInfo: "dopo 5 ore"
  },
  {
    id: 7,
    type: "wishlisted",
    gameId: 8,
    gameTitle: "Hogwarts Legacy",
    timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 mese fa
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
      return <Trophy className="h-5 w-5 text-[#9FC089]" />;
    case "played":
      return <Clock className="h-5 w-5 text-[#9FC089]" />;
    case "added":
      return <Gamepad2 className="h-5 w-5 text-[#9FC089]" />;
    case "rated":
      return <Star className="h-5 w-5 text-[#9FC089]" />;
    case "platinum":
      return <Award className="h-5 w-5 text-[#9370DB]" />; // Colore platino
    case "abandoned":
      return <X className="h-5 w-5 text-[#F44336]" />; // Colore rosso
    case "wishlisted":
      return <BookmarkPlus className="h-5 w-5 text-[#FFCC3F]" />; // Colore giallo
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
    case "wishlisted":
      return `Hai aggiunto ${activity.gameTitle} alla tua wishlist`;
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
