import React from "react";

interface CatalogSortControlsProps {
  sortBy: string;
  setSortBy: (v: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (v: "asc" | "desc") => void;
  hideOwned: boolean;
  setHideOwned: (v: boolean) => void;
  sortOptions: { value: string; label: string }[];
}

const CatalogSortControls: React.FC<CatalogSortControlsProps> = ({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  hideOwned,
  setHideOwned,
  sortOptions,
}) => (
  <div className="flex items-center gap-2 ml-auto">
    <label className="text-sm text-text-secondary mr-2">Ordina per:</label>
    <select
      value={sortBy}
      onChange={e => setSortBy(e.target.value)}
      className="px-2 py-1 rounded-md border border-border-color bg-primary-bg text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
    >
      {sortOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    <button
      className={`ml-2 p-1.5 rounded-md border border-border-color bg-primary-bg text-text-secondary hover:text-accent-primary transition-colors flex items-center justify-center ${sortOrder === "asc" ? "rotate-180" : ""}`}
      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
      title={sortOrder === "asc" ? "Ordine crescente" : "Ordine decrescente"}
      aria-label="Cambia ordine"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
    <label className="flex items-center gap-1 ml-4 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={hideOwned}
        onChange={e => setHideOwned(e.target.checked)}
        className="accent-accent-primary w-4 h-4 rounded border border-border-color focus:ring-2 focus:ring-accent-primary"
      />
      <span className="text-xs text-text-secondary">Nascondi giochi già in libreria</span>
    </label>
  </div>
);

export default CatalogSortControls;
