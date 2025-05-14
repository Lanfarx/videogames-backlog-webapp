import React from 'react';
import { PlusCircle } from 'lucide-react';

interface AddGameButtonProps {
  onClick: () => void;
}

const AddGameButton: React.FC<AddGameButtonProps> = ({ onClick }) => {
  return (
    <button
      className="flex items-center px-4 py-2 bg-accent-primary text-white font-roboto font-medium text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
      onClick={onClick}
    >
      <PlusCircle className="w-4 h-4 mr-2" />
      Aggiungi gioco
    </button>
  );
};

export default AddGameButton;
