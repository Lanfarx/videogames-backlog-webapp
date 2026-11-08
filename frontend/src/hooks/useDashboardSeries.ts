import { useEffect, useState } from 'react';
import { DashboardSeries, getDashboardSeries } from '../store/services/gamesService';

// Serie mensili della dashboard (ore e backlog), calcolate dal server
export function useDashboardSeries(): DashboardSeries | null {
  const [series, setSeries] = useState<DashboardSeries | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDashboardSeries()
      .then(result => { if (!cancelled) setSeries(result); })
      .catch(error => console.warn('Serie della dashboard non disponibili:', error));
    return () => { cancelled = true; };
  }, []);

  return series;
}
