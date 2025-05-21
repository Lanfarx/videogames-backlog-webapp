/**
 * Tipi relativi ai profili utente e alle impostazioni
 */

/**
 * Dati del profilo utente
 */
export interface UserProfile {
  userId: string;              // ID univoco dell'utente
  username: string;            // Nome utente 
  fullName?: string;           // Nome completo
  bio?: string;                // Biografia/descrizione
  avatar?: string;             // URL dell'immagine del profilo
  memberSince: Date | string;  // Data di iscrizione
  tags?: string[];             // Tag/interessi dell'utente
  socialLinks?: SocialLink[];  // Link ai profili social
  privacySettings: PrivacySettings; // Impostazioni privacy
  connectedAccounts: ConnectedAccounts; // Account di gioco collegati
}

/**
 * Impostazioni di privacy dell'utente
 */
export interface PrivacySettings {
  isPrivate: boolean;          // Profilo privato/pubblico
  showStats: boolean;          // Mostra statistiche giochi
  showDiary: boolean;          // Mostra diario attività
  showLibrary: boolean;        // Mostra libreria giochi
  showLastPlayed: boolean;     // Mostra ultimi giochi giocati
}

/**
 * Link ai social media
 */
export interface SocialLink {
  platform: SocialPlatform;    // Tipo di piattaforma social
  url: string;                 // URL del profilo
  displayName?: string;        // Nome visualizzato
}

/**
 * Tipi di piattaforme social supportate
 */
export type SocialPlatform = 'twitter' | 'twitch' | 'youtube' | 'discord' | 'instagram' | 'reddit' | 'other';

/**
 * Account di gioco collegati
 */
export interface ConnectedAccounts {
  steam?: ConnectedAccount;    // Account Steam
  playstation?: ConnectedAccount; // Account PlayStation
  xbox?: ConnectedAccount;     // Account Xbox
  nintendo?: ConnectedAccount; // Account Nintendo
}

/**
 * Struttura di un account collegato
 */
export interface ConnectedAccount {
  id: string;                  // ID dell'account
  username?: string;           // Nome utente sulla piattaforma
  isConnected: boolean;        // Stato della connessione
  lastSync?: Date;             // Data ultima sincronizzazione
}

/**
 * Preferenze dell'applicazione
 */
export interface AppPreferences {
  language: string;            // Lingua dell'interfaccia
  theme: 'light' | 'dark' | 'system'; // Tema 
  dateFormat: string;          // Formato date
  timeFormat: string;          // Formato orario
  notifications: NotificationPreferences; // Preferenze notifiche
}

/**
 * Preferenze per le notifiche
 */
export interface NotificationPreferences {
  enabled: boolean;            // Notifiche abilitate globalmente
  newReleases: boolean;        // Notifiche nuove uscite
  priceAlerts: boolean;        // Notifiche sconti
  achievements: boolean;       // Notifiche achievement/trofei
  friendActivity: boolean;     // Notifiche attività amici
}