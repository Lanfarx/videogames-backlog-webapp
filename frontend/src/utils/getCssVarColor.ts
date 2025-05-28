/**
 * Helper per ottenere un colore da una variabile CSS
 */
export function getCssVarColor(varName: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return value ? `rgb(${value})` : fallback;
}
