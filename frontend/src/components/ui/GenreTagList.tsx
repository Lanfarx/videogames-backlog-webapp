import React from 'react';
import GenreTag from './atoms/GenreTag';


interface GenreTagListProps {
  genres: string[];
  maxDisplay?: number;
  small?: boolean;
}

const GenreTagList: React.FC<GenreTagListProps> = ({ 
  genres, 
  maxDisplay = 2,
  small = false
}) => {
  // Se non ci sono generi passati, non renderizziamo nulla
  if (!genres || genres.length === 0) {
    return null;
  }

  // Limitiamo il numero di generi da mostrare
  // Supporta sia string[] che {id, name}[]
  const displayedGenres = genres.slice(0, maxDisplay).map((g: any) => typeof g === 'string' ? g : g.name);
  
  return (
    <div className="flex flex-wrap gap-2">
      {displayedGenres.map((genreName, index) => (
        <GenreTag key={index} genre={genreName} small={small} />
      ))}
    </div>
  );
};

export default GenreTagList;
