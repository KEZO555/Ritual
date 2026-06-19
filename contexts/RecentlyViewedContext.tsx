import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useRef,
} from "react";
import { usePersistedState } from "@/hooks/usePersistedState";

const MAX_RECENT = 8;

interface RecentlyViewedContextType {
  addRecent: (id: string) => void;
  recent: string[];
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType>({
  addRecent: () => {
    throw new Error(
      "useRecentlyViewed must be used within RecentlyViewedProvider"
    );
  },
  recent: [],
});

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);

export const RecentlyViewedProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [recent, setRecent] = usePersistedState<string[]>("recentlyViewed", []);

  // Read the latest list through a ref so addRecent stays stable across renders.
  const recentRef = useRef(recent);
  recentRef.current = recent;

  const addRecent = useCallback(
    (id: string) => {
      const current = recentRef.current;
      if (current[0] === id) {
        return;
      }
      setRecent(
        [id, ...current.filter((item) => item !== id)].slice(0, MAX_RECENT)
      );
    },
    [setRecent]
  );

  return (
    <RecentlyViewedContext.Provider value={{ recent, addRecent }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};
