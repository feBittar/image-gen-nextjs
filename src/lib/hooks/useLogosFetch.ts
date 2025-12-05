import { useState, useEffect } from 'react';

/**
 * Interface para item de logo
 */
export interface LogoItem {
  name: string;
  url: string;
  category?: string;
}

/**
 * Estado retornado pelo hook
 */
export interface UseLogosFetchResult {
  logos: LogoItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook compartilhado para buscar logos da API
 *
 * Substitui a lógica duplicada em 5+ componentes:
 * - StackFormFields
 * - VersusDuoFormFields
 * - VersusFormFields
 * - OpenLoopFormFields
 * - FitFeedCapaFormFields
 */
export function useLogosFetch(): UseLogosFetchResult {
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/logos');

      if (!response.ok) {
        throw new Error(`Failed to fetch logos: ${response.status}`);
      }

      const data = await response.json();
      setLogos(data.logos || []);
    } catch (err) {
      console.error('Error fetching logos:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLogos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  return {
    logos,
    loading,
    error,
    refetch: fetchLogos,
  };
}

/**
 * Hook para buscar logos com cache
 * Útil para componentes que re-renderizam frequentemente
 */
let cachedLogos: LogoItem[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useLogosFetchCached(): UseLogosFetchResult {
  const [logos, setLogos] = useState<LogoItem[]>(cachedLogos || []);
  const [loading, setLoading] = useState(!cachedLogos);
  const [error, setError] = useState<string | null>(null);

  const fetchLogos = async (force: boolean = false) => {
    // Check cache validity
    const now = Date.now();
    if (!force && cachedLogos && now - cacheTimestamp < CACHE_DURATION) {
      setLogos(cachedLogos);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/logos');

      if (!response.ok) {
        throw new Error(`Failed to fetch logos: ${response.status}`);
      }

      const data = await response.json();
      const fetchedLogos = data.logos || [];

      // Update cache
      cachedLogos = fetchedLogos;
      cacheTimestamp = now;

      setLogos(fetchedLogos);
    } catch (err) {
      console.error('Error fetching logos:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Use cached data on error if available
      if (cachedLogos) {
        setLogos(cachedLogos);
      } else {
        setLogos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  return {
    logos,
    loading,
    error,
    refetch: () => fetchLogos(true),
  };
}

/**
 * Helper para filtrar logos por categoria
 */
export function filterLogosByCategory(
  logos: LogoItem[],
  category: string
): LogoItem[] {
  return logos.filter(logo => logo.category === category);
}

/**
 * Helper para encontrar um logo pelo URL
 */
export function findLogoByUrl(
  logos: LogoItem[],
  url: string
): LogoItem | undefined {
  return logos.find(logo => logo.url === url);
}

/**
 * Helper para encontrar um logo pelo nome
 */
export function findLogoByName(
  logos: LogoItem[],
  name: string
): LogoItem | undefined {
  return logos.find(
    logo => logo.name.toLowerCase() === name.toLowerCase()
  );
}
