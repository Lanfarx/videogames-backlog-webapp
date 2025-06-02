import axios from 'axios';

const STEAM_API_BASE_URL = 'https://api.steampowered.com';

const steamApiClient = axios.create({
  baseURL: STEAM_API_BASE_URL,
  params: {
    key: process.env.REACT_APP_STEAM_API_KEY
  }
});

export async function fetchSteamGames(steamId: string) {
  try {
    const response = await steamApiClient.get('/IPlayerService/GetOwnedGames/v1/', {
      params: {
        steamid: steamId,
        include_appinfo: 1,
        include_Played_free_games: 0
      }
    });
    return response.data.response.games || [];
  } catch (error) {
    console.error('Errore nel recupero dei giochi Steam:', error);
    throw error;
  }
}