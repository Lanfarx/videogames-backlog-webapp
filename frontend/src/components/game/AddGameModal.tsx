import React, { useState, useEffect } from 'react';
import { X, Search, Upload, Award } from 'lucide-react';
import { Game, GameStatus } from '../../types/game';
import { Status_OPTIONS, GAME_PlatformS, Genres } from '../../constants/gameConstants';
import { useAppDispatch } from '../../store/hooks';
import { useGameActions } from '../../store/hooks/gamesHooks';
import { useAllActivitiesActions } from '../../store/hooks/activitiesHooks';
import StatusBadge from '../ui/atoms/StatusBadge';
import FormErrorInline from '../ui/atoms/FormErrorInline';
import StatusIndicator from '../ui/atoms/StatusIndicator';
import { createStatusChangeActivity, createPlaytimeActivity } from '../../utils/activityUtils';
import { getGameDetails, searchGames } from '../../store/services/rawgService';
import { fetchGames } from '../../store/thunks/gamesThunks';

// Tipo per i dati del form
type GameFormData = Omit<Game, "id" | "Rating"> & { id?: number, CompletionDate?: string, PlatinumDate?: string }

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillGame?: Partial<Game> | null;
}

// Stato iniziale del form
const initialGameData: GameFormData = {
  Title: "",
  CoverImage: "",
  Developer: "",
  Publisher: "",
  ReleaseYear: new Date().getFullYear(),
  Genres: [],
  Platform: "",
  Status: "NotStarted",
  HoursPlayed: 0,
  Metacritic: 0,
  PurchaseDate: new Date().toISOString().split("T")[0],
  Price: 0,
  Notes: "",
};

