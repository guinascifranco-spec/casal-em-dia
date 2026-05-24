import { useEffect, useState } from "react";

const KEY = "caloteiros.activeCoupleId";

export function useActiveCouple() {
  const [activeId, setActiveId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(KEY);
  });

  useEffect(() => {
    if (activeId) localStorage.setItem(KEY, activeId);
    else localStorage.removeItem(KEY);
  }, [activeId]);

  return { activeId, setActiveId };
}
