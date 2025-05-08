import { getStatusColor } from '../../utils/statusData';

interface GameCoverProps {
  coverImage?: string;  // Reso opzionale
  title: string;
  status?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const GameCover = ({ coverImage, title, status = 'not-started', size = 'md' }: GameCoverProps) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm': return 'w-32 h-32';
      case 'lg': return 'w-64 h-64';
      case 'xl': return 'w-[280px] h-[280px]';
      default: return 'w-48 h-48';
    }
  };

  return (
    <div 
      className={`relative ${getDimensions()} border border-border-color shadow-md overflow-hidden`}
      style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
    >
      <img 
        src={coverImage || "/placeholder.svg"} 
        alt={title} 
        className="w-full h-full object-cover"
      />
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: `${getStatusColor(status)}33` }}
      ></div>
    </div>
  );
};

export default GameCover;
