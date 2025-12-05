'use client';

import { useState, useEffect } from 'react';

/**
 * Hook para persistir a tab ativa no localStorage
 * @param key - Chave única para armazenar no localStorage
 * @param defaultValue - Valor padrão se não houver valor armazenado
 */
export function usePersistedTab(key: string, defaultValue: string) {
  const [tab, setTab] = useState(defaultValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Carregar valor do localStorage após hidratação
  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      setTab(stored);
    }
    setIsHydrated(true);
  }, [key]);

  const setTabPersisted = (value: string) => {
    setTab(value);
    localStorage.setItem(key, value);
  };

  return [tab, setTabPersisted, isHydrated] as const;
}
