import { GameStatus } from '../../types/game';
import { Platform_COLORS } from '../../constants/gameConstants';

export interface SampleGame {
  id: number;
  title: string;
  status: GameStatus;
  platform: string;
  hoursPlayed: number;
  rating: number; 
  metacritic: number; 
  genre: string;
  releaseYear: number;
  coverImage: string;
  notes?: string;
}

export const SAMPLE_GAMES: SampleGame[] = [
  {
    id: 1,
    title: 'Elden Ring',
    status: 'InProgress',
    platform: 'PlayStation 5',
    hoursPlayed: 84,
    rating: 5,
    metacritic: 96,
    genre: 'Action RPG',
    releaseYear: 2022,
    coverImage: 'https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg',
    notes: 'In corso: esplorando le Terre delle Ombre nel DLC. Esperienza monumentale.'
  },
  {
    id: 2,
    title: "Baldur's Gate 3",
    status: 'Platinum',
    platform: 'Steam',
    hoursPlayed: 160,
    rating: 5,
    metacritic: 96,
    genre: 'CRPG',
    releaseYear: 2023,
    coverImage: 'https://media.rawg.io/media/games/699/69907ecf13f172e9e144069769c3be73.jpg',
    notes: 'Completata ogni quest e romance. Il miglior gioco di ruolo dell’ultimo decennio.'
  },
  {
    id: 3,
    title: 'Hades II',
    status: 'InProgress',
    platform: 'Steam',
    hoursPlayed: 32,
    rating: 5,
    metacritic: 93,
    genre: 'Roguelike',
    releaseYear: 2024,
    coverImage: 'https://media.rawg.io/media/games/8fd/8fd2e8317849fd265ad8781c324d4ec2.jpg',
    notes: 'Combat system fluido e colonna sonora magistrale. Raggiunta la superficie.'
  },
  {
    id: 4,
    title: 'Cyberpunk 2077',
    status: 'Completed',
    platform: 'PlayStation 5',
    hoursPlayed: 92,
    rating: 4.5,
    metacritic: 86,
    genre: 'Action RPG',
    releaseYear: 2020,
    coverImage: 'https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg',
    notes: 'Storia principale e Phantom Liberty concluse. Atmosfera di Night City senza pari.'
  },
  {
    id: 5,
    title: 'Forza Horizon 5',
    status: 'Completed',
    platform: 'Xbox',
    hoursPlayed: 75,
    rating: 4.5,
    metacritic: 92,
    genre: 'Racing',
    releaseYear: 2021,
    coverImage: 'https://media.rawg.io/media/games/082/082365507ff04d456c700157072d35db.jpg',
    notes: 'Open-world in Messico spettacolare. Ottimo per sessioni di relax su console.'
  },
  {
    id: 6,
    title: 'The Witcher 3: Wild Hunt',
    status: 'Platinum',
    platform: 'Steam',
    hoursPlayed: 145,
    rating: 5,
    metacritic: 93,
    genre: 'RPG',
    releaseYear: 2015,
    coverImage: 'https://media.rawg.io/media/games/618/618c2031a07bbff6b4f611f10b6bcdbc.jpg',
    notes: 'Completato sia il gioco base sia Hearts of Stone e Blood and Wine.'
  },
  {
    id: 7,
    title: 'Hollow Knight',
    status: 'NotStarted',
    platform: 'Nintendo Switch',
    hoursPlayed: 0,
    rating: 5,
    metacritic: 90,
    genre: 'Metroidvania',
    releaseYear: 2017,
    coverImage: 'https://media.rawg.io/media/games/4cf/4cfc6b7f1850590a4634b08bfab308ab.jpg',
    notes: 'Acquistato per Switch, programmato come prossima avventura portatile.'
  },
  {
    id: 8,
    title: 'Starfield',
    status: 'Abandoned',
    platform: 'Xbox',
    hoursPlayed: 14,
    rating: 3,
    metacritic: 83,
    genre: 'Sci-Fi RPG',
    releaseYear: 2023,
    coverImage: 'https://media.rawg.io/media/games/ba8/ba82c971336adfd290e4c0eab6504fcf.jpg',
    notes: 'Interrotto dopo 14 ore: ritmo narrativo e viaggi spaziali non affini al mio gusto.'
  }
];

export const WORKFLOW_STEPS = [
  {
    stepNumber: '01',
    title: 'Cerca qualsiasi titolo in un click',
    description: 'Accedi al catalogo globale con oltre 800.000 giochi powered by RAWG. Copertine ufficiali, sviluppatori, generi e punteggi Metacritic importati all’istante.',
    tag: 'Catalogo RAWG'
  },
  {
    stepNumber: '02',
    title: 'Organizza per stato e piattaforma',
    description: 'Dividi con precisione tra Da iniziare, In corso, Completati, Platinati e Abbandonati. Assegna le tue piattaforme (Steam, PS5, Xbox, Switch).',
    tag: 'Stati & Piattaforme'
  },
  {
    stepNumber: '03',
    title: 'Traccia ore, note e recensioni',
    description: 'Tieni il conto del tempo speso su ciascun gioco, inserisci note personali e recensisci con voti dedicati per gameplay, grafica, storia e sonoro.',
    tag: 'Ore & Diario'
  }
];

export const PLATFORM_BADGES = [
  { name: 'Steam', color: Platform_COLORS['Steam'] },
  { name: 'PlayStation 5', color: Platform_COLORS['PlayStation 5'] },
  { name: 'Xbox', color: Platform_COLORS['Xbox'] },
  { name: 'Nintendo Switch', color: Platform_COLORS['Nintendo Switch'] },
  { name: 'Epic Games Store', color: Platform_COLORS['Epic Games Store'] },
  { name: 'GOG', color: Platform_COLORS['GOG'] },
];
