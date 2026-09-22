import { useState, useEffect } from 'react';
import { Game, GameStatus } from '../types/game';
import { useGameActions } from '../store/hooks/gamesHooks';
import { getGameDetails } from '../store/services/rawgService';

export type GameFormData = Omit<Game, "id" | "Rating"> & { id?: number, CompletionDate?: string, PlatinumDate?: string }

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
  Metacritic: null,
  PurchaseDate: new Date().toISOString().split("T")[0],
  Price: undefined,
  Notes: "",
};

export function useAddGameForm(
  isOpen: boolean,
  onClose: () => void,
  prefillGame?: Partial<Game> | null,
  onSuccess?: () => void
) {
  const { add } = useGameActions();
  const [activeTab, setActiveTab] = useState<"search" | "manual">("search");
  const [gameData, setGameData] = useState<GameFormData>(initialGameData);
  const [formError, setFormError] = useState<string | null>(null);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [originalMetacritic, setOriginalMetacritic] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setGameData(initialGameData);
    setIsAutoFilled(false);
    setFormError(null);
    setOriginalMetacritic(undefined);
    setIsSubmitting(false);
  }, [isOpen]);

  useEffect(() => {
    setFormError(null);
  }, [activeTab]);

  useEffect(() => {
    if (isOpen && prefillGame) {
      const metacriticValue = prefillGame.Metacritic !== null && prefillGame.Metacritic !== undefined ? prefillGame.Metacritic : null;
      setGameData(prev => ({
        ...prev,
        Title: prefillGame.Title || "",
        CoverImage: prefillGame.CoverImage || "",
        Developer: prefillGame.Developer || "",
        Publisher: prefillGame.Publisher || "",
        ReleaseYear: prefillGame.ReleaseYear || new Date().getFullYear(),
        Genres: prefillGame.Genres || [],
        Metacritic: metacriticValue,
      }));
      setOriginalMetacritic(metacriticValue);
      setActiveTab("manual");
      setIsAutoFilled(true);
    }
  }, [isOpen, prefillGame]);

  const handleGameSelect = async (game: any) => {
    try {
      const fullData = await getGameDetails(game.id);
      const metacriticValue = fullData.Metacritic || null;
      
      setGameData({
        ...gameData,
        Title: fullData.Title,
        CoverImage: fullData.CoverImage || "/placeholder.svg?height=280&width=280",
        Developer: fullData.Developer || "Sconosciuto",
        Publisher: fullData.Publisher || "Sconosciuto",
        ReleaseYear: fullData.ReleaseYear || new Date().getFullYear(),
        Genres: fullData.Genres || [],
        Metacritic: metacriticValue,
      });
      setOriginalMetacritic(metacriticValue);
      setActiveTab("manual");
      setIsAutoFilled(true);
    } catch (error) {
      console.error("Errore durante il caricamento dei dettagli del gioco:", error);
    }
  };

  const handleGameDataChange = (data: Partial<GameFormData>) => {
    if (data.Status) {
      const newStatus = data.Status as GameStatus;
      const updates: Partial<GameFormData> = { ...data };

      if (newStatus === "NotStarted") {
        updates.HoursPlayed = 0;
      }

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

  const handleGenreToggle = (genre: string) => {
    const updatedGenres = gameData.Genres.includes(genre)
      ? gameData.Genres.filter((g) => g !== genre)
      : [...gameData.Genres, genre];
    handleGameDataChange({ Genres: updatedGenres });
  };

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

  const removeImage = () => {
    handleGameDataChange({ CoverImage: "" });
  };

  const handleSave = async () => {
    const scrollErrorIntoView = () => {
      setTimeout(() => {
        const manualTab = document.getElementById('add-game-manual-tab');
        const errorSection = document.getElementById('add-game-base-info');
        const modalContainer = (manualTab?.closest('.overflow-auto') || manualTab?.closest('[class*="overflow-auto"]')) as HTMLElement | null;
        if (manualTab && modalContainer) {
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
    setIsSubmitting(true);
    
    const gameToSave = {
      ...gameData,
      PurchaseDate: gameData.PurchaseDate ? gameData.PurchaseDate : undefined,
      CompletionDate: gameData.CompletionDate ? gameData.CompletionDate : undefined,
      PlatinumDate: gameData.PlatinumDate ? gameData.PlatinumDate : undefined,
    } as Game;

    try {
      await add(gameToSave);
      
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Errore durante il salvataggio del gioco:", error);
      setFormError("Errore durante il salvataggio del gioco. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    gameData,
    formError,
    isAutoFilled,
    originalMetacritic,
    isSubmitting,
    handleGameSelect,
    handleGameDataChange,
    handleGenreToggle,
    handleImageUpload,
    removeImage,
    handleSave
  };
}
