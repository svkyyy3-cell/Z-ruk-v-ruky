import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { readFilters } from '../utils/filters';

/**
 * Reads filters from the URL and exposes helpers to change them without
 * scrolling the page back to the top.
 */
export function useFilterParams(category) {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params, category), [params, category]);

  /** `changes` is an object of param → value; empty values remove the param. */
  const update = useCallback(
    (changes) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          Object.entries(changes).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') next.delete(key);
            else next.set(key, String(value));
          });
          return next;
        },
        { preventScrollReset: true },
      );
    },
    [setParams],
  );

  /** Removes every filter but keeps the keyword and sort order. */
  const clearAll = useCallback(() => {
    setParams(
      (previous) => {
        const next = new URLSearchParams();
        ['q', 'sort'].forEach((key) => previous.get(key) && next.set(key, previous.get(key)));
        return next;
      },
      { preventScrollReset: true },
    );
  }, [setParams]);

  return { params, filters, update, clearAll };
}
