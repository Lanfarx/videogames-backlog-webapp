import React from 'react';

interface GenreTagProps {
  genre: string;
  small?: boolean;
}

const GenreTag: React.FC<GenreTagProps> = ({ 
  genre,
  small = false
}) => {  return (
    <span 
      className={`inline-block rounded-full ${
        small 
          ? 'px-2 py-0.5 text-xs bg-tertiary-bg text-text-secondary border border-border-color' 
          : 'px-4 py-2 text-sm bg-tertiary-bg text-text-secondary border border-border-color'
      } font-secondary ${!small && 'mr-2 mb-2'}`}
    >
      {genre}
    </span>
  );
};

export default GenreTag;
