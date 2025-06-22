import React from "react";

interface CatalogSearchBarProps {
  search: string;
  setSearch: (v: string) => void;
}

const CatalogSearchBar: React.FC<CatalogSearchBarProps> = ({ search, setSearch }) => (
  <input
    type="text"
    value={search}
    onChange={e => setSearch(e.target.value)}
    placeholder="Cerca nel catalogo..."
    className="px-4 py-2 rounded-md border border-border-color bg-primary-bg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary text-base w-full md:w-96"
  />
);

export default CatalogSearchBar;
