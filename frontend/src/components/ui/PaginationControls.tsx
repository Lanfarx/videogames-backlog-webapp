import React from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  variant?: 'simple' | 'numbers';
  totalCount?: number;
}

export function PaginationControls({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  loading = false, 
  variant = 'numbers',
  totalCount
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  if (variant === 'simple') {
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-text-secondary">
          Mostrando pagina {currentPage} di {totalPages}
          {totalCount !== undefined ? ` (${totalCount} risultati)` : ''}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="px-3 py-1 bg-secondary-bg text-text-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover-color transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Precedente
          </button>
          
          <span className="px-3 py-1 bg-accent-primary text-white rounded-lg">
            {currentPage}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="px-3 py-1 bg-secondary-bg text-text-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover-color transition-colors flex items-center gap-1"
          >
            Successiva
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Variant 'numbers'
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-color">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || loading}
        className="flex items-center gap-2 px-4 py-2 text-sm disabled:text-text-secondary disabled:cursor-not-allowed text-text-primary hover:text-accent-primary transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Precedente
      </button>            
      
      <div className="flex items-center gap-2">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={loading}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currentPage === pageNum
                  ? 'bg-accent-primary text-white'
                  : 'text-text-secondary hover:text-accent-primary'
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || loading}
        className="flex items-center gap-2 px-4 py-2 text-sm disabled:text-text-secondary disabled:cursor-not-allowed text-text-primary hover:text-accent-primary transition-colors"
      >
        Successiva
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
