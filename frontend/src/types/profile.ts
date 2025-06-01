/**
 * Tipi relativi ai profili utente e alle impostazioni
 */

/**
 * Dati del profilo utente
 */
export interface UserProfile {
  userId: string;              // ID univoco dell'utente
  userName: string;            // Nome utente 
  email: string;               // Email dell'utente
  passwordHash?: string; // Hash della password (opzionale)
  fullName?: string;           // Nome completo
  bio?: string;                // Biografia/descrizione
  avatar?: string;             // URL dell'immagine del profilo
  memberSince: Date | string;  // Data di iscrizione
  tags?: string[];             // Tag/interessi dell'utente
  privacySettings: PrivacySettings;
  steamId?: string;          // ID Steam (opzionale)
  appPreferences: AppPreferences;
  library: Game[];             // Libreria giochi dell'utente
}

/**
 * Impostazioni di privacy dell'utente
 */
export interface PrivacySettings {
  isPrivate: boolean;
  showStats: boolean;
  showDiary: boolean;
  friendRequests: boolean;
}

/**
 * Preferenze dell'applicazione
 */
export interface AppPreferences {
  language: string;
  theme: 'light' | 'dark';
  accentColor: AccentColor;
  dateFormat: string;
  notifications: boolean;
}

import type { Game } from './game';import { AccentColor } from './theme';

