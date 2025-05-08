import React, { useState, useEffect } from 'react';
import { X, Search, Upload } from 'lucide-react';
import { Game, GameStatus } from '../../types/game';
import { STATUS_OPTIONS, STATUS_COLORS, STATUS_NAMES, GAME_PLATFORMS, GENRES } from '../../constants/gameConstants';

// Tipo per i dati del form
type GameFormData = Omit<Game, "id" | "rating"> & { id?: number, completionDate?: string, platinumDate?: string }

interface AddGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  gameToEdit?: Partial<Game>;
  onSave?: (game: Game) => void;
}

// Stato iniziale del form
const initialGameData: GameFormData = {
  title: "",
  coverImage: "",
  developer: "",
  publisher: "",
  releaseYear: new Date().getFullYear(),
  genres: [],
  platform: "",
  status: "not-started",
  hoursPlayed: 0,
  purchaseDate: new Date().toISOString().split("T")[0],
  price: 0,
  notes: "",
};

// Simulazione di dati per la ricerca automatica
// In un'implementazione reale, questo verrebbe sostituito da una chiamata API
const searchSampleGames = [
  {
    id: 1,
    title: "The Legend of Zelda: Breath of the Wild",
    coverImage: "/placeholder.svg?height=280&width=280",
    developer: "Nintendo EPD",
    publisher: "Nintendo",
    releaseYear: 2017,
    genres: ["Action", "Adventure", "Open World"],
  },
  {
    id: 2,
    title: "Cyberpunk 2077",
    coverImage: "/placeholder.svg?height=280&width=280",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    releaseYear: 2020,
    genres: ["RPG", "Action", "Open World"],
  },
  {
    id: 3,
    title: "God of War Ragnarök",
    coverImage: "/placeholder.svg?height=280&width=280",
    developer: "Santa Monica Studio",
    publisher: "Sony Interactive Entertainment",
    releaseYear: 2022,
    genres: ["Action", "Adventure"],
  }
];

