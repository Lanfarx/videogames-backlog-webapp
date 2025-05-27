import { Game } from '../types/game';

// Funzione che richiama l'API Steam e mappa i giochi nel formato Game locale
export async function mapSteamGamesToLocal(steamId: string): Promise<Game[]> {
  const { fetchSteamGames } = await import('../store/api/steamApi');
  const steamGames = await fetchSteamGames(steamId);
  return steamGames.map((steamGame: any) => {
    return {
      id: Number(`${steamGame.appid}${Date.now()}${Math.floor(Math.random()*1000)}`),
      title: steamGame.name,
      platform: 'Steam',
      releaseYear: new Date().getFullYear(),
      genres: [],
      status: 'not-started',
      coverImage: steamGame.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${steamGame.appid}/${steamGame.img_icon_url}.jpg`
        : undefined,
      price: 0,
      purchaseDate: undefined,
      developer: undefined,
      publisher: undefined,
      completionDate: undefined,
      platinumDate: undefined,
      hoursPlayed: Math.round((steamGame.playtime_forever || 0) / 60),
      metacritic: 0,
      rating: 0,
      notes: '',
      review: undefined,
      comments: [],
    };
  });
}
