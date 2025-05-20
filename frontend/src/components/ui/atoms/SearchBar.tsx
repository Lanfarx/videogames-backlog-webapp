import React from 'react';
import { Search } from 'lucide-react';

const SearchBar: React.FC = () => {
  return (
    <div className="relative flex-grow w-full max-w-xl ml-0">
      <input
        type="text"
        className="w-full h-14 pl-14 pr-5 rounded-3xl border border-border-color focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 text-base"
        placeholder="Cerca nei tuoi giochi..."
      />
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <Search className="h-6 w-6 text-text-secondary" />
      </div>
    </div>
  );
};

export default SearchBar;
