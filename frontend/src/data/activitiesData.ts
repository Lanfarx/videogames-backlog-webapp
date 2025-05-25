import { getStatusColor } from '../constants/gameConstants';
import { Activity } from '../types/activity';

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
