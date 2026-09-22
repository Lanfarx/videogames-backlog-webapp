import { useState, useEffect } from 'react';
import { Game, GameUpdateInput } from '../types/game';
import { useGameActions } from '../store/hooks/gamesHooks';

export function useEditGameInfoForm(game: Game, isOpen: boolean, onClose: () => void) {
  const { update } = useGameActions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    Platform: game.Platform || '',
    Price: game.Price != null ? game.Price.toString() : '',
    PurchaseDate: game.PurchaseDate || '',
    HoursPlayed: game.HoursPlayed.toString(),
    CompletionDate: game.CompletionDate || '',
    PlatinumDate: game.PlatinumDate || ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        Platform: game.Platform || '',
        Price: game.Price != null ? game.Price.toString() : '',
        PurchaseDate: game.PurchaseDate || '',
        HoursPlayed: game.HoursPlayed.toString(),
        CompletionDate: game.CompletionDate || '',
        PlatinumDate: game.PlatinumDate || ''
      });
    }
  }, [game, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newHoursPlayed = parseFloat(formData.HoursPlayed) || 0;
    const updateData: GameUpdateInput = {};

    if (formData.Platform && formData.Platform !== game.Platform) {
      updateData.Platform = formData.Platform;
    }

    const currentPriceStr = game.Price !== null && game.Price !== undefined ? game.Price.toString() : '';
    if (formData.Price !== currentPriceStr) {
      updateData.Price = formData.Price === '' ? -2 : parseFloat(formData.Price);
    }

    const currentPurchaseDate = game.PurchaseDate || '';
    if (formData.PurchaseDate !== currentPurchaseDate) {
      updateData.PurchaseDate = formData.PurchaseDate === '' ? '0001-01-01' : formData.PurchaseDate;
    }

    if (newHoursPlayed !== game.HoursPlayed) {
      updateData.HoursPlayed = newHoursPlayed;
    }

    const isCompleted = game.Status === "Completed";
    const isPlatinum = game.Status === "Platinum";
    const hasBeenCompleted = isCompleted || isPlatinum;

    if (hasBeenCompleted && formData.CompletionDate !== (game.CompletionDate || '')) {
      updateData.CompletionDate = formData.CompletionDate === '' ? '0001-01-01' : formData.CompletionDate;
    }

    if (isPlatinum && formData.PlatinumDate !== (game.PlatinumDate || '')) {
      updateData.PlatinumDate = formData.PlatinumDate === '' ? '0001-01-01' : formData.PlatinumDate;
    }

    if (newHoursPlayed !== game.HoursPlayed) {
      if (newHoursPlayed === 0 && game.Status !== 'NotStarted') {
        updateData.Status = 'NotStarted';
      } else if (newHoursPlayed > 0 && game.HoursPlayed === 0 && game.Status === 'NotStarted') {
        updateData.Status = 'InProgress';
      }
    }

    if (Object.keys(updateData).length > 0) {
      try {
        await update(game.id, updateData);
      } catch (error) {
        console.error("Errore durante l'aggiornamento:", error);
      }
    }

    setIsSubmitting(false);
    onClose();
  };

  return {
    formData,
    isSubmitting,
    handleChange,
    handleSubmit
  };
}
