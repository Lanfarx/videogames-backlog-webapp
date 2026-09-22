import { GameStatus } from '../../types/game';
import { Platform_COLORS } from '../../constants/gameConstants';

export interface SampleGame {
  id: number;
  title: string;
  status: GameStatus;
  platform: string;
  hoursPlayed: number;
  progressPercent: number;
  rating: number;
  genre: string;
  coverImage: string;
  badgeText?: string;
}

export const SAMPLE_GAMES: SampleGame[] = [
  {
    id: 1,
    title: 'Elden Ring: Shadow of the Erdtree',
    status: 'InProgress',
    platform: 'PlayStation 5',
    hoursPlayed: 78,
    progressPercent: 82,
    rating: 5,
    genre: 'Action RPG',
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=640&auto=format&fit=crop',
    badgeText: 'Boss finale in corso'
  },
  {
    id: 2,
    title: 'Hades II',
    status: 'InProgress',
    platform: 'Steam',
    hoursPlayed: 34,
    progressPercent: 50,
    rating: 5,
    genre: 'Roguelike',
    coverImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=640&auto=format&fit=crop',
    badgeText: 'Fuga #14 completata'
  },
  {
    id: 3,
    title: "Baldur's Gate 3",
    status: 'Platinum',
    platform: 'Steam',
    hoursPlayed: 146,
    progressPercent: 100,
    rating: 5,
    genre: 'CRPG',
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=640&auto=format&fit=crop',
    badgeText: 'Tutti i trofei sbloccati'
  },
  {
    id: 4,
    title: 'Cyberpunk 2077: Phantom Liberty',
    status: 'Completed',
    platform: 'PlayStation 5',
    hoursPlayed: 88,
    progressPercent: 100,
    rating: 4.5,
    genre: 'Sci-Fi RPG',
    coverImage: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=640&auto=format&fit=crop',
    badgeText: 'Storia principale conclusa'
  },
  {
    id: 5,
    title: 'The Legend of Zelda: Tears of the Kingdom',
    status: 'NotStarted',
    platform: 'Nintendo Switch 2',
    hoursPlayed: 0,
    progressPercent: 0,
    rating: 5,
    genre: 'Action Adventure',
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=640&auto=format&fit=crop',
    badgeText: 'Prossimo in coda'
  },
  {
    id: 6,
    title: 'Starfield',
    status: 'Abandoned',
    platform: 'Xbox Series X',
    hoursPlayed: 14,
    progressPercent: 20,
    rating: 3,
    genre: 'Sci-Fi RPG',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=640&auto=format&fit=crop',
    badgeText: 'Abbandonato dopo 14h'
  },
];

export const WORKFLOW_STEPS = [
  {
    stepNumber: '01',
    title: 'Cerca qualsiasi titolo in un click',
    description: 'Accedi al catalogo globale con oltre 800.000 giochi. Copertine ufficiali, date di rilascio e generi caricati all’istante.',
    tag: 'Catalogo giochi'
  },
  {
    stepNumber: '02',
    title: 'Organizza per stato e piattaforma',
    description: 'Dividi con facilità tra Da iniziare, In corso, Completati, Abbandonati e Platinati. Assegna le tue piattaforme preferite tra PC, PlayStation, Xbox e Switch 2.',
    tag: 'Filtri dinamici'
  },
  {
    stepNumber: '03',
    title: 'Traccia ore, note e celebra i traguardi',
    description: 'Tieni il conto preciso del tempo investito, scrivi recensioni personali e condividi i tuoi progressi videoludici con i tuoi compagni di gioco.',
    tag: 'Statistiche & Diario'
  }
];

export const PLATFORM_BADGES = [
  { name: 'Steam', color: Platform_COLORS['Steam'] },
  { name: 'PlayStation 5', color: Platform_COLORS['PlayStation 5'] },
  { name: 'Xbox Series X/S', color: Platform_COLORS['Xbox Series X/S'] },
  { name: 'Nintendo Switch 2', color: Platform_COLORS['Nintendo Switch 2'] },
  { name: 'Epic Games Store', color: Platform_COLORS['Epic Games Store'] },
  { name: 'GOG', color: Platform_COLORS['GOG'] },
];

