import axios from 'axios';

import { API_CONFIG } from '../config/api';

export interface HowLongToBeatResult {
  name: string;
  mainExtra: number; // in ore
  completionist: number; // in ore
  similarity?: number; // 0-1, quanto è simile al titolo cercato
}

const API_URL = API_CONFIG.BASE_URL;

/**
 * Cerca i dati di HowLongToBeat per un gioco usando il proxy locale (C#)
 * @param gameName Nome del gioco da cercare
 * @returns Dati di completamento o null se non trovato
 */
export const searchHowLongToBeat = async (gameName: string): Promise<HowLongToBeatResult | null> => {
  try {
    const token = localStorage.getItem('token');
    
    // Configura gli headers in base alla presenza del token
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await axios.get(`${API_URL}/api/HowLongToBeat/search`, {
      params: { query: gameName },
      headers: headers
    });
    
    const results = response.data;
    
    if (!results || results.length === 0) {
      console.log(`No HowLongToBeat data found for: ${gameName}`);
      return null;
    }

    // Prendi il primo risultato (più rilevante)
    const game = results[0];
    
    return {
      name: game.name,
      mainExtra: game.mainExtra || 0,
      completionist: game.completionist || 0,
      similarity: game.similarity || 1
    };
  } catch (error) {
    console.error('Error fetching HowLongToBeat data via proxy:', error);
    return null;
  }
};

/**
 * Formatta le ore in formato leggibile
 * @param hours Ore da formattare
 * @returns Stringa formattata (es: "15h" o "15.5h")
 */
export const formatHours = (hours: number | undefined | null): string => {
  if (!hours || hours === 0) return '-';
  return `${hours}h`;
};
