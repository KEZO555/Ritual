import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
} from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

export interface BrewEntry {
  at: number;
  id: string;
  note?: string;
  rating: number;
  recipeId: string;
}

interface NewEntry {
  note?: string;
  rating: number;
  recipeId: string;
}

interface BrewHistoryContextType {
  addEntry: (entry: NewEntry) => void;
  entries: BrewEntry[];
  removeEntry: (id: string) => void;
}

const BrewHistoryContext = createContext<BrewHistoryContextType>({
  addEntry: () => {
    throw new Error("useBrewHistory must be used within BrewHistoryProvider");
  },
  entries: [],
  removeEntry: () => undefined,
});

export const useBrewHistory = () => useContext(BrewHistoryContext);

export const BrewHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = usePersistedState<BrewEntry[]>(
    "brewHistory",
    []
  );

  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const addEntry = useCallback(
    ({ recipeId, rating, note }: NewEntry) => {
      const at = Date.now();
      const entry: BrewEntry = {
        at,
        id: `brew-${at}`,
        recipeId,
        rating,
        ...(note ? { note } : {}),
      };
      setEntries([entry, ...entriesRef.current]);
    },
    [setEntries]
  );

  const removeEntry = useCallback(
    (id: string) => {
      setEntries(entriesRef.current.filter((entry) => entry.id !== id));
    },
    [setEntries]
  );

  return (
    <BrewHistoryContext.Provider value={{ addEntry, entries, removeEntry }}>
      {children}
    </BrewHistoryContext.Provider>
  );
};
