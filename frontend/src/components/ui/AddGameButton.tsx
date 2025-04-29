import React from 'react';
import { Plus } from 'lucide-react';

const AddGameButton: React.FC = () => {
  return (
    <button className="flex items-center px-6 py-3 bg-accent-primary text-white font-medium rounded-lg transition-colors font-secondary">
      <Plus className="h-5 w-5 mr-2" />
      Aggiungi un gioco
    </button>
  );
};

export default AddGameButton;