const AddGameModal: React.FC<AddGameModalProps> = ({ 
  isOpen, 
  onClose, 
  isEdit = false, 
  gameToEdit, 
  onSave 
}) => {
  const [activeTab, setActiveTab] = useState<"search" | "manual">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gameData, setGameData] = useState<GameFormData>(initialGameData);

  // Se è in modalità modifica, popola i dati del gioco
  useEffect(() => {
    if (isEdit && gameToEdit) {
      setGameData({ ...initialGameData, ...gameToEdit });
      setActiveTab("manual");
    } else {
      setGameData(initialGameData);
    }
  }, [isEdit, gameToEdit, isOpen]);

  // Gestisce la ricerca
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);

    // Simulazione di una ricerca API
    setTimeout(() => {
      const results = searchSampleGames.filter(
        (game) => game.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };

  // Gestisce la selezione di un gioco dalla ricerca
  const handleGameSelect = (game: any) => {
    setGameData({
      ...gameData,
      title: game.title,
      coverImage: game.coverImage,
      developer: game.developer,
      publisher: game.publisher,
      releaseYear: game.releaseYear,
      genres: game.genres,
    });
    setActiveTab("manual");
  };

  // Gestisce l'aggiornamento dei dati del gioco
  const handleGameDataChange = (data: Partial<GameFormData>) => {
    if (data.status) {
      const newStatus = data.status as GameStatus;
      const updates: Partial<GameFormData> = { ...data };

      // Regole per ore di gioco
      if (newStatus === "not-started") {
        updates.hoursPlayed = 0;
      }

      // Aggiungi date specifiche per stato
      if (newStatus === "completed" || newStatus === "platinum") {
        updates.completionDate = updates.completionDate || new Date().toISOString().split("T")[0];
      } else {
        updates.completionDate = undefined;
      }

      if (newStatus === "platinum") {
        updates.platinumDate = updates.platinumDate || new Date().toISOString().split("T")[0];
      } else {
        updates.platinumDate = undefined;
      }

      setGameData((prev) => ({ ...prev, ...updates }));
      return;
    }

    setGameData((prev) => ({ ...prev, ...data }));
  };

  // Gestisce il toggle dei generi
  const handleGenreToggle = (genre: string) => {
    const updatedGenres = gameData.genres.includes(genre)
      ? gameData.genres.filter((g) => g !== genre)
      : [...gameData.genres, genre];
    handleGameDataChange({ genres: updatedGenres });
  };

  // Gestisce l'upload dell'immagine
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleGameDataChange({ coverImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Rimuove l'immagine
  const removeImage = () => {
    handleGameDataChange({ coverImage: "" });
  };

  // Gestisce il salvataggio del gioco
  const handleSave = (andAddAnother = false) => {
    // Crea un oggetto gioco completo
    const gameToSave = {
      id: gameData.id || Date.now(), // Usa l'ID esistente o ne crea uno nuovo
      ...gameData,
    } as Game;

    // Chiama la funzione onSave se fornita
    if (onSave) {
      onSave(gameToSave);
    }

    console.log("Salvataggio gioco:", gameToSave);

    if (andAddAnother) {
      // Resetta il form per aggiungere un altro gioco
      setGameData(initialGameData);
      setActiveTab("search");
      setSearchQuery("");
      setSearchResults([]);
    } else {
      onClose();
    }
  };

  // Per visualizzazione nell'anteprima
  const statusColor = STATUS_COLORS[gameData.status as GameStatus] || "#E0E0E0";
  const statusName = STATUS_NAMES[gameData.status as GameStatus] || "Sconosciuto";

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
              {isEdit ? "Modifica gioco" : "Aggiungi nuovo gioco"}
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
        {!isEdit && (
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
        )}

        {/* Content */}
        <div className="px-8">
          {/* Tab content */}
          {!isEdit && activeTab === "search" ? (
            <div className="mb-8">
              <form onSubmit={handleSearch} className="mb-6">
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
                              src={game.coverImage || "/placeholder.svg"}
                              alt={game.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-montserrat font-medium text-base text-text-primary">{game.title}</h3>
                            <p className="font-roboto text-sm text-text-secondary">
                              {game.developer} • {game.releaseYear}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Informazioni di base */}
                <div>
                  <h3 className="font-montserrat font-semibold text-xl text-text-primary mb-6">Informazioni di base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Titolo */}
                    <div className="md:col-span-2">
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        Titolo <span className="text-accent-primary">*</span>
                      </label>
                      <input
                        type="text"
                        value={gameData.title}
                        onChange={(e) => handleGameDataChange({ title: e.target.value })}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                        required
                      />
                    </div>

                    {/* Sviluppatore */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Sviluppatore</label>
                      <input
                        type="text"
                        value={gameData.developer}
                        onChange={(e) => handleGameDataChange({ developer: e.target.value })}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                      />
                    </div>

                    {/* Publisher */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Publisher</label>
                      <input
                        type="text"
                        value={gameData.publisher}
                        onChange={(e) => handleGameDataChange({ publisher: e.target.value })}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                      />
                    </div>

                    {/* Anno di uscita */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        Anno di uscita
                      </label>
                      <input
                        type="number"
                        value={gameData.releaseYear}
                        onChange={(e) =>
                          handleGameDataChange({
                            releaseYear: Number.parseInt(e.target.value) || new Date().getFullYear(),
                          })
                        }
                        min="1970"
                        max={new Date().getFullYear()}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                      />
                    </div>

                    {/* Piattaforma */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                        Piattaforma <span className="text-accent-primary">*</span>
                      </label>
                      <select
                        value={gameData.platform}
                        onChange={(e) => handleGameDataChange({ platform: e.target.value })}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                        required
                      >
                        <option value="" disabled>
                          Seleziona piattaforma
                        </option>
                        {GAME_PLATFORMS.map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Generi */}
                    <div className="md:col-span-2">
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Generi</label>
                      <div className="flex flex-wrap gap-2">
                        {GENRES.map((genre) => (
                          <button
                            key={genre}
                            type="button"
                            onClick={() => handleGenreToggle(genre)}
                            className={`px-3 py-1 rounded-full text-sm font-roboto transition-colors ${
                              gameData.genres.includes(genre)
                                ? "bg-accent-primary text-white"
                                : "bg-secondary-bg text-text-primary hover:bg-tertiary-bg"
                            }`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Upload copertina */}
                    <div className="md:col-span-2">
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Copertina</label>
                      {gameData.coverImage ? (
                        <div className="relative w-40 h-40 border border-border-color rounded-md overflow-hidden">
                          <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
                          <img
                            src={gameData.coverImage || "/placeholder.svg"}
                            alt="Copertina"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-primary-bg rounded-full p-1 text-text-secondary hover:text-accent-primary transition-colors"
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
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
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
                        value={gameData.status}
                        onChange={(e) => handleGameDataChange({ status: e.target.value as GameStatus })}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                        required
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
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
                        value={gameData.hoursPlayed}
                        onChange={(e) => handleGameDataChange({ hoursPlayed: Number.parseInt(e.target.value) || 0 })}
                        min="0"
                        disabled={gameData.status === "not-started"}
                        className={`w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base ${
                          gameData.status === "not-started" ? "bg-tertiary-bg cursor-not-allowed" : ""
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
                        value={gameData.purchaseDate}
                        onChange={(e) => handleGameDataChange({ purchaseDate: e.target.value })}
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                        />
                    </div>

                    {/* Prezzo */}
                    <div>
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Prezzo (€)</label>
                      <input
                        type="number"
                        value={gameData.price}
                        onChange={(e) => handleGameDataChange({ price: Number.parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                        />
                    </div>
                      {/* Data di completamento */}
                      {(gameData.status === "completed" || gameData.status === "platinum") && (
                        <div>
                          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                            Data di completamento
                          </label>
                          <input
                            type="date"
                            value={gameData.completionDate || ""}
                            onChange={(e) => handleGameDataChange({ completionDate: e.target.value })}
                            className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                          />
                        </div>
                      )}
  
                      {/* Data di platino */}
                      {gameData.status === "platinum" && (
                        <div>
                          <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">
                            Data di platino
                          </label>
                          <input
                            type="date"
                            value={gameData.platinumDate || ""}
                            onChange={(e) => handleGameDataChange({ platinumDate: e.target.value })}
                            className="w-full p-3 border border-border-color rounded-md bg-primary-bg text-text-primary focus:outline-none focus:border-accent-primary transition-colors font-roboto text-base"
                          />
                        </div>
                      )}

                    {/* Note */}
                    <div className="md:col-span-2">
                      <label className="block font-roboto font-medium text-sm text-text-secondary mb-2">Note</label>
                      <textarea
                        value={gameData.notes}
                        onChange={(e) => handleGameDataChange({ notes: e.target.value })}
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
                <div className="bg-secondary-bg rounded-xl p-6">
                  <h3 className="font-montserrat font-semibold text-xl text-text-primary mb-4">Anteprima scheda</h3>

                  <div className="bg-primary-bg border border-border-color rounded-xl shadow-sm h-[320px] relative">
                    {/* Indicatore di stato */}
                    <div className="h-1 bg-border-color rounded-t-xl overflow-hidden">
                      <div className="h-full" style={{ backgroundColor: statusColor, width: "100%" }}></div>
                    </div>

                    {/* Copertina */}
                    <div className="relative h-[180px] overflow-hidden">
                      <div className="absolute inset-0 bg-accent-secondary/20 z-10"></div>
                      {gameData.coverImage ? (
                        <img
                          src={gameData.coverImage || "/placeholder.svg"}
                          alt={gameData.title}
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
                        {gameData.title || "Titolo del gioco"}
                      </h3>

                      <div className="flex items-center mt-2 text-text-secondary">
                        <span className="font-roboto text-xs">{gameData.platform || "Piattaforma"}</span>
                        <span className="mx-2">|</span>
                        <span className="font-roboto text-xs">{gameData.hoursPlayed} ore</span>
                      </div>

                      {/* Prezzo */}
                      {gameData.price > 0 && (
                        <div className="mt-2 text-text-secondary">
                          <span className="font-roboto text-xs">{gameData.price.toFixed(2)} €</span>
                        </div>
                      )}

                      {/* Stato */}
                      <div className="mt-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-xs font-roboto"
                          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                        >
                          {statusName}
                        </span>
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
          </button>
          <div className="flex flex-wrap gap-4">
            {!isEdit && (
              <button
                onClick={() => handleSave(true)}
                className="px-6 py-3 text-accent-primary font-roboto font-medium text-base rounded-lg hover:bg-accent-primary/10 transition-colors"
              >
                Salva e aggiungi altro
              </button>
            )}
            <button
              onClick={() => handleSave(false)}
              className="px-6 py-3 bg-accent-primary text-white font-roboto font-medium text-base rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGameModal;