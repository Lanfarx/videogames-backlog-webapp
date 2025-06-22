import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  // Genera un array di numeri di pagina da visualizzare
  const getPageNumbers = () => {
    const pageNumbers = [];

    // Mostra sempre la prima pagina
    pageNumbers.push(1);

    // Calcola l'intervallo di pagine da mostrare intorno alla pagina corrente
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    // Aggiungi ellipsis se necessario prima dell'intervallo
    if (startPage > 2) {
      pageNumbers.push("...");
    }

    // Aggiungi le pagine nell'intervallo
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Aggiungi ellipsis se necessario dopo l'intervallo
    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }

    // Mostra sempre l'ultima pagina se ce n'è più di una
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-center mt-8">
      <div className="flex items-center space-x-2">
        {/* Pulsante Precedente */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center h-9 w-9 rounded ${
            currentPage === 1 ? "text-text-disabled cursor-not-allowed" : "text-text-secondary hover:bg-tertiary-bg"
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Numeri di pagina */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`flex items-center justify-center h-9 w-9 rounded font-roboto font-medium text-sm ${
              page === currentPage
                ? "bg-accent-primary text-white"
                : page === "..."
                ? "text-text-secondary cursor-default"
                : "text-text-secondary hover:bg-tertiary-bg"
            }`}
          >
            {page}
          </button>
        ))}

        {/* Pulsante Successivo */}
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center h-9 w-9 rounded ${
            currentPage === totalPages
              ? "text-text-disabled cursor-not-allowed"
              : "text-text-secondary hover:bg-tertiary-bg"
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;