import { ChevronLeft } from 'lucide-react';
import Button from '../../ui/atoms/Button';

interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

const BackButton = ({ onClick, label = 'Torna' }: BackButtonProps) => {
  return (
    <Button
      onClick={onClick}
      label={label}
      primary={false}
      icon={<ChevronLeft className="h-4 w-4" />}
      className="font-medium"
    />
  );
};

export default BackButton;
