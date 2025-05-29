// Restituisce il token JWT se presente in localStorage o sessionStorage
export function getToken(): string | null {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}
