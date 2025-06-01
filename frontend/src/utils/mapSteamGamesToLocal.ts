import { Game } from '../types/game';

// Funzione che richiama l'API Steam e mappa i giochi nel formato Game locale
export async function mapSteamGamesToLocal(steamId: string): Promise<Game[]> {
  const { fetchSteamGames } = await import('../store/services/steamService');
  const steamGames = await fetchSteamGames(steamId);
  return steamGames.map((steamGame: any) => {
    return {
      id: Number(`${steamGame.appid}${Date.now()}${Math.floor(Math.random()*1000)}`),
      title: steamGame.name,
      Platform: 'Steam',
      ReleaseYear: new Date().getFullYear(),
      Genres: [],
      Status: 'NotStarted',
      CoverImage: steamGame.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${steamGame.appid}/${steamGame.img_icon_url}.jpg`
        : undefined,
      Price: 0,
      PurchaseDate: undefined,
      Developer: undefined,
      Publisher: undefined,
      CompletionDate: undefined,
      PlatinumDate: undefined,
      HoursPlayed: Math.round((steamGame.playtime_forever || 0) / 60),
      Metacritic: 0,
      Rating: 0,
      Notes: '',
      Review: undefined,
      Comments: [],
    };
  });
}