const AddGameModal: React.FC<AddGameModalProps> = ({ 
  isOpen, 
  onClose,
  prefillGame
}) => {
  const dispatch = useAppDispatch();
  const { add } = useGameActions();
  const { addActivity } = useAllActivitiesActions();
  const [activeTab, setActiveTab] = useState<"search" | "manual">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gameData, setGameData] = useState<GameFormData>(initialGameData);
  const [formError, setFormError] = useState<string | null>(null);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  // Sempre nuovo gioco, resetta il form all'apertura
  useEffect(() => {
    setGameData(initialGameData);
    setIsAutoFilled(false);
    setFormError(null); // reset errore su chiusura modal
  }, [isOpen]);

  useEffect(() => {
    setFormError(null); // reset errore su cambio tab
  }, [activeTab]);

  // Prefill da catalogo (o altro) se fornito
  useEffect(() => {
    if (isOpen && prefillGame) {
      setGameData(prev => ({
        ...prev,
        Title: prefillGame.Title || "",
        CoverImage: prefillGame.CoverImage || "",
        Developer: prefillGame.Developer || "",
        Publisher: prefillGame.Publisher || "",
        ReleaseYear: prefillGame.ReleaseYear || new Date().getFullYear(),
        Genres: prefillGame.Genres || [],
        Metacritic: prefillGame.Metacritic || 0,
      }));
      setActiveTab("manual");
      setIsAutoFilled(true);
    }
  }, [isOpen, prefillGame]);

  // Gestisce la ricerca
  const handleSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const data = await searchGames(query);
      // Mappa i risultati dell'API al formato che ti serve
     const formattedResults = data.results
      .filter((game: any) => game.Metacritic && game.Ratings_count > 5)
      .map((game: any) => ({
        id: game.id,
        Title: game.name,
        CoverImage: game.background_image || "/placeholder.svg",
        ReleaseYear: game.released ? new Date(game.released).getFullYear() : null,
        Genres: game.Genres?.map((g: any) => g.name) || [],
        Metacritic: game.Metacritic,
        Rating: game.Rating,
        Platforms: game.Platforms?.map((p: any) => p.Platform.name) || [],
      }));
      
      setSearchResults(formattedResults);
    } catch (error) {
      console.error('Errore nella ricerca:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Gestisce la selezione di un gioco dalla ricerca
  const handleGameSelect = async (game: any) => {
    try {
    const fullData = await getGameDetails(game.id);
    
    setGameData({
      ...gameData,
      Title: fullData.name,
      CoverImage: fullData.background_image || "/placeholder.svg?height=280&width=280",
      Developer: fullData.Developers?.[0]?.name || "Sconosciuto",
      Publisher: fullData.Publishers?.[0]?.name || "Sconosciuto",
      ReleaseYear: fullData.released ? new Date(fullData.released).getFullYear() : new Date().getFullYear(),
      Genres: fullData.Genres?.map((g: any) => g.name) || [],
      Metacritic: fullData.Metacritic || 0,
    });
    setActiveTab("manual");
    setIsAutoFilled(true);
    setSearchQuery("");
    setSearchResults([]);
    } catch (error) {
    console.error("Errore durante il caricamento dei dettagli del gioco:", error);
  }
};

  // Gestisce l'aggiornamento dei dati del gioco
  const handleGameDataChange = (data: Partial<GameFormData>) => {
    if (data.Status) {
      const newStatus = data.Status as GameStatus;
      const updates: Partial<GameFormData> = { ...data };

      // Regole per ore di gioco
      if (newStatus === "NotStarted") {
        updates.HoursPlayed = 0;
      }

      // Aggiungi date specifiche per stato
      if (newStatus === "Completed" || newStatus === "Platinum") {
        updates.CompletionDate = updates.CompletionDate || new Date().toISOString().split("T")[0];
      } else {
        updates.CompletionDate = undefined;
      }

      if (newStatus === "Platinum") {
        updates.PlatinumDate = updates.PlatinumDate || new Date().toISOString().split("T")[0];
      } else {
        updates.PlatinumDate = undefined;
      }

      setGameData((prev) => ({ ...prev, ...updates }));
      return;
    }

    setGameData((prev) => ({ ...prev, ...data }));
  };

  // Gestisce il toggle dei generi
  const handleGenreToggle = (genre: string) => {
    const updatedGenres = gameData.Genres.includes(genre)
      ? gameData.Genres.filter((g) => g !== genre)
      : [...gameData.Genres, genre];
    handleGameDataChange({ Genres: updatedGenres });
  };

  // Gestisce l'upload dell'immagine
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleGameDataChange({ CoverImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Rimuove l'immagine
  const removeImage = () => {
    handleGameDataChange({ CoverImage: "" });
  };  // Gestisce il salvataggio del gioco
  const handleSave = async () => {
    // Validazione campi obbligatori
    const scrollErrorIntoView = () => {
      setTimeout(() => {
        // Prima cerca la tab manuale, poi la sezione base info
        const manualTab = document.getElementById('add-game-manual-tab');
        const errorSection = document.getElementById('add-game-base-info');
        // Trova il contenitore scrollabile del modal
        const modalContainer = (manualTab?.closest('.overflow-auto') || manualTab?.closest('[class*="overflow-auto"]')) as HTMLElement | null;
        if (manualTab && modalContainer) {
          // Scrolla la tab manuale in alto nel contenitore
          const tabRect = manualTab.getBoundingClientRect();
          const containerRect = modalContainer.getBoundingClientRect();
          const offset = tabRect.top - containerRect.top;
          modalContainer.scrollTop += offset;
        } else if (manualTab) {
          manualTab.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (errorSection) {
          errorSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0);
    };
    if (!gameData.Title.trim() || !gameData.ReleaseYear) {
      setFormError("Compila tutti i campi obbligatori: titolo e anno di uscita.");
      scrollErrorIntoView();
      return;
    }
    if (gameData.Status !== "NotStarted" && (!gameData.HoursPlayed || gameData.HoursPlayed === 0)) {
      setFormError("Se lo stato non è 'Da iniziare', inserisci almeno 1 ora di gioco.");
      scrollErrorIntoView();
      return;
    }
    setFormError(null);    
    const gameToSave = {
      ...gameData
    } as Game;
    
    try {
      await add(gameToSave);

      // Crea attività appropriate in base al nuovo gioco
      // 1. Crea l'attività di aggiunta alla libreria (added)
      const addedActivity = createStatusChangeActivity(gameToSave, 'NotStarted');
      addActivity(addedActivity);      // 2. Se il gioco ha ore di gioco (stato non è "NotStarted"), crea anche un'attività di gioco
      if (gameToSave.Status !== 'NotStarted' && gameToSave.HoursPlayed > 0) {
        const isFirstSession = true; // È la prima sessione dato che è un nuovo gioco
        const playtimeActivity = createPlaytimeActivity(gameToSave, gameToSave.HoursPlayed, isFirstSession);
        addActivity(playtimeActivity);
      }
      
      // Chiudi il modal dopo il salvataggio
      onClose();
    } catch (error) {
      console.error("Errore durante il salvataggio del gioco:", error);
      setFormError("Errore durante il salvataggio del gioco. Riprova.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-primary-bg border border-border-color rounded-xl w-full max-w-[800px] max-h-[80vh] overflow-auto">
        {/* Header */}
        <div className="p-8 border-b border-border-color">
          <div className="flex justify-between items-center">
            <h2 className="font-montserrat font-bold text-[28px] text-text-primary">
              Aggiungi nuovo gioco
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-accent-primary transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border-color mb-6">
          <div className="flex">
            <button
              className={`px-6 py-3 font-roboto font-medium text-base transition-colors ${
                activeTab === "search"
                  ? "text-text-primary border-b-[3px] border-accent-primary"
                  : "text-text-secondary hover:text-accent-primary"
              }`}
              onClick={() => setActiveTab("search")}
            >
              Ricerca automatica
            </button>
            <button
              className={`px-6 py-3 font-roboto font-medium text-base transition-colors ${
                activeTab === "manual"
                  ? "text-text-primary border-b-[3px] border-accent-primary"
                  : "text-text-secondary hover:text-accent-primary"
              }`}
              onClick={() => setActiveTab("manual")}
            >
              Inserimento manuale
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8">
          {/* Tab content */}
          {activeTab === "search" ? (
            <div className="mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchQuery);
                }}
                className="mb-6"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca titolo del gioco..."
                    className="w-full px-12 py-3 border border-border-color rounded-lg bg-primary-bg text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
                  <button
                    type="submit"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 px-3 py-1 bg-accent-primary text-white font-roboto font-medium text-sm rounded-md hover:bg-accent-primary/90 transition-colors"
                  >
                    Cerca
                  </button>
                </div>
              </form>

              {/* Risultati della ricerca */}
              <div className="bg-primary-bg border border-border-color rounded-lg overflow-hidden">
                {isSearching ? (
                  <div className="p-6 text-center text-text-secondary">Ricerca in corso...</div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-[320px] overflow-y-auto">
                    {searchResults.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-3 h-[72px] border-b border-border-color hover:bg-secondary-bg transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="relative h-[50px] w-[50px] mr-3 overflow-hidden">
                            <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
                            <img
                              src={game.CoverImage || "/placeholder.svg"}
                              alt={game.Title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-montserrat font-medium text-base text-text-primary">{game.Title}</h3>
                            <p className="font-roboto text-sm text-text-secondary">
                              {game.Developer} • {game.ReleaseYear}
                              {game.Metacritic && (
                                <span className="ml-2 text-yellow-500 font-medium">{game.Metacritic}</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleGameSelect(game)}
                          className="px-3 py-1 bg-accent-primary text-white font-roboto font-medium text-sm rounded-md hover:bg-accent-primary/90 transition-colors"
                        >
                          Seleziona
                        </button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="p-6 text-center text-text-secondary">Nessun risultato trovato</div>
                ) : (
                  <div className="p-6 text-center text-text-secondary">
                    Cerca un gioco per titolo per visualizzare i risultati
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div id="add-game-manual-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Informazioni di base */}
                <div className="relative" id="add-game-base-info">
                  <h3 id="manual-tab-header" className="font-montserrat font-semibold text-xl text-text-primary mb-6">Informazioni di base</h3>
                  <FormErrorInline message={formError} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Titolo */}
                    <div className="md:col-span-2">
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        Titolo <span className="text-accent-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={gameData.Title}
                        onChange={(e) => handleGameDataChange({ Title: e.target.value })}
                        className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${isAutoFilled ? 'bg-tertiary-bg cursor-not-allowed opacity-80' : ''}`}
                        required
                        disabled={isAutoFilled}
                      />
                    </div>

                    {/* Sviluppatore */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Sviluppatore</label>
                      <input
                        type="text"
                        value={gameData.Developer}
                        onChange={(e) => handleGameDataChange({ Developer: e.target.value })}
                        className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${isAutoFilled ? 'bg-tertiary-bg cursor-not-allowed opacity-80' : ''}`}
                        disabled={isAutoFilled}
                      />
                    </div>

                    {/* Publisher */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Publisher</label>
                      <input
                        type="text"
                        value={gameData.Publisher}
                        onChange={(e) => handleGameDataChange({ Publisher: e.target.value })}
                        className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${isAutoFilled ? 'bg-tertiary-bg cursor-not-allowed opacity-80' : ''}`}
                        disabled={isAutoFilled}
                      />
                    </div>

                    {/* Anno di uscita */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        Anno di uscita
                      </label>
                      <input
                        type="number"
                        value={gameData.ReleaseYear}
                        onChange={(e) => handleGameDataChange({ ReleaseYear: Number.parseInt(e.target.value) || new Date().getFullYear() })}
                        min="1970"
                        max={new Date().getFullYear()}
                        className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${isAutoFilled ? 'bg-tertiary-bg cursor-not-allowed opacity-80' : ''}`}
                        disabled={isAutoFilled}
                      />
                    </div>

                    {/* Metacritic */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        <span className="flex items-center">
                          <Award className="w-4 h-4 text-yellow-500 mr-1" />
                          Metacritic
                        </span>
                      </label>
                      <input
                        type="number"
                        value={gameData.Metacritic || 0}
                        onChange={(e) => handleGameDataChange({ Metacritic: Number.parseInt(e.target.value) || 0 })}
                        min="0"
                        max="100"
                        className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${isAutoFilled ? 'bg-tertiary-bg cursor-not-allowed opacity-80' : ''}`}
                        disabled={isAutoFilled}
                      />
                    </div>

                    {/* Piattaforma */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        Piattaforma <span className="text-accent-primary">*</span>
                      </label>
                      <select
                        value={gameData.Platform}
                        onChange={(e) => handleGameDataChange({ Platform: e.target.value })}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                        required
                      >
                        <option value="" disabled>
                          Seleziona piattaforma
                        </option>
                        {GAME_PlatformS.map((Platform) => (
                          <option key={Platform} value={Platform}>
                            {Platform}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Generi */}
                    <div className="md:col-span-2">
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Generi</label>
                      <div className="flex flex-wrap gap-2">
                        {Genres.map((genre) => (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => handleGenreToggle(genre)}
                            className={`px-3 py-1 rounded-full text-sm font-roboto transition-colors ${gameData.Genres.includes(genre) ? "bg-accent-primary text-white" : "bg-secondary-bg text-text-primary hover:bg-tertiary-bg"} ${isAutoFilled ? 'opacity-60 cursor-not-allowed' : ''}`}
                            disabled={isAutoFilled}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upload copertina */}
                    <div className="md:col-span-2">
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Copertina</label>
                      {gameData.CoverImage ? (
                        <div className="relative w-40 h-40 border border-border-color rounded-md overflow-hidden">
                          <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
                          <img
                            src={gameData.CoverImage || "/placeholder.svg"}
                            alt="Copertina"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-primary-bg rounded-full p-1 text-text-secondary hover:text-accent-primary transition-colors"
                            disabled={isAutoFilled}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border-color rounded-md bg-secondary-bg hover:border-accent-primary transition-colors cursor-pointer">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="h-10 w-10 text-text-secondary mb-2" />
                            <p className="font-roboto text-sm text-text-secondary">
                              <span className="font-medium">Clicca per caricare</span> o trascina qui l'immagine
                            </p>
                            <p className="text-xs text-text-secondary mt-1">PNG, JPG o WEBP (max. 2MB)</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isAutoFilled} />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dettagli personali */}
                <div>
                  <h3 className="font-montserrat font-semibold text-xl text-text-primary mb-6">Dettagli personali</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Stato */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        Stato <span className="text-accent-primary">*</span>
                      </label>
                      <select
                        value={gameData.Status}
                        onChange={(e) => handleGameDataChange({ Status: e.target.value as GameStatus })}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                        required
                      >
                        {Status_OPTIONS.map((Status) => (
                          <option key={Status.value} value={Status.value}>
                            {Status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ore di gioco */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        Ore di gioco
                      </label>
                      <input
                        type="number"
                        value={gameData.HoursPlayed}
                        onChange={(e) => handleGameDataChange({ HoursPlayed: Number.parseInt(e.target.value) || 0 })}
                        min="0"
                        disabled={gameData.Status === "NotStarted"}
                        className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${
                          gameData.Status === "NotStarted" ? "bg-tertiary-bg cursor-not-allowed" : ""
                        }`}
                      />
                    </div>


                    {/* Data di acquisto */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        Data di acquisto
                      </label>
                      <input
                        type="date"
                        value={gameData.PurchaseDate}
                        onChange={(e) => handleGameDataChange({ PurchaseDate: e.target.value })}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                        />
                    </div>

                    {/* Prezzo */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Prezzo (€)</label>
                      <input
                        type="number"
                        value={gameData.Price}
                        onChange={(e) => handleGameDataChange({ Price: Number.parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                        />
                    </div>
                      {/* Data di completamento */}
                      {(gameData.Status === "Completed" || gameData.Status === "Platinum") && (
                        <div>
                          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                            Data di completamento
                          </label>
                          <input
                            type="date"
                            value={gameData.CompletionDate || ""}
                            onChange={(e) => handleGameDataChange({ CompletionDate: e.target.value })}
                            className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                          />
                        </div>
                      )}
  
                      {/* Data di platino */}
                      {gameData.Status === "Platinum" && (
                        <div>
                          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                            Data di platino
                          </label>
                          <input
                            type="date"
                            value={gameData.PlatinumDate || ""}
                            onChange={(e) => handleGameDataChange({ PlatinumDate: e.target.value })}
                            className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                          />
                        </div>
                      )}

                    {/* Note */}
                    <div className="md:col-span-2">
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Note</label>
                      <textarea
                        value={gameData.Notes}
                        onChange={(e) => handleGameDataChange({ Notes: e.target.value })}
                        rows={4}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors resize-none font-roboto text-base"
                        placeholder="Aggiungi note personali sul gioco..."
                        ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anteprima */}
              <div className="lg:col-span-1">
                <div className="bg-secondary-bg rounded-xl p-6 sticky top-8">
                  <h3 className="font-montserrat font-semibold text-xl text-text-primary mb-4">Anteprima scheda</h3>

                  <div className="bg-primary-bg border border-border-color rounded-xl shadow-sm h-[360px] relative">
                    {/* Indicatore di stato */}
                    <StatusIndicator Status={gameData.Status} />

                    {/* Copertina */}
                    <div className="relative h-[180px] overflow-hidden">
                      <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
                      {gameData.CoverImage ? (
                        <img
                          src={gameData.CoverImage || "/placeholder.svg"}
                          alt={gameData.Title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-tertiary-bg flex items-center justify-center text-text-secondary">
                          Nessuna copertina
                        </div>
                      )}
                    </div>

                    {/* Contenuto */}
                    <div className="p-4">
                      <h3 className="font-montserrat font-semibold text-base text-text-primary line-clamp-2 h-12">
                        {gameData.Title || "Titolo del gioco"}
                      </h3>

                      <div className="flex items-center mt-2 text-text-secondary">
                        <span className="font-roboto text-xs">{gameData.Platform || "Piattaforma"}</span>
                        <span className="mx-2">|</span>
                        <span className="font-roboto text-xs">{gameData.HoursPlayed} ore</span>
                        {gameData.Metacritic > 0 && (
                          <>
                            <span className="mx-2">|</span>
                            <Award className="h-4 w-4 mr-1 text-yellow-500" />
                            <span className="font-roboto text-xs">{gameData.Metacritic}</span>
                          </>
                        )}
                      </div>

                      {/* Prezzo */}
                      {gameData.Price > 0 && (
                        <div className="mt-2 text-text-secondary">
                          <span className="font-roboto text-xs">{gameData.Price.toFixed(2)} €</span>
                        </div>
                      )}

                      {/* Stato */}
                      <div className="mt-2">
                        <StatusBadge Status={gameData.Status} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border-color flex flex-wrap justify-between gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary-bg border border-border-color text-text-primary font-roboto font-medium text-base rounded-lg hover:bg-secondary-bg transition-colors"
          >
            Annulla
          </button>          {activeTab === "manual" && (
            <button
              onClick={() => handleSave()}
              className="px-6 py-3 bg-accent-primary text-white font-roboto font-medium text-base rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Salva
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddGameModal;