import React from 'react';
import { Plus } from 'lucide-react';
import Button from './atoms/Button';

const AddGameButton: React.FC<{ onClick?: () => void }> = ({ onClick = () => {} }) => {
  return (
    <Button 
      label="Aggiungi un gioco" 
      primary={true}
      onClick={onClick}
      icon={<Plus className="h-5 w-5" />}
      className="py-3 px-6 font-medium transition-colors rounded-lg"
    />
  );
};

export default AddGameButton;
