import { useState, useEffect, useRef, useCallback } from 'react';

export function useSearch<T>(data: T[], searchFn: (item: T, query: string) => boolean) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>(data);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filterData = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(data);
        return;
      }

      const normalized = searchQuery.toLowerCase().trim();
      const filtered = data.filter((item) => searchFn(item, normalized));
      setResults(filtered);
    },
    [data, searchFn]
  );

  useEffect(() => {
    setIsSearching(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      filterData(query);
      setIsSearching(false);
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, filterData]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    clearSearch: () => {
      setQuery('');
      setResults(data);
    },
  };
}
