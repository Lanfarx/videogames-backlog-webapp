import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  label?: string;
  onClick?: () => void; // Aggiungiamo la prop onClick come opzionale
}

const BackButton: React.FC<BackButtonProps> = ({ label = 'Indietro', onClick }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onClick) {
      // Se è stata fornita una funzione onClick personalizzata, la usiamo
      onClick();
    } else {
      // Altrimenti, torniamo indietro nella storia del browser
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center text-sm font-medium text-text-secondary hover:text-accent-primary transition-colors"
    >
      <ChevronLeft className="w-4 h-4 mr-1" />
      {label}
    </button>
  );
};

export default BackButton;
