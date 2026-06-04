import { useEffect, useState, useCallback } from "react";

const KEY = "compare:ids";
const MAX = 3;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function write(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("compare:changed"));
}

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(read());
    const onChange = () => setIds(read());
    window.addEventListener("compare:changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("compare:changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const cur = read();
    if (cur.includes(id)) write(cur.filter((x) => x !== id));
    else if (cur.length < MAX) write([...cur, id]);
  }, []);

  const remove = useCallback((id: string) => write(read().filter((x) => x !== id)), []);
  const clear = useCallback(() => write([]), []);

  return { ids, toggle, remove, clear, max: MAX };
}
