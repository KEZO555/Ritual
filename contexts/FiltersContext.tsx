import { createContext, type ReactNode, useContext, useState } from "react";
import type { Filters } from "@/data/recipes";

const EMPTY_FILTERS: Filters = {
  roast: null,
  grind: null,
  method: null,
  orientation: null,
  brewTime: null,
};

interface FiltersContextType {
  filters: Filters;
  resetFilters: () => void;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

const FiltersContext = createContext<FiltersContextType>({
  filters: EMPTY_FILTERS,
  setFilter: () => {
    throw new Error("useFilters must be used within FiltersProvider");
  },
  resetFilters: () => {
    throw new Error("useFilters must be used within FiltersProvider");
  },
});

export const useFilters = () => useContext(FiltersContext);

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const setFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => setFilters(EMPTY_FILTERS);

  return (
    <FiltersContext.Provider value={{ filters, setFilter, resetFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};
