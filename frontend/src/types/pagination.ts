/**
 * Interfaccia generica che rispecchia il contratto PaginatedResult<T> del backend C#.
 * Utilizzata come tipo per le risposte Axios delle API paginate,
 * eliminando la necessità di usare `any`.
 */
export interface BackendPaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interfaccia generica per i risultati paginati lato frontend.
 * I servizi possono estenderla o usarla direttamente.
 */
export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Mappa una risposta paginata dal backend al formato frontend generico.
 * Accetta un mapper opzionale per trasformare ogni elemento dell'array.
 *
 * @param data - L'oggetto `response.data` di tipo BackendPaginatedResponse
 * @param itemMapper - Funzione opzionale per mappare ogni elemento (es. mapGameFromApi)
 * @returns Un oggetto PaginatedResult<U> con fallback sicuri
 */
export function mapPaginatedResponse<T, U = T>(
  data: BackendPaginatedResponse<T>,
  itemMapper?: (item: T) => U
): PaginatedResult<U> {
  const items = data.items || [];
  return {
    items: itemMapper ? items.map(itemMapper) : items as unknown as U[],
    totalItems: data.totalItems || 0,
    totalPages: data.totalPages || 0,
    currentPage: data.currentPage || 1,
    pageSize: data.pageSize || 10,
    hasNextPage: data.hasNextPage ?? false,
    hasPreviousPage: data.hasPreviousPage ?? false
  };
}
